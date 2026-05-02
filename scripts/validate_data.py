"""머지된 데이터 통계 및 검증"""
import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes_merged.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

print(f"=== 영웅 데이터 검증 ({len(heroes)}명) ===\n")

# 메타데이터 커버리지
no_meta = [h["name"] for h in heroes if h["meta"] is None]
print(f"메타데이터 없음: {len(no_meta)}")
for n in no_meta:
    print(f"  - {n}")

# 등급/속성/직업 분포 (파일1 영웅 한정)
ranks = Counter()
elements = Counter()
classes = Counter()
zodiacs = Counter()

for h in heroes:
    if h["meta"]:
        if h["meta"]["rank"]: ranks[h["meta"]["rank"]] += 1
        if h["meta"]["element"]: elements[h["meta"]["element"]] += 1
        if h["meta"]["class"]: classes[h["meta"]["class"]] += 1
        if h["meta"]["zodiac"]: zodiacs[h["meta"]["zodiac"]] += 1

print(f"\n등급: {dict(sorted(ranks.items()))}")
print(f"속성: {dict(elements)}")
print(f"직업: {dict(classes)}")
print(f"별자리: {dict(zodiacs)} ({len(zodiacs)}종)")

# 부옵 인기도 (essential + preferred 합)
substat_essential = Counter()
substat_preferred = Counter()
for h in heroes:
    for stat, level in h["valid_substats"].items():
        if level == "essential":
            substat_essential[stat] += 1
        elif level == "preferred":
            substat_preferred[stat] += 1

print(f"\n=== 부옵 분포 ===")
all_stats = sorted(set(substat_essential) | set(substat_preferred),
                   key=lambda x: -(substat_essential[x] + substat_preferred[x]))
print(f"{'부옵':<10} {'essential':>10} {'preferred':>10} {'합계':>8}")
for s in all_stats:
    e = substat_essential[s]; p = substat_preferred[s]
    print(f"{s:<10} {e:>10} {p:>10} {e+p:>8}")

# 세트 인기도
set_count = Counter()
for h in heroes:
    for s in h["valid_sets"]:
        set_count[s] += 1

print(f"\n=== 세트 인기도 (top 20) ===")
for s, c in set_count.most_common(20):
    print(f"  {s:<6} {c}")

# 변형(variant) 영웅 그룹
print(f"\n=== Variant 영웅 그룹 (base_name 별로 2개 이상) ===")
groups = {}
for h in heroes:
    groups.setdefault(h["base_name"], []).append(h["name"])
for base, names in sorted(groups.items()):
    if len(names) > 1:
        print(f"  [{base}] → {names}")

# variant 라벨 종류
variants = Counter()
for h in heroes:
    if h["variant"]:
        variants[h["variant"]] += 1
print(f"\nVariant 라벨 종류 ({len(variants)}):")
for v, c in variants.most_common():
    print(f"  ({v}) x{c}")
