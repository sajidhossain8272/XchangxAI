/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import API from "@/../apilist";

type Review = { _id?: string; name: string; comment: string; rating: number; published?: boolean };

export default function AdminReviewsPage() {
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<Review>({ name: "", comment: "", rating: 5, published: true });
  const [saving, setSaving] = useState(false);

  async function ensureAuthed() {
    const res = await fetch(API.ADMIN_ME, { credentials: "include" });
    if (!res.ok) window.location.href = "/admin/login";
  }

  async function load() {
    setLoading(true);
    const res = await fetch(API.ADMIN_REVIEWS, { credentials: "include", cache: "no-store" });
    const json = await res.json();
    if (res.ok && json.ok) setList(json.items || []);
    setLoading(false);
  }

  useEffect(() => {
    ensureAuthed().then(load);
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(API.ADMIN_REVIEW_UPSERT, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      setForm({ name: "", comment: "", rating: 5, published: true });
      await load();
      setMsg("Saved!");
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(API.ADMIN_REVIEW_DELETE(id), {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    if (res.ok && json.ok) load();
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Reviews</h1>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-semibold">Add / Edit Review</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="rounded-md border px-3 py-2"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                Rating {n}
              </option>
            ))}
          </select>
          <textarea
            className="sm:col-span-2 min-h-[90px] rounded-md border px-3 py-2"
            placeholder="Comment"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published ?? true}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-3 rounded-md bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <div className="mt-2 text-sm text-gray-600">{msg}</div>}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 font-semibold">All Reviews</h2>
        {loading ? (
          <div className="h-24 animate-pulse rounded-md bg-gray-100" />
        ) : list.length === 0 ? (
          <div className="rounded-md border bg-white p-3 text-sm text-gray-600">No reviews yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Rating</th>
                  <th className="py-2">Published</th>
                  <th className="py-2">Comment</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={String(r._id)} className="border-b last:border-0">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.rating}</td>
                    <td className="py-2">{(r as any).published ? "Yes" : "No"}</td>
                    <td className="py-2">{r.comment}</td>
                    <td className="py-2 text-right">
                      <button
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() => setForm({
                          _id: r._id,
                          name: r.name,
                          comment: r.comment,
                          rating: r.rating,
                          published: (r as any).published ?? true,
                        })}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-2 rounded-md border px-2 py-1 text-xs text-red-600"
                        onClick={() => del(String(r._id))}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
