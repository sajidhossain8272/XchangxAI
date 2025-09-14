"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const items = [
  { href: "/admin/reserve", label: "Reserves" },
  { href: "/admin/settings", label: "Settings (stub)" },
  { href: "/admin/trades", label: "Trades (stub)" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full max-w-[220px] shrink-0 rounded-xl border bg-white p-3">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Admin</h3>
      <nav className="space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
