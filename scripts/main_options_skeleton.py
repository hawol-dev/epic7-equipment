"""
hero_guides.py 키 기반 빈 main_options.json 생성.
이미 존재하면 누락된 항목만 보강 (기존 데이터 보존).
"""
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent))
from hero_guides import HERO_GUIDES

ROOT = Path(__file__).resolve().parent.parent
DST = ROOT / "data/raw/main_options.json"

existing = {}
if DST.exists():
    existing = json.loads(DST.read_text(encoding="utf-8"))

EMPTY = {"necklace": [], "ring": [], "boots": [], "_source": None, "_note": None}

added = 0
for name, guides in HERO_GUIDES.items():
    if name not in existing:
        existing[name] = {**EMPTY, "_source": guides[0]["url"] if guides else None}
        added += 1

DST.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"  추가된 영웅: {added}, 전체: {len(existing)}")
print(f"  저장: {DST}")
