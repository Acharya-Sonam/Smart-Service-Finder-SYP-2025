import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, RefreshCw, Clock, User, Phone, Mail } from 'lucide-react';
import api from '../utils/api';
import io from 'socket.io-client';

const LocationTracking = () => {
  const [locations, setLocations] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    fetchLocations();
    
    // Connect to socket for real-time updates
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('location_update', (data) => {
      updateProviderLocation(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLocations, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    if (locations.length > 0 && !mapRef.current) {
      initMap();
    } else if (mapRef.current) {
      updateMarkers();
    }
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/locations');
      setLocations(response.data.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    // Initialize Google Maps (you'll need to add the Google Maps script to your index.html)
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapRef.current = map;

    // Add markers for each provider
    locations.forEach(location => {
      addMarker(location);
    });
  };

  const addMarker = (location) => {
    if (!mapRef.current) return;

    const marker = new window.google.maps.Marker({
      position: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
      map: mapRef.current,
      title: location.provider_name,
      icon: {
        url: `http://maps.google.com/mapfiles/ms/icons/${getMarkerColor(location)}-dot.png`,
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-bold">${location.provider_name}</h3>
          <p class="text-sm">Serving: ${location.customer_name}</p>
          <p class="text-sm">Service: ${location.service_title}</p>
          <p class="text-xs text-gray-500">Last updated: ${new Date(location.updated_at).toLocaleTimeString()}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapRef.current, marker);
      setSelectedProvider(location);
    });

    markersRef.current[location.provider_id] = { marker, infoWindow };
  };

  const updateProviderLocation = (data) => {
    setLocations(prev => {
      const existing = prev.findIndex(l => l.provider_id === data.providerId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          lat: data.lat,
          lng: data.lng,
          updated_at: new Date().toISOString()
        };
        return updated;
      }
      return prev;
    });
  };

  const updateMarkers = () => {
    locations.forEach(location => {
      if (markersRef.current[location.provider_id]) {
        markersRef.current[location.provider_id].marker.setPosition({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        });
      } else {
        addMarker(location);
      }
    });
  };

  const getMarkerColor = (location) => {
    const minutesAgo = (new Date() - new Date(location.updated_at)) / (1000 * 60);
    if (minutesAgo < 5) return 'green';
    if (minutesAgo < 15) return 'yellow';
    return 'red';
  };

  const centerMapOnProvider = (location) => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: parseFloat(location.lat), lng: parseFloat(location.lng) });
      mapRef.current.setZoom(15);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Live Provider Tracking</h3>
            <p className="text-sm text-gray-500">Real-time location of active service providers</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Auto-refresh (30s)</span>
            </label>
            <button
              onClick={fetchLocations}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div id="map" className="w-full h-[600px] rounded-lg border"></div>
        </div>

        {/* Provider List */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold mb-4">Active Providers ({locations.length})</h4>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {locations.map(location => {
                const minutesAgo = (new Date() - new Date(location.updated_at)) / (1000 * 60);
                const isActive = minutesAgo < 10;
                
                return (
                  <div
                    key={location.provider_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProvider?.provider_id === location.provider_id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedProvider(location);
                      centerMapOnProvider(location);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                        <h5 className="font-medium">{location.provider_name}</h5>
                      </div>
                      <span className="text-xs text-gray-500">
                        {minutesAgo < 1 ? 'Just now' : `${Math.round(minutesAgo)} min ago`}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center">
                        <User size={14} className="mr-2" />
                        Serving: {location.customer_name}
                      </p>
                      <p className="flex items-center">
                        <Navigation size={14} className="mr-2" />
                        Service: {location.service_title}
                      </p>
                      <p className="flex items-center">
                        <Clock size={14} className="mr-2" />
                        Last update: {new Date(location.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {locations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No active providers found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Provider Details */}
      {selectedProvider && (
        <div className="p-6 border-t">
          <h4 className="font-semibold mb-4">Provider Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Provider</p>
              <p className="font-medium">{selectedProvider.provider_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{selectedProvider.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-medium">{selectedProvider.service_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Coordinates</p>
              <p className="font-medium">{selectedProvider.lat}, {selectedProvider.lng}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Update</p>
              <p className="font-medium">{new Date(selectedProvider.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                (new Date() - new Date(selectedProvider.updated_at)) / (1000 * 60) < 10
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {(new Date() - new Date(selectedProvider.updated_at)) / (1000 * 60) < 10 ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTracking;