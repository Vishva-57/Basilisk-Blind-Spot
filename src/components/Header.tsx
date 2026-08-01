"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
      pathname === href
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
        : "text-slate-700 hover:bg-white hover:text-emerald-700 hover:shadow-sm"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-emerald-200 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
            aria-hidden="true"
          >
            B
          </span>
          <span className="text-lg font-black tracking-tight text-slate-950">
            Basilisk
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <ul className="flex gap-1">
            <li>
              <Link href="/" className={linkClass("/")}>
                Scan
              </Link>
            </li>
            <li>
              <Link href="/history" className={linkClass("/history")}>
                History
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
