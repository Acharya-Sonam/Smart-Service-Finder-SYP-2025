// ── ForgotPassword.jsx ───────────────────────────────────────────
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem" }}>
      <div className="auth-box" style={{ maxWidth: 420 }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📬</div>
            <h2 style={{ fontFamily: "var(--display)", marginBottom: ".5rem" }}>Check your inbox</h2>
            <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
              We sent a reset link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <>
            <h2>Forgot password?</h2>
            <p className="subtitle">Enter your email to receive a reset link.</p>
            {error && <div className="error-box" style={{ marginBottom: ".8rem" }}>⚠️ {error}</div>}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
              <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label>Email address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending…" : "Send reset link →"}
              </button>
            </form>
            <div className="auth-divider">or</div>
            <p className="toggle-text">
              Remembered it? <span onClick={() => navigate("/auth")}>Sign in</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
