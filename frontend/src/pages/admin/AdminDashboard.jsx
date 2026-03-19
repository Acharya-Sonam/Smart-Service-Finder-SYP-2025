import '../../styles/admin-minimal.css';
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
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${!sidebarOpen && 'closed'} ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

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
            </div>
          </div>
        </header>

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
                  <div className="stat-value">${stats?.total_revenue?.toFixed(2) || 0}</div>
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;