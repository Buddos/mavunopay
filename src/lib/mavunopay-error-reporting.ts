type MavunopayErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type MavunopayEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: MavunopayErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __mavunopayEvents?: MavunopayEvents;
  }
}

export function reportMavunopayError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__mavunopayEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
