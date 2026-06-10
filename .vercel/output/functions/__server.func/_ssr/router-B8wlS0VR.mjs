import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "../_libs/lodash.mjs";
import "util";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
const appCss = "/assets/styles-CzHGPUrC.css";
function reportMavunopayError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__mavunopayEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportMavunopayError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$8 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "mavunopay" },
      {
        name: "description",
        content: "MavunoPay Frontend: A user-friendly web interface for managing payments and financial services."
      },
      { name: "author", content: "mavunopay" },
      { property: "og:title", content: "mavunopay" },
      {
        property: "og:description",
        content: "MavunoPay Frontend: A user-friendly web interface for managing payments and financial services."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@mavunopay" },
      { name: "twitter:title", content: "mavunopay" },
      {
        name: "twitter:description",
        content: "MavunoPay Frontend: A user-friendly web interface for managing payments and financial services."
      },
      {
        property: "og:image",
        content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Em7jWxxXdjc7vFxxLdugQNpJAg23/social-images/social-1780830803511-mavunopay.webp"
      },
      {
        name: "twitter:image",
        content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Em7jWxxXdjc7vFxxLdugQNpJAg23/social-images/social-1780830803511-mavunopay.webp"
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$8.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized;
}
const Route$7 = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "MavunoPay — Transactions" }] }),
  component: Transactions
});
function Transactions() {
  const [farmer, setFarmer] = reactExports.useState(null);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        fetchTransactions(parsed.id);
      } catch (error2) {
        setError("Unable to parse stored farmer details.");
      }
    }
  }, []);
  async function fetchTransactions(farmerId) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/transactions?farmerId=${encodeURIComponent(farmerId)}`));
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || "Failed to load transactions.");
        setTransactions([]);
      } else {
        setTransactions(payload.transactions ?? []);
      }
    } catch (err) {
      setError("Unable to connect to the backend.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }
  function formatAmount(amount, assetCode) {
    if (!assetCode || assetCode === "KES") {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${assetCode}`;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Transaction History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Track payments and automatic goal allocations over time." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm",
          onClick: () => farmer && fetchTransactions(farmer.id),
          disabled: !farmer || loading,
          children: "Refresh"
        }
      )
    ] }),
    !farmer ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600", children: "No farmer selected. Log in or register from the dashboard to view transactions." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600", children: "Loading transactions..." }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700", children: error }),
      !loading && !error && transactions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600", children: "No transactions yet. Use the dashboard payment simulator or send a live payment to see allocations." }),
      transactions.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold text-slate-900", children: formatAmount(Number(tx.amount) || 0, tx.assetCode) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: new Date(tx.createdAt).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: tx.groupPayment ? "Co-op collection" : tx.memo || "Automatic allocation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-sm text-slate-700", children: [
          "Allocations:",
          " ",
          (tx.allocations || []).map(
            (alloc) => `${alloc.key}: ${formatAmount(Number(alloc.amount) || 0, alloc.assetCode || tx.assetCode || "KES")} (${alloc.pct}%)`
          ).join(", ")
        ] })
      ] }, tx.id))
    ] })
  ] });
}
const $$splitComponentImporter$3 = () => import("./signup-DvSWr4-d.mjs");
const Route$6 = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Sign Up — MavunoPay"
    }, {
      name: "description",
      content: "Create your farmer account and get started with MavunoPay"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const Route$5 = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "MavunoPay — Profile" }] }),
  component: Profile
});
function Profile() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: "Manage your account and settings. (Coming soon)" })
  ] });
}
const $$splitComponentImporter$2 = () => import("./login-cmF_zfZM.mjs");
const Route$4 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Login — MavunoPay"
    }, {
      name: "description",
      content: "Login to your MavunoPay farmer account"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./goals-D5VyVyfi.mjs");
const Route$3 = createFileRoute("/goals")({
  head: () => ({
    meta: [{
      title: "MavunoPay — Goals"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const Route$2 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "MavunoPay — Dashboard" }]
  }),
  component: Dashboard
});
function Dashboard() {
  const [farmer, setFarmer] = reactExports.useState(null);
  const [goals, setGoals] = reactExports.useState([]);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [notifications, setNotifications] = reactExports.useState([]);
  const [creditProfile, setCreditProfile] = reactExports.useState(null);
  const [coops, setCoops] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        refreshData(parsed.id);
        return;
      } catch (error) {
      }
    }
    const legacyId = localStorage.getItem("mavunopay_farmer_id");
    if (legacyId) {
      setFarmer({ id: legacyId });
      refreshData(legacyId);
    }
  }, []);
  async function refreshData(farmerId) {
    await Promise.all([
      fetchGoals(farmerId),
      fetchTransactions(farmerId),
      fetchNotifications(farmerId),
      fetchCreditProfile(farmerId),
      fetchCooperatives(farmerId)
    ]);
  }
  async function fetchGoals(farmerId) {
    const res = await fetch(apiUrl(`/api/goals?farmerId=${farmerId}`));
    if (res.ok) {
      const j = await res.json();
      setGoals(j.goals ?? []);
    }
  }
  async function fetchTransactions(farmerId) {
    const res = await fetch(apiUrl(`/api/transactions?farmerId=${farmerId}`));
    if (res.ok) {
      const j = await res.json();
      setTransactions(j.transactions ?? []);
    } else {
      setTransactions([]);
    }
  }
  async function fetchNotifications(farmerId) {
    const res = await fetch(apiUrl(`/api/notifications?farmerId=${farmerId}`));
    if (res.ok) {
      const j = await res.json();
      setNotifications(j.notifications ?? []);
    }
  }
  async function markNotificationRead(id) {
    const res = await fetch(apiUrl("/api/notifications"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "markRead" })
    });
    if (res.ok) {
      setNotifications(
        (current) => current.map((note) => note.id === id ? { ...note, read: true } : note)
      );
    }
  }
  async function markAllNotificationsRead() {
    const unreadIds = notifications.filter((note) => !note.read).map((note) => note.id);
    await Promise.all(unreadIds.map((id) => markNotificationRead(id)));
  }
  async function fetchCreditProfile(farmerId) {
    const res = await fetch(apiUrl(`/api/credit-profile?farmerId=${farmerId}`));
    if (res.ok) {
      const j = await res.json();
      setCreditProfile(j.profile);
    }
  }
  async function fetchCooperatives(farmerId) {
    const res = await fetch(apiUrl(`/api/cooperatives?farmerId=${farmerId}`));
    if (res.ok) {
      const j = await res.json();
      setCoops(j.cooperatives ?? []);
    }
  }
  function formatCurrency(value) {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(value);
  }
  function totalSaved() {
    return goals.reduce((sum, goal) => sum + (Number(goal.balance) || 0), 0);
  }
  function totalTarget() {
    return goals.reduce((sum, goal) => sum + (Number(goal.targetAmount) || 0), 0);
  }
  function logout() {
    localStorage.removeItem("mavunopay_farmer");
    window.location.href = "/";
  }
  if (!farmer) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4", children: "No farmer selected. Please register or paste your Farmer ID." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        RegisterWidget,
        {
          onRegistered: (f) => {
            setFarmer(f);
            refreshData(f.id);
          }
        }
      )
    ] });
  }
  const saved = totalSaved();
  const goalTotal = totalTarget();
  const progress = goalTotal > 0 ? Math.min(100, Math.round(saved / goalTotal * 100)) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-semibold", children: [
          "Welcome back, ",
          farmer.name ?? "Farmer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "Farmer ID: ",
          farmer.id
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "rounded-md border border-slate-300 bg-white px-4 py-2 text-sm",
          onClick: logout,
          children: "Logout"
        }
      )
    ] }),
    notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Notifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Important updates for your farm savings, loans, and cooperative activity." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm",
            onClick: markAllNotificationsRead,
            disabled: notifications.every((note) => note.read),
            children: "Mark all read"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: notifications.slice(0, 6).map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `rounded-2xl border px-4 py-3 ${note.read ? "bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-slate-900", children: note.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: new Date(note.createdAt).toLocaleString() })
              ] }),
              !note.read ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground",
                  onClick: () => markNotificationRead(note.id),
                  children: "Mark read"
                }
              ) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm text-slate-700", children: note.message })
          ]
        },
        note.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-slate-500", children: "Total saved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-semibold text-slate-900", children: formatCurrency(saved) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-slate-500", children: [
          "Across ",
          goals.length,
          " goal",
          goals.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-slate-500", children: "Goal target" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-semibold text-slate-900", children: formatCurrency(goalTotal) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-slate-500", children: [
          "Progress: ",
          progress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-slate-500", children: "Allocation rules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
          (farmer.allocationRules || []).map((rule) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: rule.key.replace(/_/g, " ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  rule.pct,
                  "%"
                ] })
              ]
            },
            rule.key
          )),
          (farmer.allocationRules || []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: "No allocation rules configured yet." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Savings Goals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Track progress, targets, and balances for each goal." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-500", children: [
          "Total progress: ",
          progress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-4", children: goals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600", children: "No goals yet. Create one below and start saving on every payment." }) : goals.map((goal) => {
        const target = Number(goal.targetAmount) || 0;
        const balance = Number(goal.balance) || 0;
        const completed = target > 0 ? Math.min(100, Math.round(balance / target * 100)) : 0;
        const unlockDate = goal.unlockDate ? new Date(goal.unlockDate).toLocaleDateString() : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold text-slate-900", children: goal.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-500", children: [
                "Target ",
                formatCurrency(target),
                " · Balance ",
                formatCurrency(balance)
              ] }),
              goal.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm text-slate-600", children: goal.description }),
              goal.targetDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-sm text-slate-500", children: [
                "Target date: ",
                new Date(goal.targetDate).toLocaleDateString()
              ] }),
              goal.locked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-sm text-amber-700", children: [
                "Locked until ",
                unlockDate || "maturity"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm text-slate-600", children: [
              completed,
              "% complete"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-2 overflow-hidden rounded-full bg-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-primary w-full" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-slate-500", children: [
            completed,
            "% complete"
          ] })
        ] }, goal.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CreateGoalWidget,
        {
          farmerId: farmer.id,
          onCreated: (goal) => {
            setGoals((s) => [goal, ...s]);
            fetchTransactions(farmer.id);
          }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-4 xl:grid-cols-[1.4fr,0.8fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Recent Transactions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "All incoming payments allocated across your goals." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm",
              onClick: () => fetchTransactions(farmer.id),
              children: "Refresh"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-3", children: transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-600", children: "No transactions yet. Simulate a payment to see allocations in action." }) : transactions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold text-slate-900", children: [
                t.assetCode ? `${t.assetCode} ${Number(t.amount).toLocaleString()}` : formatCurrency(Number(t.amount) || 0),
                " ",
                "received"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: new Date(t.createdAt).toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: t.groupPayment ? "Co-op collection" : t.memo || "Automatic allocation" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-sm text-slate-600", children: [
            "Allocations:",
            " ",
            (t.allocations || []).map(
              (a) => `${a.key}: ${formatCurrency(Number(a.amount) || 0)} (${a.pct}%)`
            ).join(", ")
          ] })
        ] }, t.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 border-t border-slate-200 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium", children: "Simulate Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Post a payment and automatically allocate funds to your goals." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SimulatePayment,
            {
              publicKey: farmer.stellarPublicKey,
              onDone: () => {
                fetchGoals(farmer.id);
                fetchTransactions(farmer.id);
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditProfileWidget, { farmerId: farmer.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CooperativeWidget, { farmer, coops }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          WithdrawalWidget,
          {
            farmerId: farmer.id,
            goals,
            onRequested: () => fetchGoals(farmer.id)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoanWidget, { farmerId: farmer.id, onRequested: () => fetchCreditProfile(farmer.id) })
      ] })
    ] })
  ] });
}
function CreditProfileWidget({ farmerId }) {
  const [profile, setProfile] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetch(apiUrl(`/api/credit-profile?farmerId=${farmerId}`)).then(async (res) => {
      if (res.ok) {
        const json = await res.json();
        setProfile(json.profile);
      }
    });
  }, [farmerId]);
  if (!profile) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Credit Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Your farm-based credit score and borrowing power." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: apiUrl(`/api/credit-profile?farmerId=${farmerId}&export=csv`),
          className: "rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm",
          children: "Export CSV"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: "Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-semibold text-slate-900", children: profile.score })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: "Tier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-semibold text-slate-900", children: profile.tier })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: "Saved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-2xl font-semibold text-slate-900", children: [
          "KES ",
          Number(profile.totalSaved).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: "Pending withdrawals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-semibold text-slate-900", children: profile.pendingWithdrawals })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2 text-sm text-slate-600", children: profile.recommendations?.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "• ",
      item
    ] }, index)) })
  ] });
}
function CooperativeWidget({ farmer, coops }) {
  const [coop, setCoop] = reactExports.useState(coops[0] ?? null);
  const [status, setStatus] = reactExports.useState("");
  const [joinCode, setJoinCode] = reactExports.useState("");
  const [coopName, setCoopName] = reactExports.useState("");
  const [coopDesc, setCoopDesc] = reactExports.useState("");
  reactExports.useEffect(() => {
    setCoop(coops[0] ?? null);
  }, [coops]);
  async function createCoop() {
    const res = await fetch(apiUrl("/api/cooperatives"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId: farmer.id, name: coopName, description: coopDesc })
    });
    const payload = await res.json();
    if (res.ok) {
      setCoop(payload.coop);
      setStatus("Cooperative created successfully.");
    } else {
      setStatus(payload.error || "Unable to create cooperative.");
    }
  }
  async function joinCoop() {
    const res = await fetch(apiUrl("/api/cooperatives"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId: farmer.id, action: "join", joinCode })
    });
    const payload = await res.json();
    if (res.ok) {
      setCoop(payload.coop);
      setStatus("Joined cooperative successfully.");
    } else {
      setStatus(payload.error || "Unable to join cooperative.");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Cooperative" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Manage your group savings and governance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/cooperative",
          className: "rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700",
          children: "View cooperative dashboard"
        }
      )
    ] }),
    coop ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 rounded-2xl bg-slate-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-slate-900", children: coop.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-600", children: coop.description || "No description provided." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-500", children: [
        "Savings pool: KES ",
        Number(coop.savingsBalance || 0).toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-500", children: [
        "Join code: ",
        coop.joinCode
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 rounded-2xl bg-slate-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-600", children: "No cooperative connected yet. Create one or join with a code." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: coopName,
            onChange: (e) => setCoopName(e.target.value),
            placeholder: "Cooperative name",
            className: "w-full rounded-md border px-3 py-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: coopDesc,
            onChange: (e) => setCoopDesc(e.target.value),
            placeholder: "Description",
            className: "w-full rounded-md border px-3 py-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
            onClick: createCoop,
            children: "Create cooperative"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 border-t border-slate-200 pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: joinCode,
              onChange: (e) => setJoinCode(e.target.value),
              placeholder: "Join code",
              className: "w-full rounded-md border px-3 py-2"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "mt-2 inline-flex items-center rounded-md border border-slate-200 px-4 py-2 text-sm",
              onClick: joinCoop,
              children: "Join cooperative"
            }
          )
        ] })
      ] })
    ] }),
    status && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700", children: status })
  ] });
}
function WithdrawalWidget({
  farmerId,
  goals,
  onRequested
}) {
  const [goalId, setGoalId] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [type, setType] = reactExports.useState("standard");
  const [message, setMessage] = reactExports.useState("");
  async function requestWithdrawal() {
    const res = await fetch(apiUrl("/api/withdrawals"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId, goalId, amount: Number(amount), type })
    });
    const payload = await res.json();
    if (res.ok) {
      setMessage("Withdrawal request created.");
      setAmount("");
      onRequested();
    } else {
      setMessage(payload.error || "Unable to create withdrawal request.");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Withdraw funds" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Request a payout from one of your goals." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "sr-only", htmlFor: "withdrawal-goal", children: "Select goal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          id: "withdrawal-goal",
          className: "w-full rounded-md border px-3 py-2",
          value: goalId,
          onChange: (e) => setGoalId(e.target.value),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select goal" }),
            goals.map((goal) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: goal.id, children: [
              goal.name,
              " — KES ",
              Number(goal.balance || 0).toLocaleString()
            ] }, goal.id))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "sr-only", htmlFor: "withdrawal-amount", children: "Withdrawal amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "withdrawal-amount",
          type: "number",
          className: "w-full rounded-md border px-3 py-2",
          placeholder: "Amount",
          value: amount,
          onChange: (e) => setAmount(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `rounded-md px-4 py-2 text-sm ${type === "standard" ? "bg-primary text-primary-foreground" : "border border-slate-200 bg-white"}`,
            onClick: () => setType("standard"),
            children: "Standard"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `rounded-md px-4 py-2 text-sm ${type === "emergency" ? "bg-amber-500 text-white" : "border border-slate-200 bg-white"}`,
            onClick: () => setType("emergency"),
            children: "Emergency"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
          onClick: requestWithdrawal,
          disabled: !goalId || !amount,
          children: "Request withdrawal"
        }
      ),
      message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-600", children: message })
    ] })
  ] });
}
function LoanWidget({ farmerId, onRequested }) {
  const [amount, setAmount] = reactExports.useState("");
  const [term, setTerm] = reactExports.useState("12");
  const [message, setMessage] = reactExports.useState("");
  async function requestLoan() {
    const res = await fetch(apiUrl("/api/loans"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId, amount: Number(amount), termMonths: Number(term) })
    });
    const payload = await res.json();
    if (res.ok) {
      setMessage(`Loan ${payload.loan.status}.`);
      setAmount("");
      onRequested();
    } else {
      setMessage(payload.error || "Unable to request loan.");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Loan request" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Use your credit profile to access working capital." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          className: "w-full rounded-md border px-3 py-2",
          placeholder: "Loan amount",
          value: amount,
          onChange: (e) => setAmount(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          className: "w-full rounded-md border px-3 py-2",
          placeholder: "Term months",
          value: term,
          onChange: (e) => setTerm(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
          onClick: requestLoan,
          disabled: !amount || !term,
          children: "Request loan"
        }
      ),
      message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-600", children: message })
    ] })
  ] });
}
function RegisterWidget({ onRegistered }) {
  const [phone, setPhone] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function register() {
    setLoading(true);
    const res = await fetch(apiUrl("/api/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name })
    });
    const j = await res.json();
    if (res.ok) {
      const farmer = j.farmer;
      localStorage.setItem("mavunopay_farmer", JSON.stringify(farmer));
      onRegistered(farmer);
    } else {
      alert(j.error || "Registration failed");
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "register-phone", className: "block text-sm font-medium", children: "Phone" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        id: "register-phone",
        className: "mt-1 w-full rounded-md border px-3 py-2",
        value: phone,
        onChange: (e) => setPhone(e.target.value),
        placeholder: "e.g. +2547..."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "register-name", className: "block text-sm font-medium mt-3", children: "Name (optional)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        id: "register-name",
        className: "mt-1 w-full rounded-md border px-3 py-2",
        value: name,
        onChange: (e) => setName(e.target.value),
        placeholder: "Farmer name"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
        onClick: register,
        disabled: loading,
        children: loading ? "Registering..." : "Register"
      }
    ) })
  ] });
}
function CreateGoalWidget({
  farmerId,
  onCreated
}) {
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [target, setTarget] = reactExports.useState("");
  const [targetDate, setTargetDate] = reactExports.useState("");
  const [locked, setLocked] = reactExports.useState(false);
  const [unlockDate, setUnlockDate] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function create() {
    if (!name.trim() || !target.trim()) return;
    setLoading(true);
    const res = await fetch(apiUrl("/api/goals"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerId,
        name,
        description,
        targetAmount: Number(target),
        targetDate: targetDate || null,
        locked,
        unlockDate: unlockDate || null,
        currency: "KES"
      })
    });
    const payload = await res.json();
    if (res.ok) {
      setName("");
      setDescription("");
      setTarget("");
      setTargetDate("");
      setLocked(false);
      setUnlockDate("");
      onCreated(payload.goal);
    } else {
      alert(payload.error || "Unable to create goal");
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold text-slate-900", children: "Create a new savings goal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 text-sm text-slate-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "w-full rounded-md border px-3 py-2",
          placeholder: "Goal name",
          value: name,
          onChange: (e) => setName(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "w-full rounded-md border px-3 py-2",
          placeholder: "Description",
          value: description,
          onChange: (e) => setDescription(e.target.value),
          rows: 3
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            className: "rounded-md border px-3 py-2",
            placeholder: "Target amount",
            type: "number",
            value: target,
            onChange: (e) => setTarget(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            className: "rounded-md border px-3 py-2",
            placeholder: "Target date",
            type: "date",
            value: targetDate,
            onChange: (e) => setTargetDate(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: locked, onChange: (e) => setLocked(e.target.checked) }),
          "Lock goal until maturity"
        ] }),
        locked && /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "sr-only", htmlFor: "unlock-date", children: "Unlock date" }),
        locked && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "unlock-date",
            className: "rounded-md border px-3 py-2",
            type: "date",
            value: unlockDate,
            onChange: (e) => setUnlockDate(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
          onClick: create,
          disabled: loading || !name || !target,
          children: loading ? "Creating..." : "Save goal"
        }
      )
    ] })
  ] });
}
function SimulatePayment({ publicKey, onDone }) {
  const [amount, setAmount] = reactExports.useState("500");
  const [assetCode, setAssetCode] = reactExports.useState("KES");
  const [groupPayment, setGroupPayment] = reactExports.useState(false);
  const [memo, setMemo] = reactExports.useState("Harvest sale");
  const [loading, setLoading] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  async function simulate() {
    setLoading(true);
    const res = await fetch(apiUrl("/api/webhook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey, amount: Number(amount), assetCode, memo, groupPayment })
    });
    const payload = await res.json();
    if (res.ok) {
      setMessage("Payment allocated successfully.");
      setAmount("500");
      onDone();
    } else {
      setMessage(payload.error || "Unable to simulate payment.");
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: amount,
          onChange: (e) => setAmount(e.target.value),
          className: "rounded-md border px-3 py-2",
          type: "number",
          placeholder: "Amount"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: assetCode,
          onChange: (e) => setAssetCode(e.target.value),
          className: "rounded-md border px-3 py-2",
          placeholder: "Asset code"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: memo,
        onChange: (e) => setMemo(e.target.value),
        className: "w-full rounded-md border px-3 py-2",
        placeholder: "Memo"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          checked: groupPayment,
          onChange: (e) => setGroupPayment(e.target.checked)
        }
      ),
      "Group payment for cooperative savings"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
        onClick: simulate,
        disabled: loading,
        children: loading ? "Simulating..." : "Simulate payment"
      }
    ),
    message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-600", children: message })
  ] });
}
const Route$1 = createFileRoute("/cooperative")({
  head: () => ({ meta: [{ title: "MavunoPay — Cooperative Dashboard" }] }),
  component: CooperativeDashboard
});
function CooperativeDashboard() {
  const [farmer, setFarmer] = reactExports.useState(null);
  const [coops, setCoops] = reactExports.useState([]);
  const [status, setStatus] = reactExports.useState("");
  const [joinCode, setJoinCode] = reactExports.useState("");
  const [coopName, setCoopName] = reactExports.useState("");
  const [coopDesc, setCoopDesc] = reactExports.useState("");
  reactExports.useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        refreshData(parsed.id);
        return;
      } catch (error) {
      }
    }
    const legacyId = localStorage.getItem("mavunopay_farmer_id");
    if (legacyId) {
      setFarmer({ id: legacyId });
      refreshData(legacyId);
    }
  }, []);
  async function refreshData(farmerId) {
    await fetchCooperatives(farmerId);
  }
  async function fetchCooperatives(farmerId) {
    const res = await fetch(apiUrl(`/api/cooperatives?farmerId=${farmerId}`));
    if (res.ok) {
      const json = await res.json();
      setCoops(json.cooperatives ?? []);
    } else {
      setCoops([]);
    }
  }
  async function createCoop() {
    if (!farmer) return;
    const res = await fetch(apiUrl("/api/cooperatives"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId: farmer.id, name: coopName, description: coopDesc })
    });
    const payload = await res.json();
    if (res.ok) {
      setStatus("Cooperative created successfully.");
      setCoopName("");
      setCoopDesc("");
      refreshData(farmer.id);
    } else {
      setStatus(payload.error || "Unable to create cooperative.");
    }
  }
  async function joinCoop() {
    if (!farmer) return;
    const res = await fetch(apiUrl("/api/cooperatives"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmerId: farmer.id, action: "join", joinCode })
    });
    const payload = await res.json();
    if (res.ok) {
      setStatus("Joined cooperative successfully.");
      setJoinCode("");
      refreshData(farmer.id);
    } else {
      setStatus(payload.error || "Unable to join cooperative.");
    }
  }
  if (!farmer) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Cooperative dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Please log in first or restore your farmer profile from local storage." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Cooperative dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Track your co-op membership, pool, members, and governance actions." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/dashboard",
          className: "rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm",
          children: "Back to dashboard"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border bg-white p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Your cooperatives" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "View all co-ops you lead or belong to." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-500", children: [
          "Farmer ID: ",
          farmer.id
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-4", children: coops.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600", children: "You are not currently part of any cooperative. Create one now or join with a code." }) : coops.map((coop) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-base font-semibold text-slate-900", children: coop.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: coop.description || "No description provided." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-700", children: coop.leaderId === farmer.id ? "Leader" : "Member" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.14em] text-slate-500", children: "Pool balance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xl font-semibold text-slate-900", children: [
              "KES ",
              Number(coop.savingsBalance || 0).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.14em] text-slate-500", children: "Members" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xl font-semibold text-slate-900", children: Array.isArray(coop.members) ? coop.members.length : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.14em] text-slate-500", children: "Join code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xl font-semibold text-slate-900", children: coop.joinCode })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Members" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: Array.isArray(coop.members) && coop.members.length > 0 ? coop.members.map((memberId) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "rounded-lg bg-white px-3 py-2 text-sm text-slate-700",
              children: memberId
            },
            memberId
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "No member details available." }) })
        ] })
      ] }, coop.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border bg-white p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Create or join a cooperative" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Start your own group savings community or join a trade cooperative with the join code." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-slate-900", children: "Create new cooperative" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: coopName,
                onChange: (e) => setCoopName(e.target.value),
                placeholder: "Cooperative name",
                className: "w-full rounded-md border px-3 py-2"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: coopDesc,
                onChange: (e) => setCoopDesc(e.target.value),
                placeholder: "Description",
                className: "w-full rounded-md border px-3 py-2",
                rows: 4
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
                onClick: createCoop,
                disabled: !coopName.trim(),
                children: "Create cooperative"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-slate-900", children: "Join with a code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: joinCode,
                onChange: (e) => setJoinCode(e.target.value),
                placeholder: "Join code",
                className: "w-full rounded-md border px-3 py-2"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm",
                onClick: joinCoop,
                disabled: !joinCode.trim(),
                children: "Join cooperative"
              }
            )
          ] })
        ] })
      ] }),
      status && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-700", children: status })
    ] })
  ] });
}
const $$splitComponentImporter = () => import("./index-CDxpPWff.mjs");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "MavunoPay — Harvest Your Future"
    }, {
      name: "description",
      content: "Turn your farm produce into savings, credit, and financial freedom — powered by the Stellar blockchain. Built for Kenya's farmers."
    }, {
      property: "og:title",
      content: "MavunoPay — Harvest Your Future"
    }, {
      property: "og:description",
      content: "Blockchain-powered savings for smallholder farmers. No bank account needed."
    }],
    links: [{
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    }, {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous"
    }, {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap"
    }, {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TransactionsRoute = Route$7.update({
  id: "/transactions",
  path: "/transactions",
  getParentRoute: () => Route$8
});
const SignupRoute = Route$6.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$8
});
const ProfileRoute = Route$5.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$8
});
const LoginRoute = Route$4.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$8
});
const GoalsRoute = Route$3.update({
  id: "/goals",
  path: "/goals",
  getParentRoute: () => Route$8
});
const DashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$8
});
const CooperativeRoute = Route$1.update({
  id: "/cooperative",
  path: "/cooperative",
  getParentRoute: () => Route$8
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const rootRouteChildren = {
  IndexRoute,
  CooperativeRoute,
  DashboardRoute,
  GoalsRoute,
  LoginRoute,
  ProfileRoute,
  SignupRoute,
  TransactionsRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  apiUrl as a,
  router as r
};
