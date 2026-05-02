"""
Fribbels GitHub raw에서 영웅 이미지 일괄 다운로드.

- 소스: https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/data/cachedimages/
- 대상: web/public/images/heroes/{code}_s.png, {code}_l.png
- 이미 있는 파일은 스킵
- 실패한 파일은 리포트
"""
import json
import sys
import io
import time
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
SRC = ROOT / "data/processed/heroes.json"
DST_DIR = ROOT / "web/public/images/heroes"

DST_DIR.mkdir(parents=True, exist_ok=True)


def download_one(url: str, dest: Path) -> tuple[bool, str]:
    if dest.exists() and dest.stat().st_size > 0:
        return True, "skip"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EpicSevenEquipment/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        dest.write_bytes(data)
        return True, f"ok {len(data)//1024}KB"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}"
    except Exception as e:
        return False, f"err {type(e).__name__}: {e}"


def main():
    heroes = json.loads(SRC.read_text(encoding="utf-8"))

    # 다운로드 작업 목록
    tasks = []
    for h in heroes:
        img = h.get("image") or {}
        for kind, suffix in [("icon", "_s"), ("thumbnail", "_l")]:
            url = img.get(kind)
            if not url:
                continue
            # URL 끝에서 파일명 추출
            filename = url.rsplit("/", 1)[-1]  # e.g. c1019_s.png
            dest = DST_DIR / filename
            tasks.append((url, dest, h["names"]["ko"]))

    print(f"총 {len(tasks)}개 이미지 다운로드 시작...")
    print(f"대상: {DST_DIR}")

    ok = 0
    skipped = 0
    failed = []
    start = time.time()

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(download_one, url, dest): (url, dest, name)
                   for url, dest, name in tasks}
        for i, fut in enumerate(as_completed(futures), 1):
            url, dest, name = futures[fut]
            success, msg = fut.result()
            if success:
                if msg == "skip":
                    skipped += 1
                else:
                    ok += 1
            else:
                failed.append((name, dest.name, msg))
            if i % 50 == 0 or i == len(tasks):
                elapsed = time.time() - start
                print(f"  진행 {i}/{len(tasks)}  성공:{ok}  스킵:{skipped}  실패:{len(failed)}  ({elapsed:.1f}s)")

    print(f"\n완료. 다운로드:{ok}  스킵:{skipped}  실패:{len(failed)}")
    if failed:
        print("\n실패 목록:")
        for name, fname, msg in failed[:20]:
            print(f"  [{name}] {fname} — {msg}")
        if len(failed) > 20:
            print(f"  ... 외 {len(failed) - 20}건")


if __name__ == "__main__":
    main()
