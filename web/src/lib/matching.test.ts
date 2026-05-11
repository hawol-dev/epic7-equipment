import { test, expect } from "vitest";
import { matchHeroes } from "./matching";
import type { Hero, SubstatId } from "./types";

function makeHero(
  id: string,
  subs: Partial<Record<SubstatId, "essential" | "preferred" | null>> & {
    content?: "pve" | "pvp";
  }
): Hero {
  return {
    id,
    code: id,
    type: "standard",
    names: { ko: id, en: id },
    base_name_ko: id,
    variant_ko: null,
    rarity: 5,
    element: "fire",
    class: "warrior",
    zodiac: null,
    engraving_focus: null,
    categories: [],
    image: null,
    base_stats: null,
    recommended_artifacts: null,
    guides: null,
    valid_options: {
      substats: {
        spd: subs.spd ?? null,
        atk_p: subs.atk_p ?? null,
        hp_p: subs.hp_p ?? null,
        def_p: subs.def_p ?? null,
        chc: subs.chc ?? null,
        chd: subs.chd ?? null,
        eff: subs.eff ?? null,
        effres: subs.effres ?? null,
      },
      priority_order: [],
      priority_unknown: false,
      set_combos: [],
      valid_sets: [],
      ignore_2set: false,
      notes: null,
      notes_en: null,
    },
    has_data: true,
    source: [],
    tags: { content: subs.content ?? "pvp" },
  };
}

test("strict 필터: 선택한 부옵 셋 모두 essential이면 노출", () => {
  const heroes = [
    makeHero("all_three", { spd: "essential", chc: "essential", chd: "essential" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc", "chd"] });
  expect(results.length).toBe(1);
  expect(results[0].hero.id).toBe("all_three");
});

test("strict 필터: 선택한 부옵 중 하나라도 null이면 제외", () => {
  const heroes = [
    makeHero("missing_chd", { spd: "essential", chc: "essential", chd: null }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc", "chd"] });
  expect(results.length).toBe(0);
});

test("strict 필터: essential 과 preferred 혼합 OK", () => {
  const heroes = [
    makeHero("mixed", { spd: "essential", chc: "preferred", chd: "essential" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc", "chd"] });
  expect(results.length).toBe(1);
});

test("strict 필터: 선택한 부옵 전부가 preferred이면 노출", () => {
  const heroes = [
    makeHero("all_preferred", { spd: "preferred", chc: "preferred" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc"] });
  expect(results.length).toBe(1);
});

test("strict 필터: 부옵 입력 없으면 영웅 데이터 있는 거 다 통과", () => {
  const heroes = [
    makeHero("a", { spd: "essential" }),
    makeHero("b", { chc: "essential" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: [] });
  expect(results.length).toBe(2);
});

test("contents 필터: pve만 선택 시 pve 영웅만 통과", () => {
  const heroes = [
    makeHero("a_pve", { spd: "essential", content: "pve" }),
    makeHero("b_pvp", { spd: "essential", content: "pvp" }),
  ];
  const results = matchHeroes(heroes, {
    sets: [], substats: [], contents: ["pve"],
  });
  expect(results.map((r) => r.hero.id)).toEqual(["a_pve"]);
});

test("contents 필터: 비어있으면 둘 다 통과", () => {
  const heroes = [
    makeHero("a_pve", { spd: "essential", content: "pve" }),
    makeHero("b_pvp", { spd: "essential", content: "pvp" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: [] });
  expect(results.length).toBe(2);
});
