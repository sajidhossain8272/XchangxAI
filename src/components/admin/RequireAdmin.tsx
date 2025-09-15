// components/admin/RequireAdmin.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import API from "@/../apilist";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API.ADMIN_ME, { credentials: "include" });
        const ok = res.ok ? (await res.json())?.ok : false;
        if (!ok && !cancelled) {
          router.replace("/admin/login?next=" + encodeURIComponent(pathname));
          return;
        }
      } catch {
        if (!cancelled) {
          router.replace("/admin/login?next=" + encodeURIComponent(pathname));
          return;
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (checking) return <div className="p-6">Checking session…</div>;
  return <>{children}</>;
}
