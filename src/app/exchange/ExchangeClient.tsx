/* app/exchange/ExchangeClient.tsx */
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { METHOD_CCY, METHOD_LABELS, RECEIVING_ACCOUNTS, isMethod, MethodId, Fiat, TradeStatus } from "./shared";
import ReceiveDetailsForm from "./components/ReceiveDetailsForm";
import TradeStatusBar from "./components/TradeStatusBar";
import TradeChat from "./components/TradeChat";
import { copy } from "./utils";

export default function ExchangeClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // query params
  const amount = sp.get("amount") ?? "0";
  const amountCcy = (sp.get("amountCcy") as Fiat) || "USD";
  const from = sp.get("from");
  const to = sp.get("to");
  const valid = isMethod(from) && isMethod(to);

  // safe fallbacks so hooks aren't conditional
  const src: MethodId = (isMethod(from) ? from : "bkash") as MethodId;
  const dst: MethodId = (isMethod(to) ? to : "paypal") as MethodId;

  // trade id (client-only)
  const [tradeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const existing = window.sessionStorage.getItem("current-trade-id");
      if (existing) return existing;
      const id = `XCX-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
      window.sessionStorage.setItem("current-trade-id", id);
      return id;
    }
    return `XCX-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  });

  // status + saved destination
  const [status, setStatus] = useState<TradeStatus>("Started");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [destSaved, setDestSaved] = useState<any>(null);

  const account = useMemo(() => RECEIVING_ACCOUNTS[src], [src]);

  // hydrate from localStorage (demo)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `demo-trade:${tradeId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.status) setStatus(parsed.status);
      if (parsed.destSaved) setDestSaved(parsed.destSaved);
    }
  }, [tradeId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `demo-trade:${tradeId}`;
    localStorage.setItem(key, JSON.stringify({ status, destSaved }));
  }, [tradeId, status, destSaved]);

  return (
    <main className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(163,230,53,0.25),rgba(255,255,255,0)_60%)]" />
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:underline">← Back</Link>
        </div>

        {!valid ? (
          <div className="mx-auto max-w-2xl rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
            <h1 className="text-xl font-semibold text-amber-900">Invalid Request</h1>
            <p className="mt-2 text-amber-800">We couldn’t read your exchange selection. Please start again.</p>
            <Link href="/" className="mt-4 inline-block rounded-xl bg-gray-900 px-4 py-2 text-white">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
            {/* Left column */}
            <section className="rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50">
              <header className="mb-4">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Send your payment via <span className="text-lime-700">{METHOD_LABELS[src]}</span>
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  You’re exchanging from <strong>{METHOD_LABELS[src]}</strong> ({METHOD_CCY[src]}) to{" "}
                  <strong>{METHOD_LABELS[dst]}</strong> ({METHOD_CCY[dst]}).
                </p>
              </header>

              <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                <h2 className="text-sm font-semibold text-gray-800">Your Order</h2>
                <div className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                  <div>
                    <div className="text-gray-500">Amount you entered</div>
                    <div className="font-semibold">{amount} {amountCcy}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Route</div>
                    <div className="font-semibold">{METHOD_LABELS[src]} → {METHOD_LABELS[dst]}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800">Pay to this {METHOD_LABELS[src]} account</h3>
                <div className="mt-2 rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-gray-500">{account.fieldLabel}</div>
                      {account.value.includes("\n") ? (
                        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-sm text-gray-900">{account.value}</pre>
                      ) : (
                        <div className="mt-1 break-all font-mono text-sm text-gray-900">{account.value}</div>
                      )}
                      {account.helper && <p className="mt-2 text-xs text-gray-500">{account.helper}</p>}
                    </div>
                    <button
                      onClick={() => copy(account.value)}
                      className="shrink-0 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800">How it works</h3>
                <ol className="mt-3 space-y-3">
                  <li className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                    <div className="text-sm font-semibold text-gray-900">1) Send Payment</div>
                    <p className="text-sm text-gray-600">
                      From your <strong>{METHOD_LABELS[src]}</strong> account, send{" "}
                      <strong>{amount} {amountCcy}</strong> to the {METHOD_LABELS[src]} account shown above.
                    </p>
                  </li>
                  <li className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                    <div className="text-sm font-semibold text-gray-900">2) Provide Proof / Reference</div>
                    <p className="text-sm text-gray-600">
                      After sending, share the transaction ID / screenshot in chat, or include reference{" "}
                      <code className="font-mono">{tradeId}</code> while paying.
                    </p>
                  </li>
                  <li className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                    <div className="text-sm font-semibold text-gray-900">3) We Send to You</div>
                    <p className="text-sm text-gray-600">
                      Once received, we’ll transfer to your <strong>{METHOD_LABELS[dst]}</strong> in{" "}
                      <strong>{METHOD_CCY[dst]}</strong>. Typical time: 5–30 min.
                    </p>
                  </li>
                </ol>
              </div>

              <div className="mt-6">
                <TradeStatusBar status={status} onMarkPaid={() => setStatus("Pending")} />
              </div>

              <div className="mt-6">
                <ReceiveDetailsForm dst={dst} initial={destSaved} onSaved={(p) => setDestSaved(p)} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/support" className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                  Contact Support
                </Link>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
                >
                  Start a New Exchange
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Note: Network/bank fees may apply. We may request KYC for large or unusual transactions.
              </p>
            </section>

            {/* Right column */}
            <aside className="space-y-6">
              <div className="rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50">
                <h2 className="text-lg font-extrabold tracking-tight">Destination</h2>
                <div className="mt-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                  <div className="text-sm text-gray-600">You’ll receive via</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {METHOD_LABELS[dst]} ({METHOD_CCY[dst]})
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    We’ll confirm your payment and then complete the transfer to your account.
                  </p>
                </div>
              </div>

              <TradeChat tradeId={tradeId} />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
