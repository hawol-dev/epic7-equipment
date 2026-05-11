# 피드백 반영 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 부옵 strict 필터 / PVE·PVP 태그 / 영웅별 주옵션 표시 — 사용자 피드백 4건을 4 phase로 적용.

**Architecture:** Phase 1·2·4는 코드 변경 위주(matching/UI/types), Phase 3은 디시 가이드 이미지 분석으로 데이터 수집. 각 phase는 독립 commit. 데이터는 `data/raw/` → `scripts/build_unified_db.py` → `web/src/data/` 파이프라인 유지.

**Tech Stack:**
- Next.js 16 + React 19 + Tailwind v4 (web/)
- Python 3.11 + openpyxl (scripts/)
- Vitest (web/ 테스트 — phase 1에서 처음 도입)
- Python stdlib `unittest` (scripts/ 테스트)

**Reference spec:** `docs/superpowers/specs/2026-05-11-feedback-applied-design.md`

---

## Phase 1: Strict 부옵 필터

검색 매칭에서 "선택한 부옵 전부가 essential 또는 preferred인 영웅"만 노출하도록 변경.

### Task 1.0: Vitest 설치 + 설정

**Files:**
- Modify: `web/package.json`
- Create: `web/vitest.config.ts`

- [ ] **Step 1: Vitest 및 의존성 설치**

```bash
cd web
npm install -D vitest @vitest/ui
```

- [ ] **Step 2: vitest.config.ts 생성**

```bash
cat > web/vitest.config.ts <<'EOF'
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
EOF
```

- [ ] **Step 3: package.json scripts에 test 추가**

`web/package.json`의 `scripts` 안에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 동작 확인 — placeholder 테스트로 vitest 실행 검증**

```bash
mkdir -p web/src/lib
cat > web/src/lib/smoke.test.ts <<'EOF'
import { test, expect } from "vitest";
test("vitest works", () => { expect(1 + 1).toBe(2); });
EOF
cd web && npm test
```
Expected: `1 passed`. 통과 후 smoke.test.ts 삭제.

```bash
rm web/src/lib/smoke.test.ts
```

- [ ] **Step 5: 커밋**

```bash
git add web/package.json web/package-lock.json web/vitest.config.ts
git commit -m "chore: vitest 도구 추가 (web/ 단위 테스트용)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 1.1: matchHeroes strict 필터 — failing test

**Files:**
- Create: `web/src/lib/matching.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`web/src/lib/matching.test.ts`:
```ts
import { test, expect } from "vitest";
import { matchHeroes } from "./matching";
import type { Hero, SubstatId } from "./types";

function makeHero(
  id: string,
  subs: Partial<Record<SubstatId, "essential" | "preferred" | null>>
): Hero {
  return {
    id,
    code: id,
    type: "standard",
    names: { ko: id, en: id },
    base_name_ko: id,
    variant_ko: null,
    rarity: 5,
    element: "fire",
    class: "warrior",
    zodiac: null,
    engraving_focus: null,
    categories: [],
    image: null,
    base_stats: null,
    recommended_artifacts: null,
    guides: null,
    valid_options: {
      substats: {
        spd: subs.spd ?? null,
        atk_p: subs.atk_p ?? null,
        hp_p: subs.hp_p ?? null,
        def_p: subs.def_p ?? null,
        chc: subs.chc ?? null,
        chd: subs.chd ?? null,
        eff: subs.eff ?? null,
        effres: subs.effres ?? null,
      },
      priority_order: [],
      priority_unknown: false,
      set_combos: [],
      valid_sets: [],
      ignore_2set: false,
      notes: null,
      notes_en: null,
    },
    has_data: true,
    source: [],
  };
}

test("strict 필터: 선택한 부옵 셋 모두 essential이면 노출", () => {
  const heroes = [
    makeHero("all_three", { spd: "essential", chc: "essential", chd: "essential" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc", "chd"] });
  expect(results.length).toBe(1);
  expect(results[0].hero.id).toBe("all_three");
});

test("strict 필터: 선택한 부옵 중 하나라도 null이면 제외", () => {
  const heroes = [
    makeHero("missing_chd", { spd: "essential", chc: "essential", chd: null }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc", "chd"] });
  expect(results.length).toBe(0);
});

test("strict 필터: essential 과 preferred 혼합 OK", () => {
  const heroes = [
    makeHero("mixed", { spd: "essential", chc: "preferred", chd: "essential" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: ["spd", "chc", "chd"] });
  expect(results.length).toBe(1);
});

test("strict 필터: 부옵 입력 없으면 영웅 데이터 있는 거 다 통과", () => {
  const heroes = [
    makeHero("a", { spd: "essential" }),
    makeHero("b", { chc: "essential" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: [] });
  expect(results.length).toBe(2);
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd web && npm test
```
Expected: `"strict 필터: 선택한 부옵 중 하나라도 null이면 제외"` 실패 (현재 로직은 1개라도 매칭되면 통과시키므로 missing_chd가 통과되어 length === 1 vs expected 0).

### Task 1.2: matching.ts strict 로직 구현

**Files:**
- Modify: `web/src/lib/matching.ts:100-105`

- [ ] **Step 1: 부옵 제외 조건 수정**

`web/src/lib/matching.ts` 안의 다음 블록(line 100-105 부근):
```ts
    // 부옵 입력했는데 하나도 매칭 안되면 제외
    if (query.substats.length > 0 &&
        matchedEssential.length === 0 &&
        matchedPreferred.length === 0) {
      continue;
    }
```
를 아래로 교체:
```ts
    // 부옵 strict 필터: 선택한 부옵 전부가 essential 또는 preferred일 때만 통과
    const matchedCount = matchedEssential.length + matchedPreferred.length;
    if (query.substats.length > 0 && matchedCount < query.substats.length) {
      continue;
    }
```

- [ ] **Step 2: 테스트 재실행 — 통과 확인**

```bash
cd web && npm test
```
Expected: 4 passed.

### Task 1.3: 데브 서버 수동 검증

- [ ] **Step 1: 데브 서버 시작**

```bash
cd web && npm run dev
```

- [ ] **Step 2: 브라우저에서 부옵 시나리오 테스트**

`http://localhost:3000/?sub=spd,chc,chd` 접속:
- 페이라(고독한 늑대 페이라) 결과에 **없어야** 함 (치확/치피 둘 다 null)
- 결과에 나타난 영웅들은 모두 셋(속도/치확/치피) 다 essential 또는 preferred인지 hero 페이지 열어 확인 (표본 3명)

`http://localhost:3000/?sub=spd` (1개만):
- 결과 다수 노출되어야 함 (속도 essential/preferred 영웅 다수)

- [ ] **Step 3: 데브 서버 종료** (Ctrl+C)

### Task 1.4: README 변경 이력 + 커밋

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README 변경 이력에 항목 추가**

`README.md`의 `## 변경 이력` 아래, `### 2026-05-04` 위에 추가:
```markdown
### 2026-05-11

**부옵 strict 필터**

- 메인 검색에서 선택한 부옵 전부가 essential 또는 preferred인 영웅만 노출
- 이전: 1개라도 매칭되면 통과 → 이후: 선택한 전부 매칭되어야 통과
- 점수 공식·정렬은 변경 없음
```

- [ ] **Step 2: 커밋**

```bash
git add web/src/lib/matching.ts web/src/lib/matching.test.ts README.md
git commit -m "feat: 부옵 strict 필터 적용

선택한 부옵 전부가 essential 또는 preferred인 영웅만 노출.
matching.ts 의 부옵 제외 조건 한 곳 수정.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2: PVE/PVP 태그

영웅에 단일 컨텐츠 태그(pve/pvp)를 부여하고 메인 검색 고급 필터에 컨텐츠 칩, 상세 페이지에 배지를 추가.

### Task 2.0: types.ts — Hero.tags 필드 추가

**Files:**
- Modify: `web/src/lib/types.ts:68-89`
- Modify: `web/src/lib/matching.test.ts` (Phase 1에서 만든 헬퍼)

- [ ] **Step 1: ContentTag 타입 추가**

`web/src/lib/types.ts` 의 `EngravingId` 정의 아래(line 30 부근)에 추가:
```ts
export type ContentTag = "pve" | "pvp";
```

- [ ] **Step 2: Hero 인터페이스에 tags 필드 추가**

`web/src/lib/types.ts:68-89`의 `Hero` 인터페이스 안에 추가 (마지막 필드 `translation_missing?` 위):
```ts
  tags: { content: ContentTag };
```

- [ ] **Step 3: matching.test.ts 의 makeHero에 tags 필드 추가**

Phase 1에서 작성한 `matching.test.ts`의 makeHero가 Hero 새 필수 필드 때문에 TS 컴파일 깨짐. 헬퍼에서 Hero 객체 리턴 부분에 추가 (`source: []` 다음):
```ts
    tags: { content: "pvp" },
```
makeHero의 두번째 인자 타입을 다음으로 확장:
```ts
  subs: Partial<Record<SubstatId, "essential" | "preferred" | null>> & {
    content?: "pve" | "pvp";
  }
```
그리고 tags 라인을 다음으로 변경:
```ts
    tags: { content: subs.content ?? "pvp" },
```

- [ ] **Step 4: 테스트 재실행 — 기존 Phase 1 테스트 통과 확인**

```bash
cd web && npm test
```
Expected: 4 passed (Phase 1 테스트 그대로 통과).

### Task 2.1: classify_content Python 함수 — failing test

**Files:**
- Create: `scripts/test_classify_content.py`

- [ ] **Step 1: 실패하는 테스트 작성**

`scripts/test_classify_content.py`:
```python
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from build_unified_db import classify_content


class TestClassifyContent(unittest.TestCase):
    def test_pve_variant(self):
        self.assertEqual(classify_content("PVE"), "pve")

    def test_expedition_variant(self):
        self.assertEqual(classify_content("원정대"), "pve")

    def test_wyvern_variant(self):
        self.assertEqual(classify_content("와이번"), "pve")

    def test_banshee_one_punch(self):
        self.assertEqual(classify_content("밴시원펀"), "pve")

    def test_constellation(self):
        self.assertEqual(classify_content("성좌"), "pve")

    def test_hall(self):
        self.assertEqual(classify_content("전당"), "pve")

    def test_versus_specific_boss(self):
        self.assertEqual(classify_content("대 스트라제스용"), "pve")

    def test_mixed_pve_text(self):
        self.assertEqual(classify_content("원정대 리치 전열"), "pve")

    def test_role_variant_is_pvp(self):
        self.assertEqual(classify_content("탱"), "pvp")
        self.assertEqual(classify_content("딜"), "pvp")
        self.assertEqual(classify_content("디버퍼"), "pvp")

    def test_build_variant_is_pvp(self):
        self.assertEqual(classify_content("효저"), "pvp")
        self.assertEqual(classify_content("속막이"), "pvp")
        self.assertEqual(classify_content("치치"), "pvp")

    def test_explicit_pvp(self):
        self.assertEqual(classify_content("PVP"), "pvp")

    def test_none_or_empty(self):
        self.assertEqual(classify_content(None), "pvp")
        self.assertEqual(classify_content(""), "pvp")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/test_classify_content.py
```
Expected: `ImportError: cannot import name 'classify_content'`

### Task 2.2: build_unified_db.py에 classify_content 통합

**Files:**
- Modify: `scripts/build_unified_db.py`

- [ ] **Step 1: classify_content 함수 + 키워드 상수 추가**

`scripts/build_unified_db.py` 상단의 import 블록(line 30 부근) 아래, 다른 헬퍼 함수들과 같은 위치에 추가:
```python
PVE_KEYWORDS = (
    "PVE", "원정대", "와이번", "밴시원펀", "골렘원펀",
    "성좌", "성좌용", "전당", "대 스트라제스용",
)


def classify_content(variant_ko: str | None) -> str:
    """variant_ko에 PVE 컨텐츠 표기가 있으면 'pve', 그 외 전부 'pvp'."""
    if not variant_ko:
        return "pvp"
    for kw in PVE_KEYWORDS:
        if kw in variant_ko:
            return "pve"
    return "pvp"
```

- [ ] **Step 2: 테스트 재실행 — 통과 확인**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/test_classify_content.py
```
Expected: `Ran 12 tests in 0.001s — OK`

- [ ] **Step 3: 영웅 빌드 루프에 tags 필드 추가**

`scripts/build_unified_db.py`에서 영웅 dict를 만드는 부분(검색해서 `"valid_options":` 또는 `"has_data":` 부근, 영웅 dict가 최종 구성되는 곳)을 찾아, 해당 dict에 다음 라인 추가:
```python
"tags": {"content": classify_content(variant_ko)},
```
변수명 `variant_ko`가 그 컨텍스트에 없으면 영웅 dict에 이미 들어있는 `"variant_ko"` 값을 사용 (예: `hero_obj["variant_ko"]`). 실제 위치는 grep `"has_data"` 로 찾을 것.

- [ ] **Step 4: 빌드 + 분류 결과 확인**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/build_unified_db.py
```
Expected: 출력에 에러 없음. `data/processed/heroes.json`에 `"tags": {"content": "pve"}` 또는 `"pvp"` 필드가 각 영웅 entry에 들어가야 함:

```bash
grep -c '"tags":' data/processed/heroes.json
```
Expected: 영웅 수와 일치 (288).

- [ ] **Step 5: 분류 통계 빠르게 확인**

```bash
python -c "
import json
heroes = json.load(open('data/processed/heroes.json', encoding='utf-8'))
from collections import Counter
c = Counter(h['tags']['content'] for h in heroes)
print(c)
print()
print('PVE 분류된 영웅:')
for h in heroes:
    if h['tags']['content'] == 'pve':
        print(f'  {h[\"names\"][\"ko\"]} (variant={h[\"variant_ko\"]})')
" | head -50
```
Expected: pve로 분류된 영웅들이 모두 variant_ko에 PVE/원정대/와이번/밴시/골렘/성좌/전당/대~용 중 하나를 포함해야 함.

### Task 2.3: heroes.json 을 web/src/data 로 복사

- [ ] **Step 1: 빌드된 데이터 복사**

```bash
cp data/processed/heroes.json data/processed/enums.json data/processed/search_index.json web/src/data/
```

- [ ] **Step 2: 복사 확인**

```bash
grep -m1 '"tags":' web/src/data/heroes.json
```
Expected: 첫 영웅에 tags 필드가 보임.

### Task 2.4: matching.ts — contents 필터 — failing test

**Files:**
- Modify: `web/src/lib/matching.test.ts`

- [ ] **Step 1: 테스트 추가**

makeHero 헬퍼는 Task 2.0에서 이미 `content` 옵션 받게 갱신됨. `matching.test.ts` 파일 끝에 새 테스트 두 개만 추가:
```ts
test("contents 필터: pve만 선택 시 pve 영웅만 통과", () => {
  const heroes = [
    makeHero("a_pve", { spd: "essential", content: "pve" }),
    makeHero("b_pvp", { spd: "essential", content: "pvp" }),
  ];
  const results = matchHeroes(heroes, {
    sets: [], substats: [], contents: ["pve"],
  });
  expect(results.map((r) => r.hero.id)).toEqual(["a_pve"]);
});

test("contents 필터: 비어있으면 둘 다 통과", () => {
  const heroes = [
    makeHero("a_pve", { spd: "essential", content: "pve" }),
    makeHero("b_pvp", { spd: "essential", content: "pvp" }),
  ];
  const results = matchHeroes(heroes, { sets: [], substats: [] });
  expect(results.length).toBe(2);
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd web && npm test
```
Expected: 새 테스트 2개 실패 (TS 컴파일 에러 또는 `contents` 미정의).

### Task 2.5: matching.ts — contents 필터 구현

**Files:**
- Modify: `web/src/lib/matching.ts:1-7`, `web/src/lib/matching.ts:9-18`, `web/src/lib/matching.ts:45-56`

- [ ] **Step 1: ContentTag 임포트 추가**

`web/src/lib/matching.ts`의 import 블록 (line 1-7)에 ContentTag 추가:
```ts
import type {
  Hero,
  SubstatId,
  SetId,
  ElementId,
  ClassId,
  ContentTag,
} from "./types";
```

- [ ] **Step 2: GearQuery에 contents 필드 추가**

`GearQuery` 인터페이스에 추가 (rarities 다음 line):
```ts
  contents?: ContentTag[];
```

- [ ] **Step 3: metaMatches에 contents 체크 추가**

`metaMatches` 함수의 rarities 체크 뒤에 추가:
```ts
  if (query.contents?.length && !query.contents.includes(hero.tags.content)) {
    return false;
  }
```

- [ ] **Step 4: 테스트 재실행 — 통과 확인**

```bash
cd web && npm test
```
Expected: 6 passed.

### Task 2.6: GearSearch.tsx — 컨텐츠 칩 + URL 파라미터

**Files:**
- Modify: `web/src/components/GearSearch.tsx`

- [ ] **Step 1: ContentTag 임포트 추가**

`web/src/components/GearSearch.tsx`의 import 타입 블록(line 21-26)에 추가:
```ts
  ContentTag,
```

- [ ] **Step 2: 상수 및 파싱 추가**

라인 28-32(`SUBSTAT_ORDER` 정의 부근) 근처에 추가:
```ts
const CONTENT_ORDER: ContentTag[] = ["pve", "pvp"];
```

`GearSearch` 함수 안 `selectedRarities` 정의(line 79-82) 다음에 추가:
```ts
  const selectedContents = parseList(params.get("ct"), CONTENT_ORDER);
```

- [ ] **Step 3: toggleContent 핸들러 + 검색 input 영역**

`toggleRarity` (line 119-124) 다음에 추가:
```ts
  const toggleContent = (id: ContentTag) => {
    const cur = new Set(selectedContents);
    if (cur.has(id)) cur.delete(id);
    else cur.add(id);
    updateParam("ct", Array.from(cur));
  };
```

`hasInput` 계산식(line 131-134)에 `selectedContents.length` 추가:
```ts
  const hasInput =
    selectedSets.length + selectedSubs.length +
    selectedElements.length + selectedClasses.length +
    selectedRarities.length + selectedContents.length > 0;
```

- [ ] **Step 4: matchHeroes 호출에 contents 전달**

results useMemo 안 matchHeroes 호출(line 138-144)에 추가:
```ts
      contents: selectedContents.length ? selectedContents : undefined,
```
deps 배열에도 추가:
```ts
    selectedContents.join(","),
```

- [ ] **Step 5: 고급 필터 영역에 컨텐츠 Field 추가**

`<Field label={t("field_rarity")} inline>` 블록(line 266-279) 다음에 추가:
```tsx
            <Field label={t("field_content")} inline>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_ORDER.map((id) => (
                  <Chip
                    key={id}
                    label={t(`content_${id}`)}
                    selected={selectedContents.includes(id)}
                    onToggle={() => toggleContent(id)}
                    size="sm"
                  />
                ))}
              </div>
            </Field>
```

- [ ] **Step 6: 고급 필터 카운터(`<summary>` 안)에 selectedContents 추가**

`(selectedElements.length + selectedClasses.length + selectedRarities.length)` 표현(line 232) 을 다음으로 교체:
```tsx
{(selectedElements.length + selectedClasses.length + selectedRarities.length + selectedContents.length) > 0 && (
  <span className="ml-1 text-[var(--accent)] tabular">
    {selectedElements.length + selectedClasses.length + selectedRarities.length + selectedContents.length}
  </span>
)}
```

### Task 2.7: HeroDetail.tsx — 컨텐츠 배지

**Files:**
- Modify: `web/src/components/HeroDetail.tsx:124-126`

- [ ] **Step 1: 헤더 배지 줄에 컨텐츠 배지 추가**

`HeroDetail.tsx`에서 `{TYPE_LABEL[hero.type] && (` 블록(line 124-126) 바로 뒤에:
```tsx
              {hero.tags?.content && (
                <Badge subtle>{t(`content_${hero.tags.content}`)}</Badge>
              )}
```

### Task 2.8: i18n 메시지 추가

**Files:**
- Modify: `web/src/i18n/messages.ts`

- [ ] **Step 1: 메시지 항목 추가**

`web/src/i18n/messages.ts` 의 `lang_english` 항목(line 123) 다음, 닫는 `} as const;` 전에 추가:
```ts
  // Content tags (PVE/PVP)
  field_content:    { ko: "컨텐츠",                                  en: "Content" },
  content_pve:      { ko: "PVE",                                     en: "PvE" },
  content_pvp:      { ko: "PVP",                                     en: "PvP" },
```

### Task 2.9: 데브 서버 수동 검증

- [ ] **Step 1: 데브 서버 + URL 확인**

```bash
cd web && npm run dev
```

브라우저:
- `http://localhost:3000/` → 고급 필터 펼치면 "컨텐츠" Field 보이고 [PVE][PVP] 칩 노출
- PVE 칩 클릭 → URL이 `?ct=pve` 로 변경, 결과에 람(PVE), 루나(원정대), 루루카(PVE) 등 노출
- PVP 칩 추가 클릭 → URL이 `?ct=pve,pvp`, 결과는 PVE/PVP 둘 다 영웅 노출
- `/hero/ram__pve` 접속 → 헤더 배지 줄에 `[PVE]` 보임
- `/hero/lone-wolf-peira` 접속 → `[PVP]` 보임 (variant_ko null이므로 PVP 분류)

- [ ] **Step 2: 데브 서버 종료**

### Task 2.10: README 변경 이력 + 커밋

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README 변경 이력 업데이트**

`README.md` 의 `### 2026-05-11` 항목에 추가:
```markdown
**PVE/PVP 컨텐츠 태그**

- 영웅별 `tags.content`: variant_ko의 PVE 컨텐츠 표기(PVE/원정대/와이번/밴시/골렘/성좌/전당) 기반 자동 분류
- 메인 검색 고급 필터에 "컨텐츠" 칩 추가 (PVE/PVP)
- 상세 페이지 헤더 배지에 컨텐츠 표시
```

- [ ] **Step 2: 커밋**

```bash
git add web/src/lib/types.ts web/src/lib/matching.ts web/src/lib/matching.test.ts \
        web/src/components/GearSearch.tsx web/src/components/HeroDetail.tsx \
        web/src/i18n/messages.ts web/src/data/heroes.json web/src/data/enums.json \
        web/src/data/search_index.json data/processed/ \
        scripts/build_unified_db.py scripts/test_classify_content.py README.md
git commit -m "feat: PVE/PVP 컨텐츠 태그 도입

- types.ts: ContentTag 타입, Hero.tags.content 필드
- build_unified_db.py: classify_content() — variant_ko 키워드 기반 분류
- matching.ts: contents 필터 (없으면 둘 다 통과)
- GearSearch.tsx: 컨텐츠 필터 칩 (?ct=pve,pvp URL 동기화)
- HeroDetail.tsx: 헤더 컨텐츠 배지
- i18n: content_pve, content_pvp, field_content

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3: 주옵션 데이터 수집

`hero_guides.py`의 54명 영웅 디시 가이드 이미지를 다운로드 + Claude가 Read로 분석해서 `data/raw/main_options.json` 작성.

### Task 3.1: fetch_guide_images.py 작성

**Files:**
- Create: `scripts/fetch_guide_images.py`

- [ ] **Step 1: 스크립트 작성**

`scripts/fetch_guide_images.py`:
```python
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
DCIMG_RE = re.compile(r'https://dcimg\d+\.dcinside\.com/viewimage\.php\?[^"\']+')


def fetch(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Referer": "https://gall.dcinside.com/"},
    )
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
                data = fetch(img_url)
                ext = "png" if data[:8] == b"\x89PNG\r\n\x1a\n" else "jpg"
                fp = DST_DIR / f"{slug}_{i+1}.{ext}"
                fp.write_bytes(data)
                print(f"  ✓ {hero_name}_{i+1}.{ext} ({len(data)} bytes)")
            ok += 1
        except Exception as e:
            print(f"  ✗ {hero_name}: {e}")
            miss += 1
        time.sleep(1)  # dcinside 친화적 폴링

    print(f"\n완료: 성공 {ok} / 실패 {miss}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: .gitignore에 이미지 디렉토리 등록**

`.gitignore`에 추가 (없으면 생성):
```
# Phase 3 로컬 이미지 캐시
data/raw/guide_images/
```

- [ ] **Step 3: 스크립트 실행**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/fetch_guide_images.py 2>&1 | tee /tmp/fetch_log.txt
```
Expected: `data/raw/guide_images/`에 영웅별 1–3장의 jpg/png. 실패한 영웅은 로그에서 확인. dcimg referer 검증으로 실패하면 dcinside HTML이 그대로 안 들고와짐. 그 경우 step 4로.

- [ ] **Step 4: (필요 시) dcimg referer 실패 fallback**

만약 다수 영웅에서 "이미지 추출 실패" 또는 다운로드 단계에서 403이 나면:
1. `extract_image_urls`이 빈 리스트 반환 시 m.dcinside.com (모바일) URL로 재시도하는 fallback 추가
2. 또는 다운로드 단계에 `Referer: post_url` (영웅별 referer)로 헤더 교체
3. 그래도 안 되면 WebFetch 도구로 게시글 fetch → 이미지 URL 따고 그 URL을 Claude가 Read 도구로 직접 열기 (캐시 경로 활용)

### Task 3.2: main_options_skeleton.py 작성

**Files:**
- Create: `scripts/main_options_skeleton.py`
- Create: `data/raw/main_options.json`

- [ ] **Step 1: 스켈레톤 생성 스크립트**

`scripts/main_options_skeleton.py`:
```python
"""
hero_guides.py 키 기반 빈 main_options.json 생성.
이미 존재하면 누락된 항목만 보강 (기존 데이터 보존).
"""
import json
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent))
from hero_guides import HERO_GUIDES

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
DST = ROOT / "data/raw/main_options.json"

existing = {}
if DST.exists():
    existing = json.loads(DST.read_text(encoding="utf-8"))

EMPTY = {"necklace": [], "ring": [], "boots": [], "_source": None, "_note": None}

added = 0
for name, guides in HERO_GUIDES.items():
    if name not in existing:
        existing[name] = {**EMPTY, "_source": guides[0]["url"] if guides else None}
        added += 1

DST.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"  추가된 영웅: {added}, 전체: {len(existing)}")
print(f"  저장: {DST}")
```

- [ ] **Step 2: 스켈레톤 실행**

```bash
python scripts/main_options_skeleton.py
```
Expected: `data/raw/main_options.json` 생성. 54개 영웅 항목 (or hero_guides.py 수), 모두 빈 배열.

### Task 3.3: Claude가 이미지 분석해서 main_options.json 채우기

데이터 작성은 Claude가 Read 도구로 `data/raw/guide_images/` 이미지를 직접 열어 보고 main_options.json을 편집.

- [ ] **Step 1: 이미지 + 영웅 매핑 출력**

```bash
ls data/raw/guide_images/ | sort
```
영웅별로 어떤 파일이 있는지 확인.

- [ ] **Step 2: 영웅별 이미지 분석 (반복)**

다음 절차를 각 영웅에 대해 반복:
1. Read 도구로 `data/raw/guide_images/{영웅명}_1.jpg` (필요 시 _2, _3) 열기
2. 이미지에서 목걸이/반지/신발의 주옵션을 식별 (가이드에서 보통 6칸 장비 일러스트로 표시됨)
3. 옵션이 여러 개로 적혀있으면 (예: 목걸이 = 공%/생%) 모두 배열에 포함
4. `Edit` 도구로 `data/raw/main_options.json`의 해당 영웅 항목 업데이트:
```json
"고독한 늑대 페이라": {
  "necklace": ["atk_p"],
  "ring":     ["chd"],
  "boots":    ["spd"],
  "_source":  "https://gall.dcinside.com/.../no=2316561",
  "_note":    "비고가 있으면 적기"
}
```
5. 5명 끝낼 때마다 진행 상황 출력: `완료 5/54 (페이라, 클라릿사, ...)`

**부옵 ID 매핑 (이미지의 한글 표기 → JSON ID):**
- 공격력% → `atk_p`
- 생명력% → `hp_p`
- 방어력% → `def_p`
- 속도 → `spd`
- 치명확률 → `chc`
- 치명피해 → `chd`
- 효과적중 → `eff`
- 효과저항 → `effres`

- [ ] **Step 3: 채워진 항목 통계**

```bash
python -c "
import json
data = json.load(open('data/raw/main_options.json', encoding='utf-8'))
filled = sum(1 for v in data.values() if v['necklace'] or v['ring'] or v['boots'])
print(f'{filled}/{len(data)} 영웅 채워짐')
empty = [k for k, v in data.items() if not (v['necklace'] or v['ring'] or v['boots'])]
print('미입력:', empty)
"
```
Expected: filled == 54 (또는 hero_guides.py에 등록된 수). empty 리스트 비어있어야 함.

### Task 3.4: 사용자 표본 검수

- [ ] **Step 1: 표본 5명 출력**

```bash
python -c "
import json
data = json.load(open('data/raw/main_options.json', encoding='utf-8'))
SAMPLES = ['고독한 늑대 페이라', '노토스', '기원의 라스', '집행관 빌트레드', '헤카테']
for name in SAMPLES:
    print(f'--- {name} ---')
    print(json.dumps(data[name], ensure_ascii=False, indent=2))
    print()
"
```

- [ ] **Step 2: 사용자 확인 요청**

표본 출력을 사용자에게 보여주고, 디시 가이드 원본과 일치하는지 확인 요청. 불일치 있으면 step 2로 돌아가서 수정.

### Task 3.5: 커밋

- [ ] **Step 1: JSON 및 스크립트 커밋**

```bash
git add scripts/fetch_guide_images.py scripts/main_options_skeleton.py \
        data/raw/main_options.json .gitignore
git commit -m "data: 영웅별 주옵션 수집 (54명)

- fetch_guide_images.py: 디시 가이드 게시글에서 이미지 추출/다운로드
- main_options_skeleton.py: 빈 템플릿 생성 (재실행 안전)
- main_options.json: 목걸이/반지/신발 주옵션 매핑

이미지 캐시(data/raw/guide_images/)는 .gitignore.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4: 주옵션 UI

`main_options.json`을 heroes.json 에 머지하고 상세 페이지에 표시.

### Task 4.0: types.ts — ValidOptions.main_options 추가

**Files:**
- Modify: `web/src/lib/types.ts:44-53`

- [ ] **Step 1: MainOptions 타입 + ValidOptions 확장**

`web/src/lib/types.ts`에 SubstatLevel 정의 아래(line 42)에 추가:
```ts
export interface MainOptions {
  necklace: SubstatId[];
  ring: SubstatId[];
  boots: SubstatId[];
}
```

`ValidOptions` 인터페이스(line 44-53)에 마지막 필드로 추가:
```ts
  main_options: MainOptions | null;
```

### Task 4.1: build_unified_db.py — main_options 머지

**Files:**
- Modify: `scripts/build_unified_db.py`

- [ ] **Step 1: main_options.json 로드 함수 + 부옵 한글→ID 매핑**

상수/함수 영역에 추가:
```python
SRC_MAIN_OPTIONS = ROOT / "data/raw/main_options.json"

# main_options.json 안에서 사용되는 한글 → ID (사람이 작성한 JSON이라 한글일 수 있음)
# 단, 작성 가이드는 ID 직접 작성이므로 보통 그대로 통과
def normalize_main_options(slot_values: list) -> list:
    """SubstatId 형식 보장. 한글이 들어온 경우만 변환."""
    result = []
    for v in slot_values:
        if v in SUBSTAT_KO_TO_ID:  # "공격력%" 등 한글
            result.append(SUBSTAT_KO_TO_ID[v])
        else:
            result.append(v)  # 이미 ID 형식
    return result


def load_main_options() -> dict:
    if not SRC_MAIN_OPTIONS.exists():
        return {}
    raw = json.loads(SRC_MAIN_OPTIONS.read_text(encoding="utf-8"))
    out = {}
    for name, entry in raw.items():
        if not (entry.get("necklace") or entry.get("ring") or entry.get("boots")):
            continue  # 빈 항목 skip
        out[name] = {
            "necklace": normalize_main_options(entry["necklace"]),
            "ring":     normalize_main_options(entry["ring"]),
            "boots":    normalize_main_options(entry["boots"]),
        }
    return out
```

- [ ] **Step 2: 영웅 빌드 루프에 main_options 머지**

main 빌드 루프 시작 전에:
```python
main_options_map = load_main_options()
```

각 영웅 dict의 `valid_options`를 만드는 부분에서 마지막 필드로 추가:
```python
"main_options": main_options_map.get(hero["base_name_ko"]) or None,
```
(`base_name_ko` 변수명은 실제 코드에 맞춰 조정. file1 영웅명과 main_options.json 키가 동일하므로 그대로 매칭됨.)

- [ ] **Step 3: 빌드 실행 + 결과 확인**

```bash
python scripts/build_unified_db.py
grep -c '"main_options": {' data/processed/heroes.json
```
Expected: 54 (또는 main_options.json에 채워진 수). 0이면 매핑 키가 안 맞는 것.

- [ ] **Step 4: web/src/data로 복사**

```bash
cp data/processed/heroes.json data/processed/enums.json data/processed/search_index.json web/src/data/
```

### Task 4.2: SlotIcon SVG 컴포넌트

**Files:**
- Create: `web/src/components/SlotIcon.tsx`

- [ ] **Step 1: 인라인 SVG 아이콘 3개**

`web/src/components/SlotIcon.tsx`:
```tsx
interface SlotIconProps {
  slot: "necklace" | "ring" | "boots";
  size?: number;
}

export function SlotIcon({ slot, size = 16 }: SlotIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (slot === "necklace") {
    return (
      <svg {...common}>
        <path d="M3 3 Q8 11 13 3" />
        <circle cx="8" cy="12" r="1.5" />
      </svg>
    );
  }
  if (slot === "ring") {
    return (
      <svg {...common}>
        <circle cx="8" cy="10" r="4" />
        <path d="M6 5 L8 3 L10 5" />
      </svg>
    );
  }
  // boots
  return (
    <svg {...common}>
      <path d="M5 3 V9 H11 V11 L13 12 L13 9 L11 8 V3 Z" />
    </svg>
  );
}
```

### Task 4.3: MainOptionsBlock 컴포넌트

**Files:**
- Modify: `web/src/components/HeroDetail.tsx`

- [ ] **Step 1: SlotIcon 임포트 + 헬퍼 함수 + 블록**

`web/src/components/HeroDetail.tsx` 상단 import 영역에 추가:
```ts
import { SlotIcon } from "./SlotIcon";
```

import 타입(line 9-15)에 추가:
```ts
  MainOptions,
```

`ValidOptionsBlock` 컴포넌트(line 172-259)의 grid 블록(line 181) 위에 새 컴포넌트 호출 추가하기 위해, 먼저 새 컴포넌트를 같은 파일 끝(파일 마지막 함수 다음)에 정의:
```tsx
function MainOptionsBlock({ mo }: { mo: MainOptions }) {
  const t = useT();
  const { lang } = useLang();
  const slots: { key: keyof MainOptions; label: string }[] = [
    { key: "necklace", label: t("slot_necklace") },
    { key: "ring",     label: t("slot_ring") },
    { key: "boots",    label: t("slot_boots") },
  ];
  return (
    <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 md:p-5 md:col-span-2">
      <h2 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {t("sec_main_options")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {slots.map(({ key, label }) => {
          const opts = mo[key];
          if (!opts.length) return null;
          return (
            <div key={key} className="flex items-center gap-2">
              <SlotIcon slot={key} size={18} />
              <div className="text-xs text-[var(--text-muted)] w-12">{label}</div>
              <div className="text-sm text-[var(--text-primary)]">
                {opts.map((s) => enumLabel(enums.substats[s], lang)).join(" / ")}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: ValidOptionsBlock 안에 호출 삽입**

`ValidOptionsBlock` 안에서 `return (` 직후, `<div className="grid md:grid-cols-2 ...">` 위에 wrapping fragment로 변경하고 위에 MainOptionsBlock 추가:
```tsx
  return (
    <>
      {vo.main_options && <MainOptionsBlock mo={vo.main_options} />}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* 기존 내용 */}
      </div>
    </>
  );
```
(마지막 `</div>` 뒤에 `</>` 닫기 추가.)

### Task 4.4: i18n 메시지 추가

**Files:**
- Modify: `web/src/i18n/messages.ts`

- [ ] **Step 1: 슬롯 + 섹션 라벨**

`web/src/i18n/messages.ts`의 `// Content tags (PVE/PVP)` 블록 위에 추가:
```ts
  // Main options (주옵션 슬롯)
  sec_main_options: { ko: "주옵션",                                  en: "Main Options" },
  slot_necklace:    { ko: "목걸이",                                  en: "Necklace" },
  slot_ring:        { ko: "반지",                                    en: "Ring" },
  slot_boots:       { ko: "신발",                                    en: "Boots" },
```

### Task 4.5: 데브 서버 수동 검증

- [ ] **Step 1: 데브 서버 시작**

```bash
cd web && npm run dev
```

- [ ] **Step 2: 표본 영웅 5명 상세 페이지 확인**

브라우저에서 차례로 접속:
- `/hero/lone-wolf-peira` (고독한 늑대 페이라)
- `/hero/notos` (노토스, 실제 id는 search_index.json 확인)
- `/hero/origin-ras` 또는 비슷한 슬러그
- `/hero/executor-vildred`
- `/hero/hecate`

각 페이지에서:
- 헤더 아래에 "주옵션" 섹션 보임
- 목걸이/반지/신발 라인 3개 각각 [아이콘] [라벨] [부옵션 텍스트] 형태
- 옵션 여럿이면 슬래시(/) 구분으로 표시

- [ ] **Step 3: 데이터 없는 영웅 확인**

- `/hero/luna__expedition` 또는 main_options.json 에 없는 영웅 접속
- 주옵션 섹션 자체가 안 보여야 함 (조건부 렌더링)

- [ ] **Step 4: 데브 서버 종료**

### Task 4.6: README 변경 이력 + 커밋

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README 변경 이력 업데이트**

`### 2026-05-11` 항목에 추가:
```markdown
**영웅별 주옵션 표시**

- 디시 가이드 이미지 분석으로 54명 영웅의 목걸이/반지/신발 주옵션 수집
- 상세 페이지에 "주옵션" 섹션 추가 (인라인 SVG 슬롯 아이콘)
- 데이터 없는 영웅은 섹션 자체 숨김 (233명)
```

- [ ] **Step 2: 커밋**

```bash
git add web/src/lib/types.ts web/src/components/SlotIcon.tsx \
        web/src/components/HeroDetail.tsx web/src/i18n/messages.ts \
        web/src/data/heroes.json data/processed/ \
        scripts/build_unified_db.py README.md
git commit -m "feat: 영웅 상세 페이지에 주옵션 표시

- types.ts: MainOptions 타입, ValidOptions.main_options 필드
- build_unified_db.py: main_options.json 로드 및 머지
- SlotIcon.tsx: 목걸이/반지/신발 인라인 SVG 아이콘
- HeroDetail.tsx: MainOptionsBlock 컴포넌트 (조건부 렌더링)
- i18n: sec_main_options, slot_necklace/ring/boots

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## 완료 체크리스트

- [ ] Phase 1: 부옵 strict 필터 — `?sub=spd,chc,chd` 검색에서 페이라 안 보임
- [ ] Phase 2: PVE/PVP 태그 — `?ct=pve` 필터, 상세 헤더 배지
- [ ] Phase 3: 주옵션 데이터 — `main_options.json` 54명 채워짐, 표본 5명 사용자 검수 통과
- [ ] Phase 4: 주옵션 UI — 표본 5명 상세 페이지 주옵션 섹션 표시, 데이터 없는 영웅 숨김
- [ ] 모바일 햄버거: commit `3828095`로 이미 완료, Vercel 배포 확인

## 위험 요소 대응

- **dcimg referer 검증 실패** (Phase 3.1): fetch_guide_images.py step 4 fallback. WebFetch → 이미지 URL → Read 도구.
- **Phase 3 토큰 한계**: 한 세션에 54명 다 못 끝내면 진행률 저장하고 새 세션에서 이어서. main_options_skeleton.py가 재실행 안전이라 중간 저장 OK.
- **build_unified_db.py 매핑 키 불일치** (Phase 4.1 step 3): main_options.json 키가 file1의 `base_name_ko`와 정확히 일치하는지 확인. 불일치 시 alias 테이블 추가.
- **variant_ko 분류 누락**: 새 영웅이 추가되어 `PVE_KEYWORDS`에 없는 PVE 표기가 생기면 PVP로 오분류. build_report 통계로 매주 모니터링.
