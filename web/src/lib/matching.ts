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
 * 세트 보너스 점수
 * - 영웅의 추천 조합과 입력이 정확히 일치: +5
 * - 입력이 영웅의 추천 조합 중 하나의 부분집합: +3
 * - 그 외 (valid_sets에만 있음): 0 (filter 통과만)
 */
function setComboScore(querySets: SetId[], hero: Hero): number {
  if (querySets.length === 0 || !hero.valid_options) return 0;
  const querySet = new Set(querySets);
  let subsetMatch = false;
  for (const combo of hero.valid_options.set_combos) {
    const comboSet = new Set(combo);
    const allInCombo = [...querySet].every((s) => comboSet.has(s));
    if (allInCombo) {
      if (combo.length === querySet.size) return 5; // exact match
      subsetMatch = true;
    }
  }
  return subsetMatch ? 3 : 0;
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

    const setBonus = setComboScore(query.sets, hero);
    const score =
      matchedEssential.length * 2 +
      matchedPreferred.length * 1 +
      setBonus;

    results.push({
      hero,
      score,
      matchedEssential,
      matchedPreferred,
      setComboBonus: setBonus === 5,  // 정확 일치만 true (UI 호환)
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
