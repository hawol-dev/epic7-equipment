"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/LangProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const t = useT();

  const NAV = [
    { href: "/",       label: t("nav_search") },
    { href: "/heroes", label: t("nav_heroes") },
    { href: "/sets",   label: t("nav_sets") },
    { href: "/help",   label: t("nav_help") },
  ];

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-[var(--text-primary)] font-semibold tracking-tight text-[15px] shrink-0"
        >
          {t("site_short")}
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
                  "px-2 md:px-3 py-1.5 rounded-sm transition-colors " +
                  (active
                    ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
