#!/usr/bin/env node
/**
 * End-to-end farmer registration test (OTP + register + login).
 * Usage: node scripts/test-farmer-registration.mjs [baseUrl]
 * Default baseUrl: http://localhost:8080 (unified dev with Vite proxy)
 */

const baseUrl = (process.argv[2] || "http://localhost:8080").replace(/\/$/, "");
const phone = `+2547${String(Date.now()).slice(-8)}`;
const pin = "1234";
const name = "Test Farmer";

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function main() {
  console.log(`[test] Base URL: ${baseUrl}`);
  console.log(`[test] Phone: ${phone}`);

  const health = await get("/api/health");
  console.log("[test] Health:", health.status, health.payload);
  if (health.status !== 200) {
    throw new Error("API health check failed. Run: npm run dev");
  }
  if (health.payload.database === "unreachable") {
    throw new Error(
      "Database unreachable from the API. Stop npm run dev and start it again after saving backend/.env",
    );
  }

  const otpRes = await post("/api/request-otp", { phone });
  console.log("[test] Request OTP:", otpRes.status, otpRes.payload);
  if (otpRes.status !== 200 || !otpRes.payload.otpPreview) {
    throw new Error("OTP request failed");
  }
  if (!/^\d{4}$/.test(String(otpRes.payload.otpPreview))) {
    throw new Error(`OTP must be 4 digits, got: ${otpRes.payload.otpPreview}`);
  }

  const verifyRes = await post("/api/verify-otp", { phone, otp: otpRes.payload.otpPreview });
  console.log("[test] Verify OTP:", verifyRes.status, verifyRes.payload);
  if (verifyRes.status !== 200) {
    throw new Error("OTP verification failed");
  }

  const registerRes = await post("/api/register", { phone, name, pin });
  console.log("[test] Register:", registerRes.status, {
    farmerId: registerRes.payload.farmer?.id,
    phone: registerRes.payload.farmer?.phone,
    stellarPublicKey: registerRes.payload.farmer?.stellarPublicKey,
    funded: registerRes.payload.funded,
  });
  if (registerRes.status !== 201 || !registerRes.payload.farmer?.id) {
    throw new Error(`Registration failed: ${registerRes.payload.error || "unknown"}`);
  }

  const loginRes = await post("/api/login", { phone, pin });
  console.log("[test] Login:", loginRes.status, {
    farmerId: loginRes.payload.farmer?.id,
    phone: loginRes.payload.farmer?.phone,
  });
  if (loginRes.status !== 200 || loginRes.payload.farmer?.phone !== phone) {
    throw new Error(`Login failed: ${loginRes.payload.error || "unknown"}`);
  }

  console.log("\n[test] SUCCESS — farmer registered, OTP verified, and login works.");
  console.log(`[test] Storage mode: ${health.payload.storage}`);
}

main().catch((error) => {
  console.error("\n[test] FAILED:", error.message);
  process.exit(1);
});
