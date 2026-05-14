"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "./Chip";
import { HeroCard } from "./HeroCard";
import { SortSelect } from "./SortSelect";
import { heroes, enums } from "@/lib/data";
import { matchHeroes } from "@/lib/matching";
import { useT, useLang } from "@/i18n/LangProvider";
import { enumLabel } from "@/i18n/display";
import type { MessageKey } from "@/i18n/messages";

type SortKey = "score" | "rarity" | "name" | "speed";
const SORT_KEYS: Array<{ value: SortKey; msg: MessageKey }> = [
  { value: "score",  msg: "sort_score" },
  { value: "rarity", msg: "sort_rarity" },
  { value: "name",   msg: "sort_name" },
  { value: "speed",  msg: "sort_speed" },
];
import type {
  SubstatId,
  SetId,
  ElementId,
  ClassId,
  ContentTag,
} from "@/lib/types";

const SUBSTAT_ORDER: SubstatId[] = [
  "spd", "atk_p", "hp_p", "def_p",
  "chc", "chd", "eff", "effres",
];

const CONTENT_ORDER: ContentTag[] = ["pve", "pvp"];

const CONTENT_LABEL: Record<ContentTag, MessageKey> = {
  pve: "content_pve",
  pvp: "content_pvp",
};

const ELEMENT_VAR: Record<ElementId, string> = {
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

function parseList<T extends string>(
  raw: string | null,
  allowed: readonly T[]
): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

// 24의 배수 — 그리드 컬럼 수 (3/4/6/8) 모두에서 마지막 줄 꽉 참
const PAGE_SIZE = 72;

export function GearSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const t = useT();
  const { lang } = useLang();
  const SORT_OPTIONS = SORT_KEYS.map((o) => ({ value: o.value, label: t(o.msg) }));

  const allSubstats = SUBSTAT_ORDER;
  const allSets = Object.keys(enums.sets) as SetId[];
  const allElements = Object.keys(enums.elements) as ElementId[];
  const allClasses = Object.keys(enums.classes) as ClassId[];
  const allRarities = [3, 4, 5];

  const selectedSets = parseList(params.get("set"), allSets);
  const selectedSubs = parseList(params.get("sub"), allSubstats);
  const selectedElements = parseList(params.get("el"), allElements);
  const selectedClasses = parseList(params.get("cl"), allClasses);
  const selectedRarities = (params.get("rar") || "")
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => allRarities.includes(n));
  const selectedContents = parseList(params.get("ct"), CONTENT_ORDER);
  const sortKey: SortKey =
    (SORT_OPTIONS.find((o) => o.value === params.get("sort"))?.value as SortKey)
    ?? "score";

  const updateParam = (key: string, values: (string | number)[]) => {
    const next = new URLSearchParams(params.toString());
    if (values.length === 0) next.delete(key);
    else next.set(key, values.join(","));
    router.replace("?" + next.toString(), { scroll: false });
    setVisible(PAGE_SIZE);
  };

  const toggleSet = (id: SetId) => {
    const cur = new Set(selectedSets);
    if (cur.has(id)) cur.delete(id);
    else if (cur.size < 3) cur.add(id);
    updateParam("set", Array.from(cur));
  };
  const toggleSub = (id: SubstatId) => {
    const cur = new Set(selectedSubs);
    if (cur.has(id)) cur.delete(id);
    else if (cur.size < 4) cur.add(id);
    updateParam("sub", Array.from(cur));
  };
  const toggleElement = (id: ElementId) => {
    const cur = new Set(selectedElements);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    updateParam("el", Array.from(cur));
  };
  const toggleClass = (id: ClassId) => {
    const cur = new Set(selectedClasses);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    updateParam("cl", Array.from(cur));
  };
  const toggleRarity = (n: number) => {
    const cur = new Set(selectedRarities);
    if (cur.has(n)) cur.delete(n);
    else cur.add(n);
    updateParam("rar", Array.from(cur));
  };

  const toggleContent = (id: ContentTag) => {
    const cur = new Set(selectedContents);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    updateParam("ct", Array.from(cur));
  };

  const reset = () => {
    router.replace("/", { scroll: false });
    setVisible(PAGE_SIZE);
  };

  const hasInput =
    selectedSets.length + selectedSubs.length +
    selectedElements.length + selectedClasses.length +
    selectedRarities.length + selectedContents.length > 0;

  const results = useMemo(() => {
    if (!hasInput) return [];
    const matched = matchHeroes(heroes, {
      sets: selectedSets,
      substats: selectedSubs,
      elements: selectedElements.length ? selectedElements : undefined,
      classes: selectedClasses.length ? selectedClasses : undefined,
      rarities: selectedRarities.length ? selectedRarities : undefined,
      contents: selectedContents.length ? selectedContents : undefined,
    });
    if (sortKey === "score") return matched;  // matchHeroes 기본 정렬
    return [...matched].sort((a, b) => {
      if (sortKey === "rarity") {
        const ar = a.hero.rarity ?? 0, br = b.hero.rarity ?? 0;
        if (ar !== br) return br - ar;
        return a.hero.names.ko.localeCompare(b.hero.names.ko, "ko");
      }
      if (sortKey === "name") {
        return a.hero.names.ko.localeCompare(b.hero.names.ko, "ko");
      }
      if (sortKey === "speed") {
        const av = a.hero.base_stats?.lv60_6?.spd ?? a.hero.base_stats?.lv50_5?.spd ?? 0;
        const bv = b.hero.base_stats?.lv60_6?.spd ?? b.hero.base_stats?.lv50_5?.spd ?? 0;
        if (av !== bv) return bv - av;
        return a.hero.names.ko.localeCompare(b.hero.names.ko, "ko");
      }
      return 0;
    });
  }, [
    hasInput,
    selectedSets.join(","),
    selectedSubs.join(","),
    selectedElements.join(","),
    selectedClasses.join(","),
    selectedRarities.join(","),
    selectedContents.join(","),
    sortKey,
  ]);

  const shown = results.slice(0, visible);
  const hasMore = visible < results.length;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 검색 입력 영역 */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-3 md:p-5">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            {t("field_input")}
          </h2>
          {hasInput && (
            <button
              onClick={reset}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              {t("reset")}
            </button>
          )}
        </div>

        <Field label={t("field_set")} hint={t("hint_max3")}>
          <div className="flex flex-wrap gap-1.5">
            {allSets.map((id) => (
              <Chip
                key={id}
                label={enumLabel(enums.sets[id], lang)}
                selected={selectedSets.includes(id)}
                onToggle={() => toggleSet(id)}
                title={(() => {
                  const s = enums.sets[id];
                  const label = enumLabel(s, lang);
                  const effect = lang === "en" ? (s.effect_en || s.effect) : s.effect;
                  return `${label} (${s.pieces})${effect ? ` — ${effect}` : ""}`;
                })()}
              />
            ))}
          </div>
        </Field>

        <Field label={t("field_substat")} hint={t("hint_max4")}>
          <div className="flex flex-wrap gap-1.5">
            {allSubstats.map((id) => (
              <Chip
                key={id}
                label={enumLabel(enums.substats[id], lang)}
                selected={selectedSubs.includes(id)}
                onToggle={() => toggleSub(id)}
              />
            ))}
          </div>
        </Field>

        <details
          className="mt-2 group"
          open={selectedElements.length + selectedClasses.length + selectedRarities.length + selectedContents.length > 0}
        >
          <summary className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none mb-2 hover:text-[var(--text-primary)]">
            <span className="inline-block w-3 transition-transform group-open:rotate-90">
              ›
            </span>
            {t("hero_filter_optional")}
            {(selectedElements.length + selectedClasses.length + selectedRarities.length + selectedContents.length) > 0 && (
              <span className="ml-1 text-[var(--accent)] tabular">
                {selectedElements.length + selectedClasses.length + selectedRarities.length + selectedContents.length}
              </span>
            )}
          </summary>
          <div className="space-y-3 pt-1">
            <Field label={t("field_element")} inline>
              <div className="flex flex-wrap gap-1.5">
                {allElements.map((id) => (
                  <Chip
                    key={id}
                    label={enumLabel(enums.elements[id], lang)}
                    selected={selectedElements.includes(id)}
                    onToggle={() => toggleElement(id)}
                    accent={ELEMENT_VAR[id]}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
            <Field label={t("field_class")} inline>
              <div className="flex flex-wrap gap-1.5">
                {allClasses.map((id) => (
                  <Chip
                    key={id}
                    label={enumLabel(enums.classes[id], lang)}
                    selected={selectedClasses.includes(id)}
                    onToggle={() => toggleClass(id)}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
            <Field label={t("field_rarity")} inline>
              <div className="flex flex-wrap gap-1.5">
                {allRarities.map((n) => (
                  <Chip
                    key={n}
                    label={`${n}★`}
                    selected={selectedRarities.includes(n)}
                    onToggle={() => toggleRarity(n)}
                    accent={RARITY_VAR[n]}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
            <Field label={t("field_content")} inline>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_ORDER.map((id) => (
                  <Chip
                    key={id}
                    label={t(CONTENT_LABEL[id])}
                    selected={selectedContents.includes(id)}
                    onToggle={() => toggleContent(id)}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
          </div>
        </details>
      </section>

      {/* 결과 */}
      <section>
        {!hasInput ? (
          <div className="text-center py-12 md:py-16 text-sm text-[var(--text-muted)]">
            {t("no_input_hint")}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-sm text-[var(--text-muted)]">
            {t("no_results")}
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-3 gap-3">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">
                {t("matched_results")}{" "}
                <span className="tabular text-[var(--text-muted)] text-xs">
                  {results.length}{t("unit_heroes")}
                </span>
                {results.length > PAGE_SIZE && (
                  <span className="ml-2 text-xs text-[var(--text-muted)] tabular">
                    ({Math.min(visible, results.length)} / {results.length})
                  </span>
                )}
              </h2>
              <SortSelect
                value={sortKey}
                options={SORT_OPTIONS}
                label={t("sort_label")}
                onChange={(v) =>
                  updateParam("sort", v === "score" ? [] : [v])
                }
              />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
              {shown.map((r) => (
                <HeroCard
                  key={r.hero.id}
                  hero={r.hero}
                  matchScore={r.score}
                  matchedEssential={r.matchedEssential}
                  matchedPreferred={r.matchedPreferred}
                />
              ))}
            </div>
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="px-4 py-2 text-sm rounded-sm border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                >
                  {t("load_more")} (+{Math.min(PAGE_SIZE, results.length - visible)})
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  inline,
  children,
}: {
  label: string;
  hint?: string;
  inline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={inline ? "flex items-start gap-3" : "mb-3 md:mb-4 last:mb-0"}>
      <div
        className={
          (inline ? "w-10 shrink-0 mt-1" : "mb-1.5") +
          " text-xs text-[var(--text-secondary)]"
        }
      >
        {label}
        {hint && !inline && (
          <span className="ml-2 text-[var(--text-muted)]">{hint}</span>
        )}
      </div>
      <div className={inline ? "flex-1" : ""}>{children}</div>
    </div>
  );
}
