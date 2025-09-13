/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/exchange/page.tsx */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

/** ---------------- Types ---------------- */
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
type TradeStatus = "Started" | "Pending" | "Completed";

/** ---------------- Static Data ---------------- */
const METHOD_LABELS: Record<MethodId, string> = {
  paypal: "PayPal",
  payoneer: "Payoneer",
  skrill: "Skrill",
  wise: "Wise",
  usdt: "USDT (TRC20)",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer (BDT)",
};

const METHOD_CCY: Record<MethodId, Fiat> = {
  paypal: "USD",
  payoneer: "USD",
  skrill: "USD",
  wise: "USD",
  usdt: "USD",
  bkash: "BDT",
  nagad: "BDT",
  bank: "BDT",
};

const RECEIVING_ACCOUNTS: Record<
  MethodId,
  { fieldLabel: string; value: string; helper?: string }
> = {
  paypal: {
    fieldLabel: "PayPal Email",
    value: "example@gmail.com",
    helper: "Send as Friends & Family if available.",
  },
  payoneer: { fieldLabel: "Payoneer Email", value: "example@domain.com" },
  skrill: { fieldLabel: "Skrill Email", value: "skrillexample@mail.com" },
  wise: {
    fieldLabel: "Wise Email",
    value: "wiseaccount@mail.com",
    helper: "If bank details are required, contact support.",
  },
  usdt: {
    fieldLabel: "USDT (TRC20) Address",
    value: "TN1ExampleTRC20WalletAddress12345",
    helper: "Send only USDT on TRON (TRC20).",
  },
  bkash: {
    fieldLabel: "bKash Number",
    value: "01XXXXXXXXX",
    helper: "Send via Personal bKash (Send Money).",
  },
  nagad: { fieldLabel: "Nagad Number", value: "01XXXXXXXXX" },
  bank: {
    fieldLabel: "Bank Account",
    value:
      "Account Name: Your Company\nAccount No: 01234567890\nBank: ABC Bank, Banani Branch\nRouting: 0123456",
    helper: "Use the exact reference shown below.",
  },
};

/** ---------------- Helpers ---------------- */
function copy(text: string) {
  if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(text);
}
function isMethod(x: string | null): x is MethodId {
  return !!x && x in METHOD_LABELS;
}

/** -------- Destination Form -------- */
function ReceiveDetailsForm({
  dst,
  onSaved,
  initial,
}: {
  dst: MethodId;
  onSaved: (payload: any) => void;
  initial?: any;
}) {
  const isBDT = dst === "bkash" || dst === "nagad" || dst === "bank";
  const isEmail =
    dst === "paypal" || dst === "skrill" || dst === "wise" || dst === "payoneer";
  const isUSDT = dst === "usdt";

  const [form, setForm] = useState<any>(
    initial || {
      bkashNumber: "",
      nagadNumber: "",
      bankAccountName: "",
      bankAccountNo: "",
      bankName: "",
      bankRouting: "",
      email: "",
      usdtAddress: "",
      note: "",
    }
  );
  const [saving, setSaving] = useState(false);

  const label =
    dst === "bkash"
      ? "Your bKash number"
      : dst === "nagad"
      ? "Your Nagad number"
      : dst === "bank"
      ? "Your bank details"
      : dst === "usdt"
      ? "Your USDT (TRC20) address"
      : "Your payout email";

  const handle = (k: string, v: string) => setForm((s: any) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      onSaved({ dst, ...form });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
      <h3 className="text-sm font-semibold text-gray-800">
        Where should we send your money?
      </h3>
      <p className="mt-1 text-xs text-gray-500">{label}</p>

      <div className="mt-3 grid gap-3">
        {dst === "bkash" && (
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="01XXXXXXXXX"
            value={form.bkashNumber}
            onChange={(e) => handle("bkashNumber", e.target.value)}
          />
        )}
        {dst === "nagad" && (
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="01XXXXXXXXX"
            value={form.nagadNumber}
            onChange={(e) => handle("nagadNumber", e.target.value)}
          />
        )}
        {dst === "bank" && (
          <>
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder="Account Name"
              value={form.bankAccountName}
              onChange={(e) => handle("bankAccountName", e.target.value)}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder="Account Number"
              value={form.bankAccountNo}
              onChange={(e) => handle("bankAccountNo", e.target.value)}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder="Bank & Branch"
              value={form.bankName}
              onChange={(e) => handle("bankName", e.target.value)}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder="Routing Number (optional)"
              value={form.bankRouting}
              onChange={(e) => handle("bankRouting", e.target.value)}
            />
          </>
        )}
        {isEmail && (
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => handle("email", e.target.value)}
          />
        )}
        {isUSDT && (
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="TRC20 wallet address"
            value={form.usdtAddress}
            onChange={(e) => handle("usdtAddress", e.target.value)}
          />
        )}
        <textarea
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="Any extra note (optional)"
          value={form.note}
          onChange={(e) => handle("note", e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-3 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save destination"}
      </button>
    </div>
  );
}

/** -------- Status Bar -------- */
function TradeStatusBar({
  status,
  onMarkPaid,
}: {
  status: TradeStatus;
  onMarkPaid: () => void;
}) {
  const steps: { key: TradeStatus; label: string }[] = [
    { key: "Started", label: "Started" },
    { key: "Pending", label: "Pending (Paid)" },
    { key: "Completed", label: "Completed" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
      <div className="mb-3 text-sm font-semibold text-gray-900">Trade status</div>
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`h-6 rounded-full px-3 text-xs font-semibold leading-6 ${
                i <= currentIdx ? "bg-lime-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="h-0.5 w-6 bg-gray-300" />}
          </div>
        ))}
      </div>

      {status === "Started" && (
        <button
          onClick={onMarkPaid}
          className="mt-3 rounded-xl bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700"
        >
          I have paid — mark as Pending
        </button>
      )}

      {status === "Pending" && (
        <p className="mt-2 text-xs text-gray-600">
          Thanks! We’ll verify and complete your payout shortly.
        </p>
      )}
    </div>
  );
}

/** -------- Trade Chat -------- */
type ChatMsg = {
  _id: string;
  role: "user" | "admin";
  text?: string;
  imageUrl?: string;
  ts: number;
};

function TradeChat({
  tradeId,
  onUpload,
}: {
  tradeId: string;
  onUpload?: (file: File) => Promise<void>;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    function poll() {
      const key = `demo-trade-msgs:${tradeId}`;
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      if (mounted) setMessages(arr);
    }
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [tradeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    try {
      const key = `demo-trade-msgs:${tradeId}`;
      const arr: ChatMsg[] = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push({ _id: crypto.randomUUID(), role: "user", text, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(arr));
      setText("");
      setMessages(arr);
    } finally {
      setSending(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (onUpload) {
      await onUpload(f);
      return;
    }
    const url = URL.createObjectURL(f);
    const key = `demo-trade-msgs:${tradeId}`;
    const arr: ChatMsg[] = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push({ _id: crypto.randomUUID(), role: "user", imageUrl: url, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(arr));
    setMessages(arr);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50">
      <h2 className="text-lg font-extrabold tracking-tight">Chat for this trade</h2>

      <div
        ref={scrollRef}
        className="mt-3 max-h-80 overflow-y-auto rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200"
      >
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">No messages yet. Share a note or a screenshot.</p>
        )}
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                  m.role === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900 ring-1 ring-gray-200"
                }`}
              >
                {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                {m.imageUrl && (
                  <img
                    alt="upload"
                    src={m.imageUrl}
                    className="mt-2 h-auto max-h-64 w-full rounded-xl object-contain"
                  />
                )}
                <div
                  className={`mt-1 text-[10px] ${
                    m.role === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {new Date(m.ts).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
        >
          Image
        </button>
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/** ---------------- Main Page ---------------- */
export default function ExchangePage() {
  const router = useRouter();
  const sp = useSearchParams();

  const amount = sp.get("amount") ?? "0";
  const amountCcy = (sp.get("amountCcy") as Fiat) || "USD";
  const from = sp.get("from");
  const to = sp.get("to");
  const valid = isMethod(from) && isMethod(to);

  // Safe defaults to avoid conditional hooks
  const src: MethodId = (isMethod(from) ? from : "bkash") as MethodId;
  const dst: MethodId = (isMethod(to) ? to : "paypal") as MethodId;

  const [tradeId] = useState<string>(() => {
    const existing = sessionStorage.getItem("current-trade-id");
    if (existing) return existing;
    const id = `XCX-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    sessionStorage.setItem("current-trade-id", id);
    return id;
  });

  const [status, setStatus] = useState<TradeStatus>("Started");
  const [destSaved, setDestSaved] = useState<any>(null);
  const account = useMemo(() => RECEIVING_ACCOUNTS[src], [src]);

  useEffect(() => {
    const key = `demo-trade:${tradeId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.status) setStatus(parsed.status);
      if (parsed.destSaved) setDestSaved(parsed.destSaved);
    }
  }, [tradeId]);

  useEffect(() => {
    const key = `demo-trade:${tradeId}`;
    localStorage.setItem(key, JSON.stringify({ status, destSaved }));
  }, [tradeId, status, destSaved]);

  function markPaid() {
    setStatus("Pending");
  }

  return (
    <main className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(163,230,53,0.25),rgba(255,255,255,0)_60%)]" />
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back
          </Link>
        </div>

        {!valid ? (
          <div className="mx-auto max-w-2xl rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
            <h1 className="text-xl font-semibold text-amber-900">Invalid Request</h1>
            <p className="mt-2 text-amber-800">
              We couldn’t read your exchange selection. Please start again.
            </p>
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
                  You’re exchanging from <strong>{METHOD_LABELS[src]}</strong> ({METHOD_CCY[src]}) to
                  <strong> {METHOD_LABELS[dst]}</strong> ({METHOD_CCY[dst]}).
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
                    <button onClick={() => copy(account.value)} className="shrink-0 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">Copy</button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800">How it works</h3>
                <ol className="mt-3 space-y-3">
                  <li className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                    <div className="text-sm font-semibold text-gray-900">1) Send Payment</div>
                    <p className="text-sm text-gray-600">
                      From your <strong>{METHOD_LABELS[src]}</strong> account, send <strong>{amount} {amountCcy}</strong> to the {METHOD_LABELS[src]} account shown above.
                    </p>
                  </li>
                  <li className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                    <div className="text-sm font-semibold text-gray-900">2) Provide Proof / Reference</div>
                    <p className="text-sm text-gray-600">
                      After sending, share the transaction ID / screenshot in chat, or include reference
                      <code className="font-mono"> {tradeId}</code> while paying.
                    </p>
                  </li>
                  <li className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                    <div className="text-sm font-semibold text-gray-900">3) We Send to You</div>
                    <p className="text-sm text-gray-600">Once received, we’ll transfer to your <strong>{METHOD_LABELS[dst]}</strong> in <strong>{METHOD_CCY[dst]}</strong>. Typical time: 5–30 min.</p>
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
                <Link href="/support" className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">Contact Support</Link>
                <button onClick={() => router.push("/")} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50">Start a New Exchange</button>
              </div>

              <p className="mt-4 text-xs text-gray-500">Note: Network/bank fees may apply. We may request KYC for large or unusual transactions.</p>
            </section>

            {/* Right column */}
            <aside className="space-y-6">
              <div className="rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50">
                <h2 className="text-lg font-extrabold tracking-tight">Destination</h2>
                <div className="mt-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                  <div className="text-sm text-gray-600">You’ll receive via</div>
                  <div className="text-xl font-semibold text-gray-900">{METHOD_LABELS[dst]} ({METHOD_CCY[dst]})</div>
                  <p className="mt-2 text-sm text-gray-600">We’ll confirm your payment and then complete the transfer to your account.</p>
                </div>
              </div>

              <TradeChat tradeId={tradeId} onUpload={async (file) => {
                // const fd = new FormData();
                // fd.append("file", file);
                // await axios.post(`/api/trades/${tradeId}/upload`, fd);
              }} />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
