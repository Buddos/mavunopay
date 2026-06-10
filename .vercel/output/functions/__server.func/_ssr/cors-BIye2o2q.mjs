const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081"
];
const ALLOW_HEADERS = "X-CSRF-Token, X-Forwarded-Host, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization";
function getAllowedOrigins() {
  const env = process.env.CORS_ORIGINS?.trim();
  if (!env) return DEFAULT_ORIGINS;
  return env.split(",").map((origin) => origin.trim()).filter(Boolean);
}
function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin) && true) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
  return true;
}
function withCors(handler) {
  return async (req, res) => {
    const originAllowed = applyCorsHeaders(req, res);
    res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", ALLOW_HEADERS);
    if (req.method === "OPTIONS") {
      res.status(originAllowed ? 204 : 403).end();
      return;
    }
    if (req.headers.origin && !originAllowed) {
      res.status(403).json({ error: "CORS origin not allowed" });
      return;
    }
    return handler(req, res);
  };
}
export {
  withCors as w
};
