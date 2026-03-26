import React, { useState, useEffect } from 'react';
import api from "../utils/api";
const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading services...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Services Management</h2>
      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No services found</p>
          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Add Service</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg">{service.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              <div className="mt-3 flex justify-between">
                <span className="text-indigo-600 font-bold">${service.price}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;