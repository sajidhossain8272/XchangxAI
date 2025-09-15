// app/admin/(protected)/faq/page.tsx
"use client";

import { useEffect, useState } from "react";
import API from "@/../apilist";

type Faq = {
  _id?: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
};

export default function AdminFaqPage() {
  const [list, setList] = useState<Faq[]>([]);
  const [form, setForm] = useState<Faq>({ question: "", answer: "", order: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(API.ADMIN_FAQS, { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.ok) setList(json.items || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function editRow(f: Faq) {
    setForm({ ...f });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(API.ADMIN_FAQ_UPSERT, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      setMsg("Saved!");
      setForm({ question: "", answer: "", order: 0, isActive: true });
      await load();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Delete this FAQ?")) return;
    const res = await fetch(API.ADMIN_FAQ_DELETE(id), {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    if (res.ok && json.ok) await load();
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">FAQs</h1>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-semibold">{form._id ? "Edit FAQ" : "Add FAQ"}</h2>
        <div className="grid gap-3">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Question"
            value={form.question}
            onChange={(e) => setForm((s) => ({ ...s, question: e.target.value }))}
          />
          <textarea
            className="rounded-md border px-3 py-2"
            placeholder="Answer"
            rows={4}
            value={form.answer}
            onChange={(e) => setForm((s) => ({ ...s, answer: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-md border px-3 py-2"
              type="number"
              placeholder="Order"
              value={form.order}
              onChange={(e) => setForm((s) => ({ ...s, order: Number(e.target.value || 0) }))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {form._id && (
            <button
              onClick={() => setForm({ question: "", answer: "", order: 0, isActive: true })}
              className="rounded-md border px-4 py-2"
            >
              Cancel edit
            </button>
          )}
        </div>
        {msg && <div className="mt-2 text-sm text-gray-600">{msg}</div>}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-semibold">All FAQs</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Order</th>
                  <th className="py-2">Question</th>
                  <th className="py-2">Active</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f._id} className="border-b last:border-0">
                    <td className="py-2">{f.order}</td>
                    <td className="py-2">{f.question}</td>
                    <td className="py-2">{f.isActive ? "Yes" : "No"}</td>
                    <td className="py-2 text-right">
                      <button
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() => editRow(f)}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-2 rounded-md border px-2 py-1 text-xs text-red-600"
                        onClick={() => remove(f._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td className="py-2" colSpan={4}>
                      No FAQs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
