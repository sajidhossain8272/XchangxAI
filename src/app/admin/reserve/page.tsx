"use client";

import { useEffect, useState } from "react";
import API from "@/../apilist";
import RequireAdmin from "@/components/admin/RequireAdmin";

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

function ReserveForm({ onSaved }: { onSaved: () => void }) {
  const [id, setId] = useState(METHODS[0].id);
  const [label, setLabel] = useState(METHODS[0].label);
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
      onSaved();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
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
  );
}

function ReserveTable() {
  const [list, setList] = useState<ReserveItem[]>([]);

  async function load() {
    const res = await fetch(API.ADMIN_RESERVES, { credentials: "include" });
    const json = await res.json();
    if (res.ok && json.ok) setList(json.items || []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
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
  );
}

export default function AdminReservePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <RequireAdmin>
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reserves</h1>
          <form
            action={API.ADMIN_LOGOUT}
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              fetch(API.ADMIN_LOGOUT, { method: "POST", credentials: "include" })
                .then(() => (window.location.href = "/admin/login"));
            }}
          >
            <button className="rounded-md border px-3 py-1" type="submit">
              Logout
            </button>
          </form>
        </div>
        <ReserveForm onSaved={() => setRefreshKey((k) => k + 1)} />
        {/* key forces re-mount to re-fetch, or lift load() up with a callback */}
        <div key={refreshKey}>
          <ReserveTable />
        </div>
      </main>
    </RequireAdmin>
  );
}
