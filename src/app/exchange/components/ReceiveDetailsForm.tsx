/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/exchange/components/ReceiveDetailsForm.tsx */
"use client";
import { useState } from "react";
import type { MethodId } from "../shared";

export default function ReceiveDetailsForm({
  dst,
  onSaved,
  initial,
}: {
  dst: MethodId;
  onSaved: (payload: any) => void;
  initial?: any;
}) {
  const isEmail = ["paypal", "skrill", "wise", "payoneer"].includes(dst);
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
      <h3 className="text-sm font-semibold text-gray-800">Where should we send your money?</h3>
      <div className="mt-3 grid gap-3">
        {dst === "bkash" && (
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="01XXXXXXXXX"
            value={form.bkashNumber} onChange={(e) => handle("bkashNumber", e.target.value)} />
        )}
        {dst === "nagad" && (
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="01XXXXXXXXX"
            value={form.nagadNumber} onChange={(e) => handle("nagadNumber", e.target.value)} />
        )}
        {dst === "bank" && (
          <>
            <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Account Name"
              value={form.bankAccountName} onChange={(e) => handle("bankAccountName", e.target.value)} />
            <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Account Number"
              value={form.bankAccountNo} onChange={(e) => handle("bankAccountNo", e.target.value)} />
            <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Bank & Branch"
              value={form.bankName} onChange={(e) => handle("bankName", e.target.value)} />
            <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Routing Number (optional)"
              value={form.bankRouting} onChange={(e) => handle("bankRouting", e.target.value)} />
          </>
        )}
        {isEmail && (
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="your@email.com"
            value={form.email} onChange={(e) => handle("email", e.target.value)} />
        )}
        {isUSDT && (
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="TRC20 wallet address"
            value={form.usdtAddress} onChange={(e) => handle("usdtAddress", e.target.value)} />
        )}
        <textarea className="rounded-xl border px-3 py-2 text-sm" placeholder="Any extra note (optional)"
          value={form.note} onChange={(e) => handle("note", e.target.value)} />
      </div>

      <button onClick={save} disabled={saving}
        className="mt-3 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
        {saving ? "Saving..." : "Save destination"}
      </button>
    </div>
  );
}
