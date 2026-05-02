"""Fribbels 스탯 / 파일2 추천세팅 / 계산요소 구조 한 번에 확인"""
import json, openpyxl, sys, io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ===== Fribbels herodata: calculatedStatus =====
fr = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_herodata.json', encoding='utf-8'))
sample = fr["Ravi"]
print("=== Fribbels Ravi.calculatedStatus 구조 ===")
print(json.dumps(sample.get("calculatedStatus", {}), indent=2)[:1500])

# ===== 파일2 추천 세팅 =====
print("\n\n=== 파일2 추천 세팅 시트 ===")
path2 = r"C:\Users\jsh02\Downloads\에픽세븐장비시뮬_26_04_14의 사본.xlsx"
wb = openpyxl.load_workbook(path2, data_only=True, read_only=True)
ws = wb["추천 세팅"]
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i > 8:
        break
    nonempty = [(j, v) for j, v in enumerate(row, 1) if v is not None]
    print(f"R{i+1}: {nonempty[:18]}")

# ===== 파일2 계산요소 (각인집중) =====
print("\n\n=== 파일2 계산요소 시트 ===")
ws2 = wb["계산요소"]
for i, row in enumerate(ws2.iter_rows(values_only=True)):
    if i > 15:
        break
    nonempty = [(j, v) for j, v in enumerate(row, 1) if v is not None]
    print(f"R{i+1}: {nonempty[:12]}")

# ===== 파일2 아티팩트 정보 =====
print("\n\n=== 파일2 아티팩트 정보 시트 (헤더 + 처음 5개) ===")
ws3 = wb["아티팩트 정보"]
for i, row in enumerate(ws3.iter_rows(values_only=True)):
    if i > 6:
        break
    nonempty = [(j, v) for j, v in enumerate(row, 1) if v is not None]
    print(f"R{i+1}: {nonempty[:10]}")
