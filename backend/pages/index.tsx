export default function ApiHome() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "40rem" }}>
      <h1>MavunoPay API</h1>
      <p>
        The backend is running. Use the frontend app for login, signup, and the dashboard — not this
        port directly.
      </p>
      <p>
        <a href="/api/health">/api/health</a>
      </p>
    </main>
  );
}
