/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";

/** ---- Types ---- */
type MethodId =
  | "paypal"
  | "payoneer"
  | "skrill"
  | "wise"
  | "usdt"
  | "bkash"
  | "nagad"
  | "bank";
type Fiat = "USD" | "EUR" | "BDT";
type TradeStatus = "Pending" | "Completed" | "Refunded";
type Trade = {
  id: string;
  send: MethodId;
  recv: MethodId;
  amount: number;
  ccy: Fiat; // shown with amount
  username: string;
  createdAt: number; // ms epoch
  status: TradeStatus | string; // allow legacy strings; normalized on read
};

const METHODS: { id: MethodId; label: string; icon: string }[] = [
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "payoneer", label: "Payoneer", icon: "🅿" },
  { id: "skrill", label: "Skrill", icon: "💳" },
  { id: "wise", label: "Wise", icon: "🟩" },
  { id: "usdt", label: "USDT (TRC20)", icon: "🪙" },
  { id: "bkash", label: "bKash", icon: "📲" },
  { id: "nagad", label: "Nagad", icon: "🟠" },
  { id: "bank", label: "Bank Transfer (BDT)", icon: "🏦" },
];

const PLATFORM_CCY: Record<MethodId, Fiat> = {
  paypal: "USD",
  payoneer: "USD",
  skrill: "USD",
  wise: "USD",
  usdt: "USD",
  bkash: "BDT",
  nagad: "BDT",
  bank: "BDT",
};

/** ---- Utils ---- */
const meta = (id: MethodId) => METHODS.find((m) => m.id === id)!;
const fmtAmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
const fmtDT = (ts: number) => {
  const d = new Date(ts);
  return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};
const relTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/** Normalize legacy / mixed statuses to your canonical set */
const normalizeStatus = (s: string): TradeStatus => {
  const v = (s || "").toLowerCase();
  if (v === "accepted" || v === "complete" || v === "completed") return "Completed";
  if (v === "rejected" || v === "refund" || v === "refunded" || v === "cancelled" || v === "canceled")
    return "Refunded";
  return "Pending";
};

const statusChip = (raw: TradeStatus | string) => {
  const s = normalizeStatus(String(raw));
  return s === "Completed"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    : s === "Pending"
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    : "bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"; // Refunded
};

/** ---- Seed (static) ---- */
const SEED: Trade[] = [
  {
    id: "t1",
    send: "usdt",
    recv: "nagad",
    amount: 10.55,
    ccy: "USD",
    username: "SAYONBISWAS100",
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
    status: "Completed",
  },
  {
    id: "t2",
    send: "wise",
    recv: "paypal",
    amount: 10,
    ccy: "USD",
    username: "MEHRAB",
    createdAt: Date.now() - 1000 * 60 * 45,
    status: "Completed",
  },
  {
    id: "t3",
    send: "nagad",
    recv: "paypal",
    amount: 826,
    ccy: "BDT",
    username: "Ahnaf",
    createdAt: Date.now() - 1000 * 60 * 30,
    status: "Completed",
  },
  {
    id: "t5",
    send: "nagad",
    recv: "skrill",
    amount: 670,
    ccy: "BDT",
    username: "Bayazid783",
    createdAt: Date.now() - 1000 * 60 * 5,
    status: "Pending",
  },
].filter(
  (t) =>
    METHODS.some((m) => m.id === t.send) &&
    METHODS.some((m) => m.id === t.recv)
);

/** ---- Tiny UI bits ---- */
function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 items-center justify-center ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-500 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-600" />
    </span>
  );
}
function MethodBadge({ id }: { id: MethodId }) {
  const m = meta(id);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
      <span className="text-base leading-none">{m.icon}</span>
      {m.label}
      <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-300">
        {PLATFORM_CCY[id]}
      </span>
    </span>
  );
}

/** ---- Component ---- */
export default function LatestTradesTable() {
  const [rows, setRows] = useState<Trade[]>(SEED);

  // pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Sort newest first
  const sorted = useMemo(
    () =>
      [...rows]
        .map((t) => ({ ...t, status: normalizeStatus(String(t.status)) }))
        .sort((a, b) => b.createdAt - a.createdAt),
    [rows]
  );

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const currentRows = sorted.slice(startIdx, startIdx + PAGE_SIZE);
  const paddingRows = Math.max(0, PAGE_SIZE - currentRows.length); // keep height fixed

  // accept external updates (normalize incoming legacy statuses too)
  useEffect(() => {
    const onPlaced = (e: Event) => {
      const ev = e as CustomEvent<Trade>;
      if (!ev?.detail) return;
      const incoming = ev.detail;
      const normalized: Trade = { ...incoming, status: normalizeStatus(String(incoming.status)) };
      setRows((r) => [normalized, ...r].slice(0, 500));
      setPage(1); // jump to newest
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "latest-trade" || !e.newValue) return;
      try {
        const t = JSON.parse(e.newValue) as Trade;
        const normalized: Trade = { ...t, status: normalizeStatus(String(t.status)) };
        setRows((r) => [normalized, ...r].slice(0, 500));
        setPage(1);
      } catch {}
    };
    window.addEventListener("trade:placed", onPlaced as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("trade:placed", onPlaced as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + currentRows.length, total);
  const lastUpdated = useMemo(
    () => (rows[0] ? relTime(rows[0].createdAt) : "—"),
    [rows]
  );

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-4">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Latest Exchanges
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Status meanings:</span> Pending = received, not fulfilled • Completed = fulfilled • Refunded = returned & cancelled
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700 ring-1 ring-lime-300/60 dark:bg-lime-900/30 dark:text-lime-300 dark:ring-lime-700/40">
            <LiveDot />
            Live
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Updated {lastUpdated}</span>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_6px_30px_-12px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-black/40">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white">
          Exchanges
        </div>

        {/* Single table (desktop + mobile, horizontal scroll if needed) */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-gray-300">
                <th className="w-[22%] px-4 py-2">Send</th>
                <th className="w-[22%] px-4 py-2">Receive</th>
                <th className="w-[14%] px-4 py-2">Amount</th>
                <th className="w-[18%] px-4 py-2">User</th>
                <th className="w-[14%] px-4 py-2">Placed</th>
                <th className="w-[10%] px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((t, i) => (
                <tr
                  key={t.id}
                  className={`transition hover:bg-blue-50/50 dark:hover:bg-white/5 ${
                    i % 2 ? "bg-white dark:bg-transparent" : "bg-gray-50/60 dark:bg-white/0"
                  }`}
                >
                  <td className="px-4 py-3">
                    <MethodBadge id={t.send as MethodId} />
                  </td>
                  <td className="px-4 py-3">
                    <MethodBadge id={t.recv as MethodId} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {fmtAmt(t.amount)} {t.ccy}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500/20 via-green-400/20 to-yellow-400/20 text-[11px] font-bold text-gray-800 ring-1 ring-black/5 dark:text-gray-100 dark:ring-white/10">
                        {t.username.slice(0, 2).toUpperCase()}
                      </span>
                      <button
                        title="Click to copy"
                        onClick={() => navigator.clipboard?.writeText(t.username)}
                        className="group inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {t.username}
                        <span className="opacity-0 transition group-hover:opacity-100">⧉</span>
                      </button>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    <span title={fmtDT(t.createdAt)}>{relTime(t.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusChip(t.status)}`}>
                      {normalizeStatus(String(t.status))}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Padding rows to keep height fixed at 10 rows */}
              {paddingRows > 0 &&
                Array.from({ length: paddingRows }).map((_, idx) => (
                  <tr
                    key={`pad-${idx}`}
                    className={(currentRows.length + idx) % 2 ? "bg-white dark:bg-transparent" : "bg-gray-50/60 dark:bg-white/0"}
                  >
                    <td className="px-4 py-3">&nbsp;</td>
                    <td className="px-4 py-3">&nbsp;</td>
                    <td className="px-4 py-3">&nbsp;</td>
                    <td className="px-4 py-3">&nbsp;</td>
                    <td className="px-4 py-3">&nbsp;</td>
                    <td className="px-4 py-3">&nbsp;</td>
                  </tr>
                ))}

              {total === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No exchanges yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-white/10 dark:text-gray-300 sm:flex-row">
          <div>
            {total > 0 ? (
              <span>
                Showing <span className="font-semibold text-gray-900 dark:text-white">{showingFrom}</span>–
                <span className="font-semibold text-gray-900 dark:text-white">{showingTo}</span> of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
              </span>
            ) : (
              <span>Showing 0 of 0</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md px-3 py-1.5 ring-1 ring-gray-300 disabled:opacity-50 dark:ring-white/10"
              aria-label="Previous page"
            >
              ← Prev
            </button>

            {/* Page numbers (collapse if many) */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              const isEdge = n === 1 || n === totalPages;
              const near = Math.abs(n - safePage) <= 1;
              if (totalPages > 7 && !isEdge && !near) {
                if (n === 2 || n === totalPages - 1) {
                  return (
                    <span key={n} className="px-2 text-gray-400">
                      …
                    </span>
                  );
                }
                return null;
              }
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md px-3 py-1.5 ring-1 transition ${
                    n === safePage
                      ? "bg-blue-600 text-white ring-blue-600"
                      : "ring-gray-300 hover:bg-gray-50 dark:ring-white/10 dark:hover:bg-white/5"
                  }`}
                  aria-current={n === safePage ? "page" : undefined}
                >
                  {n}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-md px-3 py-1.5 ring-1 ring-gray-300 disabled:opacity-50 dark:ring-white/10"
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* (dev tip) trigger new trade:
      window.dispatchEvent(new CustomEvent("trade:placed", { detail: {id:'tX', send:'paypal', recv:'bkash', amount:12, ccy:'USD', username:'USER', createdAt:Date.now(), status:'Pending'} })) */}
    </section>
  );
}
