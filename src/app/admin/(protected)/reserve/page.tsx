// app/admin/(protected)/reserve/page.tsx
"use client";

import { useEffect, useState } from "react";
import API from "@/../apilist";

type ReserveItem = { id: string; label: string; amountUSD: number };

const METHODS = [
  { id: "paypal", label: "PayPal (USD)" },
  { id: "payoneer", label: "Payoneer (USD)" },
  { id: "skrill", label: "Skrill (USD)" },
  { id: "wise", label: "Wise (USD)" },
  { id: "usdt", label: "USDT (TRC20) (USD)" },
  { id: "bkash", label: "bKash (BDT)" },
  { id: "nagad", label: "Nagad (BDT)" },
  { id: "bank", label: "Bank Transfer (BDT)" },
];

export default function AdminReservePage() {
  const [list, setList] = useState<ReserveItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // form
  const [id, setId] = useState(METHODS[0].id);
  const [label, setLabel] = useState(METHODS[0].label);
  const [amountUSD, setAmountUSD] = useState<number>(0);

  async function load() {
    const res = await fetch(API.ADMIN_RESERVES, { credentials: "include" });
    const json = await res.json();
    if (res.ok && json.ok) setList(json.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function upsert() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(API.ADMIN_RESERVES_UPSERT, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, label, amountUSD: Number(amountUSD) }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      setMsg("Saved!");
      await load();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Reserves</h1>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-semibold">Upsert Reserve</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="rounded-md border px-3 py-2"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              const m = METHODS.find((x) => x.id === e.target.value);
              if (m) setLabel(m.label);
            }}
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label"
          />
          <input
            className="rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.01"
            value={amountUSD}
            onChange={(e) => setAmountUSD(Number(e.target.value))}
            placeholder="Amount (USD)"
          />
        </div>
        <button
          onClick={upsert}
          disabled={saving}
          className="mt-3 rounded-md bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <div className="mt-2 text-sm text-gray-600">{msg}</div>}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-semibold">Current Reserves</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Label</th>
                <th className="py-2 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2">{r.id}</td>
                  <td className="py-2">{r.label}</td>
                  <td className="py-2 text-right">{r.amountUSD.toFixed(2)}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td className="py-2" colSpan={3}>
                    No reserves yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
