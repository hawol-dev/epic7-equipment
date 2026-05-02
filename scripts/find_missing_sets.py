"""나머지 7개 세트 이름 찾기"""
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_ko.json", "r", encoding="utf-8") as f:
    ko = json.load(f)

# 한글값을 가진 모든 짧은 키 찾기
targets = {
    "체력": "HP set (2pc HP)",
    "방어": "Defense set (2pc DEF)",
    "공격": "Attack set (4pc ATK)",
    "추격": "Hunt set",
    "역습": "Counterattack/Resurrection set",
    "개전": "?",
    "응수": "Riposte?",
    "Hunt": "?",
}
for tgt in targets:
    matches = [(k, v) for k, v in ko.items() if v == tgt or k == tgt]
    print(f"  '{tgt}' (looking for: {targets[tgt]}):")
    for k, v in matches[:5]:
        print(f"    '{k}' → '{v}'")

# Fribbels artifact data 다운받아서 set 이름 거기에 있나 보기
print("\n=== Fribbels artifactdata.json 구조 ===")
import urllib.request
url = "https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/data/cache/artifactdata.json"
data = json.loads(urllib.request.urlopen(url).read())
print(f"Top keys (first 5): {list(data.keys())[:5]}")
# 첫번째 항목 보기
first = list(data.keys())[0]
print(f"\nFirst entry '{first}':")
print(json.dumps(data[first], ensure_ascii=False, indent=2)[:500])

# Fribbels py 폴더에서 set 정의 찾기
print("\n=== Fribbels py 폴더 확인 ===")
import urllib.request
contents_url = "https://api.github.com/repos/fribbels/Fribbels-Epic-7-Optimizer/contents/data/py"
contents = json.loads(urllib.request.urlopen(contents_url).read())
for x in contents:
    if isinstance(x, dict):
        print(f"  {x['type']:>5} {x['name']}")
