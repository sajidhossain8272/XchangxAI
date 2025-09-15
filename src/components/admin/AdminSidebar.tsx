// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import API from "@/../apilist";

const links = [
  { href: "/admin/reserve", label: "Reserves" },
  { href: "/admin/faq", label: "FAQs" }, 
  { href: "/admin/settings", label: "Settings (coming soon)" },
  { href: "/admin/trades", label: "Trades (coming soon)" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch(API.ADMIN_LOGOUT, { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-60 shrink-0 rounded-xl border bg-white p-4">
      <div className="mb-4 text-lg font-semibold">XchangXAI Admin</div>
      <nav className="space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active ? "bg-gray-900 text-white" : "hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="mt-6 w-full rounded-md border px-3 py-2 text-sm"
      >
        Logout
      </button>
    </aside>
  );
}
