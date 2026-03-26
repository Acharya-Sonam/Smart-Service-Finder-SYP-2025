import React, { useState, useEffect } from 'react';
import api from "../utils/api";

const RevenueStats = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/bookings'),
      api.get('/admin/services'),
    ]).then(([b, s]) => {
      setBookings(b.data.bookings || []);
      setServices(s.data.services || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">Loading revenue data...</div>;

  const completed = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completed.reduce((sum, b) => sum + parseFloat(b.service_price || 0), 0);
  const avgValue = completed.length ? (totalRevenue / completed.length).toFixed(0) : 0;

  const byCategory = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { count: 0, total: 0 };
    acc[s.category].count++;
    acc[s.category].total += parseFloat(s.price || 0);
    return acc;
  }, {});

  const statusCount = ['pending','accepted','completed','rejected','cancelled'].map(status => ({
    status, count: bookings.filter(b => b.status === status).length,
    pct: bookings.length ? Math.round((bookings.filter(b => b.status === status).length / bookings.length) * 100) : 0,
  }));

  const barColors = { pending:'#f7c948', accepted:'#43e97b', completed:'#4fc3f7', rejected:'#ff4d6d', cancelled:'#8888aa' };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Revenue Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">Rs. {totalRevenue.toFixed(0)}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Completed Bookings</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">{completed.length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Avg Booking Value</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">Rs. {avgValue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">Revenue by Category</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-xs uppercase"><th className="text-left pb-3">Category</th><th className="text-left pb-3">Services</th><th className="text-left pb-3">Avg Price</th></tr></thead>
            <tbody>
              {Object.entries(byCategory).map(([cat, data]) => (
                <tr key={cat} className="border-t border-gray-800">
                  <td className="py-3 text-gray-300">{cat}</td>
                  <td className="py-3 text-gray-300">{data.count}</td>
                  <td className="py-3 text-emerald-400">Rs. {data.count ? (data.total / data.count).toFixed(0) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold mb-4">Booking Status Breakdown</h3>
          <div className="space-y-3">
            {statusCount.map(({ status, count, pct }) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-400">{status}</span>
                  <span className="text-white">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div style={{ width: `${pct}%`, background: barColors[status] }} className="h-full rounded-full transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 font-semibold">Completed Bookings</div>
        {completed.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No completed bookings yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800"><tr>
              {['Service','Customer','Provider','Date','Amount'].map(h => <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {completed.map((b, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800 transition">
                  <td className="px-5 py-3 text-white font-medium">{b.service_title}</td>
                  <td className="px-5 py-3 text-gray-400">{b.customer_name}</td>
                  <td className="px-5 py-3 text-gray-400">{b.provider_name}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(b.booking_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-emerald-400 font-semibold">Rs. {b.service_price || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RevenueStats;