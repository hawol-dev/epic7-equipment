"""최종 통합 DB 검증"""
import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

# 이미지 없음 4명
no_img = [h for h in heroes if not (h.get("image") and h["image"].get("icon"))]
print(f"=== 이미지 없는 영웅 ({len(no_img)}) ===")
for h in no_img:
    print(f"  {h['name_ko']} (en={h['name_en']}, source={h['source']}, has_data={h['has_data']})")

# rarity 4종?
ranks = Counter(h.get("rarity") for h in heroes)
print(f"\n=== rarity 분포: {dict(ranks)}")
none_rank = [h for h in heroes if h.get("rarity") is None]
print(f"  rarity None: {len(none_rank)}")
for h in none_rank[:5]:
    print(f"    {h['name_ko']} (source={h['source']})")

# 검색 시뮬레이션 (사용자가 "속도 essential + 효과적중 essential" 검색했을 때)
print(f"\n=== 검색 시뮬: 속도 필수 + 효과적중 필수 ===")
hits = [h for h in heroes if h.get("valid_options") and
        h["valid_options"]["substats"].get("속도") == "essential" and
        h["valid_options"]["substats"].get("효과적중") == "essential"]
print(f"  매칭 영웅 수: {len(hits)}")
for h in hits[:8]:
    print(f"  - {h['name_ko']} ({h['rarity']}★ {h['element']} {h['class']})")

# 검색 시뮬: 속도 세트 + 면역 세트
print(f"\n=== 검색 시뮬: 세트 [속도, 면역] 모두 사용 ===")
hits = [h for h in heroes if h.get("valid_options") and
        "속도" in h["valid_options"]["valid_sets"] and
        "면역" in h["valid_options"]["valid_sets"]]
print(f"  매칭 영웅 수: {len(hits)}")
for h in hits[:8]:
    print(f"  - {h['name_ko']}")

# 샘플 영웅 풀 데이터 한번 보기
print(f"\n=== 샘플 영웅 데이터 (라비) ===")
ravi = next((h for h in heroes if h["name_ko"] == "라비"), None)
if ravi:
    print(json.dumps(ravi, ensure_ascii=False, indent=2))
