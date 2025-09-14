"use client";

import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex gap-4">
        <AdminSidebar />
        <div className="flex-1 rounded-xl border bg-white p-4">{children}</div>
      </div>
    </div>
  );
}
