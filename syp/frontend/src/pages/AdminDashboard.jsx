<<<<<<< HEAD
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
=======
import '../styles/admin-minimal.css';
import UserManagement from './UserManagement';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Star, 
  TrendingUp, 
  MapPin,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  Activity,
  DollarSign
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
<<<<<<< HEAD
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

=======
  const [loading, setLoading] = useState(true);
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
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
<<<<<<< HEAD
    if (user) fetchDashboardData();
  }, [user]);
=======
    fetchDashboardData();
  }, []);
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity')
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data?.activity || []);
=======
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className={`logo ${!sidebarOpen && 'closed'}`}>AdminPanel</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="nav-menu">
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
<<<<<<< HEAD
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
=======
              className={`nav-item ${!sidebarOpen && 'closed'} ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
            </button>
          ))}
        </nav>

<<<<<<< HEAD
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
=======
        <button
          onClick={logout}
          className={`logout-btn ${!sidebarOpen && 'closed'}`}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!sidebarOpen && 'sidebar-closed'}`}>
        <header className="header">
          <h2 className="page-title">
            {menuItems.find(item => item.id === activeTab)?.label}
          </h2>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user?.fullName}</span>
            <div className="user-avatar">
              {user?.fullName?.charAt(0)}
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
            </div>
          </div>
        </header>

<<<<<<< HEAD
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-gray-950">
          {renderContent()}
=======
        <main className="content-area">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users size={24} />
                  </div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats?.total_users || 0}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Briefcase size={24} />
                  </div>
                  <div className="stat-label">Total Services</div>
                  <div className="stat-value">{stats?.total_services || 0}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-label">Total Bookings</div>
                  <div className="stat-value">{stats?.total_bookings || 0}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value"><p>${Number(stats?.total_revenue || 0).toFixed(2)}</p></div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="chart-container">
                <h3 className="chart-title">Revenue Overview</h3>
                <p className="text-gray-500 text-center py-8">Chart will be displayed here</p>
              </div>

              {/* Recent Activity */}
              <div className="activity-container">
                <h3 className="activity-title">Recent Activity</h3>
                <div className="activity-item">
                  <div className="activity-content">
                    <div className="activity-description">New user registered</div>
                    <div className="activity-time">2 minutes ago</div>
                  </div>
                  <span className="activity-status status-completed">New</span>
                </div>
                <div className="activity-item">
                  <div className="activity-content">
                    <div className="activity-description">Booking #123 completed</div>
                    <div className="activity-time">5 minutes ago</div>
                  </div>
                  <span className="activity-status status-completed">Completed</span>
                </div>
                <div className="activity-item">
                  <div className="activity-content">
                    <div className="activity-description">New service added</div>
                    <div className="activity-time">10 minutes ago</div>
                  </div>
                  <span className="activity-status status-accepted">Active</span>
                </div>
              </div>
            </>
          )}

          {/* USERS TAB - This needs to be here, not inside the conditional above */}
          {activeTab === 'users' && <UserManagement />}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="chart-container">
              <h3 className="chart-title">Services Management</h3>
              <p className="text-gray-500 text-center py-8">Services management coming soon...</p>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="chart-container">
              <h3 className="chart-title">Bookings Management</h3>
              <p className="text-gray-500 text-center py-8">Bookings management coming soon...</p>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="chart-container">
              <h3 className="chart-title">Reviews Management</h3>
              <p className="text-gray-500 text-center py-8">Reviews management coming soon...</p>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="chart-container">
              <h3 className="chart-title">Revenue Reports</h3>
              <p className="text-gray-500 text-center py-8">Revenue reports coming soon...</p>
            </div>
          )}

          {/* Live Tracking Tab */}
          {activeTab === 'locations' && (
            <div className="chart-container">
              <h3 className="chart-title">Live Provider Tracking</h3>
              <p className="text-gray-500 text-center py-8">Live tracking coming soon...</p>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === 'logs' && (
            <div className="chart-container">
              <h3 className="chart-title">System Logs</h3>
              <p className="text-gray-500 text-center py-8">System logs coming soon...</p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="chart-container">
              <h3 className="chart-title">Settings</h3>
              <p className="text-gray-500 text-center py-8">Settings coming soon...</p>
            </div>
          )}
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
        </main>
      </div>
    </div>
  );
};

<<<<<<< HEAD
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

=======
>>>>>>> 0cb00864c984a909126aef019326fe2b023bd812
export default AdminDashboard;