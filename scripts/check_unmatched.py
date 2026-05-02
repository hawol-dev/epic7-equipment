"""미매칭 3명 원인 분석"""
import openpyxl
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r"C:\Users\jsh02\Downloads\에픽세븐장비시뮬_26_04_14의 사본.xlsx"
wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
ws = wb["캐릭터 정보"]

targets = ["에스텔", "헤이스트", "카마인", "카마인로즈", "적월"]

for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        continue
    name = row[0]
    if not name:
        continue
    name_s = str(name).strip()
    for t in targets:
        if t in name_s:
            print(f"  match '{t}' → {name_s} (등급:{row[2]}, 속성:{row[3]}, 별:{row[4]}, 직업:{row[5]})")
