# 커뮤니티 평균 스펙 연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 영웅 상세 페이지에 Fribbels Hero Library 빌드 풀 기반 평균 스펙(공/생/방/속/치확/치피/효적/효저 + 장비점수) 표시.

**Architecture:** 빌드 타임에 Fribbels getBuilds API를 호출해 평균 stat을 정적 JSON으로 저장 → heroes.json에 머지 → 상세 페이지에서 조건부 렌더링. 주간 GitHub Actions 워크플로로 자동 갱신, 실패 시 graceful (이전 데이터 유지).

**Tech Stack:**
- Python 3.11 + stdlib (urllib, json) — 데이터 수집 스크립트
- Python `unittest` (stdlib) — 단위 테스트
- TypeScript / Next.js 16 / React 19 — UI
- GitHub Actions — 주간 자동 동기화

**Reference spec:** `docs/superpowers/specs/2026-05-12-community-avg-stats-design.md`

---

## Phase 1: 데이터 수집 + 스키마 통합

Fribbels API 호출 스크립트, heroes.json 스키마 확장, 첫 데이터 생성.

### Task 1.1: compute_averages — failing test

**Files:**
- Create: `scripts/test_fetch_hero_builds.py`

- [ ] **Step 1: 빈 모듈 생성 (import 가능하게)**

Create `scripts/fetch_hero_builds.py` with placeholder so test file can import:
```python
def compute_averages(builds):
    raise NotImplementedError
```

- [ ] **Step 2: 실패하는 테스트 작성**

Create `scripts/test_fetch_hero_builds.py`:
```python
import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from fetch_hero_builds import compute_averages


class TestComputeAverages(unittest.TestCase):
    def test_empty_builds_returns_none(self):
        self.assertIsNone(compute_averages([]))

    def test_single_build(self):
        b = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
             "chc": 50, "chd": 200, "eff": 0, "efr": 100, "gs": 400}
        result = compute_averages([b])
        self.assertEqual(result["atk"], 5000.0)
        self.assertEqual(result["spd"], 200.0)
        self.assertEqual(result["n"], 1)

    def test_average_of_two_builds(self):
        b1 = {"atk": 4000, "def": 1000, "hp": 18000, "spd": 180,
              "chc": 50, "chd": 150, "eff": 0, "efr": 80, "gs": 400}
        b2 = {"atk": 6000, "def": 1500, "hp": 22000, "spd": 220,
              "chc": 70, "chd": 200, "eff": 100, "efr": 100, "gs": 500}
        result = compute_averages([b1, b2])
        self.assertEqual(result["atk"], 5000.0)
        self.assertEqual(result["spd"], 200.0)
        self.assertEqual(result["chd"], 175.0)
        self.assertEqual(result["n"], 2)

    def test_missing_key_in_some_builds(self):
        b1 = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 200, "eff": 80, "efr": 100, "gs": 400}
        b2 = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 200,            "efr": 100, "gs": 400}  # eff 없음
        result = compute_averages([b1, b2])
        # eff 는 b1 만 카운트
        self.assertEqual(result["eff"], 80.0)
        # 다른 stat 은 둘 다 카운트
        self.assertEqual(result["atk"], 5000.0)
        self.assertEqual(result["n"], 2)

    def test_rounds_to_one_decimal(self):
        b1 = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 175, "eff": 0, "efr": 100, "gs": 400}
        b2 = {"atk": 5001, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 175, "eff": 0, "efr": 100, "gs": 400}
        result = compute_averages([b1, b2])
        self.assertEqual(result["atk"], 5000.5)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/test_fetch_hero_builds.py
```
Expected: `NotImplementedError` raised in tests.

### Task 1.2: compute_averages 구현

**Files:**
- Modify: `scripts/fetch_hero_builds.py`

- [ ] **Step 1: compute_averages 구현**

Replace placeholder in `scripts/fetch_hero_builds.py`:
```python
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
```

- [ ] **Step 2: 테스트 실행 — 통과 확인**

```bash
python scripts/test_fetch_hero_builds.py
```
Expected: `Ran 5 tests in 0.000s — OK`

### Task 1.3: API 호출 + main 함수

**Files:**
- Modify: `scripts/fetch_hero_builds.py`

- [ ] **Step 1: 전체 스크립트 작성**

Replace `scripts/fetch_hero_builds.py` content with:
```python
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
MIN_SUCCESS_RATIO = 0.5

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
SRC_HEROES = ROOT / "data/processed/heroes.json"
DST = ROOT / "data/raw/community_avg_stats.json"


def fetch_builds(en_name: str) -> list[dict]:
    """Fribbels API POST 호출. body는 영웅 영문 이름 plain text."""
    req = urllib.request.Request(
        API_URL,
        data=en_name.encode("utf-8"),
        method="POST",
        headers={"Content-Type": "text/plain"},
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


def main():
    heroes = json.loads(SRC_HEROES.read_text(encoding="utf-8"))
    existing = json.loads(DST.read_text(encoding="utf-8")) if DST.exists() else {}
    new_data = dict(existing)
    success = total = 0

    # 영문 이름이 있는 영웅만 대상
    en_names = []
    for h in heroes:
        en = h.get("names", {}).get("en")
        if en and en not in en_names:
            en_names.append(en)

    for en in en_names:
        total += 1
        try:
            builds = fetch_builds(en)
            avg = compute_averages(builds)
            if avg:
                new_data[en] = avg
                success += 1
                print(f"  ✓ {en}: n={avg['n']}")
            else:
                print(f"  - {en}: 0 builds")
            time.sleep(SLEEP_SEC)
        except (urllib.error.URLError, ValueError, json.JSONDecodeError) as e:
            print(f"  ✗ {en}: {e}")
            continue

    ratio = success / total if total else 0
    print(f"\n결과: 성공 {success}/{total} ({ratio:.1%})")
    if ratio < MIN_SUCCESS_RATIO:
        print(f"경고: 성공률 너무 낮음 ({ratio:.1%} < {MIN_SUCCESS_RATIO:.0%}). 기존 파일 유지.")
        return

    DST.write_text(
        json.dumps(new_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"저장: {DST} ({len(new_data)} 영웅 누적)")


if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    main()
```

- [ ] **Step 2: 기존 테스트 여전히 통과 확인**

```bash
python scripts/test_fetch_hero_builds.py
```
Expected: `Ran 5 tests in 0.000s — OK`

### Task 1.4: 첫 실행 — community_avg_stats.json 생성

**Files:**
- Create: `data/raw/community_avg_stats.json`

- [ ] **Step 1: 스크립트 실행**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/fetch_hero_builds.py 2>&1 | tail -30
```
Expected: 287명 시도, 80% 이상 성공 (특수 영웅은 0 builds 가능). 약 5분 소요. `data/raw/community_avg_stats.json` 생성.

- [ ] **Step 2: 결과 검증**

```bash
python -c "
import json
d = json.load(open('data/raw/community_avg_stats.json', encoding='utf-8'))
print(f'총 {len(d)} 영웅')
print('샘플:')
for name in ['Senya', 'Bernard', 'Belian']:
    if name in d:
        print(f'  {name}: {d[name]}')
"
```
Expected: Senya, Bernard 등에 atk/def/hp/spd/chc/chd/eff/efr/gs/n 값 채워짐.

### Task 1.5: types.ts — CommunityAvgStats 인터페이스

**Files:**
- Modify: `web/src/lib/types.ts`

- [ ] **Step 1: 인터페이스 추가**

In `web/src/lib/types.ts`, add after `ContentTag` type definition (around line 31):
```ts
export interface CommunityAvgStats {
  atk: number;
  def: number;
  hp: number;
  spd: number;
  chc: number;
  chd: number;
  eff: number;
  efr: number;
  gs: number;
  n: number;
}
```

- [ ] **Step 2: Hero 인터페이스에 필드 추가**

Add to `Hero` interface (before `translation_missing?`):
```ts
  community_avg_stats: CommunityAvgStats | null;
```

- [ ] **Step 3: matching.test.ts makeHero 헬퍼 갱신**

Add to the Hero return object in `web/src/lib/matching.test.ts`'s `makeHero` (after `tags: { content: ... }`):
```ts
    community_avg_stats: null,
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd web && npm test
```
Expected: 7 tests pass (no regression).

### Task 1.6: build_unified_db.py — 머지 로직

**Files:**
- Modify: `scripts/build_unified_db.py`

- [ ] **Step 1: 상수 + 로더 함수 추가**

Find `SRC_FILE2_ENGRAVING` line (around line 50). Add after it:
```python
SRC_COMMUNITY_AVG_STATS = ROOT / "data/raw/community_avg_stats.json"
```

Find the section with other `load_*` helper functions (after `load_engraving_grades`). Add new function:
```python
def load_community_avg_stats() -> dict:
    """data/raw/community_avg_stats.json — 영웅 영문명 → {atk, def, ..., gs, n}."""
    if not SRC_COMMUNITY_AVG_STATS.exists():
        return {}
    return json.loads(SRC_COMMUNITY_AVG_STATS.read_text(encoding="utf-8"))
```

- [ ] **Step 2: 빌드 루프에서 머지**

Find where the build loop starts (search for `for hero` or similar build iteration). Before the loop, add:
```python
community_stats_map = load_community_avg_stats()
```

In each hero dict assembly (search for `"tags":` to find the right place), add:
```python
"community_avg_stats": community_stats_map.get(en_name) if en_name else None,
```
The variable holding the English name in that scope might be `en_name`, `hero["names"]["en"]`, or similar — match the existing variable. If unclear, use the inline form:
```python
"community_avg_stats": community_stats_map.get(
    hero_dict.get("names", {}).get("en")
) if hero_dict.get("names", {}).get("en") else None,
```

- [ ] **Step 3: 빌드 실행 + 결과 확인**

```bash
cd /e/jsh02/Dev/EpicSevenEquipment
python scripts/build_unified_db.py 2>&1 | tail -5
grep -c '"community_avg_stats": {' data/processed/heroes.json
```
Expected: 마지막 grep이 ~200 이상 (영문 이름 있고 Fribbels에 데이터 있는 영웅 수).

- [ ] **Step 4: web/src/data 로 복사**

```bash
cp data/processed/heroes.json data/processed/enums.json data/processed/search_index.json web/src/data/
```

### Task 1.7: Phase 1 커밋

- [ ] **Step 1: 커밋**

```bash
git add scripts/fetch_hero_builds.py scripts/test_fetch_hero_builds.py \
        web/src/lib/types.ts web/src/lib/matching.test.ts \
        scripts/build_unified_db.py \
        data/raw/community_avg_stats.json \
        data/processed/ web/src/data/
git commit -m "feat: 커뮤니티 평균 스펙 데이터 수집 + 스키마 통합 (Phase 1)

- fetch_hero_builds.py: Fribbels getBuilds API → 영웅별 평균 atk/def/hp/spd
  /chc/chd/eff/efr/gs 추출. graceful (성공률 <50%면 기존 파일 유지)
- test_fetch_hero_builds.py: compute_averages 단위 테스트 5건
- types.ts: CommunityAvgStats 인터페이스, Hero.community_avg_stats 필드
- build_unified_db.py: load_community_avg_stats + 머지 로직
- community_avg_stats.json: 첫 수집 결과

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2: UI

상세 페이지에 평균 스펙 섹션 + i18n.

### Task 2.1: i18n 메시지 추가

**Files:**
- Modify: `web/src/i18n/messages.ts`

- [ ] **Step 1: 메시지 추가**

In `web/src/i18n/messages.ts`, find the existing `// Main options (주옵션 슬롯)` block. Add a new block ABOVE that block:
```ts
  // Community avg stats
  sec_community_stats:    { ko: "커뮤니티 평균 스펙",   en: "Community Avg Stats" },
  community_stats_source: { ko: "출처: Fribbels Hero Library 빌드 풀",
                            en: "Source: Fribbels Hero Library build pool" },
  stat_eff:               { ko: "효과적중",            en: "Effectiveness" },
  stat_efr:               { ko: "효과저항",            en: "Effect Resistance" },
  stat_gs:                { ko: "장비점수",            en: "Gear Score" },
```

(Note: `stat_chc`, `stat_chd` already exist around line 105–106 — do not duplicate.)

- [ ] **Step 2: TS 컴파일 확인**

```bash
cd web && npm run build 2>&1 | tail -5
```
Expected: 빌드 성공 (TypeScript 통과).

### Task 2.2: HeroDetail.tsx — 평균 스펙 섹션

**Files:**
- Modify: `web/src/components/HeroDetail.tsx`

- [ ] **Step 1: 타입 임포트 추가**

In `web/src/components/HeroDetail.tsx`'s type import block (currently has `Hero, SubstatId, SetId, ElementId, EngravingGrade`, possibly more), add:
```ts
  CommunityAvgStats,
```

- [ ] **Step 2: ExtrasBlock 내 기본 능력치 Section 다음에 추가**

Find the `기본 능력치` Section block inside `ExtrasBlock` (search for `t("sec_base_stats")`). Right after the closing `)` of that conditional `{stats && ( ... )}` block, add:
```tsx
      {hero.community_avg_stats && (
        <Section title={t("sec_community_stats")}>
          <dl className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-2 text-sm">
            <Stat label={t("stat_atk")} value={Math.round(hero.community_avg_stats.atk).toLocaleString()} />
            <Stat label={t("stat_hp")}  value={Math.round(hero.community_avg_stats.hp).toLocaleString()} />
            <Stat label={t("stat_def")} value={Math.round(hero.community_avg_stats.def).toLocaleString()} />
            <Stat label={t("stat_spd")} value={Math.round(hero.community_avg_stats.spd)} />
            <Stat label={t("stat_chc")} value={`${hero.community_avg_stats.chc.toFixed(1)}%`} />
            <Stat label={t("stat_chd")} value={`${hero.community_avg_stats.chd.toFixed(1)}%`} />
            <Stat label={t("stat_eff")} value={`${hero.community_avg_stats.eff.toFixed(1)}%`} />
            <Stat label={t("stat_efr")} value={`${hero.community_avg_stats.efr.toFixed(1)}%`} />
            <Stat label={t("stat_gs")}  value={Math.round(hero.community_avg_stats.gs)} />
          </dl>
          <p
            className="mt-3 text-[10px] text-[var(--text-muted)]"
            title={t("community_stats_source")}
          >
            n = {hero.community_avg_stats.n.toLocaleString()} · Fribbels
          </p>
        </Section>
      )}
```

- [ ] **Step 3: hasAny 가드 업데이트**

Find the `hasAny` boolean (just before `if (!hasAny) return null;`). Update to include the new field:
```ts
  const hasAny =
    variants.length > 0 ||
    related.length > 0 ||
    !!stats ||
    !!hero.community_avg_stats ||
    artifacts.length > 0 ||
    guides.length > 0 ||
    !!engRow;
```

### Task 2.3: 데브 서버 수동 검증

- [ ] **Step 1: 빌드 + 테스트**

```bash
cd web && npm test 2>&1 | tail -5
cd web && npm run build 2>&1 | tail -5
```
Expected: 7 tests pass, build success.

- [ ] **Step 2: 데브 서버 + 표본 영웅 확인**

```bash
cd web && npm run dev
```

브라우저에서 확인:
- `/hero/senya` (또는 search_index 통해 c1106) → 커뮤니티 평균 스펙 섹션 표시: 공/생/방/속/치확%/치피%/효적%/효저%/장비점수, 그 아래 "n = X,XXX · Fribbels"
- `/hero/bernard` → 평균 스펙 표시 확인
- 신규 영웅 (Fribbels에 없는) → 섹션 자체 안 보임

- [ ] **Step 3: 데브 서버 종료** (Ctrl+C)

### Task 2.4: Phase 2 커밋

- [ ] **Step 1: 커밋**

```bash
git add web/src/i18n/messages.ts web/src/components/HeroDetail.tsx
git commit -m "feat: 영웅 상세 페이지 커뮤니티 평균 스펙 섹션 (Phase 2)

- HeroDetail.tsx: community_avg_stats 가 있을 때만 새 Section 렌더링
  (기본 능력치 섹션 옆에 grid md:cols-2 형태로 배치)
- 표시 stat: atk/hp/def/spd/chc/chd/eff/efr/gs + sample count n
- i18n: sec_community_stats, community_stats_source, stat_eff/efr/gs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3: 워크플로 자동화

매주 월요일 자동 동기화에 Fribbels API 호출 단계 추가.

### Task 3.1: sync-heroes.yml 단계 추가

**Files:**
- Modify: `.github/workflows/sync-heroes.yml`

- [ ] **Step 1: 단계 삽입**

Open `.github/workflows/sync-heroes.yml`. Find the step `- name: Re-build unified DB`. Insert a new step BEFORE it:
```yaml
      - name: Fetch Fribbels community avg stats
        run: python scripts/fetch_hero_builds.py
        continue-on-error: true
        timeout-minutes: 10
```

`continue-on-error: true` — Fribbels API down/timeout 시 워크플로 계속 진행 (기존 community_avg_stats.json 유지).
`timeout-minutes: 10` — 287명 × 1초 ≈ 5분 + 마진.

- [ ] **Step 2: 워크플로 git add 단계 업데이트**

Find the `Commit changes` step (around line 73). The `git add` line already adds `data/`, `web/src/data/`, `web/public/images/`. The `community_avg_stats.json` is in `data/raw/` so already covered. Verify by inspecting the line — no change needed if it includes `data/` (not `data/processed/`).

If the line is `git add data/ web/src/data/ web/public/images/`, that's correct (covers `data/raw/`).

- [ ] **Step 3: README 변경 이력 항목 추가**

In `README.md`, find the `### 2026-05-11` entry (or most recent entry). Add a new entry above it:
```markdown
### 2026-05-12

**커뮤니티 평균 스펙 연동**

- 영웅 상세 페이지에 Fribbels Hero Library 빌드 풀 기반 평균 스펙 표시
- 평균 공/생/방/속/치확/치피/효적/효저 + 장비점수(GS) + 샘플 수(n)
- 데이터 없는 영웅은 섹션 자동 숨김 (신규 영웅 등)
- 매주 월요일 GitHub Actions 워크플로에서 자동 갱신 (API 실패 시 이전 데이터 유지)
```

### Task 3.2: Phase 3 커밋 + 수동 트리거 검증

- [ ] **Step 1: 커밋**

```bash
git add .github/workflows/sync-heroes.yml README.md
git commit -m "ci: 주간 동기화에 Fribbels 평균 스펙 fetch 추가 (Phase 3)

매주 월요일 sync-heroes.yml 실행 시 fetch_hero_builds.py 도 같이 돌아감.
continue-on-error: true 로 API 실패 시 graceful — 다음 단계는 진행하고
기존 community_avg_stats.json 그대로 사용.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 2: 푸시**

```bash
git push origin main
```

- [ ] **Step 3: GitHub Actions 수동 트리거 (사용자)**

GitHub repo의 Actions 탭 → `Sync Hero Data` → `Run workflow` 버튼. 실행 완료까지 대기 (~10–15분, Fribbels API 단계가 추가됐으니 평소보다 길어짐).

Expected:
- 모든 단계 ✓
- 새 커밋 생성됨 (`data/raw/community_avg_stats.json` 변경분 포함)
- Vercel 자동 배포

이 단계는 자동화의 일부라 controller가 해당 부분 검증은 어려움 — 사용자가 GitHub UI에서 확인.

---

## 완료 체크리스트

- [ ] Phase 1: community_avg_stats.json 200+ 영웅, heroes.json에 머지 정상
- [ ] Phase 1: `python scripts/test_fetch_hero_builds.py` 5/5 통과
- [ ] Phase 2: 세냐/베르나드 상세 페이지에 평균 스펙 섹션 표시
- [ ] Phase 2: 신규 영웅 등 데이터 없는 경우 섹션 숨김
- [ ] Phase 2: `npm test` 7/7 통과, `npm run build` 성공
- [ ] Phase 3: 워크플로 수동 트리거 성공, 다음 주 자동 실행 동작 확인

## 위험 요소 대응

- **Fribbels API endpoint 변경/다운**: `continue-on-error: true` + graceful 로 기존 데이터 유지. 워크플로 fail 알림에서 인지.
- **이름 매칭 미스**: `hero.names.en` 이 null이거나 Fribbels와 표기 다른 경우. 빌드 리포트에 미스 영웅 출력. 누적되면 별도 alias 테이블 추가 가능.
- **CI 타임아웃**: `timeout-minutes: 10` 설정. 287명 × 1초 = 5분 예상. Fribbels가 느려지면 `SLEEP_SEC` 조정.
- **stat 단위 혼동**: chc/chd/eff/efr 은 % 단위 (Fribbels에서 정수로 옴, 50 = 50%). atk/def/hp/spd/gs는 절대값. UI에서 stat별로 다른 포맷팅 적용 (toFixed(1) vs round).
