"""
영웅 타입 분류 + 캐릭터 패밀리 그룹핑

타입 (code prefix 기반):
- standard:   c1xxx 4~5★ 베이스 성약
- moonlight5: c2xxx 5★ 월광
- moonlight4: c2xxx 4★ 월광 (또는 c6xxx)
- moonlight4_alt: c6xxx 4★ 월광/한정
- regular3:   c3xxx 3★ 일반
- specialty3: c4xxx 3★ 전직
- limited:    c5xxx 한정/콜라보/스토리
"""
import json, sys, io, re
from collections import defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r"E:\jsh02\Dev\EpicSevenEquipment\data"
fribbels = json.load(open(f"{ROOT}/raw/fribbels_herodata.json", encoding='utf-8'))
ko_dict = json.load(open(f"{ROOT}/raw/fribbels_ko.json", encoding='utf-8'))
heroes = json.load(open(f"{ROOT}/processed/heroes.json", encoding='utf-8'))

# Manual KO names (from build script)
MANUAL = {
    "Hecate": "헤카테", "Notos": "노토스", "Salome": "살로메",
    "Serila": "세리라", "Aki": "아키", "Fern": "페른",
    "Frieren": "프리렌", "Stark": "슈타르크", "Saria": "사르미아",
    "Ruiza": "루이자", "Wretched Rose": "비탄의 로제",
    "School Nurse Yulha": "보건교사 율하",
    "Sealed Eye Surin": "봉안의 수린",
    "Swift Flagbearer Sigret": "쾌속의 기수 시그렛",
    "Shepherd of the Dark Diene": "어둠의 목자 디에네",
    "Monarch of the Sword Iseria": "보검의 군주 이세리아",
    "Tactical Archetype Coli": "전술형 콜리",
    "Perfumer Byblis": "조향사 비브리스",
    "Estelle": "에스텔",
}

def get_ko(en):
    return MANUAL.get(en) or ko_dict.get(en) or en

def classify(en_name, h):
    code = h.get("code", "")
    rarity = h.get("rarity", 0)
    m = re.match(r"^c(\d)(\d+)", code)
    if not m:
        return "unknown"
    prefix = m.group(1)
    if prefix == "1":
        return "standard"
    if prefix == "2":
        return "moonlight" + (str(rarity) if rarity in (4, 5) else "?")
    if prefix == "3":
        return "regular3"
    if prefix == "4":
        return "specialty3"
    if prefix == "5":
        return "limited"
    if prefix == "6":
        return "moonlight4_alt"
    return f"c{prefix}"

# 1) 모든 영웅에 type, family_suffix 부여
classified = {}
for en_name, h in fribbels.items():
    code = h.get("code", "")
    m = re.match(r"^c(\d)(\d+)", code)
    suffix = m.group(2) if m else None
    classified[en_name] = {
        "en": en_name,
        "ko": get_ko(en_name),
        "code": code,
        "type": classify(en_name, h),
        "suffix": suffix,
        "rarity": h.get("rarity"),
        "element": h.get("attribute"),
    }

# 2) 미등록 126명 다시 분류
missing_heroes = [h for h in heroes if not h["has_data"]]
print(f"=== 미등록 {len(missing_heroes)}명 — 새 분류 ===\n")

by_type = defaultdict(list)
for h in missing_heroes:
    en = h["names"]["en"]
    if not en:
        by_type["no_fribbels_match"].append(h)
        continue
    info = classified.get(en)
    if not info:
        by_type["unknown"].append(h)
        continue
    by_type[info["type"]].append(h)

for t in ["standard", "moonlight5", "moonlight4", "moonlight4_alt",
          "specialty3", "regular3", "limited", "no_fribbels_match", "unknown"]:
    if t in by_type:
        lst = by_type[t]
        print(f"[{t}] {len(lst)}명")
        for h in sorted(lst, key=lambda x: (x["rarity"], x["names"]["ko"])):
            print(f"  {h['rarity']}* {h['names']['ko']} (en={h['names']['en']}, code={h.get('code')})")
        print()

# 3) 베이스 ↔ 파생 매핑 (suffix 기반)
print("\n=== 캐릭터 패밀리 ===")
print("file1의 영웅이 베이스인지 파생인지 / 패밀리에 다른 버전이 있는지 확인\n")

# suffix별로 그룹핑하되, 같은 character family 인지 검증 (이름 substring)
families = defaultdict(list)
for info in classified.values():
    if info["suffix"]:
        families[info["suffix"]].append(info)

# file1 영웅 중 패밀리에 다른 멤버가 있는 케이스 찾기
file1_with_family = []
for h in heroes:
    if not h["has_data"]:
        continue
    en = h["names"]["en"]
    if not en:
        continue
    info = classified.get(en)
    if not info or not info["suffix"]:
        continue
    fam = families[info["suffix"]]
    others = [x for x in fam if x["en"] != en]
    if others:
        # 같은 캐릭 가능성 검증: 영문명에 공통 단어 있는지
        my_tokens = set(en.lower().split())
        same_char_others = []
        for o in others:
            o_tokens = set(o["en"].lower().split())
            common = my_tokens & o_tokens
            if common:
                # 단어 길이 3+ 이상이면 같은 캐릭터 가능성 높음
                if any(len(w) >= 3 for w in common):
                    same_char_others.append(o)
        if same_char_others:
            file1_with_family.append((h, info, same_char_others))

print(f"file1의 has_data 영웅 중 패밀리에 다른 버전 있음: {len(file1_with_family)}")
for h, info, others in file1_with_family[:30]:
    others_str = ", ".join([f"{o['ko']}({o['type']})" for o in others])
    print(f"  [{info['type']}] {h['names']['ko']}  ↔ 패밀리: {others_str}")
