type HandlerModule = { default: (req: unknown, res: unknown) => void | Promise<void> };

const handlerLoaders: Record<string, () => Promise<HandlerModule>> = {
  health: () => import("../../backend/pages/api/health"),
  login: () => import("../../backend/pages/api/login"),
  register: () => import("../../backend/pages/api/register"),
  "request-otp": () => import("../../backend/pages/api/request-otp"),
  "verify-otp": () => import("../../backend/pages/api/verify-otp"),
  verify: () => import("../../backend/pages/api/verify"),
  goals: () => import("../../backend/pages/api/goals"),
  transactions: () => import("../../backend/pages/api/transactions"),
  notifications: () => import("../../backend/pages/api/notifications"),
  "credit-profile": () => import("../../backend/pages/api/credit-profile"),
  cooperatives: () => import("../../backend/pages/api/cooperatives"),
  withdrawals: () => import("../../backend/pages/api/withdrawals"),
  loans: () => import("../../backend/pages/api/loans"),
  webhook: () => import("../../backend/pages/api/webhook"),
  ussd: () => import("../../backend/pages/api/ussd"),
};

export async function loadApiHandler(routeName: string) {
  const loader = handlerLoaders[routeName];
  if (!loader) return null;
  const module = await loader();
  return module.default;
}

export const apiRoutes = Object.keys(handlerLoaders);
