"""변환된 JSON 검증 — 풀네임 파싱이 제대로 됐는지"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\heroes_valid_options.json", "r", encoding="utf-8") as f:
    heroes = json.load(f)

# 이전에 issue가 있던 영웅들 확인
problem_names = [
    "데스티나", "디지", "라이아", "루루카(PVE)", "리무루",
    "뮤이(밴시원펀)", "세즈", "슈니엘(PVE)", "슈타르크", "안젤리카(PVE)",
    "어둠의 코르부스", "어린 여왕 샬롯", "잿빛 숲의 이세리아(딜)",
    "잿빛 숲의 이세리아(선턴)", "타마린느(PVE)", "플랑", "헤카테", "후미르",
    "어둠의 목자 디에네(적저)",
]

for h in heroes:
    if h["name"] in problem_names:
        sc = h["set_combo"]
        print(f"[{h['name']}]")
        print(f"  raw: '{sc['raw']}'")
        print(f"  alternates: {sc['alternates']}")
        print(f"  ignore_2set: {sc['ignore_2set']}")
        print(f"  valid_sets (col21+): {h['valid_sets']}")
        print()
