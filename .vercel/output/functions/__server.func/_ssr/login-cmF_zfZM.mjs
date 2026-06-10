import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as apiUrl } from "./router-B8wlS0VR.mjs";
import "../_libs/lodash.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "util";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
function LoginPage() {
  const [phone, setPhone] = reactExports.useState("");
  const [pin, setPin] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState(null);
  const [collapsed, setCollapsed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleError = (error) => {
    const text = error?.message && String(error.message).includes("Failed to fetch") ? "Unable to reach authentication server. Please ensure the backend is running." : error.message || "An error occurred";
    setMessage({
      type: "error",
      text
    });
  };
  async function login() {
    if (!phone.trim()) {
      handleError(new Error("Please enter your phone number"));
      return;
    }
    if (!pin.trim()) {
      handleError(new Error("Please enter your PIN"));
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          pin
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Login failed");
      localStorage.setItem("mavunopay_farmer", JSON.stringify(payload.farmer));
      window.location.href = "/dashboard";
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: `mv-nav ${collapsed ? "collapsed" : ""}`, style: {
      background: "transparent"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "logo", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/", style: {
      textDecoration: "none",
      color: "inherit",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/mavunopay-logo.png", alt: "MavunoPay", className: "nav-logo-img" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "brand-text", children: [
        "Mavuno",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pay" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .mv-nav{display:flex;align-items:center;justify-content:flex-start;padding:12px 20px;transition:padding .25s ease}
        .mv-nav .nav-logo-img{height:42px;width:auto}
        .mv-nav .brand-text{font-weight:700;color:#e07a00;margin-left:6px}
        .mv-nav.collapsed{padding:6px 12px}
        .mv-nav.collapsed .brand-text{display:none}
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "auth-section", style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-panel", style: {
      maxWidth: "400px",
      width: "100%"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-copy", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
        marginBottom: "0.5rem"
      }, children: "Login to your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
        marginBottom: "2rem",
        color: "#666"
      }, children: "Enter your phone number and PIN to access your dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "login-phone", children: "Phone number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "login-phone", type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "e.g. +254700123456", disabled: loading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "login-pin", children: "PIN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "login-pin", type: "password", value: pin, onChange: (e) => setPin(e.target.value), placeholder: "Enter your 4-digit PIN", disabled: loading, maxLength: 4 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-footer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-gold", onClick: login, disabled: loading, children: loading ? "Logging in..." : "Login to dashboard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-note", children: "Your PIN provides secure access to your account." })
        ] }),
        message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `auth-error`, style: {
          backgroundColor: message.type === "error" ? "#fee" : "#efe",
          color: message.type === "error" ? "#c33" : "#3c3",
          marginTop: "1rem"
        }, children: message.text }),
        message && message.type === "error" && String(message.text).includes("Unable to reach authentication server") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          marginTop: "0.5rem",
          textAlign: "center"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-ghost", onClick: login, style: {
          padding: "0.5rem 1rem"
        }, children: "Try again" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          alignItems: "center"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "btn-ghost", style: {
            textDecoration: "underline",
            color: "#1f2937",
            borderColor: "#d1d5db",
            background: "#ffffff"
          }, children: "← Back to Homepage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "#ccc"
          }, children: "|" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/signup", style: {
            color: "#d4af37",
            textDecoration: "underline"
          }, children: "Create account" })
        ] })
      ] })
    ] }) }) }),
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
  LoginPage as component
};
