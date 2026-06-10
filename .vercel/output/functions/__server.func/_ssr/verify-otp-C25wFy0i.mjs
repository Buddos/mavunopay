import { w as withCors } from "./cors-BIye2o2q.mjs";
import { i as isValidOtpCode, v as verifyOtp$1 } from "./otp-CbY-ewNb.mjs";
import "fs";
import "path";
import "./db-C9kVyrmy.mjs";
import "node:fs";
import "node:path";
import "node:dns";
import "../_commonjsHelpers-CCIqAdii.mjs";
import "events";
import "util/types";
import "util";
import "crypto";
import "dns";
import "net";
import "tls";
import "stream";
import "string_decoder";
import "./wrapper-C1_KymC2.mjs";
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { phone, otp } = req.body;
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  if (!otp || typeof otp !== "string" || !otp.trim()) {
    return res.status(400).json({ error: "OTP is required" });
  }
  if (!isValidOtpCode(otp)) {
    return res.status(400).json({ error: "OTP must be exactly 4 digits" });
  }
  const result = await verifyOtp$1(phone, otp);
  if (!result.valid) {
    return res.status(400).json({ error: result.reason || "OTP invalid" });
  }
  return res.status(200).json({ success: true });
}
const verifyOtp = withCors(handler);
export {
  verifyOtp as default
};
