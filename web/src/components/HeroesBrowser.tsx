"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "./Chip";
import { HeroGrid } from "./HeroGrid";
import { SearchInput } from "./SearchInput";
import { heroes, enums } from "@/lib/data";
import type { ElementId, ClassId, HeroType } from "@/lib/types";

// 24의 배수 — 그리드 컬럼 수 (모바일 3, sm 4, md 6, lg 8) 모두에서 마지막 줄까지 꽉 참
const PAGE_SIZE = 72;

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

// 사용자에게 보여줄 카테고리 필터 (heroes.json의 categories 배열과 매칭)
// 한 영웅이 여러 카테고리에 속할 수 있음 (예: 한정 영웅은 "covenant" + "limited")
const CATEGORY_GROUPS: Array<{
  id: string;
  label: string;
  category: string;
  accent?: string;
}> = [
  { id: "covenant",  label: "성약", category: "covenant",
    accent: "var(--type-standard)" },
  { id: "moonlight", label: "월광", category: "moonlight",
    accent: "var(--type-moonlight)" },
  { id: "limited",   label: "한정", category: "limited",
    accent: "var(--type-limited)" },
  { id: "specialty", label: "전직", category: "specialty",
    accent: "var(--type-specialty)" },
];

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

export function HeroesBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const allElements = Object.keys(enums.elements) as ElementId[];
  const allClasses = Object.keys(enums.classes) as ClassId[];
  const allRarities = [3, 4, 5];
  const allTypeGroups = CATEGORY_GROUPS.map((g) => g.id);

  const selectedElements = parseList(params.get("el"), allElements);
  const selectedClasses = parseList(params.get("cl"), allClasses);
  const selectedRarities = (params.get("rar") || "")
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => allRarities.includes(n));
  const selectedTypeGroups = parseList(params.get("type"), allTypeGroups);
  const query = (params.get("q") || "").trim();

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.replace("?" + next.toString(), { scroll: false });
  };
  const updateList = (key: string, values: (string | number)[]) =>
    updateParam(key, values.length ? values.join(",") : null);

  const toggleArr = <T,>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const reset = () => router.replace("/heroes", { scroll: false });

  const hasFilter =
    selectedElements.length +
      selectedClasses.length +
      selectedRarities.length +
      selectedTypeGroups.length > 0 ||
    query.length > 0;

  const filtered = useMemo(() => {
    // 선택한 그룹들의 카테고리 (영웅이 하나라도 매칭되면 통과 — OR)
    const allowedCategories = new Set<string>();
    for (const groupId of selectedTypeGroups) {
      const g = CATEGORY_GROUPS.find((x) => x.id === groupId);
      if (g) allowedCategories.add(g.category);
    }

    return heroes
      .filter((h) => {
        if (selectedElements.length && (!h.element || !selectedElements.includes(h.element))) return false;
        if (selectedClasses.length && (!h.class || !selectedClasses.includes(h.class))) return false;
        if (selectedRarities.length && (!h.rarity || !selectedRarities.includes(h.rarity))) return false;
        if (allowedCategories.size > 0) {
          const heroCats = new Set(h.categories || []);
          let match = false;
          for (const c of allowedCategories) {
            if (heroCats.has(c)) { match = true; break; }
          }
          if (!match) return false;
        }
        if (query) {
          const q = query.toLowerCase();
          const ko = h.names.ko.toLowerCase();
          const en = (h.names.en || "").toLowerCase();
          if (!ko.includes(q) && !en.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ar = a.rarity ?? 0;
        const br = b.rarity ?? 0;
        if (ar !== br) return br - ar;
        return a.names.ko.localeCompare(b.names.ko, "ko");
      });
  }, [
    selectedElements.join(","),
    selectedClasses.join(","),
    selectedRarities.join(","),
    selectedTypeGroups.join(","),
    query,
  ]);

  // 필터 변경되면 페이지 리셋
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filtered.length]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 필터 패널 */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            필터
          </h2>
          {hasFilter && (
            <button
              onClick={reset}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              초기화
            </button>
          )}
        </div>

        {/* 이름 검색 (한글 IME 안전) */}
        <div className="mb-4">
          <SearchInput
            value={query}
            onChange={(v) => updateParam("q", v || null)}
            placeholder="이름으로 검색 (한글/영문)"
            className="w-full bg-[var(--bg-input)] border border-[var(--border-default)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
          />
        </div>

        <Field label="속성">
          <div className="flex flex-wrap gap-1.5">
            {allElements.map((id) => (
              <Chip
                key={id}
                label={enums.elements[id].ko}
                selected={selectedElements.includes(id)}
                onToggle={() => updateList("el", toggleArr(selectedElements, id))}
                accent={ELEMENT_VAR[id]}
                size="sm"
              />
            ))}
          </div>
        </Field>

        <Field label="직업">
          <div className="flex flex-wrap gap-1.5">
            {allClasses.map((id) => (
              <Chip
                key={id}
                label={enums.classes[id].ko}
                selected={selectedClasses.includes(id)}
                onToggle={() => updateList("cl", toggleArr(selectedClasses, id))}
                size="sm"
              />
            ))}
          </div>
        </Field>

        <Field label="등급">
          <div className="flex flex-wrap gap-1.5">
            {allRarities.map((n) => (
              <Chip
                key={n}
                label={`${n}★`}
                selected={selectedRarities.includes(n)}
                onToggle={() => updateList("rar", toggleArr(selectedRarities, n))}
                accent={RARITY_VAR[n]}
                size="sm"
              />
            ))}
          </div>
        </Field>

        <Field label="타입">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_GROUPS.map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                selected={selectedTypeGroups.includes(g.id)}
                onToggle={() => updateList("type", toggleArr(selectedTypeGroups, g.id))}
                accent={g.accent}
                size="sm"
              />
            ))}
          </div>
        </Field>

      </section>

      {/* 결과 */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            영웅{" "}
            <span className="tabular text-[var(--text-muted)] text-xs">
              {filtered.length}명
            </span>
          </h2>
          {filtered.length > PAGE_SIZE && (
            <span className="text-xs text-[var(--text-muted)] tabular">
              {Math.min(visible, filtered.length)} / {filtered.length}
            </span>
          )}
        </div>
        <HeroGrid heroes={shown} emptyMessage="조건에 맞는 영웅이 없습니다." />
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="px-4 py-2 text-sm rounded-sm border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              더 보기 (+{Math.min(PAGE_SIZE, filtered.length - visible)})
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-3 last:mb-0">
      <div className="w-10 shrink-0 mt-1 text-xs text-[var(--text-secondary)]">
        {label}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
