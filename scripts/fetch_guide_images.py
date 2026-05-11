"""
hero_guides.py 의 디시 URL에서 첨부 이미지를 다운로드.
저장 위치: data/raw/guide_images/{base_name}_{idx}.jpg
이미 받은 파일은 스킵 (재실행 안전).
"""
import re
import sys
import io
import time
import urllib.request
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent))
from hero_guides import HERO_GUIDES

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
DST_DIR = ROOT / "data/raw/guide_images"
DST_DIR.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
DCIMG_RE = re.compile(r'https://dcimg\d+\.dcinside\.(?:com|co\.kr)/viewimage\.php\?[^"\']+')


def fetch(url: str, referer: str | None = None) -> bytes:
    headers = {"User-Agent": UA}
    if referer:
        headers["Referer"] = referer
    else:
        headers["Referer"] = "https://gall.dcinside.com/"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()


def extract_image_urls(post_url: str) -> list[str]:
    html = fetch(post_url).decode("utf-8", errors="ignore")
    return list(dict.fromkeys(DCIMG_RE.findall(html)))


def safe_filename(name: str) -> str:
    return re.sub(r'[\\/:*?"<>|]', '_', name)


def main():
    ok = miss = 0
    for hero_name, guides in HERO_GUIDES.items():
        if not guides:
            continue
        url = guides[0]["url"]
        slug = safe_filename(hero_name)
        existing = list(DST_DIR.glob(f"{slug}_*.jpg")) + list(DST_DIR.glob(f"{slug}_*.png"))
        if existing:
            print(f"  skip {hero_name} ({len(existing)}장 있음)")
            ok += 1
            continue
        try:
            imgs = extract_image_urls(url)
            if not imgs:
                print(f"  ✗ {hero_name}: 이미지 추출 실패")
                miss += 1
                continue
            for i, img_url in enumerate(imgs):
                data = fetch(img_url, referer=url)
                ext = "png" if data[:8] == b"\x89PNG\r\n\x1a\n" else "jpg"
                fp = DST_DIR / f"{slug}_{i+1}.{ext}"
                fp.write_bytes(data)
                print(f"  ✓ {hero_name}_{i+1}.{ext} ({len(data)} bytes)")
            ok += 1
        except Exception as e:
            print(f"  ✗ {hero_name}: {e}")
            miss += 1
        time.sleep(1)

    print(f"\n완료: 성공 {ok} / 실패 {miss}")


if __name__ == "__main__":
    main()
