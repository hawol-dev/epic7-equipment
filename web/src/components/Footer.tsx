"use client";

import { useT, useLang } from "@/i18n/LangProvider";

export function Footer() {
  const t = useT();
  const { lang } = useLang();

  return (
    <footer className="border-t border-[var(--border-subtle)] mt-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 text-xs text-[var(--text-muted)] leading-relaxed">
        <p>
          {t("footer_text")} ·{" "}
          {lang === "ko" ? (
            <>
              유효옵 데이터 출처: 디시인사이드 에픽세븐 마이너 갤러리 시트.
              이미지: Smilegate / Epic Seven (
              <a
                href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-secondary)]"
              >
                Fribbels Optimizer
              </a>
              {" "}경유).
            </>
          ) : (
            <>
              Substat data: DCInside Epic Seven Gallery community sheet.
              Images: Smilegate / Epic Seven (via{" "}
              <a
                href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-secondary)]"
              >
                Fribbels Optimizer
              </a>
              ).
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
