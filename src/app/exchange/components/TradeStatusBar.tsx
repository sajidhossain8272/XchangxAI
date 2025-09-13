/* app/exchange/components/TradeStatusBar.tsx */
"use client";

import type { TradeStatus } from "../shared";

export default function TradeStatusBar({
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
            <div className={`h-6 rounded-full px-3 text-xs font-semibold leading-6 ${
              i <= currentIdx ? "bg-lime-500 text-white" : "bg-gray-200 text-gray-700"}`}>
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="h-0.5 w-6 bg-gray-300" />}
          </div>
        ))}
      </div>

      {status === "Started" && (
        <button onClick={onMarkPaid}
          className="mt-3 rounded-xl bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700">
          I have paid — mark as Pending
        </button>
      )}

      {status === "Pending" && (
        <p className="mt-2 text-xs text-gray-600">Thanks! We’ll verify and complete your payout shortly.</p>
      )}
    </div>
  );
}
