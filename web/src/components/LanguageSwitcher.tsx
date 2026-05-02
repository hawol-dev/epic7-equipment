"use client";

import { useLang } from "@/i18n/LangProvider";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div
      className="inline-flex items-center text-xs border border-[var(--border-default)] rounded-sm overflow-hidden"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("ko")}
        aria-pressed={lang === "ko"}
        className={
          "px-2 py-1 transition-colors " +
          (lang === "ko"
            ? "bg-[var(--text-primary)] text-[var(--text-inverse)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")
        }
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={
          "px-2 py-1 transition-colors border-l border-[var(--border-default)] " +
          (lang === "en"
            ? "bg-[var(--text-primary)] text-[var(--text-inverse)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")
        }
      >
        EN
      </button>
    </div>
  );
}
