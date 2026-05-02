"""파일2 장비 목록에서 공식 세트 전체 리스트 + 효과 추출"""
import openpyxl
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r"C:\Users\jsh02\Downloads\에픽세븐장비시뮬_26_04_14의 사본.xlsx"
wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
ws = wb["장비 목록"]

sets = []
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        continue
    name = row[0]
    if not name:
        continue
    name = str(name).strip()
    pieces = row[2]  # 활성 (2 or 4)
    effect = row[3]  # 세트 효과
    source = row[4]  # 획득처
    sets.append({
        "ko_name": name,
        "pieces": int(pieces) if pieces else None,
        "effect": str(effect).strip() if effect else None,
        "source": str(source).strip() if source else None,
    })
    if i >= 30:
        break

for s in sets:
    print(f"{s['ko_name']:>4} ({s['pieces']}세트): {s['effect']}")
print(f"\n총 {len(sets)} 세트")
