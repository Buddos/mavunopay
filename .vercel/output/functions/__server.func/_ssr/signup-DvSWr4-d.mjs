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
function SignupPage() {
  const [step, setStep] = reactExports.useState("info");
  const [phone, setPhone] = reactExports.useState("");
  const [otp, setOtp] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [pin, setPin] = reactExports.useState("");
  const [confirmPin, setConfirmPin] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState(null);
  const [otpPreview, setOtpPreview] = reactExports.useState(null);
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
  const handleSuccess = (text) => {
    setMessage({
      type: "success",
      text
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to send OTP");
      setOtpPreview(payload.otpPreview || null);
      handleSuccess("OTP sent to your phone");
      setStep("otp");
    } catch (error) {
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          otp
        })
      });
      const verifyPayload = await verify.json();
      if (!verify.ok) throw new Error(verifyPayload.error || "Invalid OTP");
      const res = await fetch(apiUrl("/api/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          name: fullName,
          pin
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Signup failed");
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
      }, children: "Sign up as a farmer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: {
        marginBottom: "2rem",
        color: "#666"
      }, children: [
        step === "info" && "Enter your farmer info, then send the code to your phone",
        step === "otp" && "Enter the OTP sent to the phone number above"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-card", children: [
        step === "info" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "phone", children: "Phone number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "phone", type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "e.g. +254700123456", disabled: loading })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "fullname", children: "Farmer name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "fullname", type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Enter your full name", disabled: loading })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "pin", children: "Create PIN (4 digits)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "pin", type: "password", value: pin, onChange: (e) => setPin(e.target.value), placeholder: "Enter 4-digit PIN", disabled: loading, maxLength: 4 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "confirmpin", children: "Confirm PIN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "confirmpin", type: "password", value: confirmPin, onChange: (e) => setConfirmPin(e.target.value), placeholder: "Re-enter PIN", disabled: loading, maxLength: 4 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-gold", onClick: requestOTP, disabled: loading, children: loading ? "Sending code..." : "Send code" }) })
        ] }),
        step === "otp" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "otp", children: "Enter OTP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "otp", type: "text", value: otp, onChange: (e) => setOtp(e.target.value), placeholder: "4-digit code", disabled: loading, maxLength: 4, inputMode: "numeric", pattern: "[0-9]{4}" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-footer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-gold", onClick: completeSignup, disabled: loading, children: loading ? "Creating account..." : "Create account" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1rem"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-ghost", onClick: requestOTP, disabled: loading, style: {
                padding: "0.5rem 1rem"
              }, children: "Resend OTP" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: {
                background: "none",
                border: "none",
                color: "#d4af37",
                textDecoration: "underline",
                cursor: "pointer"
              }, onClick: () => {
                setStep("info");
                setOtpPreview(null);
              }, children: "Use different number" })
            ] })
          ] })
        ] }),
        message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `auth-error`, style: {
          backgroundColor: message.type === "error" ? "#fee" : "#efe",
          color: message.type === "error" ? "#c33" : "#3c3",
          marginTop: "1rem"
        }, children: message.text }),
        otpPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-note", style: {
          backgroundColor: "#f7f7f7",
          border: "1px solid #e5e7eb",
          color: "#1f2937",
          marginTop: "1rem",
          padding: "0.75rem",
          borderRadius: "0.5rem"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "OTP Preview:" }),
          " ",
          otpPreview,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            marginTop: "0.25rem",
            color: "#6b7280"
          }, children: "This preview is shown when SMS delivery is not configured." })
        ] }),
        message && message.type === "error" && String(message.text).includes("Unable to reach authentication server") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          marginTop: "0.5rem",
          textAlign: "center"
        }, children: step === "info" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-ghost", onClick: requestOTP, style: {
          padding: "0.5rem 1rem"
        }, children: "Try again" }) : step === "otp" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "btn-ghost", onClick: completeSignup, style: {
          padding: "0.5rem 1rem"
        }, children: "Try again" }) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          marginTop: "2rem",
          textAlign: "center",
          color: "#999",
          fontSize: "0.9rem"
        }, children: [
          "Step ",
          ["info", "otp"].indexOf(step) + 1,
          " of 2"
        ] }),
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
          }, children: "Home" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "#ccc"
          }, children: "|" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", style: {
            color: "#d4af37"
          }, children: "Login" })
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
  SignupPage as component
};
