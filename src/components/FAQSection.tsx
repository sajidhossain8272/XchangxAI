/* components/FAQSection.tsx */
"use client";

import { useEffect, useState } from "react";
import API from "@/../apilist";

type Faq = {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
};

export function FAQSection() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(API.FAQS, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load FAQs");
      setItems(json.items || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="mx-auto mt-12 max-w-5xl px-4">
      <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Frequently Asked Questions</h2>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : err ? (
        <div className="rounded-xl bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-100">
          {err}{" "}
          <button
            className="ml-2 rounded-md bg-amber-600 px-2 py-0.5 text-[11px] text-white"
            onClick={load}
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
          {items.map((f) => (
            <li key={f._id} className="py-4">
              <div className="text-[15px] font-semibold text-gray-900">{f.question}</div>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{f.answer}</p>
            </li>
          ))}
          {items.length === 0 && <li className="py-4 text-sm text-gray-500">No FAQs yet.</li>}
        </ul>
      )}
    </section>
  );
}
