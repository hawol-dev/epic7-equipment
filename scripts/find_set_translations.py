"""Fribbels 번역 파일에서 세트/스탯 EN↔KO 찾기"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_ko.json", "r", encoding="utf-8") as f:
    ko = json.load(f)

# 세트 후보 — 알려진 영문 이름 후보들
SET_CANDIDATES = [
    "Speed", "Hit", "Critical", "Aegis", "Protection",
    "Health", "Hp", "Lifeplus", "Defense", "Attack",
    "Destruction", "Counter", "Counter Set", "Lifesteal",
    "Resist", "Immunity", "Rage", "Combo", "Coop",
    "Penetration", "Torrent", "Injury", "Wound",
    "Revenge", "Unity", "Hunt", "Riposte", "Counterattack",
    "Reverse",
]

print("=== 세트 EN→KO 후보 매칭 ===")
for c in SET_CANDIDATES:
    if c in ko:
        print(f"  '{c}' → '{ko[c]}'")

# 스탯/부옵 후보
STAT_CANDIDATES = [
    "Attack", "ATK", "Defense", "DEF", "Health", "HP",
    "Speed", "SPD", "Critical Hit Chance", "Critical Hit Damage",
    "Crit Chance", "Crit Damage", "Effectiveness", "Effect Resistance",
    "Resistance", "Eff", "Eff Res", "CHC", "CHD",
    "Attack %", "Defense %", "Health %",
]
print("\n=== 스탯 EN→KO 후보 매칭 ===")
for c in STAT_CANDIDATES:
    if c in ko:
        print(f"  '{c}' → '{ko[c]}'")

# 'set' 단어 포함된 키 전체
print("\n=== 'set' 포함 키 ===")
for k in ko.keys():
    if isinstance(k, str) and ('set' in k.lower() or 'Set' in k):
        if len(k) < 50:
            print(f"  '{k}' → '{ko[k]}'")

# 한글 값에서 세트 이름이 나오는지 역검색
print("\n=== 한글 값으로 역검색 (세트 이름) ===")
target_ko_sets = ['속도', '면역', '체력', '격류', '적중', '관통', '파멸', '치명', '저항', '반격',
                  '방어', '추격', '흡혈', '역습', '수호', '개전', '상처', '응수', '분노', '공격',
                  '협공', '복수']
for tgt in target_ko_sets:
    matches = [(k, v) for k, v in ko.items() if v == tgt and len(k) < 30]
    print(f"  {tgt} ← {[m[0] for m in matches[:5]]}")
