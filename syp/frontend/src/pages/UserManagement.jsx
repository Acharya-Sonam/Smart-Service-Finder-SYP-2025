import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import api from '../utils/api';
import './admin.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'status-completed';
      case 'Service Provider': return 'status-accepted';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="chart-title">User Management</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <Search size={20} style={{ marginLeft: '-40px', marginTop: '8px', color: '#999' }} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #edf2f7' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Contact</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="user-avatar" style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                      {user.fullName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>{user.contact || 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`activity-status ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{user.location || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ background: 'none', border: 'none', color: '#f56565', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;