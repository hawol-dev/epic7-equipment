"""Fribbels herodata.json 구조 분석"""
import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"E:\jsh02\Dev\EpicSevenEquipment\data\raw\fribbels_herodata.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Top-level type: {type(data).__name__}")
if isinstance(data, dict):
    print(f"Top-level keys (first 10): {list(data.keys())[:10]}")
    print(f"Total keys: {len(data)}")
    # Sample
    first_key = list(data.keys())[0]
    print(f"\nFirst entry — key='{first_key}':")
    print(json.dumps(data[first_key], ensure_ascii=False, indent=2)[:1500])
elif isinstance(data, list):
    print(f"Total items: {len(data)}")
    print(f"\nFirst item:")
    print(json.dumps(data[0], ensure_ascii=False, indent=2)[:1500])
