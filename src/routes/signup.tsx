import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — MavunoPay" },
      {
        name: "description",
        content: "Create your farmer account and get started with MavunoPay",
      },
    ],
  }),
  component: SignupPage,
});

type SignupStep = "info" | "otp";

function SignupPage() {
  const [step, setStep] = useState<SignupStep>("info");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleError = (error: any) => {
    const text =
      error?.message && String(error.message).includes("Failed to fetch")
        ? "Unable to reach authentication server. Please ensure the backend is running."
        : error.message || "An error occurred";
    setMessage({ type: "error", text });
  };

  const handleSuccess = (text: string) => {
    setMessage({
      type: "success",
      text,
    });
  };

  async function requestOTP() {
    if (!phone.trim()) {
      handleError(new Error("Please enter your phone number"));
      return;
    }
    if (!fullName.trim()) {
      handleError(new Error("Please enter your full name"));
      return;
    }
    if (!pin.trim() || pin.length !== 4) {
      handleError(new Error("PIN must be exactly 4 digits"));
      return;
    }
    if (pin !== confirmPin) {
      handleError(new Error("PINs do not match"));
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(apiUrl("/api/request-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to send OTP");
      setOtpPreview(payload.otpPreview || null);
      handleSuccess("OTP sent to your phone");
      setStep("otp");
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  async function completeSignup() {
    if (!otp.trim()) {
      handleError(new Error("Please enter the OTP"));
      return;
    }
    if (!/^\d{4}$/.test(otp.trim())) {
      handleError(new Error("OTP must be exactly 4 digits"));
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const verify = await fetch(apiUrl("/api/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const verifyPayload = await verify.json();
      if (!verify.ok) throw new Error(verifyPayload.error || "Invalid OTP");

      const res = await fetch(apiUrl("/api/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name: fullName, pin }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Signup failed");
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
      <nav
        className={`mv-nav ${collapsed ? "collapsed" : ""}`}
        style={{ background: "transparent" }}
      >
        <div className="logo">
          <a
            href="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <img src="/mavunopay-logo.png" alt="MavunoPay" className="nav-logo-img" />
            <span className="brand-text">
              Mavuno<span>Pay</span>
            </span>
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

      {/* SIGNUP SECTION */}
      <section
        className="auth-section"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="auth-panel" style={{ maxWidth: "400px", width: "100%" }}>
          <div className="auth-copy">
            <h2 style={{ marginBottom: "0.5rem" }}>Sign up as a farmer</h2>
            <p style={{ marginBottom: "2rem", color: "#666" }}>
              {step === "info" && "Enter your farmer info, then send the code to your phone"}
              {step === "otp" && "Enter the OTP sent to the phone number above"}
            </p>

            <div className="auth-card">
              {/* PHONE STEP */}
              {step === "info" && (
                <>
                  <div className="auth-field">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +254700123456"
                      disabled={loading}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="fullname">Farmer name</label>
                    <input
                      id="fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="pin">Create PIN (4 digits)</label>
                    <input
                      id="pin"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      disabled={loading}
                      maxLength={4}
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="confirmpin">Confirm PIN</label>
                    <input
                      id="confirmpin"
                      type="password"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Re-enter PIN"
                      disabled={loading}
                      maxLength={4}
                    />
                  </div>
                  <div className="auth-footer">
                    <button
                      type="button"
                      className="btn-gold"
                      onClick={requestOTP}
                      disabled={loading}
                    >
                      {loading ? "Sending code..." : "Send code"}
                    </button>
                  </div>
                </>
              )}

              {/* OTP STEP */}
              {step === "otp" && (
                <>
                  <div className="auth-field">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="4-digit code"
                      disabled={loading}
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                    />
                  </div>
                  <div className="auth-footer">
                    <button
                      type="button"
                      className="btn-gold"
                      onClick={completeSignup}
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create account"}
                    </button>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                        marginTop: "1rem",
                      }}
                    >
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={requestOTP}
                        disabled={loading}
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        Resend OTP
                      </button>
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#d4af37",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setStep("info");
                          setOtpPreview(null);
                        }}
                      >
                        Use different number
                      </button>
                    </div>
                  </div>
                </>
              )}

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

              {otpPreview && (
                <div
                  className="auth-note"
                  style={{
                    backgroundColor: "#f7f7f7",
                    border: "1px solid #e5e7eb",
                    color: "#1f2937",
                    marginTop: "1rem",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                  }}
                >
                  <strong>OTP Preview:</strong> {otpPreview}
                  <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                    This preview is shown when SMS delivery is not configured.
                  </div>
                </div>
              )}

              {message &&
                message.type === "error" &&
                String(message.text).includes("Unable to reach authentication server") && (
                  <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                    {step === "info" ? (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={requestOTP}
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        Try again
                      </button>
                    ) : step === "otp" ? (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={completeSignup}
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        Try again
                      </button>
                    ) : null}
                  </div>
                )}

              {/* STEP INDICATOR */}
              <div
                style={{
                  marginTop: "2rem",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "0.9rem",
                }}
              >
                Step {["info", "otp"].indexOf(step) + 1} of 2
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
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
                  Home
                </a>
                <span style={{ color: "#ccc" }}>|</span>
                <a href="/login" style={{ color: "#d4af37" }}>
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
