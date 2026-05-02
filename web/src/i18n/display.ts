/**
 * lang에 따라 영웅/스탯/세트/속성 등의 표시 이름 반환
 */

import type { Hero } from "@/lib/types";
import type { Lang } from "./messages";

export function heroName(hero: Hero, lang: Lang): string {
  if (lang === "en" && hero.names.en) return hero.names.en;
  return hero.names.ko;
}

export function enumLabel(
  entry: { ko: string; en: string } | undefined,
  lang: Lang
): string {
  if (!entry) return "";
  return lang === "en" ? entry.en : entry.ko;
}
