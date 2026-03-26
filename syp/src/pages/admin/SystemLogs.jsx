import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading logs...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Logs</h2>
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.type === 'error' ? 'bg-red-100 text-red-800' :
                      log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{log.user || 'System'}</td>
                  <td className="px-6 py-4 text-sm">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;