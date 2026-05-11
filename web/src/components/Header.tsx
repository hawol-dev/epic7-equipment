"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/LangProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState(false);

  const NAV = [
    { href: "/",       label: t("nav_search") },
    { href: "/heroes", label: t("nav_heroes") },
    { href: "/sets",   label: t("nav_sets") },
    { href: "/help",   label: t("nav_help") },
  ];

  // 라우트 바뀌면 모바일 메뉴 자동 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-[var(--text-primary)] font-semibold tracking-tight text-[15px] shrink-0"
        >
          {t("site_short")}
        </Link>

        {/* 데스크탑 nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "px-3 py-1.5 rounded-sm transition-colors " +
                (isActive(item.href)
                  ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]")
              }
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-2">
            <LanguageSwitcher />
          </div>
        </nav>

        {/* 모바일: 언어 + 햄버거 */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {open && (
        <nav className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="max-w-[1400px] mx-auto px-4 py-2 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "px-3 py-2.5 text-sm rounded-sm " +
                  (isActive(item.href)
                    ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  // 18×14 깔끔한 3줄 / X 토글 (CSS 트랜지션)
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      <line
        x1="3" y1="6" x2="17" y2="6"
        style={{
          transformOrigin: "10px 6px",
          transform: open ? "translateY(4px) rotate(45deg)" : "none",
          transition: "transform 0.2s ease",
        }}
      />
      <line
        x1="3" y1="10" x2="17" y2="10"
        style={{
          opacity: open ? 0 : 1,
          transition: "opacity 0.15s ease",
        }}
      />
      <line
        x1="3" y1="14" x2="17" y2="14"
        style={{
          transformOrigin: "10px 14px",
          transform: open ? "translateY(-4px) rotate(-45deg)" : "none",
          transition: "transform 0.2s ease",
        }}
      />
    </svg>
  );
}
