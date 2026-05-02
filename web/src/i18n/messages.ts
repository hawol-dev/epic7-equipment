/**
 * UI 메시지 카탈로그 (한↔영)
 *
 * - 데이터 라벨 (스탯/세트/속성/직업/별자리/각인) 은 enums.json 의 ko/en 사용
 * - 영웅 이름은 hero.names.ko / hero.names.en 사용
 * - 비고/세트 효과는 한글만 (영문 데이터 없음 — 한글 그대로 노출)
 */

export type Lang = "ko" | "en";

export const M = {
  // Brand / Header
  site_name:        { ko: "에픽세븐 장비 가이드",                   en: "Epic 7 Gear Guide" },
  site_short:       { ko: "E7 장비 가이드",                          en: "E7 Gear Guide" },
  nav_search:       { ko: "장비 검색",                              en: "Gear Search" },
  nav_heroes:       { ko: "영웅",                                    en: "Heroes" },
  nav_sets:         { ko: "세트",                                    en: "Sets" },
  nav_help:         { ko: "사용법",                                  en: "Help" },

  // Home (장비 검색)
  home_title:       { ko: "이 장비, 누구한테 줄까",                  en: "Whose Gear Is This?" },
  home_subtitle:    { ko: "세트와 부옵션을 입력하면 어울리는 영웅을 점수순으로 보여줍니다.",
                       en: "Enter the gear's set and substats to find matching heroes." },

  // Heroes browse
  heroes_title:     { ko: "영웅 둘러보기",                          en: "Browse Heroes" },
  heroes_subtitle:  { ko: "속성·직업·등급·타입으로 영웅을 좁혀보거나 이름으로 찾으세요.",
                       en: "Filter heroes by element, class, rarity, or type — or search by name." },

  // Sets
  sets_title:       { ko: "세트 정보",                              en: "Set Info" },
  sets_subtitle:    { ko: "22개 세트의 효과와 어떤 영웅이 사용하는지 확인하세요.",
                       en: "22 gear set effects and which heroes use them." },

  // Filter / form labels
  field_set:        { ko: "세트",                                    en: "Set" },
  field_substat:    { ko: "부옵션",                                  en: "Substats" },
  field_element:    { ko: "속성",                                    en: "Element" },
  field_class:      { ko: "직업",                                    en: "Class" },
  field_rarity:     { ko: "등급",                                    en: "Rarity" },
  field_type:       { ko: "타입",                                    en: "Type" },
  field_filters:    { ko: "필터",                                    en: "Filters" },
  field_input:      { ko: "장비 입력",                              en: "Gear Input" },
  hint_max3:        { ko: "최대 3개",                                en: "Max 3" },
  hint_max4:        { ko: "최대 4개",                                en: "Max 4" },
  hero_filter_optional: { ko: "영웅 필터 (선택)",                   en: "Hero filters (optional)" },
  search_by_name:   { ko: "이름으로 검색 (한글/영문)",              en: "Search by name (KO/EN)" },
  reset:            { ko: "초기화",                                  en: "Reset" },
  load_more:        { ko: "더 보기",                                 en: "Load more" },

  // Results
  matched_results:  { ko: "매칭 결과",                              en: "Matches" },
  no_input_hint:    { ko: "세트나 부옵션을 입력하면 매칭 영웅이 표시됩니다.",
                       en: "Enter a set or substats to see matching heroes." },
  no_results:       { ko: "조건에 맞는 영웅이 없습니다.",            en: "No heroes match the filter." },
  unit_heroes:      { ko: "명",                                      en: "" },

  // Sort
  sort_label:       { ko: "정렬",                                    en: "Sort" },
  sort_score:       { ko: "매칭 점수순",                            en: "By score" },
  sort_rarity:      { ko: "등급순",                                  en: "By rarity" },
  sort_name:        { ko: "가나다순",                                en: "Alphabetical" },
  sort_speed:       { ko: "속도순",                                  en: "By speed" },
  sort_atk:         { ko: "공격력순",                                en: "By attack" },
  sort_hp:          { ko: "생명력순",                                en: "By HP" },
  sort_def:         { ko: "방어력순",                                en: "By defense" },

  // Type groups
  type_covenant:    { ko: "성약",                                    en: "Covenant" },
  type_moonlight:   { ko: "월광",                                    en: "Moonlight" },
  type_limited:     { ko: "한정",                                    en: "Limited" },
  type_specialty:   { ko: "전직",                                    en: "Specialty Change" },

  // Hero detail sections
  sec_substats:     { ko: "유효 부옵션",                            en: "Valid Substats" },
  sec_priority:     { ko: "우선순위",                                en: "Priority" },
  sec_priority_unknown: { ko: "우선순위 정보 없음",                 en: "Priority not specified" },
  sec_recommended_sets: { ko: "추천 세트",                          en: "Recommended Sets" },
  sec_valid_sets:   { ko: "유효 세트 (어떤 세트든 OK)",              en: "Valid Sets (any combination)" },
  sec_notes:        { ko: "비고",                                    en: "Notes" },
  sec_artifacts:    { ko: "추천 아티팩트",                          en: "Recommended Artifacts" },
  sec_base_stats:   { ko: "기본 능력치",                            en: "Base Stats" },
  sec_engraving:    { ko: "각인집중 효과",                          en: "Engraving Focus Bonus" },
  sec_variants:     { ko: "다른 운영법",                            en: "Other Builds" },
  sec_related:      { ko: "비슷한 세팅의 영웅",                      en: "Heroes with Similar Setup" },
  sec_guides:       { ko: "외부 가이드",                            en: "External Guides" },

  level_essential:  { ko: "필수",                                    en: "Essential" },
  level_preferred:  { ko: "선호",                                    en: "Preferred" },
  ignore_2set:      { ko: "※ 2세트 옵션 무시 (4세트 위주)",          en: "* Ignore 2-set bonuses (4-set focus)" },
  no_recommended_sets: { ko: "추천 세트 정보 없음",                  en: "No recommended sets" },
  unregistered:     { ko: "유효옵 미등록",                          en: "Substats N/A" },
  unregistered_note: { ko: "이 영웅의 유효옵션 정보가 아직 등록되지 않았습니다.",
                       en: "Substat data for this hero is not yet registered." },
  external_refs:    { ko: "외부 참고:",                              en: "External references:" },
  guides_source:    { ko: "출처: 디시인사이드 에픽세븐 마이너 갤러리",
                       en: "Source: DCInside Epic Seven Gallery" },
  back_to_home:     { ko: "홈",                                      en: "Home" },

  // Stat labels (when shown standalone)
  stat_atk:         { ko: "공격력",                                  en: "Attack" },
  stat_hp:          { ko: "생명력",                                  en: "Health" },
  stat_def:         { ko: "방어력",                                  en: "Defense" },
  stat_spd:         { ko: "속도",                                    en: "Speed" },
  stat_chc:         { ko: "치명확률",                                en: "Crit Chance" },
  stat_chd:         { ko: "치명피해",                                en: "Crit Damage" },
  stat_dac:         { ko: "협공률",                                  en: "Dual Attack" },
  stat_cp:          { ko: "전투력",                                  en: "CP" },

  // Engraving display
  engraving_label:  { ko: "각인집중",                                en: "Engraving Focus" },
  engraving_grade:  { ko: "등급",                                    en: "Grade" },
  engraving_level:  { ko: "단계",                                    en: "Lv" },
  base_stats_lv60:  { ko: "60렙 6★ 풀각성",                          en: "Lv60 6★ Fully Awakened" },
  base_stats_lv50:  { ko: "50렙 5★ 풀각성",                          en: "Lv50 5★ Fully Awakened" },

  // Footer
  footer_text:      { ko: "비공식 팬 사이트 · 게임/이미지 자산은 Smilegate Megaport 소유",
                       en: "Unofficial fan site · Game/image assets © Smilegate Megaport" },

  // Language switcher
  lang_korean:      { ko: "한국어",                                  en: "Korean" },
  lang_english:     { ko: "English",                                  en: "English" },
} as const;

export type MessageKey = keyof typeof M;

export function t(key: MessageKey, lang: Lang): string {
  const entry = M[key];
  if (!entry) return String(key);
  return entry[lang] || entry.ko;
}
