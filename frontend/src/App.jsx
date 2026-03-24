import { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing, Services, ServiceDetail } from './pages/Home.jsx';
import { Login, Signup, ForgotPassword } from './pages/Auth.jsx';
import { CustomerDashboard, Chat } from './pages/Customer.jsx';
import ProviderDashboard from './pages/Provider.jsx';
import AdminDashboard from './pages/Admin.jsx';
// ─── API HELPER ───────────────────────────────────────────
export const API_BASE = 'http://localhost:5000/api';

export const api = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: 'Bearer ' + token }),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ─── AUTH CONTEXT ─────────────────────────────────────────
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── ROUTE GUARDS ─────────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const ChatRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'Admin') return <Navigate to="/admin" />;
  return children;
};

// ─── APP ROUTES ───────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<Landing />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/signup"          element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/services"        element={<Services />} />
      <Route path="/services/:id"    element={<ServiceDetail />} />
      <Route path="/chat"            element={<ChatRoute><Chat /></ChatRoute>} />
      <Route path="/customer"        element={<ProtectedRoute role="Customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/provider"        element={<ProtectedRoute role="Service Provider"><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/admin"           element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="*"                element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
