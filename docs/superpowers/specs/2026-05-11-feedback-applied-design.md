# 피드백 반영 디자인 — 2026-05-11

사용자 피드백 4가지(부옵 strict 필터 / 주옵션 노출 / PVE·PVP 태그 / 모바일 햄버거)에 대한 구현 디자인.

## 배경

`web/src/components/GearSearch.tsx` 메인 검색은 부옵을 1개라도 매칭하면 노출하지만, 사용자는 "선택한 부옵 전부가 유효해야" 노출되길 원함. 영웅 상세 페이지는 부옵·세트·아티팩트·각인까지 보여주지만 주옵션(목걸이/반지/신발) 권장값이 없음. `variant_ko`가 PVE/PVP/역할/빌드를 한 문자열에 섞어 담아 필터 불가. 모바일 햄버거 메뉴는 이미 구현돼 있었지만 미커밋 상태로 배포 안 됐고, 이미 commit/push 완료 (commit `3828095`).

## 데이터 출처 조사 결과

영웅별 주옵션 데이터는 다음 위치에 **존재하지 않음**:
- `에픽세븐 장비 유효옵의 사본.xlsx` — file1 원본, `[영웅별 유효옵]` 시트에 ●○ 부옵 마킹만
- `에픽세븐장비시뮬_26_04_14의 사본.xlsx` — `[추천 세팅]`은 세트/아티팩트만, `[캐릭터 정보]`는 메타만, `[이정도면잘키웠다]`는 단일 영웅 calculator 템플릿
- dcinside 모음집(2468784) — 영웅별 가이드 URL 인덱스만, 텍스트로 정리된 표 없음

→ 각 영웅의 dcinside 가이드 게시글에 첨부된 **이미지에서만** 확인 가능. 이미지 분석을 통해 수집해야 함.

## 적용 범위

| 항목 | 포함 | 비고 |
|------|------|------|
| 부옵 strict 필터 | ✓ | 토글 없이 디폴트 strict |
| 주옵션 데이터 수집 (54명) | ✓ | hero_guides.py 등록된 영웅 |
| 주옵션 UI (상세 페이지) | ✓ | 데이터 없는 영웅은 섹션 숨김 |
| PVE/PVP 태그 | ✓ | 단일 차원, content만 |
| 컨텐츠 필터 칩 (메인 검색) | ✓ | 고급 필터 영역 |
| 모바일 햄버거 | 완료 | commit `3828095`, 배포 대기 |
| 공식 API 평균 스펙 | 제외 | 별도 spec로 |
| 세부 페이지 아이콘 폴리시 | 제외 | phase 4 후속 작업 |
| role/build variant 정규화 | 제외 | `variant_ko` 그대로 |

## 디자인

### 1. 부옵 strict 필터

**대상 파일**: `web/src/lib/matching.ts`

`matchHeroes` 안의 부옵 제외 조건만 수정. 선택한 부옵 전부가 essential 또는 preferred일 때만 결과 포함.

```ts
// 변경 전 (lines 101-105)
if (query.substats.length > 0 &&
    matchedEssential.length === 0 &&
    matchedPreferred.length === 0) {
  continue;
}

// 변경 후
const matchedCount = matchedEssential.length + matchedPreferred.length;
if (query.substats.length > 0 && matchedCount < query.substats.length) {
  continue;
}
```

점수 공식(`essential×2 + preferred×1 + setBonus`)·정렬(점수→등급→가나다순)·세트 필터 모두 변경 없음.

**검증**: dev 서버에서 부옵 `속도/치확/치피` 3개 선택 시
- 숨김: 페이라(치확·치피 둘 다 null — 데이터 확인됨)
- 노출: 셋 모두 essential/preferred인 영웅만 (베니마루 등 치명 딜러 — 실제 결과는 데이터 검증 필요)

### 2. 주옵션 데이터 + UI

#### 2-1. 스키마

`web/src/lib/types.ts` `ValidOptions`에 추가:
```ts
export interface ValidOptions {
  // ... 기존 필드
  main_options: {
    necklace: SubstatId[];   // 1~2개
    ring:     SubstatId[];
    boots:    SubstatId[];
  } | null;
}
```

8개 부옵 enum과 동일한 ID 사용 (`spd, atk_p, hp_p, def_p, chc, chd, eff, effres`). null이면 데이터 없음 → UI 숨김.

#### 2-2. 데이터 파일

`data/raw/main_options.json`:
```json
{
  "고독한 늑대 페이라": {
    "necklace": ["atk_p"],
    "ring":     ["chd"],
    "boots":    ["spd"],
    "_source":  "https://gall.dcinside.com/.../no=2316561",
    "_note":    null
  }
}
```

`_source`·`_note` 는 검증/주석용. build 시 heroes.json에 머지될 때는 `main_options` 만 들어감.

#### 2-3. 수집 스크립트

**`scripts/fetch_guide_images.py`** (자동):
1. `scripts/hero_guides.py`의 `HERO_GUIDES` 순회
2. 각 URL을 `urllib.request`로 fetch (User-Agent: 일반 브라우저)
3. HTML에서 `dcimg1.dcinside.com/viewimage.php` 패턴 이미지 URL 추출
4. `data/raw/guide_images/{base_name}_{idx}.png` 저장 (이미지는 .gitignore)
5. dcimg URL이 referer 체크하면 fallback: WebFetch로 viewimage.php 거쳐 캐시

**`scripts/main_options_skeleton.py`** (수동 협업):
- HERO_GUIDES 키 기반 빈 main_options.json 템플릿 생성
- 이미 채워진 항목은 보존 (재실행 안전)

**Claude 작업** (Read 도구):
- guide_images/ 의 이미지를 영웅별로 열어보고 main_options.json 채움
- 가이드에서 옵션이 여럿이면 배열로 (예: 목걸이 = 공%/생% 둘 다)

#### 2-4. UI

`web/src/components/HeroDetail.tsx`의 `ValidOptionsBlock` 안, "부옵" 섹션 위에 `MainOptionsBlock` 신규.

```
┌─ 주옵션 ─────────┐    ← 새 섹션 (main_options 있을 때만)
│  목걸이  공격력%    │
│  반지   치명피해    │
│  신발   속도        │
└────────────────┘
┌─ 부옵 ───────────┐    ← 기존
│ ● 필수: 속 공% 효적 │
│ ○ 선호: 생%        │
└────────────────┘
```

- 슬롯 아이콘: 인라인 SVG 3개 (목걸이/반지/신발 픽토그램, 외부 자산 의존성 없음)
- 옵션 라벨: `enums.substats[id]` 사용해서 i18n 자동
- 옵션이 여럿이면 슬래시로 (`공격력% / 생명력%`)
- `main_options` 가 null이면 섹션 자체 렌더링 안 함

i18n 추가:
- `slot_necklace`: "목걸이" / "Necklace"
- `slot_ring`: "반지" / "Ring"
- `slot_boots`: "신발" / "Boots"
- `sec_main_options`: "주옵션" / "Main Options"

### 3. PVE/PVP 태그

#### 3-1. 스키마

`Hero` 인터페이스:
```ts
export interface Hero {
  // ... 기존 필드
  tags: {
    content: "pve" | "pvp";
  };
}
```

#### 3-2. 분류 (build_unified_db.py)

```python
PVE_KEYWORDS = {"PVE", "원정대", "와이번", "밴시원펀", "골렘원펀",
                "성좌", "성좌용", "전당", "대 스트라제스용"}

def classify_content(variant_ko: str | None) -> str:
    if variant_ko and any(kw in variant_ko for kw in PVE_KEYWORDS):
        return "pve"
    return "pvp"
```

규칙: PVE 컨텐츠 표기가 있으면 `pve`, 그 외 전부 `pvp` (사용자 결정사항).

`data/processed/build_report.txt`에 분류 결과 통계 출력:
```
컨텐츠 분류: pve=N, pvp=M
PVE 분류된 variant 목록: [...]
```

#### 3-3. 필터 UI

`web/src/components/GearSearch.tsx` 고급 필터(`<details>`) 안 마지막 Field로:
```tsx
<Field label={t("field_content")} inline>
  {["pve", "pvp"].map((c) => (
    <Chip
      label={t(`content_${c}`)}
      selected={selectedContents.includes(c)}
      onToggle={() => toggleContent(c)}
      size="sm"
    />
  ))}
</Field>
```

URL 파라미터: `?ct=pve` / `?ct=pve,pvp` (둘 다 == 빈 == 전체).

`lib/matching.ts`의 `metaMatches`에 추가:
```ts
if (query.contents?.length && !query.contents.includes(hero.tags.content)) {
  return false;
}
```

`GearQuery`에 `contents?: ("pve" | "pvp")[]` 필드 추가.

#### 3-4. 상세 페이지 배지

`HeroDetail.tsx` 헤더 배지 줄에 마지막으로 `[PVE]` 또는 `[PVP]` 배지 1개 추가.

i18n: `content_pve` = "PVE" / "PvE", `content_pvp` = "PVP" / "PvP", `field_content` = "컨텐츠" / "Content".

## Phase별 빌드 순서

각 phase는 독립 commit·deploy 가능.

### Phase 1 — Strict 필터
- `matching.ts:101-105` 조건 변경
- README 변경 이력 추가
- 검증: 부옵 3개 입력 결과 비교
- **커밋 1개**, 추정 10분

### Phase 2 — PVE/PVP 태그 + 필터
- `types.ts`: `Hero.tags.content`, `GearQuery.contents` 추가
- `build_unified_db.py`: `PVE_KEYWORDS` + `classify_content` + 통계 출력
- 빌드 후 `web/src/data/heroes.json` 재생성
- `lib/matching.ts`: `metaMatches`에 컨텐츠 필터
- `components/GearSearch.tsx`: 컨텐츠 칩, URL 파라미터, parseList
- `components/HeroDetail.tsx`: 헤더 배지
- `i18n/messages.ts`: 메시지 추가
- 검증: PVE만 / PVP만 / 둘 다 토글
- **커밋 1개**, 추정 30분

### Phase 3 — 주옵션 데이터 수집
- `scripts/fetch_guide_images.py` 작성 + 실행
- `scripts/main_options_skeleton.py` 작성 + 실행
- `data/raw/guide_images/` `.gitignore` 등록
- Claude가 Read 도구로 이미지 보며 `data/raw/main_options.json` 작성 (54명)
- 사용자 검수: 표본 5명 (페이라, 노토스, 라스, 빌트레드, 헤카테)
- **커밋 1개** (이미지 파일은 제외, JSON·스크립트만)
- 추정 1–2시간 (토큰 비용 5M 추정, 분할 가능)

### Phase 4 — 주옵션 UI
- `types.ts`: `ValidOptions.main_options` 추가
- `build_unified_db.py`: `main_options.json` 로드 + heroes에 머지
- `components/HeroDetail.tsx`: `MainOptionsBlock` 컴포넌트
- 인라인 SVG 아이콘 3개
- `i18n/messages.ts`: 슬롯 라벨 추가
- 검증: 표본 영웅 5명 표시 확인, 데이터 없는 영웅 섹션 숨김
- **커밋 1개**, 추정 40분

## 검증 기준

phase별 명시적 완료 기준:

| Phase | 완료 기준 |
|-------|-----------|
| 1 | dev 서버에서 `속도/치확/치피` 선택 시 페이라 숨김, 베니마루 노출 |
| 2 | `?ct=pve` 시 람(PVE)·루나(원정대) 노출, 페이라 숨김; `?ct=pvp` 시 반대 |
| 3 | `main_options.json` 54명 모두 채워짐, 사용자 검수 표본 5명 통과 |
| 4 | 표본 5명 상세 페이지에 주옵션 섹션 표시, 데이터 없는 영웅 섹션 자체 없음 |

## 위험 요소

- **dcimg referer 체크**: dcinside 이미지 URL이 referer를 검사하면 직접 다운로드 차단. Fallback으로 WebFetch (참조 헤더 자동 처리)를 거쳐 Claude의 이미지 캐시에 도달시키고 Read 도구로 분석.
- **Phase 3 토큰 비용**: 이미지당 30–60k, 100장이면 5M 토큰. 한 세션 내 다 처리 안 되면 phase 3-A(다운로드), 3-B(JSON 채우기) 분할.
- **분류 키워드 누락**: `PVE_KEYWORDS`에 들어가지 않은 새 PVE 컨텐츠 표기가 추가되면 PVP로 오분류. 빌드 리포트 통계로 모니터링.
- **main_options 중복 라벨**: 같은 slot에 옵션 여럿(예: 목 = 공%/생%) 일 때 UI 가독성. 슬래시 구분으로 충분히 짧음 (대부분 2개).

## 안 다룬 항목 (의도적 제외)

이번 spec 범위 밖. 별도 spec에서 처리.

- 공식 API 평균 스펙 연동 (외부 API 검증 필요)
- 세부 페이지 전반 아이콘 폴리시 (모호한 요청, phase 4 후속)
- role/build variant 정규화 (variant_ko 80+개 분류, 별도 큰 작업)
- 부옵 strict 토글 옵션 (현재는 디폴트 strict, 토글 없이 진행)
