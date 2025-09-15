"use client";

import React, { useEffect, useState } from "react";
import API from "@/../apilist";

type Review = {
  _id: string;
  name: string;
  comment: string;
  rating: number; // 1-5
  createdAt?: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const res = await fetch(`${API.REVIEWS}?limit=3`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || !json.ok)
          throw new Error(json.error || "Failed to load reviews");
        if (mounted) setItems(json.items || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load reviews");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className='rounded-3xl bg-white/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900'>
        Customer Reviews
      </h3>

      {loading && (
        <ul className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <li key={i} className='h-20 animate-pulse rounded-xl bg-gray-100' />
          ))}
        </ul>
      )}

      {!loading && err && (
        <div className='rounded-xl bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-100'>
          {err}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className='rounded-xl border bg-white p-3 text-sm text-gray-600'>
          No reviews yet.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <ul className='space-y-4'>
          {items.map((r) => (
            <li
              key={r._id}
              className='rounded-xl border border-gray-100 bg-white/80 p-3 shadow-sm'
            >
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-900'>
                  {r.name}
                </span>
                {r.createdAt && (
                  <span className='text-xs text-gray-400'>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className='mt-1 text-sm text-gray-700'>{r.comment}</p>
              <div className='mt-1'>
                <Stars rating={r.rating} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
