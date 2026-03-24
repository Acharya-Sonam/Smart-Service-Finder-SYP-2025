import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './App.jsx';


// ─── NAVBAR ───────────────────────────────────────────────
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Service Provider') return '/provider';
    return '/customer';
  };

  const isActive = (path) => location.pathname === path;
  const linkStyle = (path) => ({
    fontSize: 14, cursor: 'pointer', fontWeight: 500,
    color: isActive(path) ? '#6c63ff' : '#8888aa',
    transition: 'color 0.15s', padding: '4px 0',
    borderBottom: isActive(path) ? '2px solid #6c63ff' : '2px solid transparent',
  });

  return (
    <nav style={{
      height: 64, background: '#13131a', borderBottom: '1px solid #2a2a38',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 32, height: 32, background: '#6c63ff', borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff',
        }}>S</div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#e8e8f0', lineHeight: 1 }}>SmartService</div>
          <div style={{ fontSize: 9, color: '#55556a', letterSpacing: 2, textTransform: 'uppercase' }}>Finder</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <span onClick={() => navigate('/')} style={linkStyle('/')}>Home</span>
        <span onClick={() => navigate('/services')} style={linkStyle('/services')}>Services</span>
        {user && <span onClick={() => navigate(getDashboardPath())} style={linkStyle(getDashboardPath())}>Dashboard</span>}
        {user && user.role !== 'Admin' && (
          <span onClick={() => navigate('/chat')} style={linkStyle('/chat')}>Messages</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: '#55556a' }}>{user.role}</div>
            </div>
            <div onClick={() => navigate(getDashboardPath())} style={{
              width: 36, height: 36, background: '#6c63ff', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}>
              {user.fullName?.[0]?.toUpperCase()}
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} style={{
              background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
              color: '#ff4d6d', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}>Logout</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/login')} style={{
              background: '#1c1c26', border: '1px solid #2a2a38', color: '#8888aa',
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}>Login</button>
            <button onClick={() => navigate('/signup')} style={{
              background: '#6c63ff', border: 'none', color: '#fff',
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────
export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const cats = ['Plumbing','Electrical','Cleaning','Tutoring','Carpentry','Beauty & Salon'];
  const links = [
    { label: 'Browse Services', path: '/services' },
    { label: 'Login', path: '/login' },
    { label: 'Sign Up', path: '/signup' },
    { label: 'Forgot Password', path: '/forgot-password' },
  ];
  const ls = { fontSize: 13, color: '#8888aa', marginBottom: 10, cursor: 'pointer' };

  return (
    <footer style={{ background: '#13131a', borderTop: '1px solid #2a2a38', padding: '48px 0 24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, background: '#6c63ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>S</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#e8e8f0' }}>SmartService</div>
                <div style={{ fontSize: 10, color: '#55556a', letterSpacing: 1 }}>FINDER</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.7, maxWidth: 260 }}>
              Connecting people with trusted local service providers in Nepal.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e8f0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Services</div>
            {cats.map(c => <div key={c} onClick={() => navigate(`/services?category=${c}`)} style={ls}>{c}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e8f0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Platform</div>
            {links.map(l => <div key={l.label} onClick={() => navigate(l.path)} style={ls}>{l.label}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e8f0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Contact</div>
            <div style={ls}>📍 Itahari, Sunsari, Nepal</div>
            <div style={ls}>📧 support@smartservice.np</div>
            <div style={ls}>📞 +977 9800000000</div>
            <div style={{ display: 'inline-block', marginTop: 8, background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', color: '#43e97b', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              Available 24/7
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2a2a38', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#55556a' }}>© {year} SmartService Finder — Itahari International College — Second Year Project</div>
          <div style={{ fontSize: 12, color: '#55556a' }}>Built with React + Node.js + MySQL</div>
        </div>
      </div>
    </footer>
  );
}

// ─── REUSABLE UI COMPONENTS ───────────────────────────────
export const Btn = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, style, fullWidth }) => {
  const base = { border: 'none', borderRadius: 8, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: disabled ? 0.6 : 1, width: fullWidth ? '100%' : 'auto' };
  const variants = {
    primary: { background: '#6c63ff', color: '#fff' },
    danger:  { background: 'rgba(255,77,109,0.15)', color: '#ff4d6d', border: '1px solid rgba(255,77,109,0.3)' },
    ghost:   { background: '#1c1c26', color: '#8888aa', border: '1px solid #2a2a38' },
    success: { background: 'rgba(67,233,123,0.15)', color: '#43e97b', border: '1px solid rgba(67,233,123,0.3)' },
    outline: { background: 'transparent', color: '#6c63ff', border: '1px solid #6c63ff' },
  };
  const sizes = { sm: { padding: '6px 12px', fontSize: 12 }, md: { padding: '10px 20px', fontSize: 14 }, lg: { padding: '13px 28px', fontSize: 15 } };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...sizes[size], ...style }}>{children}</button>;
};

export const Badge = ({ label }) => {
  const colors = {
    pending:  { bg: 'rgba(247,201,72,0.15)',  color: '#f7c948' },
    accepted: { bg: 'rgba(67,233,123,0.15)',  color: '#43e97b' },
    completed:{ bg: 'rgba(79,195,247,0.15)',  color: '#4fc3f7' },
    rejected: { bg: 'rgba(255,77,109,0.15)',  color: '#ff4d6d' },
    cancelled:{ bg: 'rgba(136,136,170,0.15)', color: '#8888aa' },
    active:   { bg: 'rgba(67,233,123,0.15)',  color: '#43e97b' },
    inactive: { bg: 'rgba(255,77,109,0.15)',  color: '#ff4d6d' },
    Admin:    { bg: 'rgba(255,77,109,0.15)',  color: '#ff4d6d' },
    'Service Provider': { bg: 'rgba(108,99,255,0.15)', color: '#6c63ff' },
    Customer: { bg: 'rgba(67,233,123,0.15)',  color: '#43e97b' },
  };
  const c = colors[label] || { bg: 'rgba(136,136,170,0.15)', color: '#8888aa' };
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>{label}</span>;
};

export const Card = ({ children, style }) => (
  <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, ...style }}>{children}</div>
);

export const Alert = ({ message, type = 'error' }) => {
  if (!message) return null;
  const c = type === 'error'
    ? { bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.3)', color: '#ff4d6d' }
    : { bg: 'rgba(67,233,123,0.1)', border: 'rgba(67,233,123,0.3)', color: '#43e97b' };
  return <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{message}</div>;
};

export const Stars = ({ rating }) => (
  <span style={{ color: '#f7c948', fontSize: 13 }}>
    {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
  </span>
);

export const Loading = ({ text = 'Loading...' }) => (
  <div style={{ textAlign: 'center', padding: 60, color: '#55556a' }}>{text}</div>
);

export const Empty = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: 60, color: '#55556a' }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
    <p style={{ fontSize: 14 }}>{text}</p>
  </div>
);

export const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 20, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 11, color: '#55556a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800 }}>{value}</div>
  </div>
);

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const useToast = () => {
  const [toast, setToast] = useState({ msg: '', type: 'success', show: false });
  const show = (msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };
  return { toast, show };
};

export const Toast = ({ toast }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: '#13131a', border: '1px solid #2a2a38',
    borderLeft: `3px solid ${toast.type === 'success' ? '#43e97b' : '#ff4d6d'}`,
    borderRadius: 10, padding: '14px 20px', fontSize: 13,
    transform: toast.show ? 'translateY(0)' : 'translateY(100px)',
    opacity: toast.show ? 1 : 0, transition: 'all 0.3s', pointerEvents: 'none',
  }}>{toast.msg}</div>
);

export const inputStyle = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none' };
export const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#8888aa', marginBottom: 6 };
