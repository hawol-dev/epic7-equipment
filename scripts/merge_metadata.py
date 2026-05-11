"""
파일2 캐릭터 정보 → 파일1 영웅 데이터에 메타데이터 머지

매칭 전략:
1. base_name (괄호 제거된 이름) 으로 파일2와 매칭
2. 같은 base_name이 file1에 여러 variant로 있으면 모두 같은 메타 받음

데이터 소스: data/raw/file2_meta.json (extract_file2_data.py로 사전 추출)
"""
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
SRC_FILE2_META = ROOT / "data/raw/file2_meta.json"
SRC_HEROES = ROOT / "data/raw/heroes_valid_options.json"
DST_MERGED = ROOT / "data/processed/heroes_merged.json"
DST_UNMATCHED = ROOT / "data/processed/unmatched_report.txt"

print("Loading file2 meta JSON...")
file2_meta = json.loads(SRC_FILE2_META.read_text(encoding="utf-8"))

print(f"파일2 영웅: {len(file2_meta)}")

# 파일1 영웅 로드
with open(SRC_HEROES, "r", encoding="utf-8") as f:
    heroes = json.load(f)

print(f"파일1 영웅: {len(heroes)}")

# 수동 별칭 (file1 base_name → file2 name)
NAME_ALIASES = {
    "적월의 헤이스트": "적월의 귀족 헤이스트",
    "전도사 카마인로즈": "전도자 카마인로즈",
    # "에스텔" — 파일2 누락 (수동 보강 필요)
}

# 머지
matched = 0
unmatched = []
for h in heroes:
    base = h["base_name"]
    lookup = NAME_ALIASES.get(base, base)
    meta = file2_meta.get(lookup)
    if meta:
        h["meta"] = meta
        matched += 1
    else:
        h["meta"] = None
        unmatched.append(h["name"])

print(f"매칭: {matched}/{len(heroes)}")
print(f"미매칭: {len(unmatched)}")

# 파일2엔 있는데 파일1엔 없는 영웅 (새 영웅 후보)
file1_base_names = {h["base_name"] for h in heroes}
file2_only = sorted(set(file2_meta.keys()) - file1_base_names)
print(f"파일2 에만 있는 영웅 (file1에 유효옵 정보 없음): {len(file2_only)}")

# 저장
DST_MERGED.parent.mkdir(parents=True, exist_ok=True)
with open(DST_MERGED, "w", encoding="utf-8") as f:
    json.dump(heroes, f, ensure_ascii=False, indent=2)

# 리포트
report = []
report.append(f"=== 메타데이터 머지 리포트 ===")
report.append(f"파일1 영웅 수: {len(heroes)}")
report.append(f"파일2 영웅 수: {len(file2_meta)}")
report.append(f"매칭 성공: {matched}")
report.append(f"매칭 실패 (file1에 있는데 file2에 없는 영웅): {len(unmatched)}")
report.append("")
report.append("--- 매칭 실패 영웅 (수동 확인 필요) ---")
for n in sorted(set(unmatched)):
    report.append(f"  {n}")
report.append("")
report.append(f"--- 파일2에만 있는 영웅 ({len(file2_only)}) — 유효옵 정보 추가 필요 ---")
for n in file2_only:
    report.append(f"  {n}")

DST_UNMATCHED.write_text("\n".join(report), encoding="utf-8")
print(f"\n저장: {DST_MERGED}")
print(f"리포트: {DST_UNMATCHED}")
print()
print("=== 미매칭 영웅 미리보기 ===")
for n in sorted(set(unmatched))[:20]:
    print(f"  {n}")
