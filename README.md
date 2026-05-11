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

xlsx 파일이 업데이트됐을 때 (수동, 로컬에서):

```bash
# 파일1 (영웅별 유효옵.xlsx) → 정규화 JSON
python scripts/convert_file1.py

# 파일2 (장비시뮬.xlsx) → 작은 JSON으로 추출 (CI는 xlsx 못 올림)
python scripts/extract_file2_data.py

# 메타 머지
python scripts/merge_metadata.py
```

이후 단계는 GitHub Actions 가 매주 자동 실행 (수동도 가능):

```bash
# 통합 빌드
python scripts/build_unified_db.py

# web/src/data/ 로 복사
cp data/processed/{heroes,enums,search_index}.json web/src/data/

# 신규 영웅 이미지 다운로드
python scripts/download_images.py
```

자동 동기화는 `.github/workflows/sync-heroes.yml` — 매주 월요일 12:00 KST 에
Fribbels 최신 데이터 받아 자동 commit & push. hawol-dev 미러 push는
저장소 시크릿 `HAWOL_DEV_PAT` 필요.

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

### 2026-05-11

**영웅별 주옵션 표시**

- 디시 가이드 이미지 분석으로 46명(변형 포함 59 엔트리) 영웅의 목걸이/반지/신발 주옵션 수집
- 상세 페이지에 "주옵션" 섹션 추가 (인라인 SVG 슬롯 아이콘)
- 데이터 없는 영웅은 섹션 자체 숨김

**PVE/PVP 컨텐츠 태그**

- 영웅별 `tags.content`: variant_ko의 PVE 컨텐츠 표기(PVE/원정대/와이번/밴시/골렘/성좌/전당) 기반 자동 분류
- 메인 검색 고급 필터에 "컨텐츠" 칩 추가 (PVE/PVP)
- 상세 페이지 헤더 배지에 컨텐츠 표시

**부옵 strict 필터**

- 메인 검색에서 선택한 부옵 전부가 essential 또는 preferred인 영웅만 노출
- 이전: 1개라도 매칭되면 통과 → 이후: 선택한 전부 매칭되어야 통과
- 점수 공식·정렬은 변경 없음

### 2026-05-04

**모바일 헤더 + 자동 동기화**

- 모바일 헤더 햄버거 메뉴 (좁은 화면에서 nav 깔끔하게 접힘)
- 파일2 xlsx → 작은 JSON 캐시로 추출 (`extract_file2_data.py`)
- 빌드 파이프라인 xlsx 의존성 제거 (CI 환경에서 동작 가능)
- GitHub Actions 매주 월요일 자동 동기화 (`.github/workflows/sync-heroes.yml`)
  - Fribbels 최신 herodata · 한글번역 · 아티팩트 다운로드
  - 신규 영웅/이미지 자동 추가 후 commit & push
  - origin (Jung-sunghoon) + hawol-dev 미러 둘 다 푸시

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
