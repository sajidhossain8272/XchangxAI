/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";

// --------------------------------------------------
// Types
// --------------------------------------------------
export type MethodId =
  | "paypal"
  | "payoneer"
  | "skrill"
  | "wise"
  | "usdt"
  | "bkash"
  | "nagad"
  | "bank";

export type Fiat = "USD" | "BDT";

export type ReserveItem = {
  id: MethodId | string;
  label: string;
  amountUSD: number; // canonical in USD
};

export type ReservesListProps = {
  items?: ReserveItem[];
  currency?: Fiat; // default USD
  usdToBdt?: number; // for BDT display
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
  fetchUrl?: string; // optional: /api/reserves -> { items, usdToBdt }
  refreshMs?: number; // default 60s
  limit?: number; // show top N ("+X more" footer)
  title?: string; // override header title
};

// --------------------------------------------------
// Defaults & helpers
// --------------------------------------------------
const DEFAULT: ReserveItem[] = [
  { id: "usdt", label: "Tether (TRC20) USDT", amountUSD: 5000 },
  { id: "bank", label: "Binance ID", amountUSD: 4882.75 },
  { id: "usdt", label: "Tether (BEP20) USDT", amountUSD: 900 },
  { id: "usdt", label: "Tether (TON) USDT", amountUSD: 895 },
  { id: "usdt", label: "BTC", amountUSD: 888 },
  { id: "bank", label: "Kucoin UID", amountUSD: 700 },
  { id: "bank", label: "Ethereum", amountUSD: 700 },
  { id: "bank", label: "RedotPay", amountUSD: 700 },
  { id: "bank", label: "TON", amountUSD: 699 },
  { id: "bank", label: "Bitcoin Cash", amountUSD: 696.68 },
  { id: "bank", label: "Smart Chain (BNB)", amountUSD: 692.31 },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function money(num: number, currency: Fiat) {
  const n = currency === "USD" ? num : Math.round(num);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(n);
}

const COLOR_MAP: Record<string, string> = {
  paypal: "#22c55e", // lime-ish brand accent
  payoneer: "#f59e0b",
  skrill: "#6d28d9",
  wise: "#0ea5e9",
  usdt: "#10b981",
  bkash: "#e11d48",
  nagad: "#f97316",
  bank: "#334155",
};

function Dot({ id }: { id: string }) {
  const color = COLOR_MAP[id] || "#64748b";
  return (
    <span
      className="inline-block h-6 w-6 flex-shrink-0 rounded-full ring-1 ring-black/5"
      style={{ background: color }}
      aria-hidden
    />
  );
}

function categoryFrom(it: ReserveItem): string {
  if (String(it.id) === "usdt") return "USDT";
  if (["paypal", "payoneer", "skrill", "wise"].includes(String(it.id))) return "USD";
  return "BANK";
}

// Single row aligned with site style
function Row({ it, currency, usdToBdt }: { it: ReserveItem; currency: Fiat; usdToBdt: number }) {
  const display = currency === "USD" ? it.amountUSD : it.amountUSD * usdToBdt;
  const cat = categoryFrom(it);
  return (
    <li className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-gray-50">
      <Dot id={String(it.id)} />
      <div className="min-w-0">
        <div className="truncate text-[15px] font-medium text-gray-900">{it.label}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{cat}</div>
      </div>
      <div className="text-right text-[15px] font-semibold tabular-nums text-gray-900">
        {money(display, currency)}
      </div>
    </li>
  );
}

// --------------------------------------------------
// Component (aligned to your hero/card look)
// --------------------------------------------------
export default function ReservesList({
  items,
  currency = "USD",
  usdToBdt = 118,
  loading,
  error,
  onRefresh,
  className,
  fetchUrl,
  refreshMs = 60000,
  limit,
  title = "Our Reserves",
}: ReservesListProps) {
  const [internal, setInternal] = useState<ReserveItem[]>(items || DEFAULT);
  const [fx, setFx] = useState<number>(usdToBdt);
  const [isLoading, setIsLoading] = useState<boolean>(!!fetchUrl || !!loading);
  const [err, setErr] = useState<string | null>(error || null);
  const [ccy, setCcy] = useState<Fiat>(currency);

  // Optional fetch mode
  useEffect(() => {
    if (!fetchUrl) return;
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setErr(null);
        const res = await fetch(fetchUrl, { cache: "no-store" });
        const json = await res.json();
        if (!mounted) return;
        if (Array.isArray(json?.items)) setInternal(json.items as ReserveItem[]);
        if (json?.usdToBdt) setFx(Number(json.usdToBdt));
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load reserves");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    const id = window.setInterval(load, refreshMs);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [fetchUrl, refreshMs]);

  useEffect(() => {
    if (items) setInternal(items);
  }, [items]);
  useEffect(() => setFx(usdToBdt), [usdToBdt]);
  useEffect(() => setCcy(currency), [currency]);

  const sorted = useMemo(() => [...internal].sort((a, b) => b.amountUSD - a.amountUSD), [internal]);
  const visible = useMemo(() => (limit ? sorted.slice(0, limit) : sorted), [sorted, limit]);
  const hiddenCount = Math.max(0, internal.length - visible.length);

  return (
    <aside
      className={cx(
        // matches your hero card aesthetics
        "rounded-3xl bg-white/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur",
        "ring-1 ring-white/50",
        className
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/60 bg-white/80 text-xs text-gray-600 shadow-sm"
            aria-label="Menu"
            title="Menu"
          >
            ≡
          </button>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-white/60 bg-white/80 p-0.5 shadow-sm">
            <button
              className={cx(
                "rounded-full px-2.5 py-1 text-xs",
                ccy === "USD" ? "bg-gray-900 text-white" : "text-gray-700"
              )}
              onClick={() => setCcy("USD")}
            >
              USD
            </button>
            <button
              className={cx(
                "rounded-full px-2.5 py-1 text-xs",
                ccy === "BDT" ? "bg-gray-900 text-white" : "text-gray-700"
              )}
              onClick={() => setCcy("BDT")}
            >
              BDT
            </button>
          </div>
          <button
            onClick={() => onRefresh?.()}
            className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-gray-700 shadow-sm hover:bg-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <li key={i} className="h-[52px] animate-pulse rounded-xl bg-gray-100/70" />
          ))}
        </ul>
      ) : err ? (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100">{err}</div>
      ) : (
        <ul className="divide-y divide-gray-100/80">
          {visible.map((it) => (
            <Row key={`${it.id}-${it.label}`} it={it} currency={ccy} usdToBdt={fx} />
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <span>FX {fx.toFixed(2)} BDT / USD</span>
        {hiddenCount > 0 && <span>+{hiddenCount} more</span>}
      </div>
    </aside>
  );
}

