"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

const links: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/exchange", label: "Exchange" },
  { href: "/support", label: "Support" },
];

function DesktopNavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "relative text-sm transition-colors focus:outline-none",
        active ? "text-gray-900" : "text-gray-700 hover:text-gray-900",
        "focus-visible:ring-2 focus-visible:ring-black/10 rounded-md px-1 py-0.5",
      ].join(" ")}
    >
      <span className="relative">
        {label}
        <span
          className={[
            "absolute left-0 -bottom-1 h-[2px] w-full origin-left rounded-full transition-transform duration-300",
            active ? "scale-x-100 bg-gray-900" : "scale-x-0 bg-gray-300 group-hover:scale-x-100",
          ].join(" ")}
        />
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]); // close on route change

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md",
        "transition-shadow",
        scrolled
          ? "border-black/5 shadow-[0_6px_24px_-10px_rgba(0,0,0,.25)]"
          : "border-black/5 shadow-[0_2px_12px_-6px_rgba(0,0,0,.12)]",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-6 py-4">
        {/* logo area (chip) */}
        <Link href="/" className="group flex items-center gap-2 md:gap-3">
          <span
            className=""
            aria-label="XchangxAI logo"
          >
            <img
              src="/logo.png"
              alt="XchangxAI Logo"
              className="h-7 w-7 md:h-8 md:w-8 object-contain drop-shadow-lg"
              style={{ filter: "brightness(1.08) saturate(1.25)" }}
            />
          </span>
          <div className="">
            <span className="text-[12px] md:text-[20px] font-bold tracking-tight text-gray-900">
              XchangxAI
            </span>
          </div>
        </Link>

        {/* desktop menu */}
        <nav className="hidden items-center gap-7 md:flex">
          <div className="group flex items-center gap-7">
            {links.map((l) => (
              <DesktopNavItem key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
            ))}
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 rounded-md px-2 py-1"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            Register
          </Link>
        </nav>

        {/* mobile menu button */}
        <button
          className="md:hidden rounded-lg p-2 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Menu"
          aria-expanded={open}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" className="stroke-gray-900" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "rounded-lg px-2 py-2 text-[15px] transition",
                  pathname === l.href ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-gray-200" />
            <Link href="/login" className="rounded-lg px-2 py-2 text-[15px] hover:bg-gray-50">
              Login
            </Link>
            <Link
              href="/register"
              className="mt-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-[15px] font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
