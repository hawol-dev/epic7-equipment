"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "./Chip";
import { HeroCard } from "./HeroCard";
import { heroes, enums } from "@/lib/data";
import { matchHeroes } from "@/lib/matching";
import type {
  SubstatId,
  SetId,
  ElementId,
  ClassId,
} from "@/lib/types";

const SUBSTAT_ORDER: SubstatId[] = [
  "spd", "atk_p", "hp_p", "def_p",
  "chc", "chd", "eff", "effres",
];

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

  const reset = () => {
    router.replace("/", { scroll: false });
    setVisible(PAGE_SIZE);
  };

  const hasInput =
    selectedSets.length + selectedSubs.length +
    selectedElements.length + selectedClasses.length +
    selectedRarities.length > 0;

  const results = useMemo(() => {
    if (!hasInput) return [];
    return matchHeroes(heroes, {
      sets: selectedSets,
      substats: selectedSubs,
      elements: selectedElements.length ? selectedElements : undefined,
      classes: selectedClasses.length ? selectedClasses : undefined,
      rarities: selectedRarities.length ? selectedRarities : undefined,
    });
  }, [
    hasInput,
    selectedSets.join(","),
    selectedSubs.join(","),
    selectedElements.join(","),
    selectedClasses.join(","),
    selectedRarities.join(","),
  ]);

  const shown = results.slice(0, visible);
  const hasMore = visible < results.length;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 검색 입력 영역 */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-3 md:p-5">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            장비 입력
          </h2>
          {hasInput && (
            <button
              onClick={reset}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              초기화
            </button>
          )}
        </div>

        <Field label="세트" hint="최대 3개">
          <div className="flex flex-wrap gap-1.5">
            {allSets.map((id) => (
              <Chip
                key={id}
                label={enums.sets[id].ko}
                selected={selectedSets.includes(id)}
                onToggle={() => toggleSet(id)}
                title={`${enums.sets[id].ko} (${enums.sets[id].pieces}세트) — ${enums.sets[id].effect ?? ""}`}
              />
            ))}
          </div>
        </Field>

        <Field label="부옵션" hint="최대 4개">
          <div className="flex flex-wrap gap-1.5">
            {allSubstats.map((id) => (
              <Chip
                key={id}
                label={enums.substats[id].ko}
                selected={selectedSubs.includes(id)}
                onToggle={() => toggleSub(id)}
              />
            ))}
          </div>
        </Field>

        <details className="mt-2 group">
          <summary className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none mb-2 hover:text-[var(--text-primary)]">
            <span className="inline-block w-3 transition-transform group-open:rotate-90">
              ›
            </span>
            영웅 필터 (선택)
            {(selectedElements.length + selectedClasses.length + selectedRarities.length) > 0 && (
              <span className="ml-1 text-[var(--accent)] tabular">
                {selectedElements.length + selectedClasses.length + selectedRarities.length}
              </span>
            )}
          </summary>
          <div className="space-y-3 pt-1">
            <Field label="속성" inline>
              <div className="flex flex-wrap gap-1.5">
                {allElements.map((id) => (
                  <Chip
                    key={id}
                    label={enums.elements[id].ko}
                    selected={selectedElements.includes(id)}
                    onToggle={() => toggleElement(id)}
                    accent={ELEMENT_VAR[id]}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
            <Field label="직업" inline>
              <div className="flex flex-wrap gap-1.5">
                {allClasses.map((id) => (
                  <Chip
                    key={id}
                    label={enums.classes[id].ko}
                    selected={selectedClasses.includes(id)}
                    onToggle={() => toggleClass(id)}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
            <Field label="등급" inline>
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
          </div>
        </details>
      </section>

      {/* 결과 */}
      <section>
        {!hasInput ? (
          <div className="text-center py-12 md:py-16 text-sm text-[var(--text-muted)]">
            세트나 부옵션을 입력하면 매칭 영웅이 표시됩니다.
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-sm text-[var(--text-muted)]">
            조건에 맞는 영웅이 없습니다.
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">
                매칭 결과{" "}
                <span className="tabular text-[var(--text-muted)] text-xs">
                  {results.length}명
                </span>
              </h2>
              {results.length > PAGE_SIZE && (
                <span className="text-xs text-[var(--text-muted)] tabular">
                  {Math.min(visible, results.length)} / {results.length}
                </span>
              )}
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
                  더 보기 (+{Math.min(PAGE_SIZE, results.length - visible)})
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
