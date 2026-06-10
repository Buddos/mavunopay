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
function Goals() {
  const [farmer, setFarmer] = reactExports.useState(null);
  const [goals, setGoals] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem("mavunopay_farmer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFarmer(parsed);
        fetchGoals(parsed.id);
        return;
      } catch (error) {
      }
    }
    const id = localStorage.getItem("mavunopay_farmer_id");
    if (id) {
      setFarmer({
        id
      });
      fetchGoals(id);
    }
  }, []);
  async function fetchGoals(id) {
    const res = await fetch(apiUrl(`/api/goals?farmerId=${id}`));
    if (res.ok) {
      const j = await res.json();
      setGoals(j.goals ?? []);
    }
  }
  if (!farmer) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8", children: "No farmer selected. Register first." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Your Savings Goals" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      "Farmer ID: ",
      farmer.id
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-4", children: goals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border bg-white p-4 text-sm text-slate-600", children: "You have no savings goals yet. Create one from the dashboard to start allocating funds automatically." }) : goals.map((goal) => {
      const target = Number(goal.targetAmount) || 0;
      const balance = Number(goal.balance) || 0;
      const progress = target > 0 ? Math.min(100, Math.round(balance / target * 100)) : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold", children: goal.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-500", children: [
              "Target: KES ",
              target.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm text-slate-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
              "KES ",
              balance.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500", children: [
              progress,
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-primary", style: {
          width: `${progress}%`
        } }) })
      ] }, goal.id);
    }) })
  ] });
}
export {
  Goals as component
};
