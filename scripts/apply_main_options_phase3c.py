"""
Phase 3C 재분석 결과 적용 — 컨트롤러가 직접 47장 이미지 분석으로 발견한 수정 사항 적용.
이전 Phase 3B subagent들이 작은 stacked 보조 라벨을 놓친 부분 보정.

CORRECTIONS만 적용 (기존 정확한 항목은 건드리지 않음).
"""
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
DST = ROOT / "data/raw/main_options.json"

# (필드, 새 값) — 변경하지 않을 필드는 생략
CORRECTIONS = {
    "고독한 늑대 페이라": {"ring": ["hp_p", "eff"]},
    "기원의 라스": {"necklace": ["chc", "hp_p"]},
    "라비": {"necklace": ["chd"], "ring": ["hp_p"]},
    "리나크": {"ring": ["atk_p", "hp_p"]},
    "마신의 그림자": {"ring": ["hp_p"]},
    "방관자 화영": {"necklace": ["chd", "chc"], "boots": ["spd", "atk_p"]},
    "빛의 루엘": {"ring": ["hp_p", "effres"], "boots": ["spd", "hp_p"]},
    "사자왕 체르미아": {"necklace": ["chd"], "boots": ["spd", "hp_p"]},
    "설화": {"necklace": ["chd", "chc"], "boots": ["spd", "hp_p"]},
    "소악마 루아": {"ring": ["hp_p", "eff"]},
    "아람": {"boots": ["spd", "hp_p"]},
    "알베도": {"boots": ["spd", "hp_p"]},
    "영안의 셀린": {"necklace": ["chd"], "ring": ["atk_p", "effres"]},
    "전승의 아미키": {"ring": ["effres"]},
    "천칭의 주인": {"ring": ["eff", "effres"]},
    "축제의 에다": {"ring": ["hp_p", "eff"]},
    "쾌속의 기수 세크레트": {"ring": ["eff"]},
    "하르세티": {"necklace": ["chc", "hp_p"]},
    "화란의 라비": {"necklace": ["hp_p", "chd"], "ring": ["hp_p"]},
    "한낮의 유영 플랑": {"necklace": ["chd"]},
    "헤카테": {"necklace": ["atk_p", "hp_p"], "ring": ["atk_p", "hp_p"]},
}

existing = json.loads(DST.read_text(encoding="utf-8"))

applied = 0
missing = []
for name, fields in CORRECTIONS.items():
    if name not in existing:
        missing.append(name)
        continue
    entry = existing[name]
    for k, v in fields.items():
        old = entry.get(k)
        entry[k] = v
        print(f"  {name}.{k}: {old} → {v}")
    applied += 1

DST.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"\n적용된 영웅: {applied} / {len(CORRECTIONS)}")
if missing:
    print(f"누락된 키: {missing}")
print(f"저장: {DST}")
