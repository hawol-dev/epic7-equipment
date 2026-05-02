"use client";

import Link from "next/link";
import { enums, searchIndex, getHeroes } from "@/lib/data";
import type { SetId, Hero } from "@/lib/types";
import { useT, useLang } from "@/i18n/LangProvider";
import { enumLabel, heroName } from "@/i18n/display";

// 4세트 먼저, 다음 2세트. 같은 종류 안에선 사용 영웅 수 내림차순
function sortSets(): SetId[] {
  const ids = Object.keys(enums.sets) as SetId[];
  return ids.sort((a, b) => {
    const ap = enums.sets[a].pieces ?? 0;
    const bp = enums.sets[b].pieces ?? 0;
    if (ap !== bp) return bp - ap;
    const ac = (searchIndex.by_set[a] || []).length;
    const bc = (searchIndex.by_set[b] || []).length;
    if (ac !== bc) return bc - ac;
    return enums.sets[a].ko.localeCompare(enums.sets[b].ko, "ko");
  });
}

export function SetsList() {
  const orderedSets = sortSets();

  return (
    <div className="grid md:grid-cols-2 gap-3 md:gap-4">
      {orderedSets.map((id) => (
        <SetCard key={id} id={id} />
      ))}
    </div>
  );
}

function SetCard({ id }: { id: SetId }) {
  const { lang } = useLang();
  const t = useT();
  const set = enums.sets[id];
  const userIds = searchIndex.by_set[id] || [];
  const users = getHeroes(userIds);

  // 5★ 우선, 가나다순
  const sortedUsers: Hero[] = users.sort((a, b) => {
    const ar = a.rarity ?? 0;
    const br = b.rarity ?? 0;
    if (ar !== br) return br - ar;
    return heroName(a, lang).localeCompare(heroName(b, lang), lang);
  });
  const topUsers = sortedUsers.slice(0, 12);
  const setLabel = enumLabel(set, lang);

  return (
    <article className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 md:p-5 flex flex-col">
      <header className="flex items-baseline justify-between gap-3 mb-2">
        <Link
          href={`/?set=${id}`}
          className="text-base font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
          title={setLabel}
        >
          {setLabel}
          <span className="ml-2 text-xs text-[var(--text-muted)] tabular">
            {set.pieces}{lang === "en" ? "pc" : "세트"}
          </span>
        </Link>
        <span className="text-xs text-[var(--text-muted)] tabular shrink-0">
          {users.length}{t("unit_heroes") || ""}
        </span>
      </header>

      {(() => {
        const eff = lang === "en" ? (set.effect_en || set.effect) : set.effect;
        return eff ? (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{eff}</p>
        ) : null;
      })()}

      {topUsers.length > 0 && (
        <div className="mt-auto pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] mb-2">
            {lang === "en" ? "Top users" : "대표 영웅"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topUsers.map((h) => (
              <Link
                key={h.id}
                href={`/hero/${h.id}`}
                className="text-xs px-2 py-1 rounded-sm border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              >
                {heroName(h, lang)}
              </Link>
            ))}
            {users.length > topUsers.length && (
              <Link
                href={`/?set=${id}`}
                className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                +{users.length - topUsers.length} →
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
