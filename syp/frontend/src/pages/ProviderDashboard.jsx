import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/CustomerProfile.css"; // reuse same CSS

const API        = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const SERVICE_ICONS = {
  "Home Cleaning": "🧹", "Plumbing Repair": "🔧", "Electrical Work": "⚡",
  "Painting": "🎨", "Carpentry": "🪚", "Landscaping": "🌿", "AC Repair": "❄️",
};

const CATEGORIES = [
  "Home Cleaning", "Plumbing Repair", "Electrical Work",
  "Painting", "Carpentry", "Landscaping", "AC Repair",
];

const NAV = [
  { id: "bookings",  icon: "◷", label: "Bookings"     },
  { id: "services",  icon: "⊕", label: "My Services"  },
  { id: "reviews",   icon: "★", label: "Reviews"      },
  { id: "settings",  icon: "⊛", label: "Settings"     },
];

const STATUS_CLASS = {
  pending: "pending", accepted: "accepted", rejected: "cancelled",
  completed: "completed", cancelled: "cancelled",
};
const STATUS_LABEL = {
  pending: "Pending", accepted: "Accepted", rejected: "Rejected",
  completed: "Completed", cancelled: "Cancelled",
};

const authAxios = () => {
  const token = localStorage.getItem("token");
  return axios.create({ headers: { Authorization: `Bearer ${token}` } });
};

// ══════════════════════════════════════════════════════════════════
export default function ProviderDashboard() {
  const [user, setUser]           = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [services, setServices]   = useState([]);
  const [reviews, setReviews]     = useState([]);
  const [activeTab, setActiveTab] = useState("bookings");
  const [initial, setInitial]     = useState("?");
  const socketRef                 = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { window.location.href = "/auth"; return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setInitial(parsed.fullName?.charAt(0).toUpperCase() || "?");

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit("join", parsed.id);

    // New booking notification
    socket.on("new_booking", () => fetchBookings());

    fetchBookings();
    fetchServices();
    fetchReviews(parsed.id);

    return () => socket.disconnect();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await authAxios().get(`${API}/bookings/provider`);
      setBookings(Array.isArray(data) ? data : (data.bookings || []));
    } catch (e) { console.error(e); }
  };

 const fetchServices = async () => {
    try {
      const { data } = await authAxios().get(`${API}/services/my`);
      setServices(Array.isArray(data) ? data : (data.services || []));
    } catch (e) { console.error(e); }
  };

  const fetchReviews = async (id) => {
  try {
    const { data } = await authAxios().get(`${API}/reviews/provider/${id}`);
    // Extract the array even if it's wrapped in an object
    const reviewData = Array.isArray(data) ? data : (data.reviews || []);
    setReviews(reviewData);
  } catch (e) { 
    console.error(e); 
    setReviews([]); 
  }
};

  const handleLogout = () => {
    socketRef.current?.disconnect();
    localStorage.clear();
    window.location.href = "/auth";
  };

  const pending   = bookings.filter((b) => b.status === "pending");
  const accepted  = bookings.filter((b) => b.status === "accepted");
  const completed = bookings.filter((b) => b.status === "completed");
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
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
          <span className="cd-role-badge">Provider</span>
          <p className="cd-email">{user.email}</p>
        </div>

        {/* Stats summary in sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".5rem", marginBottom: "1.5rem" }}>
          {[
            { n: pending.length,   l: "Pending"   },
            { n: accepted.length,  l: "Active"    },
            { n: completed.length, l: "Done"      },
            { n: avgRating,        l: "Rating"    },
          ].map((s) => (
            <div key={s.l} style={{ background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 10, padding: ".6rem", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: "1.2rem", background: "linear-gradient(135deg,var(--teal),var(--blue))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.n}</p>
              <p style={{ fontSize: ".62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.l}</p>
            </div>
          ))}
        </div>

        <nav className="cd-nav">
          <p className="cd-nav-label">Menu</p>
          {NAV.map((tab) => (
            <button key={tab.id}
              className={`cd-nav-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              <span className="cd-nav-icon">{tab.icon}</span>
              <span className="cd-nav-text">{tab.label}</span>
              {tab.id === "bookings" && pending.length > 0 && (
                <span className="cd-nav-badge">{pending.length}</span>
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
            <p className="cd-eyebrow">Service Provider Dashboard</p>
            <h1 className="cd-page-title">{NAV.find((n) => n.id === activeTab)?.label}</h1>
          </div>
          <div className="cd-header-right">
            <div className="cd-pill">⭐ {avgRating} Rating</div>
            <div className="cd-pill teal">📋 {pending.length} Pending</div>
          </div>
        </header>

        {activeTab === "bookings" && <BookingsTab bookings={bookings} fetchBookings={fetchBookings} user={user} socketRef={socketRef} />}
        {activeTab === "services" && <ServicesTab services={services} fetchServices={fetchServices} user={user} />}
        {activeTab === "reviews"  && <ReviewsTab  reviews={reviews} avgRating={avgRating} />}
        {activeTab === "settings" && <SettingsTab user={user} setUser={setUser} handleLogout={handleLogout} />}
      </main>
    </div>
  );
}

//  BOOKINGS TAB
function BookingsTab({ bookings, fetchBookings, user, socketRef }) {
  const [chatModal,     setChatModal]     = useState(null);
  const [locationShare, setLocationShare] = useState(null);

  // PATCH /api/bookings/:id/status  
  const updateStatus = async (id, status) => {
    try {
      await authAxios().patch(`${API}/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (e) { alert(e.response?.data?.message || "Failed to update status."); }
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
          <div key={b.id}>
            <div className="cd-booking-row">
              <div className="cd-bk-ico">{SERVICE_ICONS[b.service_title] || "🔧"}</div>

              <div className="cd-bk-info">
                <p className="cd-bk-service">{b.service_title}</p>
                <p className="cd-bk-meta">
                  Customer: <strong>{b.customer_name}</strong> · {b.booking_date} {b.booking_time?.slice(0, 5)}
                </p>
                {b.notes && <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".1rem" }}>📝 {b.notes}</p>}
                <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".1rem" }}>📞 {b.customer_contact}</p>
              </div>

              <div className="cd-bk-right">
                <span className={`cd-badge ${STATUS_CLASS[b.status] || "pending"}`}>
                  {STATUS_LABEL[b.status] || b.status}
                </span>

                <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {/* Accept / Reject for pending */}
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(b.id, "accepted")}
                        style={{ background: "rgba(0,212,170,.15)", border: "1px solid rgba(0,212,170,.3)", color: "var(--teal)", borderRadius: 8, padding: ".28rem .65rem", fontSize: ".72rem", cursor: "pointer", fontWeight: 600 }}>
                        ✓ Accept
                      </button>
                      <button onClick={() => updateStatus(b.id, "rejected")}
                        style={{ background: "rgba(251,113,133,.08)", border: "1px solid rgba(251,113,133,.2)", color: "var(--rose)", borderRadius: 8, padding: ".28rem .65rem", fontSize: ".72rem", cursor: "pointer" }}>
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {/* Mark complete for accepted */}
                  {b.status === "accepted" && (
                    <button onClick={() => updateStatus(b.id, "completed")}
                      style={{ background: "rgba(59,158,255,.1)", border: "1px solid rgba(59,158,255,.25)", color: "var(--blue)", borderRadius: 8, padding: ".28rem .65rem", fontSize: ".72rem", cursor: "pointer", fontWeight: 600 }}>
                      ✓ Complete
                    </button>
                  )}

                  {/* Chat */}
                  <button onClick={() => setChatModal(b)}
                    style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: ".28rem .65rem", fontSize: ".72rem", cursor: "pointer" }}>
                    💬
                  </button>

                  {/* Share location for accepted bookings */}
                  {b.status === "accepted" && (
                    <button onClick={() => setLocationShare(locationShare?.id === b.id ? null : b)}
                      style={{ background: locationShare?.id === b.id ? "rgba(0,212,170,.15)" : "var(--surface2)", border: `1px solid ${locationShare?.id === b.id ? "rgba(0,212,170,.3)" : "var(--border)"}`, color: locationShare?.id === b.id ? "var(--teal)" : "var(--muted)", borderRadius: 8, padding: ".28rem .65rem", fontSize: ".72rem", cursor: "pointer" }}>
                      📍 {locationShare?.id === b.id ? "Sharing" : "Share"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Location sharing widget inline */}
            {locationShare?.id === b.id && (
              <LocationSharing booking={b} onStop={() => setLocationShare(null)} />
            )}
          </div>
        ))}
      </div>

      {chatModal && (
        <ProviderChatModal booking={chatModal} user={user} socketRef={socketRef} onClose={() => setChatModal(null)} />
      )}
    </div>
  );
}

// ── Location Sharing Widget ───────────────────────────────────────
function LocationSharing({ booking, onStop }) {
  const [sharing, setSharing]   = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [error, setError]       = useState("");
  const watchRef                = useRef(null);
  const timerRef                = useRef(null);

  const send = (lat, lng) => {
    authAxios().post(`${API}/location`, { bookingId: booking.id, lat, lng })
      .then(() => setLastSent(new Date()))
      .catch(() => setError("Location send failed"));
  };

  const start = () => {
    if (!navigator.geolocation) { setError("GPS not supported by your browser."); return; }
    setSharing(true); setError("");
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => send(p.coords.latitude, p.coords.longitude),
      () => setError("GPS access denied. Please allow location.")
    );
    timerRef.current = setInterval(() =>
      navigator.geolocation.getCurrentPosition((p) => send(p.coords.latitude, p.coords.longitude))
    , 5000);
  };

  const stop = () => {
    setSharing(false);
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    onStop();
  };

  useEffect(() => () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return (
    <div style={{
      background: sharing ? "rgba(0,212,170,.06)" : "var(--surface3)",
      border: `1px solid ${sharing ? "rgba(0,212,170,.3)" : "var(--border)"}`,
      borderRadius: 12, padding: "1rem 1.2rem", margin: ".5rem 0 .75rem 0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: ".88rem", fontWeight: 600, marginBottom: ".2rem" }}>📍 Location Sharing</p>
          <p style={{ fontSize: ".75rem", color: sharing ? "var(--teal)" : "var(--muted)" }}>
            {sharing
              ? (lastSent ? `Last sent: ${lastSent.toLocaleTimeString()}` : "Starting…")
              : "Share your GPS so the customer can track you"}
          </p>
          {error && <p style={{ fontSize: ".72rem", color: "#ff8080", marginTop: ".2rem" }}>⚠️ {error}</p>}
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          {!sharing ? (
            <button onClick={start}
              style={{ padding: ".5rem 1rem", borderRadius: 9, border: "none", background: "linear-gradient(135deg,var(--teal),#00b894)", color: "#fff", fontWeight: 700, fontSize: ".8rem", cursor: "pointer" }}>
              ▶ Start
            </button>
          ) : (
            <button onClick={stop}
              style={{ padding: ".5rem 1rem", borderRadius: 9, border: "1px solid rgba(251,113,133,.3)", background: "rgba(251,113,133,.1)", color: "var(--rose)", fontWeight: 700, fontSize: ".8rem", cursor: "pointer" }}>
              ⏹ Stop
            </button>
          )}
        </div>
      </div>
      {sharing && (
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".6rem" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", boxShadow: "0 0 8px rgba(0,212,170,.7)", animation: "dotPulse 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: ".74rem", color: "var(--teal)" }}>Live — customer can see your location</span>
        </div>
      )}
    </div>
  );
}

// ── Provider Chat Modal ───────────────────────────────────────────
function ProviderChatModal({ booking, user, socketRef, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const bottomRef               = useRef(null);

  useEffect(() => {
    authAxios().get(`${API}/chat/${booking.id}`)
      .then((r) => setMessages(r.data))
      .catch(console.error);

    const socket = socketRef.current;
    if (socket) {
      const handler = (data) => {
        if (data.bookingId === booking.id)
          setMessages((prev) => [...prev, { ...data, senderId: data.senderId }]);
      };
      socket.on("receive_message", handler);
      return () => socket.off("receive_message", handler);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await authAxios().post(`${API}/chat`, {
        bookingId:  booking.id,
        receiverId: booking.customer_id,
        message:    text,
      });
      const msg = { senderId: user.id, message: text, createdAt: new Date().toISOString(), senderName: user.fullName };
      setMessages((prev) => [...prev, msg]);
      socketRef.current?.emit("send_message", { ...msg, receiverId: booking.customer_id, bookingId: booking.id });
      setText("");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <button className="cd-modal-close" onClick={onClose}>✕</button>
        <h3 style={{ fontFamily: "var(--font-d)", fontWeight: 700, marginBottom: ".25rem" }}>Chat</h3>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: "1rem" }}>
          {booking.service_title} · Customer: {booking.customer_name}
        </p>
        <div className="cd-chat-wrap">
          <div className="cd-chat-msgs">
            {!messages.length && (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".84rem", padding: "1.5rem" }}>
                No messages yet.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`cd-msg ${m.senderId === user.id ? "mine" : "theirs"}`}>
                <p>{m.message}</p>
                <p className="cd-msg-meta">
                  {m.senderName} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="cd-chat-input">
            <input placeholder="Type a message…" value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()} />
            <button className="cd-chat-send" onClick={handleSend}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SERVICES TAB
// ══════════════════════════════════════════════════════════════════
function ServicesTab({ services, fetchServices, user }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState({ title: "", description: "", category: CATEGORIES[0], price: "", location: "" });
  const [error, setError]       = useState("");

  const resetForm = () => { setForm({ title: "", description: "", category: CATEGORIES[0], price: "", location: "" }); setEditItem(null); setError(""); };

  const handleSubmit = async () => {
    if (!form.title || !form.price) { setError("Title and price are required."); return; }
    setError("");
    try {
      if (editItem) {
        // PUT /api/services/:id  ← friend's route
        await authAxios().put(`${API}/services/${editItem.id}`, { ...form, is_active: 1 });
      } else {
        // POST /api/services  ← friend's route
        await authAxios().post(`${API}/services`, form);
      }
      fetchServices();
      setShowForm(false);
      resetForm();
    } catch (e) { setError(e.response?.data?.message || "Failed to save service."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await authAxios().delete(`${API}/services/${id}`);
      fetchServices();
    } catch (e) { alert("Failed to delete service."); }
  };

  const handleEdit = (s) => {
    setEditItem(s);
    setForm({ title: s.title, description: s.description || "", category: s.category, price: s.price, location: s.location || "" });
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.2rem" }}>
        <button className="cd-btn" style={{ padding: ".65rem 1.3rem", minWidth: "auto" }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? "✕ Cancel" : "+ Add Service"}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="cd-card" style={{ marginBottom: "1.3rem" }}>
          <div className="cd-card-hd">
            <h3>{editItem ? "Edit Service" : "Add New Service"}</h3>
          </div>
          {error && <div className="cd-error" style={{ marginBottom: ".8rem" }}>⚠️ {error}</div>}
          <div className="cd-form">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".9rem" }}>
              <div className="cd-fg">
                <label>Title</label>
                <input type="text" placeholder="e.g. Home Deep Cleaning"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="cd-fg">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="cd-fg">
                <label>Price (₹)</label>
                <input type="number" placeholder="e.g. 500"
                  value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="cd-fg">
                <label>Location</label>
                <input type="text" placeholder="City or area"
                  value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="cd-fg">
              <label>Description</label>
              <textarea placeholder="Describe your service…"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="cd-btn" onClick={handleSubmit}>
              {editItem ? "Update Service" : "Add Service →"}
            </button>
          </div>
        </div>
      )}

      {!services.length && !showForm && (
        <div className="cd-card">
          <div className="cd-empty">
            <div className="cd-empty-icon">🔧</div>
            <p>No services yet. Add your first service to get bookings!</p>
          </div>
        </div>
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
              <span className="cd-prov-tag">💰 ₹{s.price}</span>
              <span className="cd-prov-tag">📍 {s.location || "Any"}</span>
              <span className={`cd-prov-tag`} style={{ color: s.is_active ? "var(--teal)" : "var(--rose)" }}>
                {s.is_active ? "● Active" : "○ Inactive"}
              </span>
            </div>
            {s.description && (
              <p style={{ fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.5, margin: ".6rem 0" }}>
                {s.description.length > 80 ? s.description.slice(0, 80) + "…" : s.description}
              </p>
            )}
            <div className="cd-prov-actions">
              <button className="cd-prov-btn outline" onClick={() => handleEdit(s)}>✏ Edit</button>
              <button className="cd-prov-btn" onClick={() => handleDelete(s.id)}
                style={{ background: "rgba(251,113,133,.1)", color: "var(--rose)", border: "1px solid rgba(251,113,133,.25)" }}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  REVIEWS TAB
// ══════════════════════════════════════════════════════════════════
function ReviewsTab({ reviews = [], avgRating = 0 }) {
  // 1. Safety check for the list
  if (!reviews || !Array.isArray(reviews)) {
    return <div className="cd-card">Loading reviews...</div>;
  }

  // 2. Safety helper for stars (Prevents the NaN crash)
  const renderStars = (rating) => {
    try {
      const val = Math.max(0, Math.min(5, Math.round(rating) || 0));
      return "★".repeat(val) + "☆".repeat(5 - val);
    } catch (e) {
      return "☆☆☆☆☆";
    }
  };

  return (
    <div>
      <div className="cd-card" style={{ marginBottom: "1.3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-d)", fontSize: "3rem", fontWeight: 800, background: "linear-gradient(135deg,var(--teal),var(--blue))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {Number(avgRating || 0).toFixed(1)}
            </p>
            <p style={{ color: "var(--amber)", fontSize: "1.1rem", letterSpacing: ".05em" }}>
              {renderStars(avgRating)}
            </p>
            <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".3rem" }}>
              {reviews.length} reviews
            </p>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".4rem" }}>
                  <span style={{ fontSize: ".78rem", color: "var(--amber)", width: 16, textAlign: "right" }}>{star}★</span>
                  <div style={{ flex: 1, height: 6, background: "var(--surface2)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,var(--teal),var(--blue))", transition: "width .5s" }} />
                  </div>
                  <span style={{ fontSize: ".72rem", color: "var(--muted)", width: 20 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!reviews.length && (
        <div className="cd-card">
          <div className="cd-empty"><div className="cd-empty-icon">⭐</div><p>No reviews yet.</p></div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {reviews.map((r, i) => (
          <div key={i} className="cd-card" style={{ padding: "1.3rem 1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,var(--teal),var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
                  {r.customer_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p style={{ fontSize: ".88rem", fontWeight: 600 }}>{r.customer_name || "User"}</p>
                  <p style={{ fontSize: ".72rem", color: "var(--muted)" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</p>
                </div>
              </div>
              <span style={{ color: "var(--amber)", fontSize: ".9rem" }}>
                {renderStars(r.rating)}
              </span>
            </div>
            {r.comment && <p style={{ fontSize: ".86rem", color: "var(--muted)", lineHeight: 1.6 }}>{r.comment}</p>}
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
  const [form, setForm]   = useState({ fullName: user.fullName, contact: user.contact || "", location: user.location || "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [msg, setMsg]     = useState("");
  const [err, setErr]     = useState("");

  const handleProfileSave = async () => {
    setErr(""); setMsg("");
    try {
      const { data } = await authAxios().put(`${API}/auth/profile`, form);
      const updated  = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setMsg("Profile updated!");
    } catch (e) { setErr("Failed to update profile."); }
  };

  const handlePwChange = async () => {
    setErr(""); setMsg("");
    if (pwForm.newPw !== pwForm.confirm) { setErr("Passwords don't match."); return; }
    if (pwForm.newPw.length < 6)         { setErr("Min 6 characters."); return; }
    try {
      await authAxios().put(`${API}/auth/change-password`, { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setMsg("Password updated!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e) { setErr(e.response?.data?.message || "Failed to update password."); }
  };

  return (
    <div className="cd-grid-2">

      {/* Profile */}
      <div className="cd-card">
        <div className="cd-card-hd"><h3>Update Profile</h3></div>
        {err && <div className="cd-error" style={{ marginBottom: ".8rem" }}>⚠️ {err}</div>}
        {msg && <div className="cd-success" style={{ marginBottom: ".8rem" }}>✓ {msg}</div>}
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
          <button className="cd-btn" onClick={handleProfileSave}>Save Profile</button>
        </div>
      </div>

      {/* Password + Danger */}
      <div className="cd-card">
        <div className="cd-card-hd"><h3>Change Password</h3></div>
        <div className="cd-form">
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

        <div className="cd-danger-zone">
          <p className="cd-danger-title">⚠ Danger Zone</p>
          <button className="cd-danger-btn"
            onClick={() => window.confirm("Delete account? Cannot be undone.") && handleLogout()}>
            🗑 Delete My Account
          </button>
        </div>
      </div>

    </div>
  );
}
