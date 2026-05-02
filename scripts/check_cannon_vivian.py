"""카논/비비안 미스터리 확인 — Fribbels에 별도 베이스가 있는지"""
import json, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r"E:\jsh02\Dev\EpicSevenEquipment\data"
fribbels = json.load(open(f"{ROOT}/raw/fribbels_herodata.json", encoding='utf-8'))
ko_dict = json.load(open(f"{ROOT}/raw/fribbels_ko.json", encoding='utf-8'))

# 카논 관련 모든 영웅
print("=== Fribbels 카논 관련 ===")
for en, h in fribbels.items():
    en_l = en.lower()
    if "cannon" in en_l or "kanna" in en_l or "kana" in en_l:
        ko = ko_dict.get(en, "(no ko)")
        print(f"  {en} → ko='{ko}', code={h.get('code')}, rarity={h.get('rarity')}, element={h.get('attribute')}, class={h.get('role')}")

print("\n=== Fribbels 비비안 관련 ===")
for en, h in fribbels.items():
    en_l = en.lower()
    if "vivian" in en_l:
        ko = ko_dict.get(en, "(no ko)")
        print(f"  {en} → ko='{ko}', code={h.get('code')}, rarity={h.get('rarity')}, element={h.get('attribute')}, class={h.get('role')}")

print("\n=== Fribbels 헤이스트 관련 ===")
for en, h in fribbels.items():
    en_l = en.lower()
    if "haste" in en_l or "heist" in en_l:
        ko = ko_dict.get(en, "(no ko)")
        print(f"  {en} → ko='{ko}', code={h.get('code')}, rarity={h.get('rarity')}, element={h.get('attribute')}, class={h.get('role')}")

print("\n=== Fribbels 시그렛/세크레트 ===")
for en, h in fribbels.items():
    en_l = en.lower()
    if "sigret" in en_l or "secret" in en_l or "sigreth" in en_l:
        ko = ko_dict.get(en, "(no ko)")
        print(f"  {en} → ko='{ko}', code={h.get('code')}, rarity={h.get('rarity')}")

# ko_dict 에서 거꾸로 검색
print("\n=== ko_dict에 '폭격형 카논' 있는지 ===")
for k, v in ko_dict.items():
    if isinstance(v, str) and ("폭격" in v or "카논" in v or "비비안" in v or "헤이스트" in v):
        print(f"  '{k}' → '{v}'")
