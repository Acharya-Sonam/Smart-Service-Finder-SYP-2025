import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App.jsx';
import { useAuth } from '../App.jsx';
import { Navbar, Footer, Badge, Stars, Loading, Empty, Btn, StatCard, formatDate, useToast, Toast } from '../components.jsx';

export function CustomerDashboard() {
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [review, setReview]     = useState({ booking_id: null, rating: 5, comment: '' });
  const [showReview, setShowReview] = useState(false);
  const { toast, show }         = useToast();

  const loadBookings = () => api('/bookings/my').then(d => setBookings(d.bookings));
  const loadReviews  = () => api('/reviews/provider/0').catch(() => ({ reviews: [] }));

  useEffect(() => {
    Promise.all([loadBookings()]).finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api('/bookings/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) });
      show('Booking cancelled', 'success');
      loadBookings();
      setSelectedBooking(null);
    } catch (e) { show(e.message, 'error'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api('/reviews', { method: 'POST', body: JSON.stringify(review) });
      show('Review submitted!', 'success');
      setShowReview(false);
      setReview({ booking_id: null, rating: 5, comment: '' });
      loadBookings();
    } catch (e) { show(e.message, 'error'); }
  };

  const completed  = bookings.filter(b => b.status === 'completed');
  const active     = bookings.filter(b => ['pending','accepted'].includes(b.status));
  const cancelled  = bookings.filter(b => ['cancelled','rejected'].includes(b.status));
  const filtered   = tab === 'all' ? bookings : tab === 'active' ? active : tab === 'completed' ? completed : cancelled;

  const TH = ({ c }) => <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#55556a', borderBottom: '1px solid #2a2a38' }}>{c}</th>;
  const TD = ({ c, last }) => <td style={{ padding: '13px 20px', fontSize: 13, color: '#8888aa', borderBottom: last ? 'none' : '1px solid #1c1c26' }}>{c}</td>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>Welcome, {user?.fullName}</h1>
          <p style={{ color: '#8888aa', marginTop: 4 }}>Manage your bookings and reviews</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Bookings" value={bookings.length}    color="#6c63ff" />
          <StatCard label="Active"         value={active.length}      color="#f7c948" />
          <StatCard label="Completed"      value={completed.length}   color="#43e97b" />
          <StatCard label="Cancelled"      value={cancelled.length}   color="#ff4d6d" />
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {['all','active','completed','cancelled'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: tab === t ? '#6c63ff' : '#1c1c26', color: tab === t ? '#fff' : '#8888aa' }}>{t}</button>
          ))}
          <Btn variant="outline" size="sm" onClick={() => navigate('/services')} style={{ marginLeft: 'auto' }}>+ Book New Service</Btn>
        </div>

        <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? <Loading /> : filtered.length === 0 ? <Empty icon="📅" text="No bookings found" /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><TH c="Service" /><TH c="Provider" /><TH c="Date" /><TH c="Time" /><TH c="Price" /><TH c="Status" /><TH c="Actions" /></tr></thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id}>
                    <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{b.service_title}</span>} last={i===filtered.length-1} />
                    <TD c={b.provider_name} last={i===filtered.length-1} />
                    <TD c={formatDate(b.booking_date)} last={i===filtered.length-1} />
                    <TD c={b.booking_time} last={i===filtered.length-1} />
                    <TD c={<span style={{ color: '#43e97b' }}>Rs. {b.service_price || '—'}</span>} last={i===filtered.length-1} />
                    <TD c={<Badge label={b.status} />} last={i===filtered.length-1} />
                    <TD last={i===filtered.length-1} c={
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" variant="ghost" onClick={() => setSelectedBooking(b)}>View</Btn>
                        {b.status === 'completed' && (
                          <Btn size="sm" variant="success" onClick={() => { setReview(r => ({ ...r, booking_id: b.id })); setShowReview(true); }}>Review</Btn>
                        )}
                        {['pending','accepted'].includes(b.status) && (
                          <Btn size="sm" variant="danger" onClick={() => cancelBooking(b.id)}>Cancel</Btn>
                        )}
                      </div>
                    } />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedBooking && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, width: 480 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Booking Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { label: 'Service',    value: selectedBooking.service_title },
                  { label: 'Provider',   value: selectedBooking.provider_name },
                  { label: 'Date',       value: formatDate(selectedBooking.booking_date) },
                  { label: 'Time',       value: selectedBooking.booking_time },
                  { label: 'Price',      value: selectedBooking.service_price ? `Rs. ${selectedBooking.service_price}` : '—' },
                  { label: 'Notes',      value: selectedBooking.notes || '—' },
                  { label: 'Booked on', value: formatDate(selectedBooking.created_at) },
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
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedBooking.status === 'completed' && (
                  <Btn variant="success" onClick={() => { setReview(r => ({ ...r, booking_id: selectedBooking.id })); setShowReview(true); setSelectedBooking(null); }}>Leave Review</Btn>
                )}
                {['pending','accepted'].includes(selectedBooking.status) && (
                  <Btn variant="danger" onClick={() => cancelBooking(selectedBooking.id)}>Cancel Booking</Btn>
                )}
                <Btn variant="ghost" onClick={() => setSelectedBooking(null)}>Close</Btn>
              </div>
            </div>
          </div>
        )}

        {showReview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, width: 420 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Leave a Review</div>
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: '#8888aa', display: 'block', marginBottom: 8 }}>Your Rating</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReview(r => ({ ...r, rating: n }))} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= review.rating ? '#f7c948' : '#2a2a38' }}>★</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#8888aa', marginTop: 6 }}>
                    {['','Very Bad','Bad','Average','Good','Excellent'][review.rating]} — {review.rating}/5
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, color: '#8888aa', display: 'block', marginBottom: 6 }}>Comment (optional)</label>
                  <textarea rows={4} value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} placeholder="Share your experience with this service provider..." style={{ width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn type="submit" fullWidth>Submit Review</Btn>
                  <Btn variant="ghost" onClick={() => setShowReview(false)}>Cancel</Btn>
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

export function Chat() {
  const { user }              = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef             = useRef(null);

  useEffect(() => {
    const endpoint = user?.role === 'Customer' ? '/bookings/my' : '/bookings/provider';
    api(endpoint).then(d => {
      setBookings(d.bookings.filter(b => ['accepted','completed'].includes(b.status)));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectBooking = (b) => {
    setSelected(b);
    setMessages(JSON.parse(localStorage.getItem(`chat_${b.id}`) || '[]'));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    const newMsg = { id: Date.now(), sender_name: user.fullName, message: input.trim(), sent_at: new Date().toISOString(), is_mine: true };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(`chat_${selected.id}`, JSON.stringify(updated));
    setInput('');
  };

  const getOther = (b) => user?.role === 'Customer' ? b.provider_name : b.customer_name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '24px', display: 'flex', gap: 16 }}>
        <div style={{ width: 280, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0' }}>Messages</div>
            <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>Chat with {user?.role === 'Customer' ? 'providers' : 'customers'}</div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 520 }}>
            {loading ? <Loading /> : bookings.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#55556a', fontSize: 13 }}>No active bookings to chat about</div>
            ) : bookings.map(b => (
              <div key={b.id} onClick={() => selectBooking(b)} style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #1c1c26', background: selected?.id === b.id ? '#1c1c26' : 'transparent', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {getOther(b)?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getOther(b)}</div>
                    <div style={{ fontSize: 11, color: '#8888aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.service_title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty icon="💬" text="Select a conversation to start messaging" />
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {getOther(selected)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>{getOther(selected)}</div>
                  <div style={{ fontSize: 12, color: '#8888aa' }}>{selected.service_title}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}><Badge label={selected.status} /></div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#55556a', fontSize: 13, margin: 'auto' }}>No messages yet. Say hello!</div>
                ) : messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: 12, background: msg.is_mine ? '#6c63ff' : '#1c1c26', color: '#e8e8f0', fontSize: 13, lineHeight: 1.5, borderBottomRightRadius: msg.is_mine ? 2 : 12, borderBottomLeftRadius: msg.is_mine ? 12 : 2 }}>
                      {msg.message}
                    </div>
                    <div style={{ fontSize: 11, color: '#55556a', marginTop: 3 }}>{new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #2a2a38', display: 'flex', gap: 10 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none' }} />
                <button type="submit" style={{ background: '#6c63ff', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
