import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const RevenueStats = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const response = await api.get('/admin/revenue');
      setRevenue(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading revenue data...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Revenue Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-indigo-600">${revenue?.total_revenue || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Growth Rate</p>
          <p className="text-3xl font-bold text-green-600">+{revenue?.growth_rate || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Avg. Booking Value</p>
          <p className="text-3xl font-bold text-blue-600">${revenue?.avg_booking_value || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueStats;