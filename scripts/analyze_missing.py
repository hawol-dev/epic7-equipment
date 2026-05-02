"""유효옵 미등록 126명 분류"""
import json, sys, io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

heroes = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes.json', encoding='utf-8'))
ko_dict = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_ko.json', encoding='utf-8'))

# has_data False 인 영웅 = 126
missing = [h for h in heroes if not h.get("has_data")]
print(f"=== 유효옵 미등록 영웅 총 {len(missing)} ===\n")

# 등급별
by_rarity = Counter(h["rarity"] for h in missing)
print(f"등급 분포: {dict(sorted(by_rarity.items(), reverse=True))}")

# 3성/2성 = 구식
old_low_star = [h for h in missing if h["rarity"] in (2, 3)]
print(f"\n[A] 2~3성 (구식, 보통 안 씀): {len(old_low_star)}명")
for h in sorted(old_low_star, key=lambda x: (x["rarity"], x["names"]["ko"]))[:10]:
    print(f"  {h['rarity']}* {h['names']['ko']}")
if len(old_low_star) > 10:
    print(f"  ... 외 {len(old_low_star) - 10}명")

# 4~5성 미등록
high_star = [h for h in missing if h["rarity"] in (4, 5)]
print(f"\n[B] 4~5성 미등록: {len(high_star)}명")

# B 그룹을 다시 분류:
#  B1: 한글번역 누락 (수동 매핑한 19명 + 그 외)
#  B2: 한글번역은 있지만 시트에 없음 (= 시트 업데이트 이후 추가된 신규)
b1_no_translation = []
b2_new = []
for h in high_star:
    if h.get("translation_missing"):
        b1_no_translation.append(h)
    else:
        b2_new.append(h)

print(f"\n[B1] 4~5성 + 한글번역 누락 (영문판만 / 콜라보 / 최근 출시): {len(b1_no_translation)}명")
for h in b1_no_translation:
    print(f"  {h['rarity']}* {h['names']['ko']} (en={h['names']['en']})")

print(f"\n[B2] 4~5성 + 한글번역 O + 시트 미등록 (시트 업데이트 후 출시): {len(b2_new)}명")
for h in sorted(b2_new, key=lambda x: (x["rarity"], x["names"]["ko"])):
    print(f"  {h['rarity']}* {h['names']['ko']}")
