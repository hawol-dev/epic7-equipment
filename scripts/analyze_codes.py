"""Fribbels code prefix 패턴 분석 — 월광/전직 등 구분 가능한지"""
import json, sys, io, re
from collections import Counter, defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

fribbels = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_herodata.json', encoding='utf-8'))

# code prefix 추출 (cXNNN 형태)
prefix_stats = defaultdict(lambda: {"count": 0, "rarities": Counter(), "elements": Counter(), "examples": []})
for en_name, h in fribbels.items():
    code = h.get("code", "")
    m = re.match(r"^c(\d)(\d+)", code)
    if not m:
        continue
    prefix = m.group(1)
    prefix_stats[prefix]["count"] += 1
    prefix_stats[prefix]["rarities"][h.get("rarity")] += 1
    prefix_stats[prefix]["elements"][h.get("attribute")] += 1
    if len(prefix_stats[prefix]["examples"]) < 8:
        prefix_stats[prefix]["examples"].append(f"{en_name} ({h.get('rarity')}* {h.get('attribute')}, code={code})")

print("=== Code prefix별 분포 ===")
for p in sorted(prefix_stats.keys()):
    s = prefix_stats[p]
    print(f"\nc{p}xxx — {s['count']}명")
    print(f"  rarities: {dict(s['rarities'])}")
    print(f"  elements: {dict(s['elements'])}")
    print(f"  examples:")
    for ex in s['examples']:
        print(f"    {ex}")

# 베이스 ↔ 월광/전직 매핑 추측
# 같은 영문 이름의 substring 으로 베이스/파생 영웅 그룹 찾기
print("\n=== 같은 영웅의 베이스 + 파생 그룹 (코드로 그룹핑) ===")

# 코드 마지막 4자리가 같은 캐릭터?
def code_suffix(code):
    m = re.match(r"^c\d(\d+)", code)
    return m.group(1) if m else None

by_suffix = defaultdict(list)
for en_name, h in fribbels.items():
    suf = code_suffix(h.get("code", ""))
    if suf:
        by_suffix[suf].append((en_name, h.get("rarity"), h.get("attribute"), h.get("code")))

# 2개 이상 영웅이 같은 suffix 가진 케이스
groups = {s: lst for s, lst in by_suffix.items() if len(lst) >= 2}
print(f"같은 suffix 그룹: {len(groups)}개")
for suf, lst in list(groups.items())[:15]:
    print(f"  suffix {suf}:")
    for n, r, a, c in lst:
        print(f"    {c}  {r}* {a:>5}  {n}")
