import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const HERO_SLIDES = [
  {
    src: "/assets/hero/coffee-cherries.png",
    alt: "Ripe red and green coffee cherries on the branch",
  },
  {
    src: "/assets/hero/coffee-farmer-phone.png",
    alt: "Coffee farmer using a smartphone to monitor crop health",
  },
  {
    src: "/assets/hero/coffee-harvest-woman.png",
    alt: "Woman harvesting ripe coffee cherries in a plantation",
  },
  {
    src: "/assets/hero/coffee-harvest-basin.png",
    alt: "Smiling coffee farmer collecting cherries in a metal basin",
  },
  { src: "/assets/hero/maize-field.png", alt: "Healthy green maize plants growing in a field" },
  {
    src: "/assets/hero/farmer-cassava-phone.png",
    alt: "Farmer checking a mobile phone in a cassava field",
  },
  {
    src: "/assets/hero/harvest-grain-drying.png",
    alt: "Farmers drying harvested grain in the sun",
  },
  {
    src: "/assets/hero/tea-plantation.png",
    alt: "Tea pickers working on a lush hillside plantation",
  },
  { src: "/assets/hero/tea-leaves.png", alt: "Fresh green tea leaves glistening with dew" },
  {
    src: "/assets/hero/farmer-maize-phone.png",
    alt: "Elderly farmer using a mobile phone in a maize field",
  },
  {
    src: "/assets/hero/corn-seed-demo.png",
    alt: "High-yield corn seed variety in a demonstration plot",
  },
  {
    src: "/assets/hero/corn-field-sign.png",
    alt: "Corn crop field with agricultural seed signage",
  },
  {
    src: "/assets/hero/farmer-potato-field.png",
    alt: "Farmer tending potato crops with a hand hoe",
  },
] as const;

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
        content: "Blockchain-powered savings for smallholder farmers. No bank account needed.",
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
  const total = HERO_SLIDES.length;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      {/* Minimal header: logo and brand only */}
      <header
        className="mv-header"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1rem",
          justifyContent: "flex-start",
        }}
      >
        <div className="logo" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img
            src="/mavunopay-logo.png"
            alt="MavunoPay"
            className="nav-logo-img"
            style={{ height: 46 }}
          />
          <span className="brand-text">
            Mavuno<span>Pay</span>
          </span>
        </div>
      </header>

      {/* HERO SLIDESHOW */}
      <div className="slideshow-wrap">
        <div className="slides">
          {HERO_SLIDES.map((slide, i) => (
            <div key={slide.src} className={`slide${i === current ? " active" : ""}`}>
              <img src={slide.src} alt={slide.alt} className="slide-img" />
            </div>
          ))}
        </div>
        <div className="slide-overlay" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <i className="fas fa-seedling" /> Built for Kenya's Farmers
          </div>
          <h1 className="hero-title">
            Your Harvest,
            <br />
            <em>Your Wealth.</em>
          </h1>
          <p className="hero-sub">
            Turn your farm produce into savings, credit, and financial freedom — powered by Stellar
            blockchain. No bank account needed.
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
          {HERO_SLIDES.map((_, i) => (
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

      <div className="stats-strip">
        <div className="stat">
          <div className="stat-num">10K+</div>
          <div className="stat-label">Farmers onboarded</div>
        </div>
        <div className="stat">
          <div className="stat-num">KES 50M+</div>
          <div className="stat-label">Harvest savings</div>
        </div>
        <div className="stat">
          <div className="stat-num">98%</div>
          <div className="stat-label">Goal completion</div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-head">
          <div className="section-tag">Why MavunoPay</div>
          <h2>
            Everything you need,
            <br />
            nothing you don't
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
          Ready to Harvest
          <br />
          Your Financial Future?
        </h2>
        <p>Join thousands of Kenyan farmers turning their harvest into lasting wealth.</p>
        <a href="/signup" className="btn-gold hero-cta">
          <i className="fas fa-mobile-alt" /> Get Started Free
        </a>
      </section>

      {/* TRUST */}
      <div className="trust-bar">
        <div className="trust-item">
          <i className="fas fa-shield-alt" /> Stellar Blockchain Secured
        </div>
        <div className="trust-item">
          <i className="fas fa-mobile-alt" /> M-Pesa & Airtel Ready
        </div>
        <div className="trust-item">
          <i className="fas fa-check-circle" /> CBK Compliant
        </div>
        <div className="trust-item">
          <i className="fas fa-lock" /> Bank-Grade Encryption
        </div>
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
