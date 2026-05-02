# 에픽세븐 장비 가이드

에픽세븐(Epic Seven) 영웅별 유효 부옵션·세트·우선순위 검색 사이트.
"이 장비 누구한테 줘야할지" 빠르게 찾는 도구.

## 구조

```
.
├── web/              Next.js 16 + React 19 + Tailwind v4 (메인 사이트)
├── scripts/          Python 데이터 파이프라인
└── data/
    ├── raw/          원본/외부 소스 (Fribbels, 한글번역)
    └── processed/    빌드된 JSON (heroes / enums / search_index)
```

## 데이터 빌드

```bash
# 파일1 (영웅별 유효옵.xlsx) → 정규화 JSON
python scripts/convert_file1.py

# + 파일2 (장비시뮬.xlsx) 메타 머지
python scripts/merge_metadata.py

# 통합 빌드 (heroes.json / enums.json / search_index.json)
python scripts/build_unified_db.py

# web/src/data/ 로 복사
cp data/processed/{heroes,enums,search_index}.json web/src/data/
```

## 웹 개발

```bash
cd web
npm install
npm run dev   # http://localhost:3000
```

## 출처

- 영웅 유효옵 데이터: 디시인사이드 에픽세븐 마이너 갤러리 시트
- 영웅 이미지/메타: [Fribbels Epic 7 Optimizer](https://github.com/fribbels/Fribbels-Epic-7-Optimizer) (Smilegate 게임 자산 경유)
- 게임 원본: Epic Seven © Smilegate Megaport
