import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// Prefer local hero images (place the attached images under `public/assets/hero/`)
const LOCAL_SLIDES = [
  "/assets/hero/coffee-01.jpg",
  "/assets/hero/coffee-02.jpg",
  "/assets/hero/maize-01.jpg",
  "/assets/hero/farmer-01.jpg",
  "/assets/hero/farmer-02.jpg",
];

const FALLBACK_SLIDES: string[] = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1920&q=80",
];

// Runtime slides: we'll try to use local images first (if uploaded), otherwise fall back to remote
let SLIDES: string[] = FALLBACK_SLIDES.slice();

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

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total]);

  // Try to preload local images; if they exist, use them instead of the remote fallbacks
  useEffect(() => {
    let mounted = true;
    const tryLocal = async () => {
      const loaded: string[] = [];
      for (const path of LOCAL_SLIDES) {
        // attempt to load
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded.push(path);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = path + "?t=" + Date.now();
        });
      }
      if (mounted && loaded.length > 0) {
        SLIDES = loaded.concat(FALLBACK_SLIDES).slice(0, Math.max(4, loaded.length));
        setCurrent(0);
      }
    };
    tryLocal();
    return () => {
      mounted = false;
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      {/* Minimal header: logo and brand only */}
      <header className="mv-header" style={{ display: "flex", alignItems: "center", padding: "1rem", justifyContent: "flex-start" }}>
        <div className="logo" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img src="/mavunopay-logo.svg" alt="MavunoPay" className="nav-logo-img" style={{ height: 46 }} />
          <span className="brand-text">Mavuno<span>Pay</span></span>
        </div>
      </header>

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
            <a href="/signup" className="btn-gold">
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

      {/* Replace stats with proxy/CORS instructions per request */}
      <div className="stats-strip" style={{ padding: "2rem", background: "#fafafa", textAlign: "center" }}>
        <p style={{ maxWidth: 900, margin: "0 auto", color: "#333" }}>
          If you prefer the other approach (no proxy), change fetch calls back to the full backend URL and enable CORS on the server. Example server-side (Express) CORS snippet:
        </p>
        <pre style={{ background: "#111", color: "#f7f7f7", padding: "1rem", marginTop: "1rem", overflowX: "auto", maxWidth: 900, marginLeft: "auto", marginRight: "auto", borderRadius: 6 }}>
{`// npm install express cors
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.options('*', cors());

app.use(express.json());

app.post('/api/request-otp', (req, res) => {
  // handle OTP request
  res.json({ ok: true });
});

app.listen(3001, () => console.log('Backend listening on http://localhost:3001'));
`}
        </pre>
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

      {/* HOW */}
      <section className="how" id="how">
        <div className="section-head">
        
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
        <a href="/signup" className="btn-gold hero-cta">
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
