"use client";

import Image from "next/image";
import Link from "next/link";
import type { Hero, SubstatId } from "@/lib/types";
import { enums } from "@/lib/data";
import { useLang, useT } from "@/i18n/LangProvider";
import { heroName, enumLabel } from "@/i18n/display";

interface Props {
  hero: Hero;
  /** 매칭 점수 (메인 검색 결과에서만) */
  matchScore?: number;
  matchedEssential?: SubstatId[];
  matchedPreferred?: SubstatId[];
}

const ELEMENT_VAR: Record<string, string> = {
  fire: "var(--el-fire)",
  ice: "var(--el-ice)",
  earth: "var(--el-earth)",
  light: "var(--el-light)",
  dark: "var(--el-dark)",
};

const RARITY_VAR: Record<number, string> = {
  3: "var(--rar-3)",
  4: "var(--rar-4)",
  5: "var(--rar-5)",
};

export function HeroCard({
  hero,
  matchScore,
  matchedEssential = [],
  matchedPreferred = [],
}: Props) {
  const { lang } = useLang();
  const t = useT();
  const elementColor = hero.element ? ELEMENT_VAR[hero.element] : undefined;
  const rarityColor = hero.rarity ? RARITY_VAR[hero.rarity] : undefined;
  const elementLabel = hero.element ? enumLabel(enums.elements[hero.element], lang) : null;
  const classLabel = hero.class ? enumLabel(enums.classes[hero.class], lang) : null;
  const displayName = heroName(hero, lang);
  const showMatch = matchScore !== undefined;
  const matchedCount = matchedEssential.length + matchedPreferred.length;

  return (
    <Link
      href={`/hero/${hero.id}`}
      className="group flex flex-col rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors overflow-hidden"
    >
      <div className="relative aspect-square w-full bg-[var(--bg-input)]">
        {hero.image?.icon ? (
          <Image
            src={hero.image.icon}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-xs">
            no image
          </div>
        )}

        {/* 등급 표시 (좌상단) */}
        {hero.rarity && (
          <div
            className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium tabular bg-[var(--bg-base)]/85"
            style={{ color: rarityColor }}
          >
            {hero.rarity}★
          </div>
        )}

        {/* 속성 표시 (우상단 도트) */}
        {elementColor && (
          <div
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: elementColor }}
            title={elementLabel ?? undefined}
          />
        )}

        {/* 매칭 점수 (검색 결과) */}
        {showMatch && (
          <div className="absolute top-1 right-5 px-1.5 py-0.5 text-[10px] font-medium tabular bg-[var(--bg-base)]/85 text-[var(--accent)]">
            {matchScore}
          </div>
        )}

        {/* 미등록 배지 */}
        {!hero.has_data && (
          <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)] bg-[var(--bg-base)]/85 text-center">
            {t("unregistered")}
          </div>
        )}
      </div>

      <div className="p-2 min-w-0">
        <div className="text-sm text-[var(--text-primary)] truncate group-hover:text-white">
          {displayName}
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
          {[elementLabel, classLabel].filter(Boolean).join(" · ")}
        </div>

        {/* 매칭된 부옵 라벨 (검색 결과에서만) */}
        {showMatch && matchedCount > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {matchedEssential.map((s) => (
              <span
                key={`e-${s}`}
                className="text-[10px] px-1.5 py-0.5 rounded-sm border"
                style={{
                  color: "var(--essential)",
                  borderColor:
                    "color-mix(in srgb, var(--essential) 35%, transparent)",
                }}
                title={t("level_essential")}
              >
                {enumLabel(enums.substats[s], lang)}
              </span>
            ))}
            {matchedPreferred.map((s) => (
              <span
                key={`p-${s}`}
                className="text-[10px] px-1.5 py-0.5 rounded-sm border"
                style={{
                  color: "var(--preferred)",
                  borderColor:
                    "color-mix(in srgb, var(--preferred) 35%, transparent)",
                }}
                title={t("level_preferred")}
              >
                {enumLabel(enums.substats[s], lang)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
