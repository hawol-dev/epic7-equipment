"""
정규화된 enum 정의 — 모든 식별자는 영문 snake_case
Fribbels assets.js + 게임 공식 영문판 기준
"""

# 부옵 (substats) — Fribbels naming 기반 단축형
SUBSTATS = {
    "spd":    {"ko": "속도",     "en": "Speed",         "fribbels": "Speed"},
    "atk_p":  {"ko": "공격력%",  "en": "ATK%",          "fribbels": "AttackPercent"},
    "hp_p":   {"ko": "생명력%",  "en": "HP%",           "fribbels": "HealthPercent"},
    "def_p":  {"ko": "방어력%",  "en": "DEF%",          "fribbels": "DefensePercent"},
    "chc":    {"ko": "치명확률", "en": "Crit Chance",   "fribbels": "CriticalHitChancePercent"},
    "chd":    {"ko": "치명피해", "en": "Crit Damage",   "fribbels": "CriticalHitDamagePercent"},
    "eff":    {"ko": "효과적중", "en": "Effectiveness", "fribbels": "EffectivenessPercent"},
    "effres": {"ko": "효과저항", "en": "Eff. Resistance","fribbels": "EffectResistancePercent"},
}

# 세트 (sets) — Fribbels assets.js 명명 기준 (소문자)
# pieces: 4세트면 4, 2세트면 2
# effect: 게임 내 세트 효과 설명 (파일2 장비 목록 시트 기반)
SETS = {
    "speed":       {"ko": "속도", "en": "Speed",       "pieces": 4,
                    "effect":    "속도가 25% 증가합니다.",
                    "effect_en": "Increases Speed by 25%."},
    "hit":         {"ko": "적중", "en": "Hit",         "pieces": 2,
                    "effect":    "효과적중이 20% 증가합니다.",
                    "effect_en": "Increases Effectiveness by 20%."},
    "critical":    {"ko": "치명", "en": "Critical",    "pieces": 2,
                    "effect":    "치명확률이 12% 증가합니다.",
                    "effect_en": "Increases Critical Hit Chance by 12%."},
    "protection":  {"ko": "수호", "en": "Protection",  "pieces": 4,
                    "effect":    "전투 시작 시 자신의 최대 생명력의 12%만큼 아군 전체에게 2턴 간 보호막을 발생시킵니다.",
                    "effect_en": "At the start of combat, grants all allies a barrier equal to 12% of caster's Max HP for 2 turns."},
    "health":      {"ko": "체력", "en": "Health",      "pieces": 2,
                    "effect":    "생명력이 20% 증가합니다.",
                    "effect_en": "Increases HP by 20%."},
    "defense":     {"ko": "방어", "en": "Defense",     "pieces": 2,
                    "effect":    "방어력이 20% 증가합니다.",
                    "effect_en": "Increases Defense by 20%."},
    "attack":      {"ko": "공격", "en": "Attack",      "pieces": 4,
                    "effect":    "공격력이 45% 증가합니다.",
                    "effect_en": "Increases Attack by 45%."},
    "destruction": {"ko": "파멸", "en": "Destruction", "pieces": 4,
                    "effect":    "치명피해가 60% 증가합니다.",
                    "effect_en": "Increases Critical Hit Damage by 60%."},
    "counter":     {"ko": "반격", "en": "Counter",     "pieces": 4,
                    "effect":    "피격 시 30%의 확률로 반격합니다.",
                    "effect_en": "30% chance to counterattack when hit."},
    "lifesteal":   {"ko": "흡혈", "en": "Lifesteal",   "pieces": 4,
                    "effect":    "공격 시 피해량의 20%만큼 생명력을 회복합니다.",
                    "effect_en": "Recovers HP equal to 20% of damage dealt on attack."},
    "resist":      {"ko": "저항", "en": "Resist",      "pieces": 2,
                    "effect":    "효과저항이 20% 증가합니다.",
                    "effect_en": "Increases Effect Resistance by 20%."},
    "immunity":    {"ko": "면역", "en": "Immunity",    "pieces": 2,
                    "effect":    "전투 시작 시 자신에게 1턴 간 면역 효과를 발생시킵니다. 동일한 세트 효과와 중복되지 않습니다.",
                    "effect_en": "Grants Immunity to caster for 1 turn at the start of combat. Does not stack with the same set effect."},
    "rage":        {"ko": "분노", "en": "Rage",        "pieces": 4,
                    "effect":    "공격 시 대상에게 약화효과가 있을 경우 피해량이 30% 증가합니다.",
                    "effect_en": "Damage dealt is increased by 30% when attacking enemies with debuffs."},
    "unity":       {"ko": "협공", "en": "Unity",       "pieces": 2,
                    "effect":    "협공확률이 8% 증가합니다.",
                    "effect_en": "Increases Dual Attack Chance by 8%."},
    "penetration": {"ko": "관통", "en": "Penetration", "pieces": 2,
                    "effect":    "단일 공격 시 대상의 방어력을 15% 관통합니다. 동일한 세트 효과와 중복되지 않습니다.",
                    "effect_en": "Penetrates 15% of target's Defense on single-target attacks. Does not stack with the same set effect."},
    "torrent":     {"ko": "격류", "en": "Torrent",     "pieces": 2,
                    "effect":    "생명력이 10% 감소하고 공격 시 피해량이 10% 증가합니다.",
                    "effect_en": "Decreases HP by 10%, increases damage dealt by 10%."},
    "injury":      {"ko": "상처", "en": "Injury",      "pieces": 4,
                    "effect":    "공격 후 피해량만큼 대상의 최대 생명력을 6%(단일 공격 시 12%)까지 감소시킵니다.",
                    "effect_en": "After attacking, reduces target's Max HP by 6% (12% on single-target) of damage dealt."},
    "revenge":     {"ko": "복수", "en": "Revenge",     "pieces": 4,
                    "effect":    "속도가 12% 증가하고, 잃은 생명력 1%당 0.5%씩 추가로 증가합니다.",
                    "effect_en": "Increases Speed by 12%, plus 0.5% additional per 1% HP lost."},
    "warfare":     {"ko": "개전", "en": "Warfare",     "pieces": 4,
                    "effect":    "생명력이 증가하고 전투 시작 시 스킬 쿨타임이 초기화됩니다.",
                    "effect_en": "Increases HP and resets all skill cooldowns at the start of combat."},
    "pursuit":     {"ko": "추격", "en": "Pursuit",     "pieces": 2,
                    "effect":    "추가 피해의 피해량이 증가합니다.",
                    "effect_en": "Increases additional damage dealt."},
    "reversal":    {"ko": "역습", "en": "Reversal",    "pieces": 4,
                    "effect":    "속도가 15% 증가합니다. 부활 시 행동 게이지가 50% 증가합니다.",
                    "effect_en": "Increases Speed by 15%. Increases Combat Readiness by 50% when revived."},
    "riposte":     {"ko": "응수", "en": "Riposte",     "pieces": 4,
                    "effect":    "회피 시 70% 확률로 반격합니다.",
                    "effect_en": "70% chance to counterattack when evading."},
}

# 한글 → set ID 역매핑 (생명도 체력 alias 처리)
SET_KO_TO_ID = {v["ko"]: k for k, v in SETS.items()}
SET_KO_TO_ID["생명"] = "health"

# 한글 → substat ID 역매핑
SUBSTAT_KO_TO_ID = {v["ko"]: k for k, v in SUBSTATS.items()}

# 속성 (elements)
ELEMENTS = {
    "fire":  {"ko": "화염", "en": "Fire"},
    "ice":   {"ko": "냉기", "en": "Ice"},
    "earth": {"ko": "자연", "en": "Earth"},
    "light": {"ko": "광",   "en": "Light"},
    "dark":  {"ko": "어둠", "en": "Dark"},
}
ELEMENT_KO_TO_ID = {v["ko"]: k for k, v in ELEMENTS.items()}
# Fribbels 변형
FRIBBELS_ELEMENT_TO_ID = {"wind": "earth", "fire": "fire", "ice": "ice", "light": "light", "dark": "dark"}

# 직업 (classes) — 게임 공식 영문판 기준
CLASSES = {
    "warrior":    {"ko": "전사",   "en": "Warrior"},
    "knight":     {"ko": "기사",   "en": "Knight"},
    "thief":      {"ko": "도적",   "en": "Thief"},
    "ranger":     {"ko": "사수",   "en": "Ranger"},
    "mage":       {"ko": "마도사", "en": "Mage"},
    "soulweaver": {"ko": "정령사", "en": "Soul Weaver"},
}
CLASS_KO_TO_ID = {v["ko"]: k for k, v in CLASSES.items()}
FRIBBELS_CLASS_TO_ID = {
    "warrior": "warrior", "knight": "knight", "ranger": "ranger", "mage": "mage",
    "assassin": "thief", "manauser": "soulweaver",
}

# 별자리 (zodiacs) — 라틴 표기 (12궁)
ZODIACS = {
    "aries":       {"ko": "백양궁", "en": "Aries"},
    "taurus":      {"ko": "금우궁", "en": "Taurus"},
    "gemini":      {"ko": "쌍아궁", "en": "Gemini"},
    "cancer":      {"ko": "거해궁", "en": "Cancer"},
    "leo":         {"ko": "사자궁", "en": "Leo"},
    "virgo":       {"ko": "처녀궁", "en": "Virgo"},
    "libra":       {"ko": "천칭궁", "en": "Libra"},
    "scorpio":     {"ko": "천갈궁", "en": "Scorpio"},
    "sagittarius": {"ko": "인마궁", "en": "Sagittarius"},
    "capricorn":   {"ko": "마갈궁", "en": "Capricorn"},
    "aquarius":    {"ko": "보병궁", "en": "Aquarius"},
    "pisces":      {"ko": "쌍어궁", "en": "Pisces"},
}
ZODIAC_KO_TO_ID = {v["ko"]: k for k, v in ZODIACS.items()}
FRIBBELS_ZODIAC_TO_ID = {
    "ram": "aries", "bull": "taurus", "twins": "gemini", "crab": "cancer",
    "lion": "leo", "maiden": "virgo", "scales": "libra", "scorpion": "scorpio",
    "archer": "sagittarius", "goat": "capricorn", "waterbearer": "aquarius",
    "fish": "pisces",
}

# 각인집중 (engraving focus)
ENGRAVINGS = {
    "atk_p":  {"ko": "공격력%",  "en": "ATK%"},
    "def_p":  {"ko": "방어력%",  "en": "DEF%"},
    "hp_p":   {"ko": "생명력%",  "en": "HP%"},
    "chc":    {"ko": "치명확률", "en": "Crit Chance"},
    "chd":    {"ko": "치명피해", "en": "Crit Damage"},
    "eff":    {"ko": "효과적중", "en": "Effectiveness"},
    "effres": {"ko": "효과저항", "en": "Eff. Resistance"},
    "atk":    {"ko": "공격력",   "en": "ATK"},
    "def":    {"ko": "방어력",   "en": "DEF"},
    "hp":     {"ko": "생명력",   "en": "HP"},
}
# 파일2 표기는 괄호 형식: "공격력(%)" → atk_p
ENGRAVING_KO_TO_ID = {
    "공격력(%)": "atk_p", "방어력(%)": "def_p", "생명력(%)": "hp_p",
    "치명확률": "chc", "치명피해": "chd",
    "효과적중": "eff", "효과저항": "effres",
    "공격력": "atk", "방어력": "def", "생명력": "hp",
}

# 마커 → essential/preferred
MARK_LEVELS = {
    "essential": {"ko": "필수", "en": "Essential", "marker": "●"},
    "preferred": {"ko": "선호", "en": "Preferred", "marker": "○"},
}


def export_enums_json(extra: dict | None = None):
    """enums.json 으로 직렬화. extra로 추가 데이터 머지 가능."""
    base = {
        "substats": SUBSTATS,
        "sets": SETS,
        "elements": ELEMENTS,
        "classes": CLASSES,
        "zodiacs": ZODIACS,
        "engravings": ENGRAVINGS,
        "mark_levels": MARK_LEVELS,
    }
    if extra:
        base.update(extra)
    return base
