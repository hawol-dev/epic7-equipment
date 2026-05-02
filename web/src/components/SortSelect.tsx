"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  label?: string;
}

export function SortSelect({ value, options, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      {label && <span>{label}</span>}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center justify-between gap-1.5 w-full min-w-[140px] bg-[var(--bg-input)] border border-[var(--border-default)] rounded-sm px-2 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:border-[var(--focus-ring)]"
        >
          <span>{current?.label}</span>
          <span
            aria-hidden
            className={
              "inline-block text-[var(--text-muted)] transition-transform " +
              (open ? "rotate-180" : "")
            }
          >
            ▾
          </span>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute right-0 left-0 mt-1 z-30 min-w-[140px] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-sm shadow-lg overflow-hidden"
          >
            {options.map((o) => {
              const active = o.value === value;
              return (
                <li key={o.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={
                      "w-full text-left px-3 py-1.5 text-xs transition-colors " +
                      (active
                        ? "bg-[var(--bg-input)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]")
                    }
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
