import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";

// ── Data ──────────────────────────────────────────────
const SERVICES = [
  { icon: "🔧", name: "Plumbing",     count: 84,  bg: "rgba(59,158,255,0.1)"  },
  { icon: "⚡", name: "Electrical",   count: 62,  bg: "rgba(245,158,11,0.1)"  },
  { icon: "🧹", name: "Cleaning",     count: 120, bg: "rgba(0,212,170,0.1)"   },
  { icon: "🏗️", name: "Construction", count: 45,  bg: "rgba(255,122,47,0.1)"  },
  { icon: "🎨", name: "Painting",     count: 38,  bg: "rgba(167,139,250,0.1)" },
  { icon: "❄️", name: "AC Repair",    count: 29,  bg: "rgba(56,189,248,0.1)"  },
  { icon: "🛁", name: "Bathroom",     count: 51,  bg: "rgba(251,191,36,0.1)"  },
  { icon: "🌿", name: "Gardening",    count: 33,  bg: "rgba(52,211,153,0.1)"  },
];

const PROVIDERS = [
  { initial: "H", name: "Hari Thapa",  role: "Plumber",     rating: "4.9", jobs: 128, exp: "8yr", rate: "NPR 500", gradient: "linear-gradient(135deg,#3b82f6,#60a5fa)" },
  { initial: "R", name: "Raju Sharma", role: "Electrician",  rating: "4.8", jobs: 95,  exp: "5yr", rate: "NPR 600", gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)" },
  { initial: "S", name: "Sita Rai",    role: "Home Cleaner", rating: "5.0", jobs: 210, exp: "6yr", rate: "NPR 350", gradient: "linear-gradient(135deg,#10b981,#34d399)" },
];

const NEARBY = [
  { icon: "🔧", name: "Hari Thapa",  role: "Plumber",     dist: "0.8 km", rate: "NPR 500/hr", rating: "★ 4.9 · 128 jobs", bg: "rgba(59,158,255,0.1)"  },
  { icon: "⚡", name: "Raju Sharma", role: "Electrician",  dist: "1.2 km", rate: "NPR 600/hr", rating: "★ 4.8 · 95 jobs",  bg: "rgba(0,212,170,0.1)"   },
  { icon: "🧹", name: "Sita Rai",    role: "Cleaner",      dist: "2.1 km", rate: "NPR 350/hr", rating: "★ 5.0 · 210 jobs", bg: "rgba(255,122,47,0.1)"  },
];

const REVIEWS = [
  { initial: "P", name: "Priya Maharjan", role: "Customer · Kathmandu",  text: "Found a plumber within minutes. He arrived in 20 minutes, fixed everything perfectly, and the live tracking made it stress-free.",      gradient: "linear-gradient(135deg,#3b9eff,#6aaeff)" },
  { initial: "R", name: "Ram Shrestha",   role: "Customer · Pokhara",    text: "I've been using SmartService for all my home maintenance. Always professional, on time, and reasonably priced. Highly recommended!",         gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)" },
  { initial: "A", name: "Anita KC",       role: "Provider · Biratnagar", text: "As a provider, SmartService helped me grow my client base significantly. The booking system is simple and payments are always on time.",      gradient: "linear-gradient(135deg,#10b981,#34d399)" },
];

// ── Main Component ────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState({ service: "", location: "", date: "" });

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 5) * 0.07}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams(search);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-container lp-nav-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-mark">🔧</div>
            <span className="lp-logo-text">Smart<span>Service</span></span>
          </Link>

          <ul className={`lp-nav-links ${menuOpen ? "open" : ""}`}>
            {["services", "how", "providers", "reviews"].map((id) => (
              <li key={id}>
                <a href={`#${id}`} onClick={() => setMenuOpen(false)}>
                  {id.charAt(0).toUpperCase() + id.slice(1).replace("how", "How it Works")}
                </a>
              </li>
            ))}
          </ul>

          <div className="lp-nav-ctas">
            <Link to="/auth" className="lp-btn lp-btn-outline">Sign In</Link>
            <Link to="/auth" className="lp-btn lp-btn-primary">Get Started</Link>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <span className="lp-badge-dot" />
              500+ verified providers in Nepal
            </div>
            <h1>
              Your trusted<br />
              <em>service experts</em><br />
              on demand
            </h1>
            <p className="lp-hero-sub">
              Book verified professionals for home repair, cleaning, plumbing, electrical work
              and more — track them live, chat instantly, pay safely.
            </p>
            <div className="lp-hero-ctas">
              <Link to="/auth" className="lp-btn lp-btn-primary lp-btn-lg">Book a Service →</Link>
              <Link to="/auth" className="lp-btn lp-btn-outline lp-btn-lg">Join as Provider</Link>
            </div>
            <div className="lp-hero-stats">
              <div className="lp-stat"><div className="lp-stat-num">2,400+</div><div className="lp-stat-lbl">Happy Customers</div></div>
              <div className="lp-stat-div" />
              <div className="lp-stat"><div className="lp-stat-num">500+</div><div className="lp-stat-lbl">Verified Providers</div></div>
              <div className="lp-stat-div" />
              <div className="lp-stat"><div className="lp-stat-num">4.8★</div><div className="lp-stat-lbl">Avg Rating</div></div>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-hv-card">
              <div className="lp-hv-head">
                <span className="lp-hv-title">Nearby Providers</span>
                <span className="lp-live-pill"><span className="lp-live-dot" />Live</span>
              </div>
              {NEARBY.map((p) => (
                <div className="lp-prow" key={p.name}>
                  <div className="lp-pav" style={{ background: p.bg }}>{p.icon}</div>
                  <div className="lp-pi">
                    <div className="lp-pi-name">{p.name}</div>
                    <div className="lp-pi-role">{p.role} · {p.dist} away</div>
                  </div>
                  <div className="lp-pr">
                    <div className="lp-pr-rate">{p.rate}</div>
                    <div className="lp-pr-star">{p.rating}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-float-card lp-fc1">
              <div className="lp-fc-lbl">This month</div>
              <div className="lp-fc-val">NPR 12,500</div>
              <div className="lp-fc-sub">↑ 18% vs last month</div>
            </div>
            <div className="lp-float-card lp-fc2">
              <div className="lp-fc-lbl">Avg response</div>
              <div className="lp-fc-val">4 min</div>
              <div className="lp-fc-sub">🟢 Providers online</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="lp-search">
        <div className="lp-container">
          <div className="lp-search-box">
            <div className="lp-sf"><span>🔍</span><input type="text" placeholder="What service do you need?" value={search.service} onChange={(e) => setSearch({ ...search, service: e.target.value })} /></div>
            <div className="lp-sdiv" />
            <div className="lp-sf"><span>📍</span><input type="text" placeholder="Your location" value={search.location} onChange={(e) => setSearch({ ...search, location: e.target.value })} /></div>
            <div className="lp-sdiv" />
            <div className="lp-sf"><span>📅</span><input type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} /></div>
            <button className="lp-search-btn" onClick={handleSearch}>Find Experts →</button>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="lp-services" id="services">
        <div className="lp-container">
          <div className="lp-sh reveal">
            <div>
              <span className="lp-tag">Our Services</span>
              <h2 className="lp-sec-title">Whatever you need,<br />we've got an expert</h2>
            </div>
            <button className="lp-btn lp-btn-outline" onClick={() => navigate("/auth")}>View All →</button>
          </div>
          <div className="lp-sg">
            {SERVICES.map((s) => (
              <div className="lp-sc reveal" key={s.name} onClick={() => navigate("/auth")}>
                <div className="lp-sc-ico" style={{ background: s.bg }}>{s.icon}</div>
                <div className="lp-sc-name">{s.name}</div>
                <div className="lp-sc-cnt">{s.count} providers</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="how">
        <div className="lp-container lp-how-inner">
          <div>
            <span className="lp-tag reveal">How it Works</span>
            <h2 className="lp-sec-title reveal">Book a pro in<br />3 simple steps</h2>
            <p className="lp-sec-sub reveal">No calls, no guessing. Find, book, and track your provider all in one place.</p>
            <div className="lp-steps">
              {[
                { n: "1", title: "Search & filter",  desc: "Browse verified providers near you. Filter by category, rating, price, and availability." },
                { n: "2", title: "Book & chat",      desc: "Confirm with one tap. Chat directly with your provider before they arrive." },
                { n: "3", title: "Track & review",   desc: "Watch your provider on a live map. Rate and review once done." },
              ].map((s) => (
                <div className="lp-step reveal" key={s.n}>
                  <div className="lp-step-n">{s.n}</div>
                  <div>
                    <div className="lp-step-title">{s.title}</div>
                    <div className="lp-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-map-card reveal">
            <div className="lp-map-ph">
              <span className="lp-mp" style={{ top: "32%", left: "28%" }}>📍</span>
              <span className="lp-mp" style={{ top: "52%", left: "58%", animationDelay: "0.5s" }}>🔧</span>
              <span className="lp-mp" style={{ top: "22%", left: "64%", animationDelay: "1s" }}>⚡</span>
            </div>
            <div className="lp-nearby-row">
              <div className="lp-nb-av">H</div>
              <div>
                <div className="lp-nb-name">Hari Thapa – Plumber</div>
                <div className="lp-nb-dist">0.8 km away · On the way</div>
              </div>
              <div className="lp-nb-eta">ETA 4 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROVIDERS ── */}
      <section className="lp-providers" id="providers">
        <div className="lp-container">
          <div className="lp-providers-hd reveal">
            <span className="lp-tag">Top Rated</span>
            <h2 className="lp-sec-title">Meet our verified experts</h2>
            <p className="lp-sec-sub">Every provider is background-checked, skill-verified, and rated by real customers.</p>
          </div>
          <div className="lp-pc-grid">
            {PROVIDERS.map((p) => (
              <div className="lp-pc reveal" key={p.name}>
                <div className="lp-pc-top">
                  <div className="lp-pc-av" style={{ background: p.gradient }}>{p.initial}</div>
                  <div>
                    <div className="lp-pc-name">{p.name}</div>
                    <div className="lp-pc-role">{p.role}</div>
                    <div className="lp-vbadge">✓ Verified</div>
                  </div>
                </div>
                <div className="lp-pc-stats">
                  <div className="lp-pcs"><div className="lp-pcs-n">{p.rating}</div><div className="lp-pcs-l">Rating</div></div>
                  <div className="lp-pcs"><div className="lp-pcs-n">{p.jobs}</div><div className="lp-pcs-l">Jobs</div></div>
                  <div className="lp-pcs"><div className="lp-pcs-n">{p.exp}</div><div className="lp-pcs-l">Exp.</div></div>
                </div>
                <div className="lp-pc-foot">
                  <div>
                    <div className="lp-pc-rate">{p.rate} <span>/hr</span></div>
                    <div className="lp-avail"><span className="lp-avail-d" />Available now</div>
                  </div>
                  <button className="lp-book-btn" onClick={() => navigate("/auth")}>Book →</button>
                </div>
              </div>
            ))}
          </div>
          <div className="lp-providers-cta">
            <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => navigate("/auth")}>View All Providers</button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-testi" id="reviews">
        <div className="lp-container">
          <div className="lp-testi-hd reveal">
            <span className="lp-tag">Reviews</span>
            <h2 className="lp-sec-title">What our customers say</h2>
            <p className="lp-sec-sub">Trusted by thousands of households across Nepal.</p>
          </div>
          <div className="lp-tg">
            {REVIEWS.map((r) => (
              <div className="lp-tc reveal" key={r.name}>
                <div className="lp-tc-stars">★★★★★</div>
                <p className="lp-tc-text">"{r.text}"</p>
                <div className="lp-tc-auth">
                  <div className="lp-tc-av" style={{ background: r.gradient }}>{r.initial}</div>
                  <div>
                    <div className="lp-tc-name">{r.name}</div>
                    <div className="lp-tc-role">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-container">
          <div className="lp-cta-box">
            <div className="lp-cta-txt reveal">
              <h2>Ready to get started?</h2>
              <p>Join 2,400+ customers and 500+ providers already using SmartService across Nepal.</p>
            </div>
            <div className="lp-cta-btns reveal">
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => navigate("/auth")}>Book a Service</button>
              <button className="lp-btn lp-btn-ghost lp-btn-lg"   onClick={() => navigate("/auth")}>Become a Provider</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-fg">
            <div>
              <Link to="/" className="lp-logo">
                <div className="lp-logo-mark">🔧</div>
                <span className="lp-logo-text">Smart<span>Service</span></span>
              </Link>
              <p className="lp-fd">Connecting trusted service professionals with households across Nepal since 2024.</p>
            </div>
            {[
              { title: "Services", links: ["Plumbing","Electrical","Cleaning","Painting","AC Repair"] },
              { title: "Company",  links: ["About Us","How it Works","Blog","Careers"] },
              { title: "Support",  links: ["Help Center","Contact Us","Privacy Policy","Terms of Service"] },
            ].map((col) => (
              <div className="lp-fc" key={col.title}>
                <h4>{col.title}</h4>
                <ul>{col.links.map((l) => <li key={l}><Link to="/">{l}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="lp-fb">
            <p>© 2026 SmartService. All rights reserved.</p>
            <p>Built with ❤ for Nepal</p>
          </div>
        </div>
      </footer>
    </>
  );
}
