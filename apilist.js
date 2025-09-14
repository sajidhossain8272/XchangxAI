// apilist.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const paths = {
  // public
  health: "/api/health",
  reserves: "/api/reserves",
  settings: "/api/settings",
  settingsFx: "/api/settings/fx",

  // trades
  trades: "/api/trades",
  trade: (id) => `/api/trades/${id}`,
  tradeMessages: (id) => `/api/trades/${id}/messages`,
  tradeUpload: (id) => `/api/trades/${id}/upload`,

  // admin (NEVER call from the browser with an admin key)
  adminReserves: "/api/admin/reserves",
  adminSettings: "/api/admin/settings",
};

const url = (key, ...args) => {
  const p = typeof paths[key] === "function" ? paths[key](...args) : paths[key];
  return `${API_BASE}${p}`;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { API_BASE, paths, url };
