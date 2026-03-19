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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import ServiceManagement from './ServiceManagement';
import BookingManagement from './BookingManagement';
import ReviewManagement from './ReviewManagement';
import LocationTracking from './LocationTracking';
import RevenueStats from './RevenueStats';
import SystemLogs from './SystemLogs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity')
      ]);
      setStats(statsRes.data.stats);
      setRecentActivity(activityRes.data.activity);
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-800 text-white transition-all duration-300 fixed h-full`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Admin Panel</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-indigo-700">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="mt-8">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors ${
                activeTab === item.id ? 'bg-indigo-900 border-l-4 border-white' : ''
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 hover:bg-indigo-700 rounded transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">Welcome, {user?.fullName}</span>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const DashboardHome = ({ stats, recentActivity, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Services', value: stats.total_services, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Total Bookings', value: stats.total_bookings, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Completed Bookings', value: stats.completed_bookings, icon: TrendingUp, color: 'bg-yellow-500' },
    { label: 'Pending Bookings', value: stats.pending_bookings, icon: Activity, color: 'bg-orange-500' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: Star, color: 'bg-pink-500' },
    { label: 'Total Revenue', value: `$${stats.total_revenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'bg-indigo-500' },
  ] : [];

  // Chart data
  const bookingChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 19, 15, 17, 14, 13, 10],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const userChartData = {
    labels: ['Customers', 'Providers', 'Admins'],
    datasets: [
      {
        data: [stats?.total_customers || 0, stats?.total_providers || 0, 1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Bookings</h3>
          <Line data={bookingChartData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={userChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;