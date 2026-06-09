import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import slide01 from "@/assets/slides/slide01.jpg.asset.json";
import slide02 from "@/assets/slides/slide02.jpg.asset.json";
import slide03 from "@/assets/slides/slide03.jpg.asset.json";
import slide04 from "@/assets/slides/slide04.jpg.asset.json";
import slide05 from "@/assets/slides/slide05.jpg.asset.json";
import slide06 from "@/assets/slides/slide06.jpg.asset.json";
import slide07 from "@/assets/slides/slide07.jpg.asset.json";
import slide08 from "@/assets/slides/slide08.jpg.asset.json";
import slide09 from "@/assets/slides/slide09.jpg.asset.json";
import slide10 from "@/assets/slides/slide10.jpg.asset.json";
import slide11 from "@/assets/slides/slide11.jpg.asset.json";
import slide12 from "@/assets/slides/slide12.jpg.asset.json";
import slide13 from "@/assets/slides/slide13.jpg.asset.json";
import slide14 from "@/assets/slides/slide14.jpg.asset.json";
import slide15 from "@/assets/slides/slide15.jpg.asset.json";
import slide16 from "@/assets/slides/slide16.jpg.asset.json";
import slide17 from "@/assets/slides/slide17.jpg.asset.json";
import slide18 from "@/assets/slides/slide18.jpg.asset.json";
import slide19 from "@/assets/slides/slide19.jpg.asset.json";
import slide20 from "@/assets/slides/slide20.jpg.asset.json";

const SLIDES: string[] = [
  slide01.url, slide02.url, slide03.url, slide04.url, slide05.url,
  slide06.url, slide07.url, slide08.url, slide09.url, slide10.url,
  slide11.url, slide12.url, slide13.url, slide14.url, slide15.url,
  slide16.url, slide17.url, slide18.url, slide19.url, slide20.url,
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1920&q=80",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MavunoPay — Harvest Your Future" },
      {
        name: "description",
        content:
          "Turn your farm produce into savings, credit, and financial freedom — powered by the Stellar blockchain. Built for Kenya's farmers.",
      },
      { property: "og:title", content: "MavunoPay — Harvest Your Future" },
      {
        property: "og:description",
        content:
          "Blockchain-powered savings for smallholder farmers. No bank account needed.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const total = SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total]);

  const setFarmerAndNavigate = (farmer: any) => {
    localStorage.setItem('mavunopay_farmer', JSON.stringify(farmer));
    window.location.href = '/dashboard';
  };

  async function signup() {
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: signupPhone, name: signupName }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Signup failed');
      setFarmerAndNavigate(payload.farmer);
    } catch (error: any) {
      setAuthMessage(error.message || 'Signup failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function login() {
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Login failed');
      setFarmerAndNavigate(payload.farmer);
    } catch (error: any) {
      setAuthMessage(error.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      {/* NAV */}
      <nav className="mv-nav">
        <div className="logo">
          <img src="/mavunopay-logo.svg" alt="MavunoPay" className="nav-logo-img" />
          <span className="brand-text">Mavuno<span>Pay</span></span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#farmers">Farmers</a>
          <a href="#get-started" className="nav-cta">Get Started</a>
        </div>
      </nav>

      {/* HERO SLIDESHOW */}
      <div className="slideshow-wrap">
        <div className="slides">
          {SLIDES.map((src, i) => (
            <div key={i} className={`slide${i === current ? " active" : ""}`}>
              <img src={src} alt="Hero slide" className="slide-img" />
            </div>
          ))}
        </div>
        <div className="slide-overlay" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <i className="fas fa-seedling" /> Built for Kenya's Farmers
          </div>
          <h1 className="hero-title">
            Your Harvest,<br />
            <em>Your Wealth.</em>
          </h1>
          <p className="hero-sub">
            Turn your farm produce into savings, credit, and financial freedom —
            powered by Stellar blockchain. No bank account needed.
          </p>
          <div className="hero-btns">
            <a href="#" className="btn-gold">
              <i className="fas fa-mobile-alt" /> Get Started Free
            </a>
            <a href="#how" className="btn-ghost">
              See How It Works <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>

        <div className="slide-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`dot${i === current ? " active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <div className="slide-counter">
          <span>{pad(current + 1)}</span> / <span>{pad(total)}</span>
        </div>

        <div className="scroll-cue">
          <div className="line" />
          Scroll
        </div>
      </div>

      {/* STATS */}
      <div className="stats-strip">
        <div className="stat">
          <div className="stat-num">50K+</div>
          <div className="stat-label">Farmers Onboarded</div>
        </div>
        <div className="stat">
          <div className="stat-num">KES 2B</div>
          <div className="stat-label">Harvest Value Tracked</div>
        </div>
        <div className="stat">
          <div className="stat-num">47</div>
          <div className="stat-label">Counties Covered</div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-head">
          <div className="section-tag">Why MavunoPay</div>
          <h2>
            Everything you need,<br />nothing you don't
          </h2>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: "fa-wallet",
              title: "Instant Digital Wallet",
              text: "Sign up with your phone. Your Stellar wallet is ready in seconds. Works with M-Pesa & Airtel Money.",
            },
            {
              icon: "fa-piggy-bank",
              title: "Harvest Savings",
              text: "Automatically save a portion of every harvest. Set goals for school fees, seeds, or emergencies.",
            },
            {
              icon: "fa-chart-line",
              title: "Farm-Based Credit",
              text: "Your harvest history builds a credit score. Access fair loans — no collateral, no middlemen.",
            },
            {
              icon: "fa-users",
              title: "Co-op Governance",
              text: "Vote on group rules on-chain. Full transparency for every member of your cooperative.",
            },
          ].map((f) => (
            <div className="feat-card" key={f.title}>
              <div className="feat-icon">
                <i className={`fas ${f.icon}`} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-section" id="get-started">
        <div className="section-head">
          <div className="section-tag">Get Started</div>
          <h2>Login or sign up to register as a farmer</h2>
          <p>Farmers can sign up with their phone number or login with an existing Farmer ID to access the dashboard.</p>
        </div>
        <div className="auth-panel">
          <div className="auth-copy">
            <div className="auth-tabs">
              <button type="button" className={`auth-tab${activeTab === 'signup' ? ' active' : ''}`} onClick={() => setActiveTab('signup')}>
                Sign Up
              </button>
              <button type="button" className={`auth-tab${activeTab === 'login' ? ' active' : ''}`} onClick={() => setActiveTab('login')}>
                Login
              </button>
            </div>
            <div className="auth-card">
              {activeTab === 'signup' ? (
                <>
                  <div className="auth-field">
                    <label htmlFor="signup-phone">Phone number</label>
                    <input id="signup-phone" type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} placeholder="e.g. +254700123456" />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="signup-name">Farmer name</label>
                    <input id="signup-name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="auth-footer">
                    <button type="button" className="btn-gold" onClick={signup} disabled={authLoading}>
                      {authLoading ? 'Registering...' : 'Create farmer account'}
                    </button>
                    <div className="auth-note">A new Stellar wallet and Farmer ID will be created instantly.</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="auth-field">
                    <label htmlFor="login-identifier">Farmer ID or phone</label>
                    <input id="login-identifier" type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="Enter your Farmer ID or phone" />
                  </div>
                  <div className="auth-footer">
                    <button type="button" className="btn-gold" onClick={login} disabled={authLoading}>
                      {authLoading ? 'Logging in...' : 'Login to dashboard'}
                    </button>
                    <div className="auth-note">Use the Farmer ID from your registration message or phone number.</div>
                  </div>
                </>
              )}
              {authMessage ? <div className="auth-error">{authMessage}</div> : null}
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="how" id="how">
        <div className="section-head">
          <div className="section-tag">Simple Process</div>
          <h2>Field to Future in 4 steps</h2>
        </div>
        <div className="steps-row">
          {[
            { n: 1, h: "Register", p: "Sign up with your phone number. Wallet created instantly." },
            { n: 2, h: "Set a Goal", p: "Choose how much of your harvest to save or invest." },
            { n: 3, h: "Get Paid", p: "Sell your crop. Savings are locked in automatically." },
            { n: 4, h: "Grow", p: "Use your credit history to borrow for the next season." },
          ].map((s) => (
            <div className="step-box" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="farmers">
        <h2>
          Ready to Harvest<br />Your Financial Future?
        </h2>
        <p>Join thousands of Kenyan farmers turning their harvest into lasting wealth.</p>
        <a href="#" className="btn-gold hero-cta">
          <i className="fas fa-mobile-alt" /> Get Started Free
        </a>
      </section>

      {/* TRUST */}
      <div className="trust-bar">
        <div className="trust-item"><i className="fas fa-shield-alt" /> Stellar Blockchain Secured</div>
        <div className="trust-item"><i className="fas fa-mobile-alt" /> M-Pesa & Airtel Ready</div>
        <div className="trust-item"><i className="fas fa-check-circle" /> CBK Compliant</div>
        <div className="trust-item"><i className="fas fa-lock" /> Bank-Grade Encryption</div>
      </div>

      {/* FOOTER */}
      <footer className="mv-footer">
        <p>
          © 2026 MavunoPay — Built on Stellar for Kenya's Farmers &nbsp;|&nbsp;{" "}
          <a href="#">Privacy</a> &nbsp;|&nbsp; <a href="#">Terms</a> &nbsp;|&nbsp;{" "}
          <a href="#">Contact</a>
        </p>
      </footer>
    </>
  );
}
