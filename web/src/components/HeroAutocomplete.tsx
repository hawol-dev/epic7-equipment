"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { heroes } from "@/lib/data";
import { SearchInput } from "./SearchInput";

interface Props {
  /** URL 동기화용 현재 값 */
  value: string;
  /** 디바운스된 변경값 (URL에 반영) — 외부 필터에 사용 */
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  /** 자동완성 결과 클릭 시 동작. 기본은 영웅 상세 페이지로 이동 */
  onSelect?: (heroId: string) => void;
  maxResults?: number;
}

/**
 * 영웅 이름 자동완성 dropdown.
 * - SearchInput (한글 IME 안전)을 베이스로 사용
 * - 입력값 기반 suggestion (한글 ko + 영문 en)
 * - 키보드 ↑/↓/Enter, Esc로 닫기
 */
export function HeroAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  onSelect,
  maxResults = 8,
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [localQuery, setLocalQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // SearchInput의 onChange는 디바운스됨 — URL 갱신용
  // 자동완성용 immediate 값을 위해 별도 추적
  useEffect(() => {
    setLocalQuery(value);
  }, [value]);

  const suggestions = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    if (!q) return [];
    const out = [];
    for (const h of heroes) {
      const ko = h.names.ko.toLowerCase();
      const en = (h.names.en || "").toLowerCase();
      if (ko.includes(q) || en.includes(q)) {
        // 정확한 prefix match를 우선
        const score = ko.startsWith(q) || en.startsWith(q) ? 0 : 1;
        out.push({ hero: h, score });
        if (out.length >= maxResults * 2) break;  // 1차 컷
      }
    }
    return out
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.hero.names.ko.localeCompare(b.hero.names.ko, "ko");
      })
      .slice(0, maxResults)
      .map((x) => x.hero);
  }, [localQuery, maxResults]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = suggestions[active];
      if (sel) {
        if (onSelect) onSelect(sel.id);
        else window.location.href = `/hero/${sel.id}`;
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <SearchInput
        value={value}
        onChange={(v) => {
          setLocalQuery(v);
          setActive(0);
          setOpen(true);
          onChange(v);
        }}
        placeholder={placeholder}
        className={className}
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-sm shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((h, i) => (
            <li
              key={h.id}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              className={
                "list-none " +
                (i === active ? "bg-[var(--bg-input)]" : "")
              }
            >
              <Link
                href={`/hero/${h.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--text-primary)] hover:text-white"
              >
                {h.image?.icon ? (
                  <Image
                    src={h.image.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-sm shrink-0"
                  />
                ) : (
                  <span className="w-7 h-7 bg-[var(--bg-input)] rounded-sm shrink-0" />
                )}
                <span className="flex-1 min-w-0 truncate">{h.names.ko}</span>
                {h.names.en && (
                  <span className="text-[11px] text-[var(--text-muted)] truncate shrink-0">
                    {h.names.en}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
