/**
 * 영웅 데이터 스키마 (data/processed/heroes.json)
 */

export type ElementId = "fire" | "ice" | "earth" | "light" | "dark";
export type ClassId =
  | "warrior"
  | "knight"
  | "thief"
  | "ranger"
  | "mage"
  | "soulweaver";
export type ZodiacId =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type SubstatId =
  | "spd" | "atk_p" | "hp_p" | "def_p"
  | "chc" | "chd" | "eff" | "effres";

export type SetId =
  | "speed" | "hit" | "critical" | "protection" | "health"
  | "defense" | "attack" | "destruction" | "counter" | "lifesteal"
  | "resist" | "immunity" | "rage" | "unity" | "penetration"
  | "torrent" | "injury" | "revenge" | "warfare" | "pursuit"
  | "reversal" | "riposte";

export type EngravingId =
  | "atk_p" | "def_p" | "hp_p" | "chc" | "chd"
  | "eff" | "effres" | "atk" | "def" | "hp";

export type ContentTag = "pve" | "pvp";

export type HeroType =
  | "standard"
  | "moonlight5"
  | "moonlight4"
  | "moonlight4_alt"
  | "regular3"
  | "specialty3"
  | "limited"
  | "unknown";

export type SubstatLevel = "essential" | "preferred" | null;

export interface MainOptions {
  necklace: SubstatId[];
  ring: SubstatId[];
  boots: SubstatId[];
}

export interface ValidOptions {
  substats: Record<SubstatId, SubstatLevel>;
  priority_order: SubstatId[];
  priority_unknown: boolean;
  set_combos: SetId[][];
  valid_sets: SetId[];
  ignore_2set: boolean;
  notes: string | null;
  notes_en: string | null;
  main_options: MainOptions | null;
}

export interface BaseStats {
  cp: number;
  atk: number;
  hp: number;
  spd: number;
  def: number;
  chc: number;
  chd: number;
  dac?: number;
  eff?: number;
  efr?: number;
}

export interface Hero {
  id: string;
  code: string | null;
  type: HeroType;
  names: { ko: string; en: string | null };
  base_name_ko: string;
  variant_ko: string | null;
  rarity: number | null;
  element: ElementId | null;
  class: ClassId | null;
  zodiac: ZodiacId | null;
  engraving_focus: EngravingId | null;
  categories: string[];
  image: { icon: string | null; thumbnail: string | null } | null;
  base_stats: { lv50_5: BaseStats | null; lv60_6: BaseStats | null } | null;
  recommended_artifacts: Array<{ ko: string; en: string | null }> | null;
  guides: Array<{ title: string; url: string }> | null;
  valid_options: ValidOptions | null;
  has_data: boolean;
  source: string[];
  tags: { content: ContentTag };
  translation_missing?: boolean;
}

/**
 * Enum 라벨 매핑
 */
export interface EnumLabel {
  ko: string;
  en: string;
  pieces?: number;
  effect?: string;
  effect_en?: string;
  fribbels?: string;
  marker?: string;
}

export type EngravingGrade = "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

export interface Enums {
  substats: Record<SubstatId, EnumLabel>;
  sets: Record<SetId, EnumLabel>;
  elements: Record<ElementId, EnumLabel>;
  classes: Record<ClassId, EnumLabel>;
  zodiacs: Record<ZodiacId, EnumLabel>;
  engravings: Record<EngravingId, EnumLabel>;
  mark_levels: Record<"essential" | "preferred", EnumLabel>;
  /** {stat_id: {level: {grade: "21%" | null}}} — 각인집중 등급별 효과 */
  engraving_grades?: Record<
    string,
    Record<string, Record<EngravingGrade, string | null>>
  >;
}

/**
 * 검색 인덱스
 */
export interface SearchIndex {
  by_substat_essential: Record<SubstatId, string[]>;
  by_substat_preferred: Record<SubstatId, string[]>;
  by_set: Record<SetId, string[]>;
  by_element: Record<ElementId, string[]>;
  by_class: Record<ClassId, string[]>;
  by_rarity: Record<string, string[]>;
  by_zodiac: Record<ZodiacId, string[]>;
  by_engraving: Record<EngravingId, string[]>;
  by_type: Record<HeroType, string[]>;
}
