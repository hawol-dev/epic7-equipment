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

---

## 변경 이력

### 2026-05-03

**i18n / 정렬 / 자동완성 / 가이드 / 사용법**

- **데이터 보강**
  - 디시 갤러리 영웅별 가이드 링크 55개 (70명 영웅에 매칭)
  - 영웅 비고 168개 영문 번역
  - 22개 세트 효과 영문 번역
  - 추천 아티팩트 영문 매핑 (Fribbels + 수동 보강 20개)
- **매칭 점수 개선**
  - subset 보너스 +3점 추가 (입력 세트 ⊆ 영웅 추천 조합일 때)
  - 정확 일치 +5점은 그대로
  - 페이라처럼 멀티 세트 영웅도 단일 세트 입력 시 점수 받음
- **i18n (한국어 ↔ 영어)**
  - 헤더, 검색 폼, 필터, 영웅 상세, 세트, 사용법 모두 번역
  - 영웅 이름·세트·부옵·각인은 자동 전환
  - 우측 상단 KO/EN 토글 (cookie + localStorage 영속화)
  - SSR에서 cookie 읽어 hydration mismatch 해결
- **UX 개선**
  - 정렬 옵션 셀렉터 (메인 4종, /heroes 6종)
  - 영웅 이름 자동완성 dropdown (키보드 ↑↓Enter Esc)
  - 커스텀 dropdown (native `<select>` 대체)
  - /sets 세트 칩 클릭 → 메인 검색으로 점프
  - 페이지 크기 60→72 (모든 컬럼 수에서 마지막 줄 깔끔)
  - 모든 인터랙티브 요소에 `cursor: pointer`
- **새 페이지** — `/help` (사용법 가이드)
- **SEO**
  - sitemap.xml (290+ URL)
  - robots.txt
  - 페이지별 메타 description / OpenGraph 강화

### 2026-05-02

**최초 배포**

- **데이터 파이프라인**
  - 영웅별 유효옵 시트 정규화 (287명)
  - Fribbels herodata + 한글번역 머지
  - 22개 세트 / 8개 부옵 / 5속성 / 6직업 / 12별자리 enum
  - 추천 아티팩트 + 각인집중 등급별 효과 테이블
- **페이지**
  - `/` 장비 입력 → 매칭 영웅 (점수 정렬, URL 동기화)
  - `/heroes` 영웅 둘러보기 (필터: 속성/직업/등급/타입, 이름 검색)
  - `/hero/[id]` 영웅 상세 (유효옵, 추천 세트/아티팩트, 기본 스탯, 각인 효과, 변형, 비슷한 세팅)
  - `/sets` 22개 세트 효과 + 사용 영웅
- **자체 호스팅** — 영웅 이미지 816장 다운로드 (Vercel CDN)
- **Vercel 배포**
