"""
Phase 3B 결과 적용 — subagent들이 분석한 main_options 데이터를 main_options.json에 머지.
빈 배열인 영웅은 그대로 둠 (가이드 포맷 없는 영웅).
"""
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
DST = ROOT / "data/raw/main_options.json"

# Subagent 분석 결과 (Wave 1 + Wave 2)
ANALYSIS = {
    "고독한 늑대 페이라": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "고양이 클라릿사": None,
    "기원의 라스": {"necklace": ["chc"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "노토스": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "도시의 그림자 슈": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "디에네": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "뒤틀린 망령 카일론": {
        "necklace": ["hp_p", "chc", "def_p"],
        "ring": ["hp_p", "effres", "def_p"],
        "boots": ["hp_p", "atk_p", "def_p"],
        "_note": "탱망카 생/방, 딜망카 치확/공도",
    },
    "라이아": {
        "necklace": ["hp_p", "def_p"],
        "ring": ["hp_p", "def_p"],
        "boots": ["spd"],
        "_note": "속>생>방>>>효저",
    },
    "라비": {"necklace": ["atk_p"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "로앤나": None,
    "리나크": {"necklace": ["atk_p"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "마신의 그림자": {"necklace": ["hp_p"], "ring": ["def_p"], "boots": ["spd"], "_note": None},
    "모르트": {
        "necklace": ["hp_p", "chd"],
        "ring": ["hp_p"],
        "boots": ["spd", "hp_p"],
        "_note": None,
    },
    "모험가 라스": None,
    "메이드 클로에": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "방관자 화영": {"necklace": ["chc"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "보건교사 율하": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "보검의 군주 이세리아": {
        "necklace": ["atk_p", "hp_p"],
        "ring": ["atk_p", "hp_p"],
        "boots": ["atk_p", "hp_p"],
        "_note": "공%/생% 모두 허용",
    },
    "빛의 루엘": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "베로니카": {"necklace": ["chc"], "ring": ["eff"], "boots": ["spd"], "_note": None},
    "벨리안": {
        "necklace": ["hp_p"],
        "ring": ["hp_p"],
        "boots": ["spd", "hp_p"],
        "_note": "신발 속/생 모두 허용",
    },
    "사자왕 체르미아": {"necklace": ["chc"], "ring": ["def_p"], "boots": ["spd"], "_note": None},
    "설화": {"necklace": ["chc"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "소악마 루아": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "신월의 루나": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "심연의 유피네": {
        "necklace": ["def_p"],
        "ring": ["hp_p"],
        "boots": ["spd"],
        "_note": "가이드 이미지 저해상도 — 우선순위 텍스트 기반 추정",
    },
    "아람": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "알베도": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "어둠의 목자 디에네": {
        "necklace": ["chd"],
        "ring": ["hp_p", "eff", "effres"],
        "boots": ["spd"],
        "_note": "반지는 컨셉별 분기",
    },
    "어린 셰나": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "율하": None,
    "영안의 셀린": {"necklace": ["chc"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "일편고월 벨로나": None,
    "전술형 콜리": None,
    "전승의 아미키": {"necklace": ["atk_p"], "ring": ["atk_p"], "boots": ["atk_p"], "_note": None},
    "조장 아룬카": {
        "necklace": ["hp_p", "def_p"],
        "ring": ["hp_p", "def_p"],
        "boots": ["hp_p", "def_p"],
        "_note": None,
    },
    "조향사 비브리스": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "집행관 빌트레드": {"necklace": ["chd"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "천칭의 주인": {"necklace": ["hp_p"], "ring": ["effres"], "boots": ["spd"], "_note": None},
    "창공의 일리나브": {"necklace": ["hp_p"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "축제의 에다": {"necklace": ["hp_p"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "키리스": None,
    "쾌속의 기수 세크레트": {"necklace": ["hp_p"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "타라노르 근위부대원": None,
    "타마린느": None,
    "토라미": {"necklace": ["chd"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "풍기위원 아리아": {"necklace": ["chd"], "ring": ["hp_p"], "boots": ["spd"], "_note": None},
    "프리렌": {"necklace": ["chd"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "하르세티": {
        "necklace": ["chd"],
        "ring": ["hp_p"],
        "boots": ["hp_p"],
        "_note": "가이드별 옵션 차이 있음 — 치피/생/생 채택",
    },
    "화란의 라비": {"necklace": ["hp_p"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "한낮의 유영 플랑": {"necklace": ["chc"], "ring": ["atk_p"], "boots": ["spd"], "_note": None},
    "혈검 카린": None,
    "호반의 마녀 테네브리아": {"necklace": ["hp_p"], "ring": ["eff"], "boots": ["spd"], "_note": None},
    "호위대장 크라우": {"necklace": ["def_p"], "ring": ["def_p"], "boots": ["spd"], "_note": None},
    "헤카테": {"necklace": ["eff"], "ring": ["eff"], "boots": ["spd"], "_note": None},
    "해변의 벨로나": {
        "necklace": ["chc", "chd"],
        "ring": ["atk_p", "hp_p"],
        "boots": ["atk_p", "hp_p"],
        "_note": None,
    },
}

existing = json.loads(DST.read_text(encoding="utf-8"))

filled = 0
skipped = 0
unknown = []

for name, analysis in ANALYSIS.items():
    if name not in existing:
        unknown.append(name)
        continue
    if analysis is None:
        skipped += 1
        continue
    # 기존 _source 보존, 분석 결과로 슬롯·_note 갱신
    entry = existing[name]
    entry["necklace"] = analysis["necklace"]
    entry["ring"] = analysis["ring"]
    entry["boots"] = analysis["boots"]
    entry["_note"] = analysis.get("_note")
    filled += 1

DST.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"채운 영웅: {filled}")
print(f"가이드 포맷 없음(스킵): {skipped}")
print(f"분석 누락(전체): {len(existing) - filled - skipped}")
if unknown:
    print(f"\n경고: ANALYSIS에 있지만 main_options.json에 없는 키:")
    for u in unknown:
        print(f"  - {u}")
print(f"\n저장: {DST}")
