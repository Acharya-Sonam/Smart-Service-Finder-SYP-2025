import { useEffect, useState } from 'react';
import { api } from '../App.jsx';
import { useAuth } from '../App.jsx';
import { Navbar, Footer, Badge, Stars, Loading, Empty, Btn, StatCard, Alert, formatDate, useToast, Toast } from '../components.jsx';

const CATEGORIES = ['Plumbing','Electrical','Cleaning','Tutoring','Carpentry','Beauty & Salon','Mechanic','Painting'];

export default function ProviderDashboard() {
  const { user }                = useAuth();
  const [tab, setTab]           = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form, setForm]         = useState({ title: '', description: '', category: 'Plumbing', price: '', location: '' });
  const [formError, setFormError] = useState('');
  const { toast, show }         = useToast();

  const loadBookings = () => api('/bookings/provider').then(d => setBookings(d.bookings));
  const loadServices = () => api('/services/my').then(d => setServices(d.services));
  const loadReviews  = () => api('/reviews/provider/' + user.id).then(d => setReviews(d.reviews));

  useEffect(() => {
    Promise.all([loadBookings(), loadServices(), loadReviews()]).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api('/bookings/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) });
      show('Booking ' + status, 'success');
      loadBookings();
      setSelectedBooking(null);
    } catch (e) { show(e.message, 'error'); }
  };

  const addService = async (e) => {
    e.preventDefault(); setFormError('');
    try {
      await api('/services', { method: 'POST', body: JSON.stringify({ ...form, price: parseFloat(form.price) }) });
      show('Service created!', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'Plumbing', price: '', location: '' });
      loadServices();
    } catch (e) { setFormError(e.message); }
  };

  const updateService = async (e) => {
    e.preventDefault(); setFormError('');
    try {
      await api('/services/' + editService.id, { method: 'PUT', body: JSON.stringify({ ...form, price: parseFloat(form.price) }) });
      show('Service updated!', 'success');
      setEditService(null);
      setForm({ title: '', description: '', category: 'Plumbing', price: '', location: '' });
      loadServices();
    } catch (e) { setFormError(e.message); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api('/services/' + id, { method: 'DELETE' });
      show('Service deleted', 'success');
      loadServices();
    } catch (e) { show(e.message, 'error'); }
  };

  const openEdit = (s) => {
    setEditService(s);
    setForm({ title: s.title, description: s.description || '', category: s.category, price: s.price, location: s.location || '' });
    setFormError('');
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const iStyle = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none' };
  const lStyle = { display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6 };
  const TH = ({ c }) => <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#55556a', borderBottom: '1px solid #2a2a38' }}>{c}</th>;
  const TD = ({ c, last }) => <td style={{ padding: '13px 20px', fontSize: 13, color: '#8888aa', borderBottom: last ? 'none' : '1px solid #1c1c26' }}>{c}</td>;

  const tabs = ['bookings', 'services', 'reviews'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>Provider Dashboard</h1>
          <p style={{ color: '#8888aa', marginTop: 4 }}>Welcome back, {user?.fullName}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Bookings" value={bookings.length} color="#6c63ff" />
          <StatCard label="Pending" value={bookings.filter(b => b.status === 'pending').length} color="#f7c948" />
          <StatCard label="Active Jobs" value={bookings.filter(b => b.status === 'accepted').length} color="#43e97b" />
          <StatCard label="My Services" value={services.length} color="#4fc3f7" />
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, alignItems: 'center' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: tab === t ? '#6c63ff' : '#1c1c26', color: tab === t ? '#fff' : '#8888aa' }}>
              {t === 'bookings' ? `Booking Management` : t === 'services' ? 'Service Management' : `Reviews & Ratings`}
            </button>
          ))}
          {tab === 'services' && (
            <Btn variant="outline" size="sm" onClick={() => { setShowForm(true); setEditService(null); setForm({ title: '', description: '', category: 'Plumbing', price: '', location: '' }); }} style={{ marginLeft: 'auto' }}>
              + Add Service
            </Btn>
          )}
        </div>

        {loading ? <Loading /> : (
          <>
            {tab === 'bookings' && (
              <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden' }}>
                {bookings.length === 0 ? <Empty icon="📅" text="No bookings yet" /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH c="Service" /><TH c="Customer" /><TH c="Contact" /><TH c="Date" /><TH c="Time" /><TH c="Status" /><TH c="Actions" /></tr></thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b.id}>
                          <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{b.service_title}</span>} last={i===bookings.length-1} />
                          <TD c={b.customer_name} last={i===bookings.length-1} />
                          <TD c={b.customer_contact || '—'} last={i===bookings.length-1} />
                          <TD c={formatDate(b.booking_date)} last={i===bookings.length-1} />
                          <TD c={b.booking_time} last={i===bookings.length-1} />
                          <TD c={<Badge label={b.status} />} last={i===bookings.length-1} />
                          <TD last={i===bookings.length-1} c={
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Btn size="sm" variant="ghost" onClick={() => setSelectedBooking(b)}>View</Btn>
                              {b.status === 'pending' && (
                                <>
                                  <Btn size="sm" variant="success" onClick={() => updateStatus(b.id, 'accepted')}>Accept</Btn>
                                  <Btn size="sm" variant="danger" onClick={() => updateStatus(b.id, 'rejected')}>Reject</Btn>
                                </>
                              )}
                              {b.status === 'accepted' && (
                                <Btn size="sm" variant="outline" onClick={() => updateStatus(b.id, 'completed')}>Complete</Btn>
                              )}
                            </div>
                          } />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'services' && (
              <div>
                {services.length === 0 ? (
                  <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12 }}>
                    <Empty icon="🛠️" text="No services yet. Add your first service!" />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                    {services.map(s => (
                      <div key={s.id} style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ background: 'rgba(108,99,255,0.15)', color: '#6c63ff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{s.category}</span>
                          <span style={{ color: '#43e97b', fontWeight: 700 }}>Rs. {s.price}</span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#e8e8f0' }}>{s.title}</h3>
                        <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 8, lineHeight: 1.5 }}>{s.description?.substring(0, 80)}...</p>
                        {s.location && <div style={{ fontSize: 12, color: '#55556a', marginBottom: 12 }}>📍 {s.location}</div>}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Btn size="sm" variant="ghost" onClick={() => openEdit(s)}>Edit</Btn>
                          <Btn size="sm" variant="danger" onClick={() => deleteService(s.id)}>Delete</Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                  <StatCard label="Total Reviews" value={reviews.length} color="#f7c948" />
                  <StatCard label="Avg Rating" value={reviews.length ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0'} color="#43e97b" />
                  <StatCard label="5 Star Reviews" value={reviews.filter(r => r.rating === 5).length} color="#6c63ff" />
                </div>
                <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden' }}>
                  {reviews.length === 0 ? <Empty icon="⭐" text="No reviews yet. Complete bookings to receive reviews." /> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><TH c="Customer" /><TH c="Rating" /><TH c="Comment" /><TH c="Date" /></tr></thead>
                      <tbody>
                        {reviews.map((r, i) => (
                          <tr key={r.id}>
                            <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{r.customer_name}</span>} last={i===reviews.length-1} />
                            <TD c={<Stars rating={r.rating} />} last={i===reviews.length-1} />
                            <TD c={<span style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.comment || '—'}</span>} last={i===reviews.length-1} />
                            <TD c={formatDate(r.created_at)} last={i===reviews.length-1} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {selectedBooking && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, width: 480 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Booking Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Service',    value: selectedBooking.service_title },
                  { label: 'Customer',   value: selectedBooking.customer_name },
                  { label: 'Contact',    value: selectedBooking.customer_contact || '—' },
                  { label: 'Date',       value: formatDate(selectedBooking.booking_date) },
                  { label: 'Time',       value: selectedBooking.booking_time },
                  { label: 'Notes',      value: selectedBooking.notes || '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c26', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: '#8888aa' }}>{item.label}</span>
                    <span style={{ fontSize: 13, color: '#e8e8f0', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c26', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: '#8888aa' }}>Status</span>
                  <Badge label={selectedBooking.status} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <Btn variant="success" onClick={() => updateStatus(selectedBooking.id, 'accepted')}>Accept</Btn>
                    <Btn variant="danger" onClick={() => updateStatus(selectedBooking.id, 'rejected')}>Reject</Btn>
                  </>
                )}
                {selectedBooking.status === 'accepted' && (
                  <Btn variant="outline" onClick={() => updateStatus(selectedBooking.id, 'completed')}>Mark as Completed</Btn>
                )}
                <Btn variant="ghost" onClick={() => setSelectedBooking(null)}>Close</Btn>
              </div>
            </div>
          </div>
        )}

        {(showForm || editService) && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, width: 480 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                {editService ? 'Edit Service' : 'Add New Service'}
              </div>
              <Alert message={formError} />
              <form onSubmit={editService ? updateService : addService}>
                <div style={{ marginBottom: 12 }}><label style={lStyle}>Service Title</label><input value={form.title} onChange={set('title')} placeholder="e.g. Home Plumbing Repair" required style={iStyle} /></div>
                <div style={{ marginBottom: 12 }}><label style={lStyle}>Description</label><textarea rows={3} value={form.description} onChange={set('description')} placeholder="Describe your service..." style={{ ...iStyle, resize: 'vertical' }} /></div>
                <div style={{ marginBottom: 12 }}>
                  <label style={lStyle}>Category</label>
                  <select value={form.category} onChange={set('category')} style={iStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}><label style={lStyle}>Price (Rs.)</label><input type="number" value={form.price} onChange={set('price')} placeholder="500" required style={iStyle} /></div>
                <div style={{ marginBottom: 20 }}><label style={lStyle}>Location</label><input value={form.location} onChange={set('location')} placeholder="Itahari, Sunsari" style={iStyle} /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn type="submit" fullWidth>{editService ? 'Update Service' : 'Add Service'}</Btn>
                  <Btn variant="ghost" onClick={() => { setShowForm(false); setEditService(null); }}>Cancel</Btn>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
