let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
const handlerLoaders = {
  health: () => import("./health-DJUNRuSL.mjs"),
  login: () => import("./login-n0AEGn4Y.mjs"),
  register: () => import("./register-C31ueSy4.mjs"),
  "request-otp": () => import("./request-otp-BgFyYVNU.mjs"),
  "verify-otp": () => import("./verify-otp-C25wFy0i.mjs"),
  verify: () => import("./verify-6OmIj_AS.mjs"),
  goals: () => import("./goals-BwQt5aEf.mjs"),
  transactions: () => import("./transactions-4IaNQ8GC.mjs"),
  notifications: () => import("./notifications-Cb_gybof.mjs"),
  "credit-profile": () => import("./credit-profile-N_e944em.mjs"),
  cooperatives: () => import("./cooperatives-CkANoC-Z.mjs"),
  withdrawals: () => import("./withdrawals-C6QWZctz.mjs"),
  loans: () => import("./loans-CGStUzIV.mjs"),
  webhook: () => import("./webhook-B6b3wkV1.mjs"),
  ussd: () => import("./ussd-DLvuTjzn.mjs")
};
async function loadApiHandler(routeName) {
  const loader = handlerLoaders[routeName];
  if (!loader) return null;
  const module = await loader();
  return module.default;
}
async function runNextHandler(handler, request) {
  const url = new URL(request.url);
  const query = {};
  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing === void 0) {
      query[key] = value;
      return;
    }
    query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  });
  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = text.length > 0 ? text : void 0;
    }
  }
  const req = {
    method: request.method,
    query,
    body,
    headers: Object.fromEntries(request.headers.entries())
  };
  let statusCode = 200;
  const headers = new Headers();
  let responseBody = null;
  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(name, value) {
      if (Array.isArray(value)) {
        value.forEach((entry) => headers.append(name, String(entry)));
      } else {
        headers.set(name, String(value));
      }
      return res;
    },
    json(data) {
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
      responseBody = JSON.stringify(data);
      return res;
    },
    send(data) {
      responseBody = typeof data === "string" ? data : new Uint8Array(data);
      return res;
    },
    end(data) {
      if (data !== void 0) {
        responseBody = typeof data === "string" ? data : new Uint8Array(data);
      }
      return res;
    }
  };
  await handler(req, res);
  return new Response(responseBody, { status: statusCode, headers });
}
async function handleApiRequest(request) {
  const routeName = new URL(request.url).pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean).join("/") || "health";
  const handler = await loadApiHandler(routeName);
  if (!handler) {
    return new Response(JSON.stringify({ error: "API route not found" }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });
  }
  return runNextHandler(handler, request);
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
let serverEntryPromise;
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./server-BHT12U9P.mjs").then((n) => n.s).then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
const server = {
  async fetch(request, env, ctx) {
    try {
      if (new URL(request.url).pathname.startsWith("/api/")) {
        return handleApiRequest(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  }
};
export {
  server as default,
  renderErrorPage as r
};
