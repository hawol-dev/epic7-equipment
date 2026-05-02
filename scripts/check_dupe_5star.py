"""B2 5성 4명 — file1 영웅과 진짜 다른 인물인지 / 이름 표기 다른 같은 인물인지 확인"""
import json, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

heroes = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes.json', encoding='utf-8'))

# B2 5성 4명
suspects_b2 = ["비비안", "적월의 귀족 헤이스트", "카논", "쾌속의 기수 시그렛"]
# file1 매칭 의심 영웅
candidates_file1 = [
    "비비안", "숲의 현자 비비안", "숲의 현자 비비안(스탠다드)",
    "적월의 헤이스트",
    "카논", "폭격형 카논", "폭격형 카논(PVE)",
    "쾌속의 기수 시그렛", "쾌속의 기수 세크레트",
]

print("=== B2 5성 영웅 (Fribbels-only) ===")
for s in suspects_b2:
    h = next((x for x in heroes if x["names"]["ko"] == s and not x["has_data"]), None)
    if h:
        print(f"  '{s}' (en={h['names']['en']}, code={h['code']}, rarity={h['rarity']}, element={h['element']}, class={h['class']})")

print("\n=== file1에 있는 비슷한 이름 ===")
for n in candidates_file1:
    matches = [x for x in heroes if n in x["names"]["ko"]]
    for h in matches:
        print(f"  '{h['names']['ko']}' (has_data={h['has_data']}, en={h['names']['en']}, code={h['code']}, rarity={h['rarity']})")

# B2에서 4성도 의심스러운 것들 (4성 33명 중 file1과 겹칠 수 있는 표기)
print("\n=== B2 4성 중 file1 영웅과 base name 충돌 가능 ===")
b2_4star = [h for h in heroes if not h["has_data"] and h["rarity"] == 4]
file1_base_names = {h["base_name_ko"] for h in heroes if h["has_data"]}
for h in b2_4star:
    name = h["names"]["ko"]
    # 이미 file1에 비슷한 이름이 있는지
    similar = [b for b in file1_base_names if name in b or b in name]
    if similar:
        print(f"  Fribbels '{name}' ↔ file1 후보: {similar}")
