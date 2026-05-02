"""타입별 분포 + 미등록 영웅 분류 최종 확인"""
import json, sys, io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

heroes = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes.json', encoding='utf-8'))

print(f"총 {len(heroes)}명\n")

# type × has_data 매트릭스
print("=== type × has_data ===")
print(f"{'type':<18} {'has_data':>10} {'no_data':>10} {'합계':>8}")
type_stats = {}
for h in heroes:
    t = h.get("type", "unknown")
    has = h["has_data"]
    type_stats.setdefault(t, [0, 0])
    type_stats[t][0 if has else 1] += 1

for t in sorted(type_stats):
    has, no = type_stats[t]
    print(f"{t:<18} {has:>10} {no:>10} {has+no:>8}")

# 매핑 수정 검증: 적월의 헤이스트, 폭격형 카논, 쾌속의 기수 세크레트
print("\n=== 매핑 교정 검증 ===")
for kw in ["헤이스트", "폭격형 카논", "쾌속의 기수 세크레트"]:
    matches = [h for h in heroes if kw in h["names"]["ko"]]
    for h in matches:
        print(f"  '{h['names']['ko']}' (en={h['names']['en']}, code={h['code']}, type={h['type']}, has_data={h['has_data']})")

# 미등록 영웅 — standard 타입 26명 한 번 더 보기
print("\n=== 미등록 standard 26명 (베이스 4~5★) ===")
missing_std = [h for h in heroes if not h["has_data"] and h["type"] == "standard"]
for h in sorted(missing_std, key=lambda x: (x["rarity"], x["names"]["ko"])):
    print(f"  {h['rarity']}* {h['names']['ko']}")
