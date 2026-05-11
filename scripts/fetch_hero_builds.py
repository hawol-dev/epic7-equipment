"""
Fribbels Hero Library getBuilds API 호출 → 영웅별 평균 스펙 추출.
저장: data/raw/community_avg_stats.json
재실행 안전 — 실패한 영웅은 기존 값 유지.
"""
import json
import sys
import io
import time
import urllib.request
import urllib.error
from pathlib import Path

API_URL = "https://krivpfvxi0.execute-api.us-west-2.amazonaws.com/dev/getBuilds"
SLEEP_SEC = 1.0
BACKOFF_SEC = 60
MAX_CONSECUTIVE_403 = 3
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
SRC_HEROES = ROOT / "data/processed/heroes.json"
DST = ROOT / "data/raw/community_avg_stats.json"


def fetch_builds(en_name: str) -> list[dict]:
    """Fribbels API POST 호출. body는 영웅 영문 이름 plain text."""
    req = urllib.request.Request(
        API_URL,
        data=en_name.encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "text/plain",
            "User-Agent": USER_AGENT,
            "Origin": "https://fribbels.github.io",
            "Referer": "https://fribbels.github.io/",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        body = json.loads(r.read())
    return body.get("data") or []


def compute_averages(builds):
    """builds 배열에서 평균 stat. 빈 배열은 None."""
    if not builds:
        return None
    keys = ["atk", "def", "hp", "spd", "chc", "chd", "eff", "efr", "gs"]
    out = {}
    for k in keys:
        vals = [int(b[k]) for b in builds if b.get(k) is not None]
        out[k] = round(sum(vals) / len(vals), 1) if vals else 0.0
    out["n"] = len(builds)
    return out


def save_data(data: dict) -> None:
    DST.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    heroes = json.loads(SRC_HEROES.read_text(encoding="utf-8"))
    existing = json.loads(DST.read_text(encoding="utf-8")) if DST.exists() else {}
    new_data = dict(existing)
    success = total = consecutive_403 = 0

    en_names = []
    for h in heroes:
        en = h.get("names", {}).get("en")
        if en and en not in en_names:
            en_names.append(en)

    for i, en in enumerate(en_names, 1):
        # 이미 데이터 있으면 skip (재실행 시 효율적)
        if en in new_data:
            print(f"  [{i}/{len(en_names)}] skip {en} (already cached)")
            continue
        total += 1
        try:
            builds = fetch_builds(en)
            avg = compute_averages(builds)
            consecutive_403 = 0  # reset on any successful request
            if avg:
                new_data[en] = avg
                success += 1
                print(f"  [{i}/{len(en_names)}] ✓ {en}: n={avg['n']}")
                # 매 10명마다 incremental save
                if success % 10 == 0:
                    save_data(new_data)
            else:
                print(f"  [{i}/{len(en_names)}] - {en}: 0 builds")
            time.sleep(SLEEP_SEC)
        except urllib.error.HTTPError as e:
            if e.code == 403:
                consecutive_403 += 1
                print(f"  [{i}/{len(en_names)}] ✗ {en}: HTTP 403 (consecutive={consecutive_403})")
                if consecutive_403 >= MAX_CONSECUTIVE_403:
                    print(f"\n경고: 403 연속 {MAX_CONSECUTIVE_403}회 발생. {BACKOFF_SEC}초 대기 후 재시도.")
                    time.sleep(BACKOFF_SEC)
                    consecutive_403 = 0
                continue
            print(f"  [{i}/{len(en_names)}] ✗ {en}: HTTP {e.code}")
            continue
        except (urllib.error.URLError, ValueError, json.JSONDecodeError) as e:
            print(f"  [{i}/{len(en_names)}] ✗ {en}: {e}")
            continue

    # 마무리 — 항상 저장 (incremental save 누락분 포함)
    save_data(new_data)

    ratio = success / total if total else 0
    print(f"\n결과: 이번 실행 성공 {success}/{total} ({ratio:.1%})")
    print(f"누적 저장: {len(new_data)} 영웅")


if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    main()
