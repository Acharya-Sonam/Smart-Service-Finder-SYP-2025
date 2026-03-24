import { useEffect, useState } from 'react';
import { api } from '../App.jsx';
import { Navbar, Footer, Badge, Stars, Loading, Empty, Btn, StatCard, formatDate, useToast, Toast } from '../components.jsx';

const NAV = ['overview', 'users', 'services', 'bookings', 'reviews', 'revenue', 'logs'];

const TAB_LABELS = {
  overview: 'Overview', users: 'Users', services: 'Services',
  bookings: 'Bookings', reviews: 'Reviews',
  revenue: 'Revenue Stats', logs: 'System Logs',
};

const STATUS_COLORS = {
  pending: '#f7c948', accepted: '#43e97b', completed: '#4fc3f7',
  rejected: '#ff4d6d', cancelled: '#8888aa',
};

export default function AdminDashboard() {
  const [tab, setTab]           = useState('overview');
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [users, setUsers]       = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const { toast, show }         = useToast();

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'overview') {
        const [s, a] = await Promise.all([api('/admin/stats'), api('/admin/activity')]);
        setStats(s.stats); setActivity(a.activity);
      }
      if (t === 'users')    setUsers((await api('/admin/users')).users);
      if (t === 'services') setServices((await api('/admin/services')).services);
      if (t === 'bookings') setBookings((await api('/admin/bookings')).bookings);
      if (t === 'reviews')  setReviews((await api('/admin/reviews')).reviews);
      if (t === 'revenue') {
        const [b, s] = await Promise.all([api('/admin/bookings'), api('/admin/services')]);
        setBookings(b.bookings); setServices(s.services);
      }
      if (t === 'logs') {
        const [b, u] = await Promise.all([api('/admin/bookings'), api('/admin/users')]);
        const generated = [
          ...b.bookings.slice(0, 20).map(bk => ({
            id: 'b' + bk.id, type: 'booking',
            message: `${bk.customer_name} booked ${bk.service_title} from ${bk.provider_name}`,
            status: bk.status, time: bk.created_at,
          })),
          ...u.users.slice(0, 10).map(us => ({
            id: 'u' + us.id, type: 'user',
            message: `New ${us.role} registered — ${us.fullName} (${us.email})`,
            status: 'info', time: us.created_at,
          })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time));
        setLogs(generated);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTab(tab); }, [tab]);

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await api('/admin/users/' + id, { method: 'DELETE' }); show('User deleted', 'success'); loadTab('users'); }
    catch (e) { show(e.message, 'error'); }
  };

  const toggleService = async (id, current) => {
    try { await api('/admin/services/' + id, { method: 'PATCH', body: JSON.stringify({ is_active: !current }) }); show('Updated', 'success'); loadTab('services'); }
    catch (e) { show(e.message, 'error'); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await api('/admin/services/' + id, { method: 'DELETE' }); show('Deleted', 'success'); loadTab('services'); }
    catch (e) { show(e.message, 'error'); }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api('/admin/reviews/' + id, { method: 'DELETE' }); show('Deleted', 'success'); loadTab('reviews'); }
    catch (e) { show(e.message, 'error'); }
  };

  const ts = { background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden' };
  const TH = ({ c }) => <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#55556a', borderBottom: '1px solid #2a2a38' }}>{c}</th>;
  const TD = ({ c, last }) => <td style={{ padding: '13px 20px', fontSize: 13, color: '#8888aa', borderBottom: last ? 'none' : '1px solid #1c1c26' }}>{c}</td>;

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.service_price || 0), 0);
  const revenueByCategory = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { category: s.category, count: 0, total: 0 };
    acc[s.category].count += 1;
    acc[s.category].total += parseFloat(s.price || 0);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: '#8888aa', marginTop: 4 }}>Full system management and monitoring</p>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
          {NAV.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t ? '#6c63ff' : '#1c1c26', color: tab === t ? '#fff' : '#8888aa' }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : (
          <>
            {tab === 'overview' && stats && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  <StatCard label="Total Users"    value={stats.total_users}      color="#6c63ff" />
                  <StatCard label="Services"       value={stats.total_services}   color="#43e97b" />
                  <StatCard label="Bookings"       value={stats.total_bookings}   color="#4fc3f7" />
                  <StatCard label="Reviews"        value={stats.total_reviews}    color="#f7c948" />
                  <StatCard label="Customers"      value={stats.total_customers}  color="#ff6584" />
                  <StatCard label="Providers"      value={stats.total_providers}  color="#f7971e" />
                  <StatCard label="Pending"        value={stats.pending_bookings} color="#ff4d6d" />
                </div>
                <div style={ts}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', fontWeight: 600, fontSize: 15 }}>Recent Activity</div>
                  <div style={{ padding: '0 20px 8px' }}>
                    {activity.length === 0 ? <Empty icon="📭" text="No activity yet" /> : activity.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < activity.length - 1 ? '1px solid #1c1c26' : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[a.status] || '#8888aa', flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 13, color: '#8888aa' }}>
                          <span style={{ color: '#e8e8f0', fontWeight: 500 }}>{a.customer_name}</span> booked <span style={{ color: '#e8e8f0', fontWeight: 500 }}>{a.service_title}</span>
                        </div>
                        <Badge label={a.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'users' && (
              <div style={ts}>
                {users.length === 0 ? <Empty icon="👥" text="No users" /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH c="Name" /><TH c="Email" /><TH c="Contact" /><TH c="Role" /><TH c="Joined" /><TH c="Actions" /></tr></thead>
                    <tbody>{users.map((u, i) => (
                      <tr key={u.id}>
                        <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{u.fullName}</span>} last={i === users.length - 1} />
                        <TD c={u.email} last={i === users.length - 1} />
                        <TD c={u.contact || '—'} last={i === users.length - 1} />
                        <TD c={<Badge label={u.role} />} last={i === users.length - 1} />
                        <TD c={formatDate(u.created_at)} last={i === users.length - 1} />
                        <TD last={i === users.length - 1} c={u.role !== 'Admin' ? <Btn size="sm" variant="danger" onClick={() => deleteUser(u.id, u.fullName)}>Delete</Btn> : '—'} />
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'services' && (
              <div style={ts}>
                {services.length === 0 ? <Empty icon="🛠️" text="No services" /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH c="Title" /><TH c="Provider" /><TH c="Category" /><TH c="Price" /><TH c="Status" /><TH c="Actions" /></tr></thead>
                    <tbody>{services.map((s, i) => (
                      <tr key={s.id}>
                        <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{s.title}</span>} last={i === services.length - 1} />
                        <TD c={s.provider_name} last={i === services.length - 1} />
                        <TD c={<Badge label={s.category} />} last={i === services.length - 1} />
                        <TD c={<span style={{ color: '#43e97b' }}>Rs. {s.price}</span>} last={i === services.length - 1} />
                        <TD c={<Badge label={s.is_active ? 'active' : 'inactive'} />} last={i === services.length - 1} />
                        <TD last={i === services.length - 1} c={
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn size="sm" variant="ghost" onClick={() => toggleService(s.id, s.is_active)}>{s.is_active ? 'Deactivate' : 'Activate'}</Btn>
                            <Btn size="sm" variant="danger" onClick={() => deleteService(s.id)}>Delete</Btn>
                          </div>
                        } />
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'bookings' && (
              <div style={ts}>
                {bookings.length === 0 ? <Empty icon="📅" text="No bookings" /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH c="Service" /><TH c="Customer" /><TH c="Provider" /><TH c="Date" /><TH c="Time" /><TH c="Status" /></tr></thead>
                    <tbody>{bookings.map((b, i) => (
                      <tr key={b.id}>
                        <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{b.service_title}</span>} last={i === bookings.length - 1} />
                        <TD c={b.customer_name} last={i === bookings.length - 1} />
                        <TD c={b.provider_name} last={i === bookings.length - 1} />
                        <TD c={formatDate(b.booking_date)} last={i === bookings.length - 1} />
                        <TD c={b.booking_time} last={i === bookings.length - 1} />
                        <TD c={<Badge label={b.status} />} last={i === bookings.length - 1} />
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div style={ts}>
                {reviews.length === 0 ? <Empty icon="⭐" text="No reviews" /> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH c="Customer" /><TH c="Provider" /><TH c="Rating" /><TH c="Comment" /><TH c="Date" /><TH c="Actions" /></tr></thead>
                    <tbody>{reviews.map((r, i) => (
                      <tr key={r.id}>
                        <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{r.customer_name}</span>} last={i === reviews.length - 1} />
                        <TD c={r.provider_name} last={i === reviews.length - 1} />
                        <TD c={<Stars rating={r.rating} />} last={i === reviews.length - 1} />
                        <TD c={<span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.comment || '—'}</span>} last={i === reviews.length - 1} />
                        <TD c={formatDate(r.created_at)} last={i === reviews.length - 1} />
                        <TD last={i === reviews.length - 1} c={<Btn size="sm" variant="danger" onClick={() => deleteReview(r.id)}>Delete</Btn>} />
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            )}

            {tab === 'revenue' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  <StatCard label="Total Revenue"      value={`Rs. ${totalRevenue.toFixed(0)}`} color="#43e97b" />
                  <StatCard label="Completed Bookings" value={completedBookings.length}          color="#6c63ff" />
                  <StatCard label="Total Services"     value={services.length}                  color="#4fc3f7" />
                  <StatCard label="Avg Booking Value"  value={completedBookings.length ? `Rs. ${(totalRevenue / completedBookings.length).toFixed(0)}` : 'Rs. 0'} color="#f7c948" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div style={ts}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', fontWeight: 600, fontSize: 15 }}>Revenue by Category</div>
                    {Object.values(revenueByCategory).length === 0 ? <Empty icon="📊" text="No data" /> : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><TH c="Category" /><TH c="Services" /><TH c="Avg Price" /></tr></thead>
                        <tbody>
                          {Object.values(revenueByCategory).map((r, i, arr) => (
                            <tr key={r.category}>
                              <TD c={<Badge label={r.category} />} last={i === arr.length - 1} />
                              <TD c={r.count} last={i === arr.length - 1} />
                              <TD c={<span style={{ color: '#43e97b' }}>Rs. {r.count ? (r.total / r.count).toFixed(0) : 0}</span>} last={i === arr.length - 1} />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div style={ts}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', fontWeight: 600, fontSize: 15 }}>Booking Status Breakdown</div>
                    <div style={{ padding: 20 }}>
                      {['pending', 'accepted', 'completed', 'rejected', 'cancelled'].map(status => {
                        const count = bookings.filter(b => b.status === status).length;
                        const pct   = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                        return (
                          <div key={status} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 13, textTransform: 'capitalize', color: '#8888aa' }}>{status}</span>
                              <span style={{ fontSize: 13, color: '#e8e8f0', fontWeight: 500 }}>{count} ({pct}%)</span>
                            </div>
                            <div style={{ height: 6, background: '#1c1c26', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: STATUS_COLORS[status], borderRadius: 3 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={ts}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', fontWeight: 600, fontSize: 15 }}>Completed Bookings Revenue</div>
                  {completedBookings.length === 0 ? <Empty icon="💰" text="No completed bookings yet" /> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr><TH c="Service" /><TH c="Customer" /><TH c="Provider" /><TH c="Date" /><TH c="Amount" /></tr></thead>
                      <tbody>
                        {completedBookings.map((b, i) => (
                          <tr key={b.id}>
                            <TD c={<span style={{ color: '#e8e8f0', fontWeight: 500 }}>{b.service_title}</span>} last={i === completedBookings.length - 1} />
                            <TD c={b.customer_name} last={i === completedBookings.length - 1} />
                            <TD c={b.provider_name} last={i === completedBookings.length - 1} />
                            <TD c={formatDate(b.booking_date)} last={i === completedBookings.length - 1} />
                            <TD c={<span style={{ color: '#43e97b', fontWeight: 600 }}>Rs. {b.service_price || '—'}</span>} last={i === completedBookings.length - 1} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {tab === 'logs' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                  <StatCard label="Total Events"   value={logs.length}                                   color="#6c63ff" />
                  <StatCard label="Booking Events" value={logs.filter(l => l.type === 'booking').length} color="#4fc3f7" />
                  <StatCard label="User Events"    value={logs.filter(l => l.type === 'user').length}    color="#43e97b" />
                </div>
                <div style={ts}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>System Activity Logs</span>
                    <span style={{ fontSize: 12, color: '#55556a' }}>{logs.length} events recorded</span>
                  </div>
                  {logs.length === 0 ? <Empty icon="📋" text="No system logs yet" /> : (
                    <div style={{ padding: '8px 0' }}>
                      {logs.map((log, i) => (
                        <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 20px', borderBottom: i < logs.length - 1 ? '1px solid #1c1c26' : 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1c1c26'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: log.type === 'booking' ? (STATUS_COLORS[log.status] || '#6c63ff') : '#43e97b', flexShrink: 0, marginTop: 4 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: '#e8e8f0', marginBottom: 4 }}>{log.message}</div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: '#55556a' }}>{formatDate(log.time)}</span>
                              <span style={{ fontSize: 10, background: log.type === 'booking' ? 'rgba(108,99,255,0.15)' : 'rgba(67,233,123,0.15)', color: log.type === 'booking' ? '#6c63ff' : '#43e97b', padding: '2px 8px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {log.type}
                              </span>
                              {log.status && log.type === 'booking' && <Badge label={log.status} />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <Toast toast={toast} />
    </div>
  );
}
