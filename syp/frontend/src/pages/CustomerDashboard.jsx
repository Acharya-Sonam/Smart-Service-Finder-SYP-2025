import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/CustomerProfile.css";


const API        = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const SERVICE_ICONS = {
  "Home Cleaning":   "🧹",
  "Plumbing Repair": "🔧",
  "Electrical Work": "⚡",
  "Painting":        "🎨",
  "Carpentry":       "🪚",
  "Landscaping":     "🌿",
  "AC Repair":       "❄️",
};

const CATEGORIES = [
  "", "Home Cleaning", "Plumbing Repair", "Electrical Work",
  "Painting", "Carpentry", "Landscaping", "AC Repair",
];

const NAV = [
  { id: "overview",      icon: "◈", label: "Overview"      },
  { id: "search",        icon: "⊕", label: "Find Services" },
  { id: "bookings",      icon: "◷", label: "My Bookings"   },
  { id: "chat",          icon: "◉", label: "Messages"      },
  { id: "notifications", icon: "◎", label: "Notifications" },
  { id: "settings",      icon: "⊛", label: "Settings"      },
];

const STATUS_CLASS = {
  pending:       "pending",
  accepted:      "accepted",
  rejected:      "cancelled",
  "in progress": "in-progress",
  completed:     "completed",
  cancelled:     "cancelled",
};

const STATUS_LABEL = {
  pending:   "Pending",
  accepted:  "Accepted",
  rejected:  "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ─── Axios with token ─────────────────────────────────────────────
const authAxios = () => {
  const token = localStorage.getItem("token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
};

// ══════════════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function CustomerDashboard() {
  const [user, setUser]                   = useState(null);
  const [bookings, setBookings]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab]         = useState("overview");
  const [initial, setInitial]             = useState("?");
  const [unreadNotif, setUnreadNotif]     = useState(0);
  const socketRef                         = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { window.location.href = "/auth"; return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setInitial(parsed.fullName?.charAt(0).toUpperCase() || "?");

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit("join", parsed.id);

    // Real-time chat message → push to notifications
    socket.on("receive_message", (data) => {
      setNotifications((prev) => [{
        id: Date.now(), type: "chat",
        message: `💬 New message from ${data.senderName || "provider"}`,
        is_read: 0, created_at: new Date().toISOString(),
      }, ...prev]);
      setUnreadNotif((n) => n + 1);
    });

    // Real-time booking/status notification
    socket.on("new_notification", (data) => {
      setNotifications((prev) => [{
        id: Date.now(), type: data.type,
        message: data.message,
        is_read: 0, created_at: new Date().toISOString(),
      }, ...prev]);
      setUnreadNotif((n) => n + 1);
      // Also refresh bookings when status changes
      if (data.type === "status") fetchBookings();
    });

    fetchBookings();
    fetchNotifications();

    return () => socket.disconnect();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await authAxios().get(`${API}/bookings/my`);
      setBookings(Array.isArray(data) ? data : (data.bookings || []));
    } catch (e) { console.error("bookings:", e); }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await authAxios().get(`${API}/notifications`);
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadNotif((Array.isArray(data) ? data : []).filter((n) => !n.is_read).length);
    } catch (e) { console.error("notifications:", e); }
  };

  const handleLogout = () => {
    socketRef.current?.disconnect();
    localStorage.clear();
    window.location.href = "/auth";
  };

  const completed = bookings.filter((b) => b.status === "completed");
  const active    = bookings.filter((b) => ["pending", "accepted"].includes(b.status));
  const avgRating = completed.filter((b) => b.rating).length
    ? (completed.filter((b) => b.rating).reduce((a, b) => a + b.rating, 0) / completed.filter((b) => b.rating).length).toFixed(1)
    : "—";

  if (!user) return (
    <div className="cd-loading"><div className="cd-spinner" /><span>Loading…</span></div>
  );

  return (
    <div className="cd-root">

      {/* ═══════ SIDEBAR ═══════ */}
      <aside className="cd-sidebar">
        <div className="cd-brand">
          <div className="cd-brand-mark">✦</div>
          <div className="cd-brand-name">Smart Service<span>Finder</span></div>
        </div>

        <div className="cd-sidebar-top">
          <div className="cd-avatar-wrap">
            <div className="cd-avatar-ring" />
            <div className="cd-avatar">{initial}</div>
            <div className="cd-avatar-dot" />
          </div>
          <h2 className="cd-name">{user.fullName}</h2>
          <span className="cd-role-badge">{user.role}</span>
          <p className="cd-email">{user.email}</p>
        </div>

        <nav className="cd-nav">
          <p className="cd-nav-label">Menu</p>
          {NAV.map((tab) => (
            <button key={tab.id}
              className={`cd-nav-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              <span className="cd-nav-icon">{tab.icon}</span>
              <span className="cd-nav-text">{tab.label}</span>
              {tab.id === "notifications" && unreadNotif > 0 && (
                <span className="cd-nav-badge">{unreadNotif}</span>
              )}
              <span className="cd-nav-dot" />
            </button>
          ))}
        </nav>

        <button className="cd-logout-btn" onClick={handleLogout}>
          <span>⎋</span> Sign Out
        </button>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <main className="cd-main">
        <header className="cd-header">
          <div>
            <p className="cd-eyebrow">Smart Service Platform</p>
            <h1 className="cd-page-title">{NAV.find((n) => n.id === activeTab)?.label}</h1>
          </div>
          <div className="cd-header-right">
            <div className="cd-pill">🔧 {completed.length} Done</div>
            <div className="cd-pill teal">📅 {active.length} Active</div>
          </div>
        </header>

        {activeTab === "overview"      && <OverviewTab      user={user} bookings={bookings} completed={completed} active={active} avgRating={avgRating} setUser={setUser} setInitial={setInitial} setActiveTab={setActiveTab} />}
        {activeTab === "search"        && <SearchTab        fetchBookings={fetchBookings} setActiveTab={setActiveTab} />}
        {activeTab === "bookings"      && <BookingsTab      bookings={bookings} fetchBookings={fetchBookings} user={user} socketRef={socketRef} />}
        {activeTab === "chat"          && <ChatTab          bookings={bookings} user={user} socketRef={socketRef} />}
        {activeTab === "notifications" && <NotificationsTab notifications={notifications} setNotifications={setNotifications} setUnreadNotif={setUnreadNotif} />}
        {activeTab === "settings"      && <SettingsTab      user={user} setUser={setUser} handleLogout={handleLogout} />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════
function OverviewTab({ user, bookings, completed, active, avgRating, setUser, setInitial, setActiveTab }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ fullName: user.fullName, contact: user.contact || "", location: user.location || "" });
  const [saved, setSaved]     = useState(false);

  const handleSave = async () => {
    try {
      const { data } = await authAxios().put(`${API}/auth/profile`, form);
      const updated  = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setInitial(updated.fullName?.charAt(0).toUpperCase() || "?");
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="cd-grid-2">
      <div className="cd-card">
        <div className="cd-card-hd">
          <h3>Personal Information</h3>
          <button className="cd-btn secondary" style={{ padding: ".35rem .85rem", fontSize: ".78rem" }}
            onClick={() => { setEditing(!editing); setForm({ fullName: user.fullName, contact: user.contact || "", location: user.location || "" }); }}>
            {editing ? "✕ Cancel" : "✏ Edit"}
          </button>
        </div>

        {editing ? (
          <div className="cd-form">
            {[
              { n: "fullName", l: "Full Name", t: "text" },
              { n: "contact",  l: "Contact",   t: "tel"  },
              { n: "location", l: "Location",  t: "text" },
            ].map((f) => (
              <div className="cd-fg" key={f.n}>
                <label>{f.l}</label>
                <input type={f.t} value={form[f.n]} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} />
              </div>
            ))}
            <button className="cd-btn" onClick={handleSave} style={saved ? { boxShadow: "0 0 0 6px rgba(0,212,170,.2)" } : {}}>
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        ) : (
          <div className="cd-info-list">
            {[
              { icon: "👤", l: "Full Name", v: user.fullName        },
              { icon: "✉️", l: "Email",     v: user.email           },
              { icon: "📞", l: "Contact",   v: user.contact  || "—" },
              { icon: "📍", l: "Location",  v: user.location || "—" },
              { icon: "🎭", l: "Role",      v: user.role            },
            ].map((item) => (
              <div className="cd-info-row" key={item.l}>
                <div className="cd-info-ico">{item.icon}</div>
                <div>
                  <p className="cd-info-lbl">{item.l}</p>
                  <p className="cd-info-val">{item.v}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cd-card">
        <div className="cd-card-hd"><h3>Activity Summary</h3></div>
        <div className="cd-stats-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1.4rem" }}>
          {[
            { n: completed.length, l: "Completed"     },
            { n: active.length,    l: "Active"         },
            { n: avgRating,        l: "Avg Rating"     },
            { n: bookings.length,  l: "Total Bookings" },
          ].map((s) => (
            <div className="cd-stat" key={s.l}>
              <span className="cd-stat-n">{s.n}</span>
              <span className="cd-stat-l">{s.l}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: ".7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".75rem", fontWeight: 700 }}>
          Recent Bookings
        </p>

        {bookings.slice(0, 3).map((b) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", flexShrink: 0, boxShadow: "0 0 7px rgba(0,212,170,.6)" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: ".845rem", fontWeight: 600 }}>{b.service_title}</p>
              <p style={{ fontSize: ".72rem", color: "var(--muted)" }}>{b.provider_name} · {b.booking_date}</p>
            </div>
            <span className={`cd-badge ${STATUS_CLASS[b.status] || "pending"}`}>
              {STATUS_LABEL[b.status] || b.status}
            </span>
          </div>
        ))}

        {!bookings.length && (
          <p style={{ fontSize: ".85rem", color: "var(--muted)", textAlign: "center", paddingTop: "1rem" }}>
            No bookings yet.{" "}
            <span style={{ color: "var(--teal)", cursor: "pointer" }} onClick={() => setActiveTab("search")}>
              Find a service →
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SEARCH TAB
// ══════════════════════════════════════════════════════════════════
function SearchTab({ fetchBookings, setActiveTab }) {
  const [services, setServices]       = useState([]);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("");
  const [location, setLocation]       = useState("");
  const [minPrice, setMinPrice]       = useState("");
  const [maxPrice, setMaxPrice]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [bookModal, setBookModal]     = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category  = category;
      if (location) params.location  = location;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      const { data } = await authAxios().get(`${API}/services`, { params });
      const list = Array.isArray(data) ? data : (data.services || []);
      const filtered = search
        ? list.filter((s) =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase())
          )
        : list;
      setServices(filtered);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <div>
      <div className="cd-search-bar">
        <input className="cd-search-input" placeholder="🔍 Search service or name…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchServices()} />
        <select className="cd-search-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
        </select>
        <input className="cd-search-input" style={{ maxWidth: 150 }} placeholder="📍 Location…"
          value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="cd-search-input" style={{ maxWidth: 90 }} placeholder="Min ₹"
          type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className="cd-search-input" style={{ maxWidth: 90 }} placeholder="Max ₹"
          type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <button className="cd-btn" style={{ padding: ".7rem 1.2rem", minWidth: "auto" }} onClick={fetchServices}>
          Search
        </button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>Loading services…</div>}

      {!loading && !services.length && (
        <div className="cd-empty"><div className="cd-empty-icon">🔍</div><p>No services found. Try different filters.</p></div>
      )}

      <div className="cd-providers-grid">
        {services.map((s) => (
          <div className="cd-provider-card" key={s.id}>
            <div className="cd-prov-head">
              <div className="cd-prov-avatar">{SERVICE_ICONS[s.category] || "🔧"}</div>
              <div>
                <p className="cd-prov-name">{s.title}</p>
                <p className="cd-prov-cat">{s.category}</p>
              </div>
            </div>
            <div className="cd-prov-meta">
              <span className="cd-prov-tag">📍 {s.location || "Any"}</span>
              <span className="cd-prov-tag">💰 ₹{s.price}</span>
              <span className="cd-prov-tag">👤 {s.provider_name}</span>
            </div>
            {s.description && (
              <p style={{ fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.5, margin: ".6rem 0" }}>
                {s.description.length > 80 ? s.description.slice(0, 80) + "…" : s.description}
              </p>
            )}
            <div className="cd-prov-actions">
              <button className="cd-prov-btn book" onClick={() => setBookModal(s)}>📅 Book</button>
              <button className="cd-prov-btn outline" onClick={() => setDetailModal(s)}>👁 Details</button>
            </div>
          </div>
        ))}
      </div>

      {detailModal && (
        <ServiceDetailModal service={detailModal} onClose={() => setDetailModal(null)}
          onBook={() => { setBookModal(detailModal); setDetailModal(null); }} />
      )}
      {bookModal && (
        <BookingModal service={bookModal} onClose={() => setBookModal(null)}
          fetchBookings={fetchBookings} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

// ── Service Detail Modal ──────────────────────────────────────────
function ServiceDetailModal({ service: s, onClose, onBook }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    authAxios().get(`${API}/reviews/provider/${s.provider_id}`)
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data.reviews || []);
        setReviews(list);
      })
      .catch(console.error);
  }, [s.provider_id]);

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cd-modal-close" onClick={onClose}>✕</button>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.4rem" }}>
          <div className="cd-prov-avatar" style={{ width: 54, height: 54, fontSize: "1.4rem", flexShrink: 0 }}>
            {SERVICE_ICONS[s.category] || "🔧"}
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: "1.15rem", marginBottom: ".2rem" }}>{s.title}</h2>
            <p style={{ color: "var(--teal)", fontSize: ".88rem" }}>{s.category}</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: "1.1rem" }}>
          {[
            { l: "Provider",   v: s.provider_name },
            { l: "Price",      v: `₹${s.price}`   },
            { l: "Location",   v: s.location || "Any" },
            { l: "Avg Rating", v: `${avg} ★ (${reviews.length})` },
          ].map((i) => (
            <div key={i.l} style={{ background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 10, padding: ".72rem .9rem" }}>
              <p style={{ fontSize: ".64rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: ".12rem" }}>{i.l}</p>
              <p style={{ fontSize: ".875rem", fontWeight: 500 }}>{i.v}</p>
            </div>
          ))}
        </div>
        {s.description && <p style={{ fontSize: ".86rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "1.1rem" }}>{s.description}</p>}
        {reviews.length > 0 && (
          <div style={{ marginBottom: "1.1rem" }}>
            <p style={{ fontSize: ".68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".6rem", fontWeight: 700 }}>Reviews</p>
            {reviews.slice(0, 3).map((r, i) => (
              <div key={i} style={{ background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 10, padding: ".72rem .9rem", marginBottom: ".45rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".25rem" }}>
                  <span style={{ fontSize: ".84rem", fontWeight: 600 }}>{r.customer_name}</span>
                  <span style={{ color: "var(--amber)", fontSize: ".78rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
        <button className="cd-btn" onClick={onBook}>📅 Book This Service</button>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────
function BookingModal({ service, onClose, fetchBookings, setActiveTab }) {
  const [form, setForm]       = useState({ booking_date: "", booking_time: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!form.booking_date || !form.booking_time) { setError("Please select both date and time."); return; }
    setLoading(true); setError("");
    try {
      await authAxios().post(`${API}/bookings`, {
        service_id:   service.id,
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        notes:        form.notes,
      });
      setDone(true);
      fetchBookings();
      setTimeout(() => { onClose(); setActiveTab("bookings"); }, 1800);
    } catch (e) {
      setError(e.response?.data?.message || "Booking failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <button className="cd-modal-close" onClick={onClose}>✕</button>
        {done ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>🎉</div>
            <h3 style={{ fontFamily: "var(--font-d)", fontSize: "1.1rem", marginBottom: ".5rem" }}>Booking Sent!</h3>
            <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>Request sent to <strong>{service.provider_name}</strong>.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: "1.05rem", marginBottom: ".3rem" }}>Book: {service.title}</h3>
            <p style={{ color: "var(--muted)", fontSize: ".83rem", marginBottom: "1.3rem" }}>{service.provider_name} · ₹{service.price}</p>
            {error && <div className="cd-error" style={{ marginBottom: ".8rem" }}>⚠️ {error}</div>}
            <div className="cd-form">
              <div className="cd-fg">
                <label>Select Date</label>
                <input type="date" value={form.booking_date} min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value })} />
              </div>
              <div className="cd-fg">
                <label>Select Time</label>
                <input type="time" value={form.booking_time} onChange={(e) => setForm({ ...form, booking_time: e.target.value })} />
              </div>
              <div className="cd-fg">
                <label>Notes (optional)</label>
                <textarea placeholder="Describe what you need…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button className="cd-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Booking…" : "Confirm Booking →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  BOOKINGS TAB
// ══════════════════════════════════════════════════════════════════
function BookingsTab({ bookings, fetchBookings, user, socketRef }) {
  const [reviewModal,   setReviewModal]   = useState(null);
  const [locationModal, setLocationModal] = useState(null);
  const [chatModal,     setChatModal]     = useState(null);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await authAxios().patch(`${API}/bookings/${id}/status`, { status: "cancelled" });
      fetchBookings();
    } catch (e) { alert(e.response?.data?.message || "Could not cancel."); }
  };

  if (!bookings.length) return (
    <div className="cd-card">
      <div className="cd-empty"><div className="cd-empty-icon">📋</div><p>No bookings yet.</p></div>
    </div>
  );

  return (
    <div className="cd-card">
      <div className="cd-card-hd">
        <h3>All Bookings</h3>
        <span style={{ background: "var(--surface2)", border: "1px solid var(--border)", padding: ".22rem .75rem", borderRadius: 999, fontSize: ".74rem", color: "var(--muted)" }}>
          {bookings.length} total
        </span>
      </div>
      <div className="cd-booking-list">
        {bookings.map((b) => (
          <div className="cd-booking-row" key={b.id}>
            <div className="cd-bk-ico">{SERVICE_ICONS[b.service_title] || "🔧"}</div>
            <div className="cd-bk-info">
              <p className="cd-bk-service">{b.service_title}</p>
              <p className="cd-bk-meta">Provider: <strong>{b.provider_name}</strong> · {b.booking_date} {b.booking_time?.slice(0, 5)}</p>
              {b.notes && <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".1rem" }}>📝 {b.notes}</p>}
            </div>
            <div className="cd-bk-right">
              <span className={`cd-badge ${STATUS_CLASS[b.status] || "pending"}`}>{STATUS_LABEL[b.status] || b.status}</span>
              <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <ActionBtn onClick={() => setChatModal(b)} color="default">💬</ActionBtn>
                {b.status === "accepted" && <ActionBtn onClick={() => setLocationModal(b)} color="blue">📍 Track</ActionBtn>}
                {b.status === "completed" && !b.review_id && <ActionBtn onClick={() => setReviewModal(b)} color="amber">⭐ Rate</ActionBtn>}
                {b.rating && <span style={{ color: "var(--amber)", fontSize: ".8rem", alignSelf: "center" }}>{"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)}</span>}
                {["pending", "accepted"].includes(b.status) && <ActionBtn onClick={() => handleCancel(b.id)} color="rose">✕</ActionBtn>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {reviewModal   && <ReviewModal   booking={reviewModal}   onClose={() => setReviewModal(null)}   fetchBookings={fetchBookings} />}
      {locationModal && <LocationModal booking={locationModal} onClose={() => setLocationModal(null)} socketRef={socketRef} />}
      {chatModal     && <ChatModal     booking={chatModal}     user={user}                            onClose={() => setChatModal(null)} socketRef={socketRef} />}
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────────────
function ActionBtn({ children, onClick, color = "default" }) {
  const styles = {
    default: { bg: "var(--surface2)",        border: "var(--border)",             color: "var(--text)"  },
    blue:    { bg: "rgba(59,158,255,.1)",    border: "rgba(59,158,255,.25)",      color: "var(--blue)"  },
    amber:   { bg: "rgba(251,191,36,.1)",    border: "rgba(251,191,36,.25)",      color: "var(--amber)" },
    rose:    { bg: "rgba(251,113,133,.08)",  border: "rgba(251,113,133,.2)",      color: "var(--rose)"  },
  }[color];
  return (
    <button onClick={onClick} style={{
      background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color,
      borderRadius: 8, padding: ".28rem .65rem", fontSize: ".72rem",
      cursor: "pointer", fontFamily: "var(--font-b)", transition: "all .2s",
    }}>{children}</button>
  );
}

// ── Review Modal ──────────────────────────────────────────────────
function ReviewModal({ booking, onClose, fetchBookings }) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [comment, setComment] = useState("");
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a rating."); return; }
    setError("");
    try {
      await authAxios().post(`${API}/reviews`, {
        booking_id:  booking.id,
        customer_id: user.id,
        provider_id: booking.provider_id,
        rating,
        comment,
      });
      setDone(true);
      fetchBookings();
      setTimeout(onClose, 1800);
    } catch (e) { setError(e.response?.data?.message || "Failed to submit review."); }
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <button className="cd-modal-close" onClick={onClose}>✕</button>
        {done ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>🌟</div>
            <h3 style={{ fontFamily: "var(--font-d)" }}>Thanks for your feedback!</h3>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: "1.05rem", marginBottom: ".3rem" }}>Rate: {booking.service_title}</h3>
            <p style={{ color: "var(--muted)", fontSize: ".83rem", marginBottom: "1.1rem" }}>Provider: {booking.provider_name}</p>
            {error && <div className="cd-error" style={{ marginBottom: ".8rem" }}>⚠️ {error}</div>}
            <div className="cd-star-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} className={`cd-star-btn${(hover || rating) >= s ? " on" : ""}`}
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>★</button>
              ))}
            </div>
            <div className="cd-fg" style={{ marginTop: ".75rem", marginBottom: "1rem" }}>
              <label>Write a review (optional)</label>
              <textarea placeholder="How was the service?" value={comment} onChange={(e) => setComment(e.target.value)} style={{ minHeight: 85 }} />
            </div>
            <button className="cd-btn" onClick={handleSubmit}>Submit Review →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Location Modal ────────────────────────────────────────────────
function LocationModal({ booking, onClose, socketRef }) {
  const [providerLoc, setProviderLoc] = useState(null);
  const [customerLoc, setCustomerLoc] = useState(null);
  const [distance, setDistance]       = useState(null);
  const [status, setStatus]           = useState("waiting");
  const [lastSeen, setLastSeen]       = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setCustomerLoc({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {}
    );
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (data) => {
      if (Number(data.bookingId) !== Number(booking.id)) return;
      setProviderLoc({ lat: data.lat, lng: data.lng });
      setStatus("live"); setLastSeen(new Date());
    };
    socket.on("location_update", handler);
    return () => socket.off("location_update", handler);
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await authAxios().get(`${API}/location/${booking.id}`);
        if (data.location) {
          setProviderLoc(data.location);
          const age = (Date.now() - new Date(data.location.updated_at)) / 1000;
          setStatus(age < 30 ? "live" : "offline");
          setLastSeen(new Date(data.location.updated_at));
        }
      } catch (e) {}
    };
    poll();
    const t = setInterval(poll, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!providerLoc || !customerLoc) return;
    const R = 6371, toR = (d) => (d * Math.PI) / 180;
    const dLat = toR(providerLoc.lat - customerLoc.lat);
    const dLng = toR(providerLoc.lng - customerLoc.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(customerLoc.lat)) * Math.cos(toR(providerLoc.lat)) * Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`);
  }, [providerLoc, customerLoc]);

  const statusColor = { live: "#00d4aa", waiting: "#fbbf24", offline: "#fb7185" }[status];
  const statusText  = { live: "● Live", waiting: "⏳ Waiting…", offline: "○ Last known" }[status];

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <button className="cd-modal-close" onClick={onClose}>✕</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-d)", fontWeight: 700, marginBottom: ".25rem" }}>Live Location</h3>
            <p style={{ color: "var(--muted)", fontSize: ".83rem" }}>Tracking: <strong>{booking.provider_name}</strong></p>
          </div>
          <span style={{ fontSize: ".72rem", fontWeight: 700, padding: ".22rem .75rem", borderRadius: 999, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>{statusText}</span>
        </div>
        <div className="cd-map-box">
          <div className="cd-map-pulse">📍</div>
          {providerLoc ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 600, marginBottom: ".3rem" }}>Provider Located</p>
              <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>{Number(providerLoc.lat).toFixed(5)}, {Number(providerLoc.lng).toFixed(5)}</p>
              {lastSeen && <p style={{ fontSize: ".72rem", color: statusColor, marginTop: ".25rem" }}>Updated: {lastSeen.toLocaleTimeString()}</p>}
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 500, marginBottom: ".3rem" }}>Waiting for provider…</p>
              <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>Provider shares location when heading your way</p>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginTop: "1rem" }}>
          {[
            { icon: "📏", label: "Distance",      value: distance || "—",                         color: "var(--teal)"  },
            { icon: "📍", label: "Your Location", value: customerLoc ? "Detected" : "Not shared", color: customerLoc ? "var(--teal)" : "var(--muted)" },
            { icon: "🔄", label: "Auto Refresh",  value: "Every 10s",                             color: "var(--blue)"  },
          ].map((c) => (
            <div key={c.label} style={{ background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 12, padding: ".75rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", marginBottom: ".25rem" }}>{c.icon}</div>
              <p style={{ fontSize: ".82rem", fontWeight: 600, color: c.color }}>{c.value}</p>
              <p style={{ fontSize: ".65rem", color: "var(--muted)", marginTop: ".15rem" }}>{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
function ChatModal({ booking, user, onClose, socketRef }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const bottomRef               = useRef(null);

  // Determine who to send message to
  const receiverId = user.role === 'customer' ? booking.provider_id : booking.customer_id;

  useEffect(() => {
    authAxios().get(`${API}/chat/${booking.id}`)
      .then((r) => setMessages(r.data))
      .catch(console.error);

    const socket = socketRef.current;
    if (socket) {
      const handler = (data) => {
        if (data.bookingId === booking.id)
          setMessages((prev) => [...prev, data]);
      };
      socket.on("receive_message", handler);
      return () => socket.off("receive_message", handler);
    }
  }, [booking.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await authAxios().post(`${API}/chat`, {
        bookingId:  booking.id,
        receiverId: receiverId,
        message:    text,
      });
      const msg = { senderId: user.id, message: text, createdAt: new Date().toISOString(), senderName: user.fullName };
      setMessages((prev) => [...prev, msg]);
      socketRef.current?.emit("send_message", { ...msg, receiverId, bookingId: booking.id });
      setText("");
    } catch (e) { console.error(e); }
  };

  return (
    /* OUTER WRAPPER: Changed to fixed floating position at bottom-right */
    <div style={{
      position: "fixed", 
      bottom: "20px", 
      right: "20px",
      zIndex: 9999,
      display: "flex", 
      alignItems: "flex-end", 
      justifyContent: "flex-end",
    }}>
      <div style={{
        width: "400px", 
        height: "550px", 
        maxHeight: "80vh",
        background: "#0d1117", 
        borderRadius: "15px",
        border: "1px solid rgba(255,255,255,.15)",
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
      }}>

        {/* Header - Fixed styling */}
        <div style={{
          padding: "1rem", background: "#161b22",
          borderBottom: "1px solid rgba(255,255,255,.1)",
          display: "flex", alignItems: "center", gap: ".8rem",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,var(--teal),var(--blue))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {booking.provider_name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: ".85rem", color: "#fff" }}>{booking.provider_name}</p>
            <p style={{ fontSize: ".7rem", color: "var(--teal)" }}>{booking.service_title}</p>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#8b949e", cursor: "pointer", fontSize: "1.1rem"
          }}>✕</button>
        </div>

        {/* Messages List */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "1rem",
          display: "flex", flexDirection: "column", gap: ".8rem",
          background: "#0d1117",
        }}>
          {messages.map((m, i) => {
            const isMine = m.senderId === user.id;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: ".6rem .9rem",
                  borderRadius: isMine ? "15px 15px 2px 15px" : "15px 15px 15px 2px",
                  background: isMine ? "var(--teal)" : "rgba(255,255,255,.1)",
                  color: "#fff", fontSize: ".85rem",
                }}>
                  {m.message}
                </div>
                <span style={{ fontSize: ".6rem", color: "#8b949e", marginTop: "3px" }}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: "1rem", background: "#161b22",
          borderTop: "1px solid rgba(255,255,255,.1)",
          display: "flex", gap: ".6rem", alignItems: "center"
        }}>
          <input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{
              flex: 1, background: "#0d1117", border: "1px solid #30363d",
              borderRadius: "20px", padding: ".6rem 1rem", color: "#fff", outline: "none"
            }}
          />
          <button onClick={handleSend} style={{
            background: "var(--teal)", border: "none", borderRadius: "50%",
            width: 35, height: 35, color: "#fff", cursor: "pointer"
          }}>➤</button>
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════════════
//  CHAT TAB
// ══════════════════════════════════════════════════════════════════
function ChatTab({ bookings, user, socketRef }) {
  const [active, setActive] = useState(null);
  const chatBookings = bookings.filter((b) => !["cancelled", "rejected"].includes(b.status));

  if (!chatBookings.length) return (
    <div className="cd-card">
      <div className="cd-empty"><div className="cd-empty-icon">💬</div><p>No active bookings to chat about.</p></div>
    </div>
  );

  return (
    <div style={{
      background: "rgba(255,255,255,.025)", backdropFilter: "blur(18px)",
      border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "1.2rem 1.5rem", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h3 style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: ".95rem" }}>Messages</h3>
        <span style={{ background: "var(--surface2)", border: "1px solid var(--border)", padding: ".22rem .75rem", borderRadius: 999, fontSize: ".74rem", color: "var(--muted)" }}>
          {chatBookings.length} conversations
        </span>
      </div>

      {/* Conversation list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {chatBookings.map((b, i) => (
          <div key={b.id} onClick={() => setActive(b)}
            style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "1rem 1.5rem", cursor: "pointer",
              borderBottom: i < chatBookings.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.04)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>

            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,var(--teal),var(--blue))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-d)", fontWeight: 800, fontSize: "1.3rem", color: "#fff",
              boxShadow: "0 4px 14px rgba(0,212,170,.22)",
            }}>
              {b.provider_name?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".2rem" }}>
                <p style={{ fontWeight: 600, fontSize: ".9rem", color: "var(--text)" }}>{b.provider_name}</p>
                <p style={{ fontSize: ".7rem", color: "var(--muted)" }}>{b.booking_date}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: ".78rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {b.service_title}
                </p>
                <span className={`cd-badge ${STATUS_CLASS[b.status] || "pending"}`}
                  style={{ fontSize: ".6rem", padding: ".15rem .55rem", flexShrink: 0, marginLeft: ".5rem" }}>
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
            </div>

            <span style={{ color: "var(--muted)", fontSize: "1rem", flexShrink: 0 }}>›</span>
          </div>
        ))}
      </div>

      {active && (
        <ChatModal booking={active} user={user} socketRef={socketRef} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  NOTIFICATIONS TAB
// ══════════════════════════════════════════════════════════════════
function NotificationsTab({ notifications, setNotifications, setUnreadNotif }) {
  const markRead = async (id) => {
    try {
      await authAxios().put(`${API}/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadNotif((prev) => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => authAxios().put(`${API}/notifications/${n.id}/read`).catch(() => {})));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadNotif(0);
  };

  const ICONS = { booking: "📅", chat: "💬", review: "⭐", status: "🔄", default: "🔔" };

  return (
    <div className="cd-card">
      <div className="cd-card-hd">
        <h3>Notifications</h3>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <button onClick={markAllRead} style={{
              background: "rgba(0,212,170,.1)", border: "1px solid rgba(0,212,170,.25)",
              color: "var(--teal)", borderRadius: 8, padding: ".28rem .7rem",
              fontSize: ".74rem", cursor: "pointer", fontFamily: "var(--font-b)",
            }}>Mark all read</button>
          )}
          <span style={{ background: "var(--surface2)", border: "1px solid var(--border)", padding: ".22rem .75rem", borderRadius: 999, fontSize: ".74rem", color: "var(--muted)" }}>
            {notifications.filter((n) => !n.is_read).length} unread
          </span>
        </div>
      </div>

      {!notifications.length && (
        <div className="cd-empty"><div className="cd-empty-icon">🔔</div><p>No notifications yet.</p></div>
      )}

      <div className="cd-notif-list">
        {notifications.map((n) => (
          <div key={n.id}
            className={`cd-notif-item${!n.is_read ? " unread" : ""}`}
            onClick={() => !n.is_read && markRead(n.id)}
            style={{ cursor: !n.is_read ? "pointer" : "default" }}>
            <div style={{ fontSize: "1.1rem", flexShrink: 0 }}>{ICONS[n.type] || ICONS.default}</div>
            <div style={{ flex: 1 }}>
              <p className="cd-notif-msg">{n.message}</p>
              <p className="cd-notif-time">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            <div className={`cd-notif-dot${n.is_read ? " read" : ""}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SETTINGS TAB
// ══════════════════════════════════════════════════════════════════
function SettingsTab({ user, setUser, handleLogout }) {
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg]   = useState("");
  const [pwErr, setPwErr]   = useState("");

  const handlePwChange = async () => {
    setPwErr(""); setPwMsg("");
    if (pwForm.newPw !== pwForm.confirm) { setPwErr("Passwords don't match."); return; }
    if (pwForm.newPw.length < 6)         { setPwErr("Minimum 6 characters.");  return; }
    try {
      await authAxios().put(`${API}/auth/change-password`, {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      });
      setPwMsg("Password updated successfully!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e) { setPwErr(e.response?.data?.message || "Failed to update password."); }
  };

  return (
    <div className="cd-grid-2">
      <div className="cd-card">
        <div className="cd-card-hd"><h3>Change Password</h3></div>
        <div className="cd-form">
          {pwErr && <div className="cd-error">⚠️ {pwErr}</div>}
          {pwMsg && <div className="cd-success">✓ {pwMsg}</div>}
          {[
            { n: "current", l: "Current Password"    },
            { n: "newPw",   l: "New Password"         },
            { n: "confirm", l: "Confirm New Password" },
          ].map((f) => (
            <div className="cd-fg" key={f.n}>
              <label>{f.l}</label>
              <input type="password" placeholder="••••••••"
                value={pwForm[f.n]} onChange={(e) => setPwForm({ ...pwForm, [f.n]: e.target.value })} />
            </div>
          ))}
          <button className="cd-btn" onClick={handlePwChange}>Update Password</button>
        </div>
      </div>

      <div className="cd-card">
        <div className="cd-card-hd"><h3>Notification Preferences</h3></div>
        <div className="cd-toggles">
          {[
            { l: "Booking Confirmations", d: true  },
            { l: "Service Reminders",     d: true  },
            { l: "Promotional Offers",    d: false },
            { l: "Chat Messages",         d: true  },
            { l: "Status Updates",        d: true  },
          ].map((item) => (
            <div className="cd-toggle-row" key={item.l}>
              <span>{item.l}</span>
              <label className="cd-toggle">
                <input type="checkbox" defaultChecked={item.d} />
                <span className="cd-toggle-sl" />
              </label>
            </div>
          ))}
        </div>
        <div className="cd-danger-zone">
          <p className="cd-danger-title">⚠ Danger Zone</p>
          <button className="cd-danger-btn"
            onClick={() => window.confirm("Delete your account? This cannot be undone.") && handleLogout()}>
            🗑 Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
