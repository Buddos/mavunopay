/**
 * Same-origin API paths. In dev, Vite proxies `/api/*` to the Next.js backend.
 * On Vercel, Nitro serves `/api/*` from the unified mavunopay deployment.
 * Set `VITE_BACKEND_URL` only when the API is hosted on a different origin.
 */
export function getBackendUrl(): string {
  const configured = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "";
}

/** Resolve an `/api/...` path for frontend fetch calls. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getBackendUrl();
  return base ? `${base}${normalized}` : normalized;
}
