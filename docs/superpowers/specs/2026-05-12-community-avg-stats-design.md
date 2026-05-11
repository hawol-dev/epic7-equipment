# 커뮤니티 평균 스펙 연동 — 2026-05-12

상세 페이지에 영웅별 커뮤니티 평균 스펙(공격력/생명력/방어력/속도/치확/치피/효적/효저 + 장비점수)을 표시. 데이터는 Fribbels Hero Library API에서 주간 동기화.

## 배경

영웅 상세 페이지에 이미 `기본 능력치` 섹션(60렙 6★ 풀각성 베이스)이 있지만 사용자가 "실전 세팅 기준 어느 정도 스펙이 필요한지" 가늠하기 어려움. 다른 E7 사이트에서 평균 스펙 제공하는 것 보고 같은 기능 요청.

조사 결과:
- **Onstove 공식 API** (`e7api.onstove.com/gameApi/getHeroAnalysis`) — 데이터 sparse(영웅마다 1~수십 player), 히스토그램 빈 형태라 평균 추출 어려움
- **Fribbels API** (`https://krivpfvxi0.execute-api.us-west-2.amazonaws.com/dev/getBuilds`) — 영웅당 최대 3000 builds, raw stat 값, 인증 불필요. **선택**.

샘플 응답 (Senya):
```json
{"data": [{"atk":5780,"def":1456,"hp":19837,"spd":201,"chc":15,"chd":150,"eff":0,"efr":97,"gs":462,"unitName":"Senya"}, ...]}
```

## 적용 범위

| 항목 | 포함 | 비고 |
|---|---|---|
| Fribbels getBuilds 데이터 수집 스크립트 | ✓ | 287명 순회, rate-limit 1초 |
| heroes.json 스키마 확장 (`community_avg_stats`) | ✓ | nullable, 빈 영웅은 null |
| 상세 페이지 UI 섹션 | ✓ | 기본 능력치 옆에, 조건부 렌더링 |
| 주간 자동 동기화 (GitHub Actions) | ✓ | `sync-heroes.yml` 에 단계 추가 |
| Graceful failure | ✓ | API 실패 시 이전 데이터 유지 |
| Onstove 공식 데이터 (히스토그램, 픽률 등) | 제외 | 별도 spec 가능 |
| 클라이언트 사이드 fetch | 제외 | 빌드 타임 정적 통합으로 충분 |
| stat 분포(히스토그램) 표시 | 제외 | 평균값만 |

## 디자인

### 1. 데이터 수집

**`scripts/fetch_hero_builds.py`** (신규):

```python
"""
Fribbels Hero Library getBuilds API 호출 → 영웅별 평균 스펙 추출.
저장: data/raw/community_avg_stats.json
재실행 안전 — 실패한 영웅은 기존 값 유지.
"""
import json, sys, io, time
import urllib.request, urllib.error
from pathlib import Path

API_URL = "https://krivpfvxi0.execute-api.us-west-2.amazonaws.com/dev/getBuilds"
SLEEP_SEC = 1.0
MIN_BUILDS = 1
MIN_SUCCESS_RATIO = 0.5  # 절반 미만 성공 시 새 파일 안 씀

ROOT = Path(r"E:\jsh02\Dev\EpicSevenEquipment")
SRC_HEROES = ROOT / "data/processed/heroes.json"
DST = ROOT / "data/raw/community_avg_stats.json"


def fetch_builds(en_name: str) -> list[dict] | None:
    req = urllib.request.Request(
        API_URL, data=en_name.encode("utf-8"), method="POST",
        headers={"Content-Type": "text/plain"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        body = json.loads(r.read())
    return body.get("data") or []


def compute_averages(builds: list[dict]) -> dict | None:
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
    new_data = dict(existing)  # 기존 보존
    success = total = 0
    for h in heroes:
        en = h["names"].get("en")
        if not en:
            continue
        total += 1
        try:
            builds = fetch_builds(en)
            avg = compute_averages(builds)
            if avg:
                new_data[en] = avg
                success += 1
            time.sleep(SLEEP_SEC)
        except (urllib.error.URLError, ValueError) as e:
            print(f"  ✗ {en}: {e}")
            continue
    ratio = success / total if total else 0
    if ratio < MIN_SUCCESS_RATIO:
        print(f"\n경고: 성공률 {ratio:.1%} ({success}/{total}). 기존 파일 유지.")
        return
    DST.write_text(json.dumps(new_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n저장: {success}/{total}, 누적 {len(new_data)} 영웅")


if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    main()
```

**`scripts/test_fetch_hero_builds.py`** (신규):
- `compute_averages([])` → None
- `compute_averages([build1])` → 모든 stat이 build1 값과 동일, n=1
- `compute_averages([build1, build2])` → 평균값, n=2
- 일부 build에 eff 키 누락 → 그 build skip하지만 다른 stat은 정상 평균

### 2. 스키마 통합

**`web/src/lib/types.ts`**:
```ts
export interface CommunityAvgStats {
  atk: number; def: number; hp: number; spd: number;
  chc: number; chd: number; eff: number; efr: number;
  gs: number;
  n: number;
}

export interface Hero {
  // 기존 필드
  community_avg_stats: CommunityAvgStats | null;
}
```

**`scripts/build_unified_db.py`**:
- 상수 추가: `SRC_COMMUNITY_AVG_STATS = ROOT / "data/raw/community_avg_stats.json"`
- 로더 함수:
  ```python
  def load_community_avg_stats() -> dict:
      if not SRC_COMMUNITY_AVG_STATS.exists():
          return {}
      return json.loads(SRC_COMMUNITY_AVG_STATS.read_text(encoding="utf-8"))
  ```
- 빌드 루프 시작 전 `avg_stats_map = load_community_avg_stats()`
- 각 영웅 dict에 추가: `"community_avg_stats": avg_stats_map.get(hero_en_name) or None`
- 빌드 리포트에 통계 출력: 평균스펙 채워진 영웅 수 / 미스 영웅 목록

### 3. UI

**`web/src/components/HeroDetail.tsx`**:

기존 `ExtrasBlock`의 `기본 능력치` Section 다음에 새 Section 추가:
```tsx
{hero.community_avg_stats && (
  <Section title={t("sec_community_stats")}>
    <dl className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-2 text-sm">
      <Stat label={t("stat_atk")} value={Math.round(s.atk)} />
      <Stat label={t("stat_hp")}  value={Math.round(s.hp)} />
      <Stat label={t("stat_def")} value={Math.round(s.def)} />
      <Stat label={t("stat_spd")} value={Math.round(s.spd)} />
      <Stat label={t("stat_chc")} value={`${s.chc.toFixed(1)}%`} />
      <Stat label={t("stat_chd")} value={`${s.chd.toFixed(1)}%`} />
      <Stat label={t("stat_eff")} value={`${s.eff.toFixed(1)}%`} />
      <Stat label={t("stat_efr")} value={`${s.efr.toFixed(1)}%`} />
      <Stat label={t("stat_gs")}  value={Math.round(s.gs)} />
    </dl>
    <p className="mt-3 text-[10px] text-[var(--text-muted)]" title={t("community_stats_source")}>
      n = {s.n.toLocaleString()} · Fribbels
    </p>
  </Section>
)}
```

`Math.round`는 stat 종류별로 자릿수 결정 (정수 stat은 round, % stat은 toFixed(1)).

기본 능력치 Section과 같은 grid 안에 배치되어 화면이 넓으면 가로로 나란히, 모바일에서는 세로로 쌓임 (이미 `md:grid-cols-2` 형태).

### 4. i18n

**`web/src/i18n/messages.ts`** 새 entries:
- `sec_community_stats`: "커뮤니티 평균 스펙" / "Community Avg Stats"
- `community_stats_source`: "출처: Fribbels Hero Library 빌드 풀" / "Source: Fribbels Hero Library build pool"
- `stat_eff`: "효과적중" / "Effectiveness" (이미 있을 수 있음 — 확인)
- `stat_efr`: "효과저항" / "Effect Resistance" (이미 있을 수 있음 — 확인)
- `stat_gs`: "장비점수" / "Gear Score"

### 5. 워크플로 자동화

**`.github/workflows/sync-heroes.yml`**:
기존 `Re-build unified DB` 단계 **전에** 추가:
```yaml
- name: Fetch Fribbels community avg stats
  run: python scripts/fetch_hero_builds.py
  continue-on-error: true
  timeout-minutes: 10
```

`continue-on-error: true` — Fribbels API 다운이어도 워크플로는 진행 (기존 `community_avg_stats.json` 그대로 사용).
`timeout-minutes: 10` — 287명 × 1초 = 약 5분 예상, 마진 2배.

## Phase 구조

각 phase 독립 commit.

### Phase 1: 데이터 수집 + 스키마

파일:
- 신규: `scripts/fetch_hero_builds.py`
- 신규: `scripts/test_fetch_hero_builds.py`
- 수정: `web/src/lib/types.ts` (`CommunityAvgStats`, `Hero.community_avg_stats`)
- 수정: `scripts/build_unified_db.py` (loader + 머지)
- 신규: `data/raw/community_avg_stats.json` (첫 실행 결과)

검증:
- `python scripts/test_fetch_hero_builds.py` → 통과
- `python scripts/fetch_hero_builds.py` → 287명 중 80% 이상 성공
- `python scripts/build_unified_db.py` → 에러 없음, `grep -c '"community_avg_stats": {' data/processed/heroes.json` 가 ~200 이상

### Phase 2: UI

파일:
- 수정: `web/src/components/HeroDetail.tsx` (CommunityStatsBlock 또는 ExtrasBlock 안에 직접)
- 수정: `web/src/i18n/messages.ts` (5개 entry 추가)

검증:
- `npm test` 통과 (regression 없음)
- `npm run build` 통과
- 데브 서버에서 `/hero/c1106` (세냐) 확인 — 평균 스펙 섹션 표시, 데이터 없는 영웅은 섹션 숨김

### Phase 3: 워크플로 자동화

파일:
- 수정: `.github/workflows/sync-heroes.yml`

검증:
- GitHub Actions에서 수동 트리거 (`workflow_dispatch`) → 정상 종료
- 새 `community_avg_stats.json` commit 발생 확인

## 검증 기준

| Phase | 완료 기준 |
|---|---|
| 1 | community_avg_stats.json 200+ 영웅, heroes.json에 머지 정상, test_fetch_hero_builds 통과 |
| 2 | 세냐 등 표본 5명 상세 페이지 평균 스펙 섹션 표시, 신규 영웅(데이터 없는) 섹션 숨김 |
| 3 | 워크플로 수동 트리거 정상, 다음 주 자동 실행 동작 |

## 위험 요소

- **Fribbels API 변경/다운**: `krivpfvxi0...` endpoint 변경되면 동기화 실패. graceful로 이전 데이터 유지. 모니터링: 워크플로 실패 알림으로 인지.
- **이름 매칭 미스**: `hero.names.en` 이 null이거나 Fribbels의 unitName과 표기 다르면 미스. 빌드 리포트에 미스 영웅 목록 출력, 누적 → 별도 alias 테이블로 보정 가능.
- **RTA 메타 편향**: Fribbels는 RTA 빌드 위주라 PvE 전용 영웅의 평균은 PvP 기준이 됨. UI에 출처 명시 (`Fribbels Hero Library 빌드 풀`).
- **CI 타임아웃**: 287 영웅 × 1초 ≈ 5분. CI runner 디폴트 타임아웃 안전. Fribbels가 느려지면 rate-limit 늘려서 sleep 조정.

## 안 다룬 항목

- 분포(히스토그램) 표시 — 평균값으로 충분, 분포는 별도 spec
- 등급별/티어별 stat 차이 (Onstove API에서만 가능)
- 사용 세트 빈도 — Fribbels 응답에 `sets` 필드 있지만 본 spec에서는 평균 stat만
- 추천 아티팩트 빈도 — 위와 동일
