import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Briefcase, Calendar, Star, DollarSign, 
  MapPin, Activity, Settings, LogOut, Menu, X 
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// Import your page components
import UserManagement from './UserManagement';
import ServiceManagement from './ServiceManagement';
import BookingManagement from './BookingManagement';
import ReviewManagement from './ReviewManagement';
import LocationTracking from './LocationTracking';
import RevenueStats from './RevenueStats';
import SystemLogs from './SystemLogs';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'locations', label: 'Live Tracking', icon: MapPin },
    { id: 'logs', label: 'System Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity')
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data?.activity || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome stats={stats} recentActivity={recentActivity} loading={loading} />;
      case 'users':
        return <UserManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'revenue':
        return <RevenueStats />;
      case 'locations':
        return <LocationTracking />;
      case 'logs':
        return <SystemLogs />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardHome stats={stats} recentActivity={recentActivity} loading={loading} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-800">
          <h1 className={`font-bold text-2xl tracking-tight ${!sidebarOpen && 'hidden'}`}>
            Admin <span className="text-indigo-400">Panel</span>
          </h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-xl transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-8 justify-between">
          <h2 className="text-2xl font-semibold">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user?.fullName || user?.name || 'Admin'}</span>
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
              {(user?.fullName || user?.name || 'A').charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-gray-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ stats, recentActivity, loading }) => {
  if (loading) {
    return <div className="flex justify-center items-center h-96"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'bg-blue-600' },
    { label: 'Total Services', value: stats?.total_services || 0, icon: Briefcase, color: 'bg-emerald-600' },
    { label: 'Total Bookings', value: stats?.total_bookings || 0, icon: Calendar, color: 'bg-violet-600' },
    { label: 'Total Revenue', value: `$${stats?.total_revenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'bg-amber-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-4xl font-bold mt-3">{card.value}</p>
              </div>
              <div className={`${card.color} p-4 rounded-xl`}>
                <card.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-gray-800 last:border-0">
                <div>
                  <p>{act.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(act.created_at).toLocaleString()}</p>
                </div>
                <span className="px-4 py-1.5 bg-gray-800 rounded-full text-sm">
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-12 text-center">No recent activity yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;