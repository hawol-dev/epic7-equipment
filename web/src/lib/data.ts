import heroesJson from "@/data/heroes.json";
import enumsJson from "@/data/enums.json";
import indexJson from "@/data/search_index.json";
import type { Hero, Enums, SearchIndex } from "./types";

export const heroes = heroesJson as unknown as Hero[];
export const enums = enumsJson as unknown as Enums;
export const searchIndex = indexJson as unknown as SearchIndex;

const heroById = new Map(heroes.map((h) => [h.id, h]));

export function getHero(id: string): Hero | undefined {
  return heroById.get(id);
}

export function getHeroes(ids: string[]): Hero[] {
  return ids.map((id) => heroById.get(id)).filter((x): x is Hero => !!x);
}

// base_name_ko 별 그룹 (운영법 변형 영웅 묶기)
const heroesByBaseName = new Map<string, Hero[]>();
for (const h of heroes) {
  const arr = heroesByBaseName.get(h.base_name_ko);
  if (arr) arr.push(h);
  else heroesByBaseName.set(h.base_name_ko, [h]);
}

export function getVariants(hero: Hero): Hero[] {
  const all = heroesByBaseName.get(hero.base_name_ko) || [];
  return all.filter((h) => h.id !== hero.id);
}

export type HeroSortKey = "rarity" | "name" | "speed" | "atk" | "hp" | "def";

export function sortHeroes(list: Hero[], key: HeroSortKey): Hero[] {
  const arr = [...list];
  const cmp = (a: Hero, b: Hero) => {
    if (key === "name") {
      return a.names.ko.localeCompare(b.names.ko, "ko");
    }
    if (key === "rarity") {
      const ar = a.rarity ?? 0;
      const br = b.rarity ?? 0;
      if (ar !== br) return br - ar;
      return a.names.ko.localeCompare(b.names.ko, "ko");
    }
    // 스탯 기반 정렬 — lv60_6 우선, 없으면 lv50_5
    const statKey = key as "spd" | "atk" | "hp" | "def";
    const map: Record<string, "spd" | "atk" | "hp" | "def"> = {
      speed: "spd", atk: "atk", hp: "hp", def: "def",
    };
    const sk = map[key] ?? statKey;
    const av = a.base_stats?.lv60_6?.[sk] ?? a.base_stats?.lv50_5?.[sk] ?? 0;
    const bv = b.base_stats?.lv60_6?.[sk] ?? b.base_stats?.lv50_5?.[sk] ?? 0;
    if (av !== bv) return bv - av;
    return a.names.ko.localeCompare(b.names.ko, "ko");
  };
  arr.sort(cmp);
  return arr;
}

/**
 * 이 영웅의 valid_sets 와 같은 세트를 사용하는 다른 영웅들
 * — 교집합이 가장 큰 영웅 우선, 가나다순
 */
export function getRelatedHeroes(hero: Hero, limit = 8): Hero[] {
  if (!hero.valid_options) return [];
  const mySets = new Set(hero.valid_options.valid_sets);
  if (mySets.size === 0) return [];

  const scored: Array<{ hero: Hero; overlap: number }> = [];
  for (const other of heroes) {
    if (other.id === hero.id) continue;
    if (!other.valid_options || !other.has_data) continue;
    let overlap = 0;
    for (const s of other.valid_options.valid_sets) {
      if (mySets.has(s)) overlap++;
    }
    // 교집합이 절반 이상이고 영웅의 세트수가 비슷할 때만 (관련성 보장)
    if (overlap >= 2 && overlap >= other.valid_options.valid_sets.length / 2) {
      scored.push({ hero: other, overlap });
    }
  }
  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    const ar = a.hero.rarity ?? 0;
    const br = b.hero.rarity ?? 0;
    if (br !== ar) return br - ar;
    return a.hero.names.ko.localeCompare(b.hero.names.ko, "ko");
  });
  return scored.slice(0, limit).map((x) => x.hero);
}
