"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/../apilist";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API.ADMIN_ME, { credentials: "include" });
        const json = await res.json();
        setOk(Boolean(json?.ok));
        if (!json?.ok) router.replace("/admin/login");
      } finally {
        setChecked(true);
      }
    })();
  }, [router]);

  if (!checked) return <div className="p-6">Checking session…</div>;
  return ok ? <>{children}</> : null;
}
