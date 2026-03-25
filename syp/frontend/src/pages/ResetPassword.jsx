import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function ResetPassword() {
  const { token }             = useParams();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ newPw: "", confirm: "" });
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPw !== form.confirm) { setError("Passwords don't match."); return; }
    if (form.newPw.length < 6)       { setError("Minimum 6 characters.");  return; }
    setLoading(true); setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, newPassword: form.newPw });
      setDone(true);
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Link expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem" }}>
      <div className="auth-box" style={{ maxWidth: 420 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
            <h2 style={{ fontFamily: "var(--display)", marginBottom: ".5rem" }}>Password Reset!</h2>
            <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <h2>Reset Password</h2>
            <p className="subtitle">Enter your new password below.</p>
            {error && <div className="error-box" style={{ marginBottom: ".8rem" }}>⚠️ {error}</div>}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
              <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label>New Password</label>
                <input type="password" placeholder="••••••••" value={form.newPw} onChange={(e) => setForm({ ...form, newPw: e.target.value })} required />
              </div>
              <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Resetting…" : "Reset Password →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
