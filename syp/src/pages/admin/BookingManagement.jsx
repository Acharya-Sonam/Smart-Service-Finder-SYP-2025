import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/admin/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Booking Management</h2>
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 text-sm">#{booking.id}</td>
                  <td className="px-6 py-4 text-sm">{booking.customer_name}</td>
                  <td className="px-6 py-4 text-sm">{booking.service_name}</td>
                  <td className="px-6 py-4 text-sm">{booking.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;