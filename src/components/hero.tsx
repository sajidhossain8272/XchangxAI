"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";

/** --- Types & Data --- */
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

const METHODS: { id: MethodId; label: string }[] = [
  { id: "paypal", label: "PayPal" },
  { id: "payoneer", label: "Payoneer" },
  { id: "skrill", label: "Skrill" },
  { id: "wise", label: "Wise" },
  { id: "usdt", label: "USDT (TRC20)" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "bank", label: "Bank Transfer (BDT)" },
];

// Platform -> settlement currency
const PLATFORM_CCY: Record<MethodId, Fiat> = {
  paypal: "USD",
  payoneer: "USD",
  skrill: "USD",
  wise: "USD",
  usdt: "USD", // peg
  bkash: "BDT",
  nagad: "BDT",
  bank: "BDT",
};

// Only DESTINATION fee (your margin/cost). No source fee.
const DEST_FEE_PCT: Record<MethodId, number> = {
  paypal: 0.9,
  payoneer: 0.6,
  skrill: 0.9,
  wise: 0.4,
  usdt: 0.2,
  bkash: 0.8,
  nagad: 0.8,
  bank: 0.4,
};

// Supported input currencies
const AMOUNT_CCYS: Fiat[] = ["USD", "EUR", "BDT"];

/** --- Helpers --- */
function clampPositiveNumber(s: string): string {
  if (s.trim() === "") return "";
  const cleaned = s.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return parts[0] + "." + parts.slice(1).join("");
  }
  return cleaned;
}

export default function Hero() {
  /** --- State --- */
  const [amount, setAmount] = useState<string>(""); // empty by default
  const [amountCcy, setAmountCcy] = useState<Fiat>("USD");
  const [from, setFrom] = useState<MethodId>("payoneer");
  const [to, setTo] = useState<MethodId>("bkash");

  // rates mean: 1 USD -> CCY
  const [rates, setRates] = useState<Record<Fiat, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(true);
  const [rateError, setRateError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /** --- Keep From/To different --- */
  useEffect(() => {
    if (from === to) {
      const alt = METHODS.find((m) => m.id !== from)?.id || "bkash";
      setTo(alt);
    }
  }, [from, to]);

  /** --- Fetch rates (base USD) --- */
  useEffect(() => {
    let mounted = true;

    const fetchRates = async () => {
      try {
        setLoadingRates(true);
        setRateError(null);

        // Primary: Open ER API (no key)
        const r1 = await axios.get("https://open.er-api.com/v6/latest/USD", {
          timeout: 8000,
        });
        let rEUR = r1?.data?.rates?.EUR ?? null;
        let rBDT = r1?.data?.rates?.BDT ?? null;

        // Fallback: Fawaz Ahmed Currency API (no key, via jsDelivr)
        if (!rEUR || !rBDT) {
          const r2 = await axios.get(
            "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
            { timeout: 8000 }
          );
          rEUR = rEUR ?? r2?.data?.usd?.eur ?? null;
          rBDT = rBDT ?? r2?.data?.usd?.bdt ?? null;
        }

        if (!rEUR || !rBDT) throw new Error("Missing EUR/BDT rates");

        const next: Record<Fiat, number> = { USD: 1, EUR: rEUR, BDT: rBDT };
        if (mounted) {
          setRates(next);
          setLastUpdated(new Date());
        }
      } catch {
        // Final static fallback
        const fallback: Record<Fiat, number> = {
          USD: 1,
          EUR: 0.92,
          BDT: 118.0,
        };
        if (mounted) {
          setRates(fallback);
          setRateError("Live rates unavailable. Using fallback.");
        }
      } finally {
        if (mounted) setLoadingRates(false);
      }
    };

    fetchRates();
    const id = setInterval(fetchRates, 60_000); // refresh every minute
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  /** --- Computations --- */
  const toOptions = useMemo(() => METHODS.filter((m) => m.id !== from), [from]);

  const srcCcy: Fiat = PLATFORM_CCY[from];
  const dstCcy: Fiat = PLATFORM_CCY[to];

  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  // Effective FX rate from live/fallback rates: "1 srcCcy ≈ X dstCcy"
  const effectiveSrcToDstRate = useMemo(() => {
    if (!rates) return null;
    const srcToUsd = 1 / (rates[srcCcy] || 1); // since rates are USD→CCY
    const usdToDst = rates[dstCcy] || 1;
    return srcToUsd * usdToDst;
  }, [rates, srcCcy, dstCcy]);

  // Convert input -> src currency (no source fee), then src -> dst via rate, then apply destination fee
  const { youGive, youGetBeforeFee, youGetAfterFee } = useMemo(() => {
    if (parsedAmount <= 0 || !rates) {
      return { youGive: 0, youGetBeforeFee: 0, youGetAfterFee: 0 };
    }

    // Input CCY -> USD
    const amtUSD =
      amountCcy === "USD"
        ? parsedAmount
        : parsedAmount / (rates[amountCcy] || 1);

    // USD -> srcCcy (no source fee)
    const amtSrc = amtUSD * (rates[srcCcy] || 1);

    // src -> dst
    const rate =
      effectiveSrcToDstRate && effectiveSrcToDstRate > 0
        ? effectiveSrcToDstRate
        : (1 / (rates[srcCcy] || 1)) * (rates[dstCcy] || 1);

    const getBefore = amtSrc * rate;
    const getAfter = getBefore * (1 - DEST_FEE_PCT[to] / 100);

    return {
      youGive: amtSrc,
      youGetBeforeFee: getBefore,
      youGetAfterFee: getAfter,
    };
  }, [
    parsedAmount,
    amountCcy,
    srcCcy,
    dstCcy,
    to,
    rates,
    effectiveSrcToDstRate,
  ]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const disabled = parsedAmount <= 0 || !rates;

  /** --- UI --- */
  return (
    <section className='relative overflow-hidden py-20'>
      {/* Alif Foundation badge (top-left, larger) */}
      <Link
        href='#'
        aria-label='Powered by Alif Foundation'
        className='group absolute left-3 top-3 z-20 inline-flex items-center gap-3 rounded-xl bg-white/85 px-3 py-2.5 ring-1 ring-black/5 backdrop-blur hover:bg-white md:left-6 md:top-6 md:px-3.5 md:py-3'
      >
        <Image
          src='/Alif-foundation-logo.png'
          alt='Alif Foundation'
          width={48}
          height={48}
          className='h-10 w-10 md:h-12 md:w-12 object-contain grayscale opacity-90 transition group-hover:grayscale-0 group-hover:opacity-100'
        />
        <span className='hidden sm:inline'>
          <span className='mr-1 align-middle text-xs md:text-sm text-gray-500'>
            Powered by
          </span>
          <span className='align-middle text-sm md:text-base font-semibold tracking-tight text-gray-800 group-hover:text-gray-900 '>
            Alif Foundation
          </span>
        </span>
      </Link>

      {/* Layered lime gradients (no motion) */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(163,230,53,0.35),rgba(255,255,255,0)_60%)]' />
      <div
        className='pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl'
        style={{
          background:
            "radial-gradient(closest-side, rgba(132,204,22,0.35), rgba(255,255,255,0))",
        }}
      />
      <div
        className='pointer-events-none absolute bottom-0 left-0 h-80 w-80 translate-x-[-20%] translate-y-[30%] rounded-full blur-3xl'
        style={{
          background:
            "radial-gradient(closest-side, rgba(21,128,61,0.25), rgba(255,255,255,0))",
        }}
      />

      <div className='container mx-auto flex flex-col items-center px-4 text-center'>
        <h1 className='mb-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl'>
          Dollar Exchange Made Simple in Bangladesh
        </h1>
        <p className='mb-8 max-w-2xl text-gray-600'>
          PayPal / Payoneer / Skrill / Wise ⇄ bKash / Nagad / Bank • USDT —
          fast, secure, reliable.
        </p>

        {/* Static card (no animations) */}
        <div className='relative w-full max-w-5xl rounded-3xl bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur'>
          <div className='pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/40' />
          <div className='pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-lime-200/40 via-transparent to-transparent' />

          {/* Header row */}
          <div className='mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end'>
            <div className='text-left'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Amount:{" "}
                <span className='text-lime-700'>
                  {amount.trim() === "" ? "—" : amount}
                </span>
              </h3>
              <p className='text-sm text-gray-500'>
                Enter any amount. You can exchange any platform to any other —
                just not the same one.
              </p>
            </div>

            {/* Last updated / status */}
            <div className='text-right'>
              {loadingRates ? (
                <span className='inline-flex items-center gap-2 text-sm text-gray-500'>
                  <span className='h-2 w-2 animate-pulse rounded-full bg-lime-500' />
                  Fetching live rates…
                </span>
              ) : rateError ? (
                <span className='inline-flex items-center gap-2 text-sm text-amber-600'>
                  ⚠ {rateError}
                </span>
              ) : lastUpdated ? (
                <span className='text-xs text-gray-500'>
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          </div>

          {/* Inputs */}
          <div className='grid gap-4 sm:grid-cols-3'>
            {/* Amount + currency */}
            <div className='sm:col-span-1'>
              <label className='mb-1 block text-left text-sm font-medium text-gray-700'>
                Amount
              </label>
              <div className='flex gap-2'>
                <input
                  inputMode='decimal'
                  className='w-full rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-sm shadow-inner focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-100'
                  value={amount}
                  onChange={(e) =>
                    setAmount(clampPositiveNumber(e.target.value))
                  }
                  placeholder='e.g., 100'
                  aria-label='Amount to exchange'
                />
                <select
                  className='rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-100'
                  value={amountCcy}
                  onChange={(e) => setAmountCcy(e.target.value as Fiat)}
                  aria-label='Amount currency'
                >
                  {AMOUNT_CCYS.map((ccy) => (
                    <option key={ccy} value={ccy}>
                      {ccy}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* From */}
            <div className='sm:col-span-1'>
              <label className='mb-1 block text-left text-sm font-medium text-gray-700'>
                Swap From
              </label>
              <select
                className='w-full rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-100'
                value={from}
                onChange={(e) => setFrom(e.target.value as MethodId)}
                aria-label='Swap from'
              >
                {METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({PLATFORM_CCY[m.id]})
                  </option>
                ))}
              </select>
            </div>

            {/* To */}
            <div className='sm:col-span-1'>
              <label className='mb-1 block text-left text-sm font-medium text-gray-700'>
                To
              </label>
              <select
                className='w-full rounded-2xl border border-white/60 bg-white/90 px-3 py-2 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-100'
                value={to}
                onChange={(e) => setTo(e.target.value as MethodId)}
                aria-label='Swap to'
              >
                {toOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({PLATFORM_CCY[m.id]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap + FX display */}
          <div className='mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center'>
            <div className='text-sm text-gray-600'>
              Rate source: <strong>Live API</strong>
            </div>

            <button
              type='button'
              onClick={handleSwap}
              className='mx-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 px-4 py-2 text-sm font-semibold text-white shadow'
              aria-label='Swap directions'
              title='Swap From and To'
            >
              ⇄ Swap
            </button>

            <div className='text-right text-sm text-gray-700'>
              {from !== to ? (
                <span className='rounded-full bg-lime-50 px-3 py-1'>
                  Effective rate:{" "}
                  <strong>
                    1 {PLATFORM_CCY[from]} ≈{" "}
                    {effectiveSrcToDstRate
                      ? effectiveSrcToDstRate.toFixed(4)
                      : "—"}{" "}
                    {PLATFORM_CCY[to]}
                  </strong>
                </span>
              ) : (
                <span className='rounded-full bg-amber-50 px-3 py-1 text-amber-700'>
                  Select different platforms
                </span>
              )}
            </div>
          </div>

          {/* Live estimate */}
          <div className='mt-6 grid gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl bg-white/85 p-4 text-left shadow-inner ring-1 ring-white/50'>
              <h4 className='mb-1 text-sm font-semibold text-gray-800'>
                You will give
              </h4>
              <p className='text-2xl font-bold tracking-tight text-gray-900'>
                {parsedAmount > 0 && rates ? (
                  <>
                    {youGive.toFixed(2)} {PLATFORM_CCY[from]}
                    <span className='ml-2 align-middle text-xs font-medium text-gray-500'>
                      (no source fee)
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className='mt-1 text-xs text-gray-500'>
                Enter amount in {amountCcy}; we convert to {PLATFORM_CCY[from]}.
              </p>
            </div>

            <div className='rounded-2xl bg-white/85 p-4 text-left shadow-inner ring-1 ring-white/50'>
              <h4 className='mb-1 text-sm font-semibold text-gray-800'>
                You will get
              </h4>
              <p className='text-2xl font-bold tracking-tight text-gray-900'>
                {parsedAmount > 0 && rates ? (
                  <>
                    {youGetAfterFee.toFixed(2)} {PLATFORM_CCY[to]}
                    <span className='ml-2 align-middle text-xs font-medium text-gray-500'>
                      (after {DEST_FEE_PCT[to]}% destination fee)
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className='mt-1 text-xs text-gray-500'>
                Before fee:{" "}
                {parsedAmount > 0 && rates ? youGetBeforeFee.toFixed(2) : "—"}{" "}
                {PLATFORM_CCY[to]}
              </p>
            </div>
          </div>

          {/* CTA Row */}
          <div className='mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <span className='text-sm text-gray-500'>
              Live FX updates every minute. Values are indicative until you
              proceed.
            </span>

            <Link
              href={{
                pathname: "/exchange",
                query: { amount: amount || "0", amountCcy, from, to },
              }}
              className={`rounded-2xl px-5 py-2 text-sm font-semibold text-white shadow ${
                disabled
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-gray-900 hover:bg-black"
              }`}
              aria-disabled={disabled}
            >
              Continue
            </Link>
          </div>

          {/* Trust badges */}
          <div className='mt-6 flex flex-wrap items-center justify-center gap-2 text-xs'>
            <span className='rounded-full bg-white/80 px-3 py-1 text-gray-700 shadow-sm'>
              ⚡ Instant estimate
            </span>
            <span className='rounded-full bg-white/80 px-3 py-1 text-gray-700 shadow-sm'>
              🔒 Secure & verified
            </span>
            <span className='rounded-full bg-white/80 px-3 py-1 text-gray-700 shadow-sm'>
              🕑 24/7 Support
            </span>
          </div>
        </div>

        {/* Small legal / info */}
        <p className='mt-4 max-w-3xl text-xs text-gray-500'>
          Supported: PayPal, Payoneer, Skrill, Wise, USDT (TRC20), bKash, Nagad,
          Bank Transfer (BDT). Live FX via public rate provider; destination
          fees are configurable.
        </p>
      </div>
    </section>
  );
}
