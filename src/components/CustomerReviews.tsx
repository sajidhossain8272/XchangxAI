"use client";

import React from "react";

// --------------------------------------------------
// Types
// --------------------------------------------------
interface ReviewItem {
  name: string;
  comment: string;
  rating: number; // 1–5
  date: string;
}

// --------------------------------------------------
// Dummy Reviews
// --------------------------------------------------
const REVIEWS: ReviewItem[] = [
  {
    name: "Rahim U.",
    comment: "Super fast exchange, my PayPal to bKash completed within minutes!",
    rating: 5,
    date: "2 days ago",
  },
  {
    name: "Sadia A.",
    comment: "Best rates compared to other exchangers I used before.",
    rating: 4,
    date: "5 days ago",
  },
  {
    name: "Kamal R.",
    comment: "Very reliable, I trust them for all my crypto cashouts.",
    rating: 5,
    date: "1 week ago",
  },
];

// --------------------------------------------------
// Star Renderer
// --------------------------------------------------
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

// --------------------------------------------------
// Customer Reviews Component
// --------------------------------------------------
export default function CustomerReviews() {
  return (
    <aside className="rounded-3xl bg-white/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Reviews</h3>
      <ul className="space-y-4">
        {REVIEWS.map((r, idx) => (
          <li key={idx} className="rounded-xl border border-gray-100 bg-white/80 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{r.name}</span>
              <span className="text-xs text-gray-400">{r.date}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
            <div className="mt-1">
              <Stars rating={r.rating} />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
