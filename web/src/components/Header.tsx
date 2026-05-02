"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "장비 검색" },
  { href: "/heroes", label: "영웅" },
  { href: "/sets", label: "세트" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-[var(--text-primary)] font-semibold tracking-tight text-[15px]"
        >
          E7 장비 가이드
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "px-3 py-1.5 rounded-sm transition-colors " +
                  (active
                    ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
