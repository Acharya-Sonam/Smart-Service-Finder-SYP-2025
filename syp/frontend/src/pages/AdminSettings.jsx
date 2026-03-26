import React, { useState, useEffect } from 'react';
import api from "../utils/api";
const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: 'Service Provider Platform',
    site_email: 'admin@example.com'
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.settings?.general || settings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/admin/settings', { general: settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving settings');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({...settings, site_name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Email</label>
            <input
              type="email"
              value={settings.site_email}
              onChange={(e) => setSettings({...settings, site_email: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          {saved && (
            <div className="bg-green-100 text-green-700 p-3 rounded">
              Settings saved successfully!
            </div>
          )}
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;