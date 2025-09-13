// app/exchange/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Suspense } from "react";
import ExchangeClient from "./ExchangeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200">
            <p className="text-sm text-gray-600">Loading exchange…</p>
          </div>
        </main>
      }
    >
      <ExchangeClient />
    </Suspense>
  );
}
