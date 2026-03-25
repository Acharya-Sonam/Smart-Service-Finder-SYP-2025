import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const ROLES = [
  { id: "Customer",         icon: "👤", label: "Customer"  },
  { id: "Service Provider", icon: "🔧", label: "Provider"  },
  { id: "Admin",            icon: "⚙️", label: "Admin"     },
];

const FEATURES = [
  { icon: "⚡", text: "Instant service booking"    },
  { icon: "🛡️", text: "Verified providers only"    },
  { icon: "📍", text: "Location-based matching"    },
];

export default function AuthForm() {
  const [isSignup, setIsSignup]   = useState(false);
  const [role, setRole]           = useState("Customer");
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const boxRef                    = useRef(null);
  const navigate                  = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", contact: "", location: "",
  });

  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.style.opacity   = "0";
    boxRef.current.style.transform = "translateY(12px)";
    const t = setTimeout(() => {
      boxRef.current.style.transition = "opacity .35s ease, transform .35s ease";
      boxRef.current.style.opacity    = "1";
      boxRef.current.style.transform  = "translateY(0)";
    }, 50);
    return () => clearTimeout(t);
  }, [isSignup]);

  const toggleForm = () => {
    setErrors({});
    setFormData({ fullName: "", email: "", password: "", contact: "", location: "" });
    setIsSignup((v) => !v);
    setSubmitted(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (isSignup && !formData.fullName.trim()) e.fullName = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (formData.password.length < 6) e.password = "Min 6 characters";
    if (isSignup && !formData.contact.trim())  e.contact  = "Contact is required";
    if (isSignup && !formData.location.trim()) e.location = "Location is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      if (isSignup) {
        await axios.post("http://localhost:5000/api/auth/signup", { ...formData, role });
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); toggleForm(); }, 1800);
      } else {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email, password: formData.password, role,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user",  JSON.stringify(res.data.user));

        const r = res.data.user.role;
        if (r === "Customer")          navigate("/customer-dashboard");
        else if (r === "Service Provider") navigate("/provider-dashboard");
        else                           navigate("/admin-dashboard");
      }
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left */}
      <div className="auth-left">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div className="brand-name">Serv<span>ify</span></div>
        </div>
        <h1 className="auth-hero-title">
          Connect with the <span className="hl">right people</span><br />for every job.
        </h1>
        <p className="auth-hero-sub">
          Find trusted professionals near you, or offer your services to thousands of customers.
        </p>
        <div className="feature-list">
          {FEATURES.map((f) => (
            <div className="feature-item" key={f.text}>
              <div className="feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-box" ref={boxRef}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <h2 style={{ fontFamily: "var(--display)", marginBottom: ".5rem" }}>Account created!</h2>
              <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
              <p className="subtitle">
                {isSignup ? "Join as a customer or service provider" : "Sign in to continue"}
              </p>

              {/* Role selector */}
              <div className="role-selector">
                {ROLES.map((r) => (
                  <button key={r.id} type="button"
                    className={`role-btn${role === r.id ? " active" : ""}`}
                    onClick={() => setRole(r.id)}>
                    <span>{r.icon}</span> {r.label}
                  </button>
                ))}
              </div>

              {errors.api && <div className="error-box" style={{ marginBottom: ".8rem" }}>⚠️ {errors.api}</div>}

              <form onSubmit={handleSubmit} noValidate>
                {isSignup && (
                  <>
                    <Field label="Full Name"  name="fullName" type="text"  placeholder="Ram Acharya"           value={formData.fullName}  onChange={handleChange} error={errors.fullName} />
                    <Field label="Contact"    name="contact"  type="tel"   placeholder="+977 98XXXXXXXX"    value={formData.contact}   onChange={handleChange} error={errors.contact} />
                    <Field label="Location"   name="location" type="text"  placeholder="City, Country"      value={formData.location}  onChange={handleChange} error={errors.location} />
                  </>
                )}
                <Field label="Email address" name="email"    type="email"    placeholder="youremail@example.com" value={formData.email}    onChange={handleChange} error={errors.email} />
                <Field label="Password"      name="password" type="password" placeholder="••••••••"        value={formData.password} onChange={handleChange} error={errors.password} hint={isSignup ? "Minimum 10 characters" : null} />

                {!isSignup && (
                  <div className="forgot-link">
                    <span onClick={() => navigate("/forgot-password")}>Forgot password?</span>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Please wait…" : isSignup ? "Create my account →" : "Sign in →"}
                </button>
              </form>

              <div className="auth-divider">or</div>
              <p className="toggle-text">
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span onClick={toggleForm}>{isSignup ? "Sign in" : "Sign up free"}</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, error, hint }) {
  return (
    <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required
        style={error ? { borderColor: "rgba(255,100,100,.6)", boxShadow: "0 0 0 3px rgba(255,80,80,.1)" } : {}} />
      {error && <span style={{ color: "#ff8080", fontSize: ".75rem" }}>{error}</span>}
      {hint && !error && <span style={{ color: "var(--muted)", fontSize: ".75rem" }}>{hint}</span>}
    </div>
  );
}
