import type {
  Hero,
  SubstatId,
  SetId,
  ElementId,
  ClassId,
} from "./types";

export interface GearQuery {
  /** 1~3개 세트 (모두 만족하는 영웅) */
  sets: SetId[];
  /** 보유 부옵 (이 중 영웅에게 essential/preferred인 것 매칭) */
  substats: SubstatId[];
  /** 영웅 필터 (선택) */
  elements?: ElementId[];
  classes?: ClassId[];
  rarities?: number[];
}

export interface MatchResult {
  hero: Hero;
  /** 매칭 점수: essential×2 + preferred×1 + (세트조합 일치 보너스 +5) */
  score: number;
  /** 이 영웅에게 essential인 부옵 (입력한 것 중) */
  matchedEssential: SubstatId[];
  /** 이 영웅에게 preferred인 부옵 (입력한 것 중) */
  matchedPreferred: SubstatId[];
  /** 입력한 세트가 영웅의 set_combo와 정확히 일치하는지 */
  setComboBonus: boolean;
}

/**
 * 입력한 세트가 영웅의 valid_sets 안에 모두 포함되는지
 */
function setsCovered(querySets: SetId[], hero: Hero): boolean {
  if (querySets.length === 0) return true;
  if (!hero.valid_options) return false;
  const heroSets = new Set(hero.valid_options.valid_sets);
  return querySets.every((s) => heroSets.has(s));
}

/**
 * 영웅 필터 (속성/직업/등급)
 */
function metaMatches(query: GearQuery, hero: Hero): boolean {
  if (query.elements?.length && (!hero.element || !query.elements.includes(hero.element))) {
    return false;
  }
  if (query.classes?.length && (!hero.class || !query.classes.includes(hero.class))) {
    return false;
  }
  if (query.rarities?.length && (!hero.rarity || !query.rarities.includes(hero.rarity))) {
    return false;
  }
  return true;
}

/**
 * 입력한 세트 조합이 영웅의 set_combo alternates 중 하나와
 * 정확히 일치하는지 (보너스 점수용)
 */
function setComboExactMatch(querySets: SetId[], hero: Hero): boolean {
  if (querySets.length === 0 || !hero.valid_options) return false;
  const querySet = new Set(querySets);
  return hero.valid_options.set_combos.some((combo) => {
    if (combo.length !== querySet.size) return false;
    return combo.every((s) => querySet.has(s));
  });
}

export function matchHeroes(
  heroes: Hero[],
  query: GearQuery
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const hero of heroes) {
    if (!hero.valid_options) continue;
    if (!hero.has_data) continue;
    if (!setsCovered(query.sets, hero)) continue;
    if (!metaMatches(query, hero)) continue;

    const matchedEssential: SubstatId[] = [];
    const matchedPreferred: SubstatId[] = [];

    for (const sub of query.substats) {
      const level = hero.valid_options.substats[sub];
      if (level === "essential") matchedEssential.push(sub);
      else if (level === "preferred") matchedPreferred.push(sub);
    }

    // 부옵 입력했는데 하나도 매칭 안되면 제외
    if (query.substats.length > 0 &&
        matchedEssential.length === 0 &&
        matchedPreferred.length === 0) {
      continue;
    }

    const setComboBonus = setComboExactMatch(query.sets, hero);
    const score =
      matchedEssential.length * 2 +
      matchedPreferred.length * 1 +
      (setComboBonus ? 5 : 0);

    results.push({
      hero,
      score,
      matchedEssential,
      matchedPreferred,
      setComboBonus,
    });
  }

  // 점수 내림차순 → 등급 내림차순 → 가나다순
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ar = a.hero.rarity ?? 0;
    const br = b.hero.rarity ?? 0;
    if (br !== ar) return br - ar;
    return a.hero.names.ko.localeCompare(b.hero.names.ko, "ko");
  });

  return results;
}
