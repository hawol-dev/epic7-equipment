"""검색 인덱스의 비정상 키들 확인"""
import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\processed\search_index.json", "r", encoding="utf-8") as f:
    idx = json.load(f)

print("=== element 키 ===")
for k, v in idx["by_element"].items():
    print(f"  '{k}' : {len(v)} heroes")
    if len(v) <= 3:
        for hid in v[:3]:
            h = next(x for x in heroes if x["id"] == hid)
            print(f"     · {h['name_ko']} (en={h['name_en']}, source={h['source']})")

print("\n=== class 키 ===")
for k, v in idx["by_class"].items():
    print(f"  '{k}' : {len(v)} heroes")
    if len(v) <= 3:
        for hid in v[:3]:
            h = next(x for x in heroes if x["id"] == hid)
            print(f"     · {h['name_ko']} (en={h['name_en']})")

print("\n=== zodiac 키 ===")
for k, v in idx["by_zodiac"].items():
    print(f"  '{k}' : {len(v)} heroes")

# 한글명 누락 영웅들 — 한글 번역 파일에 진짜 없는지 직접 확인
print("\n=== 한글명 누락 의심 영웅 ===")
with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_ko.json", "r", encoding="utf-8") as f:
    ko_dict = json.load(f)

suspects = ["Hecate", "Notos", "Salome", "Estelle", "Serila", "Aki"]
for s in suspects:
    if s in ko_dict:
        print(f"  '{s}' → '{ko_dict[s]}' (있음!)")
    else:
        # 부분 매칭
        partials = [k for k in ko_dict.keys() if s.lower() in k.lower() or s.lower() == k.lower()]
        print(f"  '{s}' 직접 매칭 없음. 비슷한 키: {partials[:5]}")

# 이미지 누락 영웅 22명 확인
print("\n=== 이미지 누락 영웅 ===")
no_img = [h for h in heroes if not (h.get("image") and h["image"].get("icon"))]
print(f"  총 {len(no_img)}")
for h in no_img[:25]:
    print(f"  {h['name_ko']} (en={h['name_en']}, source={h['source']})")
