"use client";

import { useT } from "@/i18n/LangProvider";
import type { MessageKey } from "@/i18n/messages";

interface Props {
  titleKey: MessageKey;
  subtitleKey?: MessageKey;
}

export function PageHeader({ titleKey, subtitleKey }: Props) {
  const t = useT();
  return (
    <header className="mb-6 md:mb-8">
      <h1 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
        {t(titleKey)}
      </h1>
      {subtitleKey && (
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t(subtitleKey)}
        </p>
      )}
    </header>
  );
}
