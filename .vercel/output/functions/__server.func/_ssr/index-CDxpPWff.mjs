import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import "../_libs/lodash.mjs";
const HERO_SLIDES = [{
  src: "/assets/hero/coffee-cherries.png",
  alt: "Ripe red and green coffee cherries on the branch"
}, {
  src: "/assets/hero/coffee-farmer-phone.png",
  alt: "Coffee farmer using a smartphone to monitor crop health"
}, {
  src: "/assets/hero/coffee-harvest-woman.png",
  alt: "Woman harvesting ripe coffee cherries in a plantation"
}, {
  src: "/assets/hero/coffee-harvest-basin.png",
  alt: "Smiling coffee farmer collecting cherries in a metal basin"
}, {
  src: "/assets/hero/maize-field.png",
  alt: "Healthy green maize plants growing in a field"
}, {
  src: "/assets/hero/farmer-cassava-phone.png",
  alt: "Farmer checking a mobile phone in a cassava field"
}, {
  src: "/assets/hero/harvest-grain-drying.png",
  alt: "Farmers drying harvested grain in the sun"
}, {
  src: "/assets/hero/tea-plantation.png",
  alt: "Tea pickers working on a lush hillside plantation"
}, {
  src: "/assets/hero/tea-leaves.png",
  alt: "Fresh green tea leaves glistening with dew"
}, {
  src: "/assets/hero/farmer-maize-phone.png",
  alt: "Elderly farmer using a mobile phone in a maize field"
}, {
  src: "/assets/hero/corn-seed-demo.png",
  alt: "High-yield corn seed variety in a demonstration plot"
}, {
  src: "/assets/hero/corn-field-sign.png",
  alt: "Corn crop field with agricultural seed signage"
}, {
  src: "/assets/hero/farmer-potato-field.png",
  alt: "Farmer tending potato crops with a hand hoe"
}];
function Home() {
  const total = HERO_SLIDES.length;
  const [current, setCurrent] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total]);
  const pad = (n) => String(n).padStart(2, "0");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "mv-header", style: {
      display: "flex",
      alignItems: "center",
      padding: "1rem",
      justifyContent: "flex-start"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "logo", style: {
      display: "flex",
      alignItems: "center",
      gap: "0.6rem"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/mavunopay-logo.png", alt: "MavunoPay", className: "nav-logo-img", style: {
        height: 46
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "brand-text", children: [
        "Mavuno",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pay" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "slideshow-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "slides", children: HERO_SLIDES.map((slide, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `slide${i === current ? " active" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: slide.src, alt: slide.alt, className: "slide-img" }) }, slide.src)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "slide-overlay" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-eyebrow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-seedling" }),
          " Built for Kenya's Farmers"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "hero-title", children: [
          "Your Harvest,",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Your Wealth." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hero-sub", children: "Turn your farm produce into savings, credit, and financial freedom — powered by Stellar blockchain. No bank account needed." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-btns", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/signup", className: "btn-gold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-mobile-alt" }),
            " Get Started Free"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#how", className: "btn-ghost", children: [
            "See How It Works ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-arrow-right" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "slide-dots", children: HERO_SLIDES.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": `Go to slide ${i + 1}`, className: `dot${i === current ? " active" : ""}`, onClick: () => setCurrent(i) }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "slide-counter", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pad(current + 1) }),
        " / ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pad(total) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scroll-cue", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line" }),
        "Scroll"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-strip", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-num", children: "10K+" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Farmers onboarded" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-num", children: "KES 50M+" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Harvest savings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-num", children: "98%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Goal completion" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "features", id: "features", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-tag", children: "Why MavunoPay" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
          "Everything you need,",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "nothing you don't"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feature-grid", children: [{
        icon: "fa-wallet",
        title: "Instant Digital Wallet",
        text: "Sign up with your phone. Your Stellar wallet is ready in seconds. Works with M-Pesa & Airtel Money."
      }, {
        icon: "fa-piggy-bank",
        title: "Harvest Savings",
        text: "Automatically save a portion of every harvest. Set goals for school fees, seeds, or emergencies."
      }, {
        icon: "fa-chart-line",
        title: "Farm-Based Credit",
        text: "Your harvest history builds a credit score. Access fair loans — no collateral, no middlemen."
      }, {
        icon: "fa-users",
        title: "Co-op Governance",
        text: "Vote on group rules on-chain. Full transparency for every member of your cooperative."
      }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feat-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "feat-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: `fas ${f.icon}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: f.text })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "how", id: "how", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-head", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Field to Future in 4 steps" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "steps-row", children: [{
        n: 1,
        h: "Register",
        p: "Sign up with your phone number. Wallet created instantly."
      }, {
        n: 2,
        h: "Set a Goal",
        p: "Choose how much of your harvest to save or invest."
      }, {
        n: 3,
        h: "Get Paid",
        p: "Sell your crop. Savings are locked in automatically."
      }, {
        n: 4,
        h: "Grow",
        p: "Use your credit history to borrow for the next season."
      }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "step-num", children: s.n }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: s.h }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: s.p })
      ] }, s.n)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "cta-section", id: "farmers", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
        "Ready to Harvest",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Your Financial Future?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Join thousands of Kenyan farmers turning their harvest into lasting wealth." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/signup", className: "btn-gold hero-cta", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-mobile-alt" }),
        " Get Started Free"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-bar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-shield-alt" }),
        " Stellar Blockchain Secured"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-mobile-alt" }),
        " M-Pesa & Airtel Ready"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-check-circle" }),
        " CBK Compliant"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trust-item", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-lock" }),
        " Bank-Grade Encryption"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "mv-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "© 2026 MavunoPay — Built on Stellar for Kenya's Farmers  | ",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", children: "Privacy" }),
      "  |  ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", children: "Terms" }),
      "  | ",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", children: "Contact" })
    ] }) })
  ] });
}
export {
  Home as component
};
