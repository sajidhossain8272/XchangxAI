// app/admin/(protected)/layout.tsx
"use client";

import React from "react";
import RequireAdmin from "@/components/admin/RequireAdmin";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex gap-4">
          <AdminSidebar />
          <div className="flex-1 rounded-xl border bg-white p-4">{children}</div>
        </div>
      </div>
    </RequireAdmin>
  );
}
