"""
키 큰 가이드 이미지(>800px tall)의 상단 600px만 크롭해서 별도 저장.
'추천 주요 옵션' 섹션이 보통 상단에 있어서 다운샘플링 없이 깔끔하게 읽힘.
"""
from PIL import Image
from pathlib import Path
import sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data/raw/guide_images"
DST = ROOT / "data/raw/guide_images_cropped"
DST.mkdir(parents=True, exist_ok=True)

CROP_HEIGHT = 600
cropped = skipped = 0

for src_path in sorted(SRC.glob("*_1.*")):
    img = Image.open(src_path)
    w, h = img.size
    if h > 800:
        new_img = img.crop((0, 0, w, min(CROP_HEIGHT, h)))
        dst_path = DST / src_path.name
        new_img.save(dst_path)
        cropped += 1
        print(f"  crop {src_path.name}  ({w}x{h} -> {w}x{min(CROP_HEIGHT, h)})")
    else:
        skipped += 1

print(f"\n크롭: {cropped}, 스킵(이미 짧음): {skipped}")
