// apilist.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

// Safe join (avoids // between base and path)
const join = (base, path) =>
  `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

const paths = {
  // public
  health: "/api/health",
  reserves: "/api/reserves",
  settings: "/api/settings",
  settingsFx: "/api/settings/fx",
  faqs: "/api/faqs",

  // trades (placeholders; wire when backend ready)
  trades: "/api/trades",
  trade: (id) => `/api/trades/${id}`,
  tradeMessages: (id) => `/api/trades/${id}/messages`,
  tradeUpload: (id) => `/api/trades/${id}/upload`,

  // admin (matches current backend)
  adminLogin: "/api/admin/login",
  adminLogout: "/api/admin/logout",
  adminMe: "/api/admin/me",
  adminReserves: "/api/admin/reserves", // GET list
  adminReservesUpsert: "/api/admin/reserves", // POST upsert (same route)
  adminFaqs: "/api/admin/faqs", // <-- ADD
  adminFaqUpsert: "/api/admin/faqs/upsert", // <-- ADD
  adminFaqDelete: (id) => `/api/admin/faqs/${id}`, // <-- ADD
  // optional future:
  adminSettings: "/api/admin/settings",
};

// Build absolute URL from a key in `paths`
const url = (key, ...args) => {
  const p = typeof paths[key] === "function" ? paths[key](...args) : paths[key];
  return join(API_BASE, p);
};

// Absolute endpoint helpers (convenient constants)
const ADMIN_LOGIN = url("adminLogin");
const ADMIN_LOGOUT = url("adminLogout");
const ADMIN_ME = url("adminMe");
const ADMIN_RESERVES = url("adminReserves");
const ADMIN_RESERVES_UPSERT = url("adminReservesUpsert");
const ADMIN_FAQS = url("adminFaqs"); // <-- ADD
const ADMIN_FAQ_UPSERT = url("adminFaqUpsert"); // <-- ADD
const ADMIN_FAQ_DELETE = (id) => url("adminFaqDelete", id); // <-- ADD

const HEALTH = url("health");
const RESERVES = url("reserves");
const SETTINGS = url("settings");
const SETTINGS_FX = url("settingsFx");
const FAQS = url("faqs");

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  API_BASE,
  paths,
  url,

  // Admin absolute endpoints
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
  ADMIN_ME,
  ADMIN_RESERVES,
  ADMIN_RESERVES_UPSERT,
  FAQS,

  // Public absolute endpoints
  HEALTH,
  RESERVES,
  SETTINGS,
  SETTINGS_FX,
  ADMIN_FAQS,
  ADMIN_FAQ_UPSERT,
  ADMIN_FAQ_DELETE,
};
