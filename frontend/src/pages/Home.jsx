import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { api } from '../App.jsx';
import { useAuth } from '../App.jsx';
import { Navbar, Footer, Stars, Badge, Loading, Empty, Btn, Alert, formatDate } from '../components.jsx';

const CATEGORIES = ['Plumbing','Electrical','Cleaning','Tutoring','Carpentry','Beauty & Salon','Mechanic','Painting'];

// ─── LANDING PAGE ──────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ position: 'relative', padding: '80px 32px 60px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1), transparent 70%)', top: '-100px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-block', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: '#6c63ff', padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          Second Year Project — Itahari International College
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 58, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, maxWidth: 750, margin: '0 auto 20px' }}>
          Find Trusted <span style={{ color: '#6c63ff' }}>Local Services</span><br />Near You
        </h1>
        <p style={{ fontSize: 17, color: '#8888aa', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Connect with verified plumbers, electricians, tutors, cleaners and more. Book instantly, chat directly, review honestly.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={() => navigate('/services')} style={{ background: '#6c63ff', border: 'none', color: '#fff', padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Browse Services</button>
          <button onClick={() => navigate('/signup')} style={{ background: '#1c1c26', border: '1px solid #2a2a38', color: '#e8e8f0', padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Join as Provider</button>
        </div>
        <div style={{ fontSize: 13, color: '#55556a' }}>Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#6c63ff', cursor: 'pointer', fontWeight: 600 }}>Login here</span></div>
      </div>

      <div style={{ background: '#13131a', borderTop: '1px solid #2a2a38', borderBottom: '1px solid #2a2a38', padding: '28px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[{ v:'500+', l:'Service Providers' },{ v:'2000+', l:'Happy Customers' },{ v:'8', l:'Service Categories' },{ v:'24/7', l:'Support Available' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#6c63ff' }}>{s.v}</div>
              <div style={{ fontSize: 13, color: '#8888aa', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '60px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Browse by Category</h2>
          <p style={{ textAlign: 'center', color: '#8888aa', marginBottom: 36, fontSize: 15 }}>Choose from 8 service categories</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[{ name:'Plumbing', icon:'🔧' },{ name:'Electrical', icon:'⚡' },{ name:'Cleaning', icon:'🧹' },{ name:'Tutoring', icon:'📚' },{ name:'Carpentry', icon:'🪵' },{ name:'Beauty & Salon', icon:'💇' },{ name:'Mechanic', icon:'🔩' },{ name:'Painting', icon:'🎨' }].map(cat => (
              <div key={cat.name} onClick={() => navigate(`/services?category=${cat.name}`)} style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.background = '#161622'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a38'; e.currentTarget.style.background = '#13131a'; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0' }}>{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#13131a', borderTop: '1px solid #2a2a38', padding: '60px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { step:'1', icon:'🔍', title:'Search', desc:'Find services by category, location and rating' },
              { step:'2', icon:'👤', title:'View Profile', desc:'Check provider experience, pricing and reviews' },
              { step:'3', icon:'📅', title:'Book', desc:'Pick date and time, send a booking request' },
              { step:'4', icon:'⭐', title:'Review', desc:'Rate and review after the job is done' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ display: 'inline-block', background: '#6c63ff', color: '#fff', width: 20, height: 20, borderRadius: '50%', fontSize: 11, fontWeight: 700, lineHeight: '20px', textAlign: 'center', marginBottom: 10 }}>{item.step}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <div style={{ color: '#8888aa', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '60px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Key Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { icon:'✅', title:'Verified Providers', desc:'All providers verified by admin before listing services.' },
              { icon:'💬', title:'Direct Chat', desc:'Message your provider directly once booking is accepted.' },
              { icon:'📍', title:'Location Based', desc:'Find services near you — Itahari, Biratnagar, Dharan and more.' },
              { icon:'⭐', title:'Ratings & Reviews', desc:'Honest reviews from real customers after completed bookings.' },
              { icon:'🔒', title:'Secure Booking', desc:'JWT authentication with bcrypt-hashed passwords.' },
              { icon:'📊', title:'Admin Control', desc:'Full admin panel for managing users, services and bookings.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 24, display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ color: '#8888aa', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#13131a', borderTop: '1px solid #2a2a38', padding: '60px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Ready to Get Started?</h2>
        <p style={{ color: '#8888aa', fontSize: 15, marginBottom: 28 }}>Join thousands of users finding services locally</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button onClick={() => navigate('/signup')} style={{ background: '#6c63ff', border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Free Account</button>
          <button onClick={() => navigate('/services')} style={{ background: 'transparent', border: '1px solid #2a2a38', color: '#8888aa', padding: '13px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Browse Services</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── SERVICES PAGE ─────────────────────────────────────────
export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchParams]          = useSearchParams();
  const [filters, setFilters]   = useState({ category: searchParams.get('category') || '', min_price: '', max_price: '', location: '' });
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filters.category) q.set('category', filters.category);
    if (filters.min_price) q.set('min_price', filters.min_price);
    if (filters.max_price) q.set('max_price', filters.max_price);
    if (filters.location)  q.set('location', filters.location);
    api('/services?' + q.toString()).then(d => setServices(d.services)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }));
  const iStyle = { background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '9px 14px', color: '#e8e8f0', fontSize: 13, outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Browse Services</h1>
        <p style={{ color: '#8888aa', marginBottom: 28, fontSize: 15 }}>Find verified local service providers near you</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilters(f => ({ ...f, category: cat === 'All' ? '' : cat }))} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: (filters.category === cat || (cat === 'All' && !filters.category)) ? '#6c63ff' : '#1c1c26', color: (filters.category === cat || (cat === 'All' && !filters.category)) ? '#fff' : '#8888aa', outline: '1px solid #2a2a38' }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={filters.location} onChange={set('location')} placeholder="📍 Location..." style={{ ...iStyle, width: 160 }} />
          <input value={filters.min_price} onChange={set('min_price')} placeholder="Min Rs." type="number" style={{ ...iStyle, width: 110 }} />
          <input value={filters.max_price} onChange={set('max_price')} placeholder="Max Rs." type="number" style={{ ...iStyle, width: 110 }} />
          <button onClick={load} style={{ background: '#6c63ff', border: 'none', color: '#fff', padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Search</button>
          <span style={{ fontSize: 13, color: '#55556a', marginLeft: 'auto' }}>{services.length} services found</span>
        </div>

        {loading ? <Loading /> : services.length === 0 ? <Empty icon="🔍" text="No services found. Try different filters." /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {services.map(s => (
              <div key={s.id} onClick={() => navigate('/services/' + s.id)} style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a38'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{s.category}</span>
                  <span style={{ color: '#43e97b', fontWeight: 700, fontSize: 16 }}>Rs. {s.price}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#e8e8f0' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 14, lineHeight: 1.5 }}>{s.description?.substring(0,80)}{s.description?.length > 80 ? '...' : ''}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#8888aa' }}>
                    By {s.provider_name}
                    {s.is_verified && <span style={{ marginLeft: 6, background: 'rgba(67,233,123,0.15)', color: '#43e97b', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>✓ Verified</span>}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Stars rating={s.avg_rating} />
                    <span style={{ fontSize: 11, color: '#55556a' }}>({s.avg_rating || 0})</span>
                  </div>
                </div>
                {s.location && <div style={{ fontSize: 12, color: '#55556a' }}>📍 {s.location}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ─── SERVICE DETAIL PAGE ───────────────────────────────────
export function ServiceDetail() {
  const { id }     = useParams();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [service, setService]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState({ booking_date: '', booking_time: '', notes: '' });
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api('/services/' + id),
      api('/reviews/provider/' + id).catch(() => ({ reviews: [] })),
    ]).then(([s, r]) => { setService(s.service); setReviews(r.reviews || []); }).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'Customer') { setError('Only customers can book services.'); return; }
    setError(''); setMsg(''); setSubmitting(true);
    try {
      await api('/bookings', { method: 'POST', body: JSON.stringify({ service_id: parseInt(id), ...booking }) });
      setMsg('Booking request sent successfully!');
      setBooking({ booking_date: '', booking_time: '', notes: '' });
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const iStyle = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none' };

  if (loading) return <div><Navbar /><Loading /></div>;
  if (!service) return <div><Navbar /><div style={{ padding: 40, textAlign: 'center', color: '#8888aa' }}>Service not found</div><Footer /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>← Back</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div>
            <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{service.category}</span>
                <span style={{ color: '#43e97b', fontWeight: 700, fontSize: 22 }}>Rs. {service.price}</span>
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{service.title}</h1>
              <p style={{ color: '#8888aa', lineHeight: 1.7, marginBottom: 16 }}>{service.description}</p>
              <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#8888aa', flexWrap: 'wrap' }}>
                <span>👤 {service.provider_name}{service.is_verified && <span style={{ marginLeft: 6, background: 'rgba(67,233,123,0.15)', color: '#43e97b', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>✓ Verified</span>}</span>
                {service.location && <span>📍 {service.location}</span>}
                <span>📞 {service.provider_contact || 'N/A'}</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stars rating={service.avg_rating} />
                <span style={{ fontSize: 13, color: '#8888aa' }}>{service.avg_rating || 0} ({service.total_reviews || 0} reviews)</span>
              </div>
            </div>
            <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Reviews ({reviews.length})</div>
              {reviews.length === 0 ? <p style={{ color: '#55556a', fontSize: 14 }}>No reviews yet.</p> : reviews.map((r, i) => (
                <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < reviews.length-1 ? '1px solid #2a2a38' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.customer_name}</span>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ fontSize: 13, color: '#8888aa' }}>{r.comment || 'No comment'}</p>
                  <span style={{ fontSize: 11, color: '#55556a' }}>{formatDate(r.created_at)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 24, alignSelf: 'start' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Book This Service</div>
            <Alert message={error} type="error" />
            <Alert message={msg} type="success" />
            {!user ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 16 }}>Login to book this service</p>
                <Btn onClick={() => navigate('/login')} fullWidth>Login to Book</Btn>
              </div>
            ) : user.role !== 'Customer' ? (
              <p style={{ color: '#8888aa', fontSize: 14 }}>Only customers can book services.</p>
            ) : (
              <form onSubmit={handleBook}>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6 }}>Date</label><input type="date" value={booking.booking_date} required onChange={e => setBooking(b => ({ ...b, booking_date: e.target.value }))} min={new Date().toISOString().split('T')[0]} style={iStyle} /></div>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6 }}>Time</label><input type="time" value={booking.booking_time} required onChange={e => setBooking(b => ({ ...b, booking_time: e.target.value }))} style={iStyle} /></div>
                <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6 }}>Notes (optional)</label><textarea value={booking.notes} rows={3} onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))} placeholder="Any special instructions..." style={{ ...iStyle, resize: 'vertical' }} /></div>
                <Btn type="submit" disabled={submitting} fullWidth style={{ padding: 12 }}>{submitting ? 'Sending...' : 'Send Booking Request'}</Btn>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
