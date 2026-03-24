import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { Alert, Footer, inputStyle, labelStyle } from '../components.jsx';

// ─── LOGIN PAGE ────────────────────────────────────────────
export function Login() {
  const [form, setForm]     = useState({ email: '', password: '', role: 'Customer' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      login(data.user, data.token);
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Service Provider') navigate('/provider');
      else navigate('/customer');
    } catch { setError('Cannot connect to server. Make sure backend is running.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 40, width: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, background: '#6c63ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>S</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#e8e8f0' }}>SmartService Finder</div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#e8e8f0', marginBottom: 4 }}>Welcome Back</div>
            <div style={{ color: '#8888aa', fontSize: 14 }}>Login to your account</div>
          </div>
          <Alert message={error} />
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={inputStyle} /></div>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Password</label><input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required style={inputStyle} /></div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Login as</label>
              <select value={form.role} onChange={set('role')} style={inputStyle}>
                <option value="Customer">Customer</option>
                <option value="Service Provider">Service Provider</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#3d3880' : '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#8888aa' }}>
            No account? <Link to="/signup" style={{ color: '#6c63ff', fontWeight: 600 }}>Sign Up</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            <Link to="/forgot-password" style={{ color: '#8888aa' }}>Forgot Password?</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── SIGNUP PAGE ───────────────────────────────────────────
export function Signup() {
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', contact: '', location: '', role: 'Customer' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 40, width: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, background: '#6c63ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>S</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#e8e8f0' }}>SmartService Finder</div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#e8e8f0', marginBottom: 4 }}>Create Account</div>
            <div style={{ color: '#8888aa', fontSize: 14 }}>Join SmartService today</div>
          </div>
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />
          <form onSubmit={handleSubmit}>
            {[
              { k: 'fullName', label: 'Full Name', placeholder: 'Ram Sharma' },
              { k: 'email',    label: 'Email',     placeholder: 'ram@example.com', type: 'email' },
              { k: 'password', label: 'Password',  placeholder: 'Min 6 characters', type: 'password' },
              { k: 'contact',  label: 'Phone',     placeholder: '98XXXXXXXX' },
              { k: 'location', label: 'Location',  placeholder: 'Itahari, Sunsari' },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{f.label}</label>
                <input type={f.type || 'text'} value={form[f.k]} onChange={set(f.k)} placeholder={f.placeholder} required={['fullName','email','password'].includes(f.k)} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Register as</label>
              <select value={form.role} onChange={set('role')} style={inputStyle}>
                <option value="Customer">Customer</option>
                <option value="Service Provider">Service Provider</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#3d3880' : '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#8888aa' }}>
            Have an account? <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600 }}>Login</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── FORGOT PASSWORD PAGE ──────────────────────────────────
export function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [token, setToken]     = useState('');
  const [newPass, setNewPass] = useState('');
  const [step, setStep]       = useState(1);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setToken(data.resetToken || '');
      setMsg('Reset token generated. Enter it below with your new password.');
      setStep(2);
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setMsg('Password reset successful! You can now login.');
      setStep(3);
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 40, width: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#e8e8f0', marginBottom: 4 }}>Reset Password</div>
            <div style={{ color: '#8888aa', fontSize: 14 }}>
              {step === 1 ? 'Enter your email to get a reset token' : step === 2 ? 'Enter the token and your new password' : 'Done!'}
            </div>
          </div>
          <Alert message={error} type="error" />
          <Alert message={msg} type="success" />
          {step === 1 && (
            <form onSubmit={handleForgot}>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} /></div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Sending...' : 'Get Reset Token'}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Reset Token</label><input value={token} onChange={e => setToken(e.target.value)} placeholder="Paste token here" required style={inputStyle} /></div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>New Password</label><input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" required style={inputStyle} /></div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
            <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600 }}>Back to Login</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
