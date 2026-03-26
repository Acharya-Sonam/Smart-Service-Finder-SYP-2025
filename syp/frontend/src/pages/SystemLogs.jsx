import React, { useState, useEffect } from 'react';
import api from "../utils/api";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([api.get('/admin/bookings'), api.get('/admin/users')])
      .then(([b, u]) => {
        const generated = [
          ...b.data.bookings.slice(0, 30).map(bk => ({
            id: 'b' + bk.id, type: 'booking',
            message: `${bk.customer_name} booked "${bk.service_title}" from ${bk.provider_name}`,
            status: bk.status, time: bk.created_at,
          })),
          ...u.data.users.slice(0, 15).map(us => ({
            id: 'u' + us.id, type: 'user',
            message: `New ${us.role} registered: ${us.fullName} (${us.email})`,
            status: 'info', time: us.created_at,
          })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time));
        setLogs(generated);
      }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">Loading logs...</div>;

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);
  const statusColors = { pending:'text-yellow-400', accepted:'text-green-400', completed:'text-blue-400', rejected:'text-red-400', cancelled:'text-gray-500', info:'text-emerald-400' };
  const typeBg = { booking:'bg-indigo-900 text-indigo-300', user:'bg-emerald-900 text-emerald-300' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Logs</h2>
        <div className="flex gap-2">
          {['all','booking','user'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Events</p>
          <p className="text-3xl font-bold text-white mt-1">{logs.length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Booking Events</p>
          <p className="text-3xl font-bold text-indigo-400 mt-1">{logs.filter(l => l.type === 'booking').length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">User Events</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{logs.filter(l => l.type === 'user').length}</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <span className="font-semibold">Activity Logs</span>
          <span className="text-sm text-gray-500">{filtered.length} events</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No logs found</p>
        ) : (
          <div>
            {filtered.map((log, i) => (
              <div key={log.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-800 transition ${i < filtered.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.type === 'user' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                <div className="flex-1">
                  <p className="text-sm text-white">{log.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{new Date(log.time).toLocaleString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBg[log.type]}`}>{log.type}</span>
                    {log.status && log.type === 'booking' && (
                      <span className={`text-xs font-medium capitalize ${statusColors[log.status] || 'text-gray-400'}`}>{log.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;