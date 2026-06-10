import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// When empty, use relative `/api` paths so same-origin requests reach deployed Next.js backend.
const BACKEND = (import.meta.env.VITE_BACKEND_URL as string) || "";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — MavunoPay" },
      {
        name: "description",
        content: "Login to your MavunoPay farmer account",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleError = (error: any) => {
    const text = error?.message && String(error.message).includes("Failed to fetch")
      ? "Unable to reach authentication server. Please ensure the backend is running."
      : error.message || "An error occurred";
    setMessage({ type: "error", text });
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
      const res = await fetch(`${BACKEND}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Login failed");
      localStorage.setItem("mavunopay_farmer", JSON.stringify(payload.farmer));
      window.location.href = "/dashboard";
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* NAV */}
      <nav className={`mv-nav ${collapsed ? "collapsed" : ""}`} style={{ background: "transparent" }}>
        <div className="logo">
          <a href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/mavunopay-logo.svg" alt="MavunoPay" className="nav-logo-img" />
            <span className="brand-text">Mavuno<span>Pay</span></span>
          </a>
        </div>
      </nav>

      <style>{`
        .mv-nav{display:flex;align-items:center;justify-content:flex-start;padding:12px 20px;transition:padding .25s ease}
        .mv-nav .nav-logo-img{height:42px;width:auto}
        .mv-nav .brand-text{font-weight:700;color:#e07a00;margin-left:6px}
        .mv-nav.collapsed{padding:6px 12px}
        .mv-nav.collapsed .brand-text{display:none}
      `}</style>

      {/* LOGIN SECTION */}
      <section className="auth-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="auth-panel" style={{ maxWidth: "400px", width: "100%" }}>
          <div className="auth-copy">
            <h2 style={{ marginBottom: "0.5rem" }}>Login to your account</h2>
            <p style={{ marginBottom: "2rem", color: "#666" }}>
              Enter your phone number and PIN to access your dashboard
            </p>

            {/* top navigation removed; bottom links are shown after the form */}

            <div className="auth-card">
              <div className="auth-field">
                <label htmlFor="login-phone">Phone number</label>
                <input
                  id="login-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254700123456"
                  disabled={loading}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="login-pin">PIN</label>
                <input
                  id="login-pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 4-digit PIN"
                  disabled={loading}
                  maxLength={4}
                />
              </div>
              <div className="auth-footer">
                <button
                  type="button"
                  className="btn-gold"
                  onClick={login}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login to dashboard"}
                </button>
                <div className="auth-note">Your PIN provides secure access to your account.</div>
              </div>

              {/* ERROR/SUCCESS MESSAGE */}
              {message && (
                <div
                  className={`auth-error`}
                  style={{
                    backgroundColor: message.type === "error" ? "#fee" : "#efe",
                    color: message.type === "error" ? "#c33" : "#3c3",
                    marginTop: "1rem",
                  }}
                >
                  {message.text}
                </div>
              )}

              {message && message.type === "error" && String(message.text).includes("Unable to reach authentication server") && (
                <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                  <button type="button" className="btn-ghost" onClick={login} style={{ padding: "0.5rem 1rem" }}>Try again</button>
                </div>
              )}

              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center" }}>
                <a
                  href="/"
                  className="btn-ghost"
                  style={{
                    textDecoration: "underline",
                    color: "#1f2937",
                    borderColor: "#d1d5db",
                    background: "#ffffff",
                  }}
                >
                  ← Back to Homepage
                </a>
                <span style={{ color: "#ccc" }}>|</span>
                <a href="/signup" style={{ color: "#d4af37", textDecoration: "underline" }}>Create account</a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mv-footer">
        <p>
          © 2026 MavunoPay — Built on Stellar for Kenya's Farmers &nbsp;|&nbsp; <a href="#">Privacy</a> &nbsp;|&nbsp; <a href="#">Terms</a> &nbsp;|&nbsp; <a href="#">Contact</a>
        </p>
      </footer>
    </>
  );
}
