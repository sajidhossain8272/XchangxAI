/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../../apilist";

/* =========================
   Types
========================= */
export type MethodId =
  | "paypal"
  | "payoneer"
  | "skrill"
  | "wise"
  | "usdt"
  | "bkash"
  | "nagad"
  | "bank"
  // new ids (can come from backend; keep as string-safe elsewhere)
  | "cashapp"
  | "zelle"
  | "chime"
  | "etransfer"
  | "venmo"
  | "monzo"
  | "atom"
  | "lamiabanca"
  | "unicredit"
  | "scotiabank"
  | "rbc";

export type Fiat = "USD" | "BDT";

export type ReserveItem = {
  id: MethodId | string;
  label: string;
  amountUSD: number; // canonical in USD
};

export type ReservesApiResponse = {
  items: ReserveItem[];
  usdToBdt?: number; // optional; we'll override with live FX if available
};

export type ReservesListProps = {
  fetchUrl?: string;
  refreshMs?: number;
  currency?: Fiat; // default USD
  limit?: number;
  title?: string;
  className?: string;
};

/* =========================
   Helpers / UI bits
========================= */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// format with optional explicit "Tk" suffix
function money(num: number, currency: Fiat) {
  if (currency === "BDT") {
    const n = Math.round(num);
    const formatted = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      useGrouping: true,
    }).format(n);
    return `BDT ${formatted}`; // 👉 code first
  }
  // USD keeps normal currency formatting
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(num);
}

// 🔺 NEW: colors for all methods
const COLOR_MAP: Record<string, string> = {
  paypal: "#22c55e",
  payoneer: "#f59e0b",
  skrill: "#6d28d9",
  wise: "#0ea5e9",
  usdt: "#10b981",
  bkash: "#e11d48",
  nagad: "#f97316",
  bank: "#334155",

  // new
  cashapp: "#16a34a",
  zelle: "#6d28d9",
  chime: "#10b981",
  etransfer: "#0ea5e9", // Interac vibe
  venmo: "#3b82f6",
  monzo: "#ef4444",
  atom: "#6366f1",
  lamiabanca: "#0ea5e9",
  unicredit: "#ef4444",
  scotiabank: "#dc2626",
  rbc: "#1d4ed8",
};

function Dot({ id }: { id: string }) {
  const color = COLOR_MAP[id] || "#64748b";
  return (
    <span
      className='inline-block h-6 w-6 flex-shrink-0 rounded-full ring-1 ring-black/5'
      style={{ background: color }}
      aria-hidden
    />
  );
}

function categoryFrom(it: ReserveItem): string {
  const id = String(it.id);
  if (id === "usdt") return "USDT";
  if (
    [
      "paypal",
      "payoneer",
      "skrill",
      "wise",
      "cashapp",
      "zelle",
      "chime",
      "venmo",
    ].includes(id)
  )
    return "USD";
  if (["monzo", "atom"].includes(id)) return "GBP";
  if (["lamiabanca", "unicredit"].includes(id)) return "EUR";
  if (["scotiabank", "rbc", "etransfer"].includes(id)) return "CAD";
  if (["bkash", "nagad", "bank"].includes(id)) return "BDT";
  return "OTHER";
}

function Row({
  it,
  currency,
  usdToBdt,
}: {
  it: ReserveItem;
  currency: Fiat;
  usdToBdt: number;
}) {
  const id = String(it.id);
  const cat = categoryFrom(it);

  // bKash & Nagad: ALWAYS show BDT with "Tk", regardless of selected tab
  if (id === "bkash" || id === "nagad" || id === "bank") {
    const bdtVal = it.amountUSD * usdToBdt;
    return (
      <li className='group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-gray-50'>
        <Dot id={id} />
        <div className='min-w-0'>
          <div className='truncate text-[15px] font-medium text-gray-900'>
            {it.label}
          </div>
          <div className='text-[10px] font-semibold uppercase tracking-wider text-gray-400'>
            {cat} • Live FX
          </div>
        </div>
        <div className='text-right text-[15px] font-semibold tabular-nums text-gray-900'>
          {money(bdtVal, "BDT")}
        </div>
      </li>
    );
  }

  // Everyone else: respect selected currency
  const display = currency === "USD" ? it.amountUSD : it.amountUSD * usdToBdt;
  return (
    <li className='group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-gray-50'>
      <Dot id={id} />
      <div className='min-w-0'>
        <div className='truncate text-[15px] font-medium text-gray-900'>
          {it.label}
        </div>
        <div className='text-[10px] font-semibold uppercase tracking-wider text-gray-400'>
          {cat}
        </div>
      </div>
      <div className='text-right text-[15px] font-semibold tabular-nums text-gray-900'>
        {money(display, currency)}
      </div>
    </li>
  );
}

/* =========================
   Component
========================= */
export default function ReservesList({
  fetchUrl,
  refreshMs = 60000,
  currency = "USD",
  limit,
  title = "Our Reserves",
  className,
}: ReservesListProps) {
  const endpoint = fetchUrl || API.url("reserves");

  const [items, setItems] = useState<ReserveItem[]>([]);
  const [usdToBdt, setUsdToBdt] = useState<number>(118);
  const [ccy, setCcy] = useState<Fiat>(currency);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const tickRef = useRef<number>(0);

  // 🔺 NEW: fetch live USD→BDT locally (Open ER API → Fawaz Ahmed fallback)
  const fetchUsdToBdt = async (): Promise<number> => {
    try {
      const r1 = await fetch("https://open.er-api.com/v6/latest/USD", {
        cache: "no-store",
      });
      if (r1.ok) {
        const j = await r1.json();
        const bdt = j?.rates?.BDT;
        if (Number.isFinite(bdt) && bdt > 0) return Number(bdt);
      }
    } catch {}
    try {
      const r2 = await fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
        { cache: "no-store" }
      );
      if (r2.ok) {
        const j = await r2.json();
        const bdt = j?.usd?.bdt;
        if (Number.isFinite(bdt) && bdt > 0) return Number(bdt);
      }
    } catch {}
    return usdToBdt; // keep current if both fail
  };

  const load = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      // fetch reserves
      const res = await fetch(endpoint, { cache: "no-store", signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ReservesApiResponse = await res.json();
      if (!Array.isArray(json?.items))
        throw new Error("Malformed response: missing items");
      setItems(json.items);

      // merge FX from server (if present) with live client FX (preferred)
      const [liveBdt, serverBdt] = await Promise.all([
        fetchUsdToBdt(),
        Promise.resolve(json.usdToBdt ?? 0),
      ]);
      const nextBdt =
        Number.isFinite(liveBdt) && liveBdt > 0
          ? liveBdt
          : Number.isFinite(serverBdt) && serverBdt > 0
          ? serverBdt
          : usdToBdt;

      setUsdToBdt(Number(nextBdt.toFixed(4)));
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e?.message || "Failed to load reserves");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial + polling
  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    let id: number | undefined;
    if (refreshMs && refreshMs > 0) {
      id = window.setInterval(() => load(), refreshMs);
    }
    return () => {
      ac.abort();
      if (id) window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, refreshMs, tickRef.current]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.amountUSD - a.amountUSD),
    [items]
  );
  const visible = useMemo(
    () => (limit ? sorted.slice(0, limit) : sorted),
    [sorted, limit]
  );
  const hiddenCount = Math.max(0, items.length - visible.length);

  return (
    <aside
      className={cx(
        "rounded-3xl bg-white/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur",
        "ring-1 ring-white/50",
        className
      )}
    >
      {/* Header */}
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <button
            className='inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/60 bg-white/80 text-xs text-gray-600 shadow-sm'
            aria-label='Menu'
            title='Menu'
            type='button'
          >
            ≡
          </button>
          <h3 className='text-base font-semibold text-gray-900'>{title}</h3>
          {lastUpdated && !isLoading && !error && (
            <span className='ml-2 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500'>
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <div className='inline-flex rounded-full border border-white/60 bg-white/80 p-0.5 shadow-sm'>
            <button
              className={cx(
                "rounded-full px-2.5 py-1 text-xs",
                ccy === "USD" ? "bg-gray-900 text-white" : "text-gray-700"
              )}
              onClick={() => setCcy("USD")}
              type='button'
            >
              USD
            </button>
            <button
              className={cx(
                "rounded-full px-2.5 py-1 text-xs",
                ccy === "BDT" ? "bg-gray-900 text-white" : "text-gray-700"
              )}
              onClick={() => setCcy("BDT")}
              type='button'
            >
              BDT
            </button>
          </div>
          <button
            onClick={() => {
              tickRef.current++;
              load();
            }}
            className='rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-gray-700 shadow-sm hover:bg-white'
            type='button'
          >
            Refresh
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <ul className='space-y-2'>
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className='h-[52px] animate-pulse rounded-xl bg-gray-100/70'
            />
          ))}
        </ul>
      ) : error ? (
        <div className='rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100'>
          {error}{" "}
          <button
            className='ml-2 rounded-md bg-amber-600 px-2 py-0.5 text-[11px] text-white'
            onClick={() => load()}
            type='button'
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className='divide-y divide-gray-100/80'>
          {visible.map((it) => (
            <Row
              key={`${it.id}-${it.label}`}
              it={it}
              currency={ccy}
              usdToBdt={usdToBdt}
            />
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className='mt-2 flex items-center justify-between text-[11px] text-gray-500'>
        <span>FX {usdToBdt.toFixed(2)} BDT / USD</span>
        {hiddenCount > 0 && <span>+{hiddenCount} more</span>}
      </div>
    </aside>
  );
}
