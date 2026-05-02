"""Korean translation file에서 영웅 이름 영→한 매핑 추출"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_ko.json", "r", encoding="utf-8") as f:
    ko = json.load(f)

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_herodata.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

# 영웅 이름들이 ko에 어떻게 들어있는지 확인
hero_names = list(heroes.keys())
print(f"Total English hero names: {len(hero_names)}")
print(f"\nSearching for hero names in ko translation...")

# Direct key match
matched = {}
unmatched = []
for en in hero_names:
    if en in ko:
        matched[en] = ko[en]
    else:
        unmatched.append(en)

print(f"Direct match: {len(matched)}")
print(f"Unmatched: {len(unmatched)}")
print(f"\n--- First 15 matches ---")
for en in hero_names[:15]:
    if en in matched:
        print(f"  {en} → {matched[en]}")
    else:
        print(f"  {en} → (NOT FOUND)")

print(f"\n--- First 15 unmatched ---")
for en in unmatched[:15]:
    print(f"  {en}")

# Check ko file structure for any nested hero names
print(f"\n--- ko 'Heroes' related keys ---")
for k in ko.keys():
    if 'hero' in k.lower() or '영웅' in str(ko[k]):
        if isinstance(ko[k], str) and len(ko[k]) < 30:
            print(f"  '{k}' → '{ko[k]}'")
