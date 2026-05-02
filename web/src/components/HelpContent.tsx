"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";

export function HelpContent() {
  const { lang } = useLang();
  return lang === "en" ? <HelpEN /> : <HelpKO />;
}

/* =================== KOREAN =================== */
function HelpKO() {
  return (
    <article className="prose-custom space-y-10">
      <Section title="이 사이트는?">
        <p>
          에픽세븐에서 <strong>방금 얻은 장비를 누구한테 줘야 할지</strong> 모르는
          뉴비를 위한 매칭 도구입니다. 영웅별 유효 부옵·세트·우선순위 데이터를
          기반으로 점수가 높은 순으로 추천 영웅을 보여줍니다.
        </p>
      </Section>

      <Section title="장비 검색 사용법">
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
          <li>
            <Link href="/" className="text-[var(--accent)]">메인 페이지</Link>로 이동
          </li>
          <li>장비의 <strong>세트</strong>를 1~3개 선택</li>
          <li>
            장비에 붙은 <strong>부옵션</strong>을 1~4개 선택.
            주옵션은 점수에 반영되지 않으니 부옵션 위주로 입력
          </li>
          <li>(선택) 속성·직업·등급 필터로 결과 좁히기</li>
          <li>매칭된 영웅이 아래에 점수 높은 순으로 표시됨</li>
        </ol>
        <p className="text-sm text-[var(--text-secondary)] mt-4">
          URL이 자동으로 갱신되니{" "}
          <code className="text-[var(--accent)] tabular text-xs">/?set=speed&sub=spd,eff</code>
          {" "}형태로 그대로 공유할 수 있습니다.
        </p>
      </Section>

      <Section title="점수 계산">
        <Code>
          {`score = 영웅의 ●필수 부옵 매칭 × 2점
       + 영웅의 ○선호 부옵 매칭 × 1점
       + 세트 보너스`}
        </Code>
        <h3 className="text-sm font-medium mt-5 mb-2 text-[var(--text-primary)]">세트 보너스</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>입력 세트 = 영웅 추천 조합 정확히 일치 → <strong>+5점</strong></li>
          <li>입력 세트 ⊆ 영웅 추천 조합 (부분집합) → <strong>+3점</strong></li>
          <li>그 외 (영웅이 그 세트를 받아들이긴 함) → +0점</li>
        </ul>

        <h3 className="text-sm font-medium mt-5 mb-2 text-[var(--text-primary)]">예시</h3>
        <p className="text-sm">
          라비 (●필수: 생명력%, 치명피해 / ○선호: 속도, 방어력%)
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>부옵 [생명력%, 속도] → 2 + 1 = <strong>3점</strong></li>
          <li>부옵 [생명력%, 치명피해, 속도] + 세트 [반격, 관통, 체력] (라비 추천 A 조합) → 2+2+1+5 = <strong>10점</strong></li>
        </ul>
      </Section>

      <Section title="영웅 카드 보기">
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>좌측 상단 <Tag>5★</Tag>: 영웅 등급 (3·4·5성)</li>
          <li>우측 상단 컬러 도트: 속성 (🔴화염 🔵냉기 🟢자연 🟡광 🟣어둠)</li>
          <li>우측 상단 숫자: 매칭 점수 (검색 결과에서만)</li>
          <li>이름 아래 빨간/황금 라벨: 입력한 부옵 중 영웅이 ●필수 / ○선호로 보는 항목</li>
        </ul>
      </Section>

      <Section title="영웅 상세 페이지">
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>유효 부옵션</strong> — ●필수 / ○선호 부옵과 우선순위</li>
          <li><strong>추천 세트</strong> — 영웅에게 잘 맞는 세트 조합 (A / B / C ...)</li>
          <li><strong>비고</strong> — 운영 팁과 주의사항</li>
          <li><strong>다른 운영법</strong> — 같은 영웅의 다른 운용 (PVE / PVP / 딜 / 탱 등)</li>
          <li><strong>추천 아티팩트</strong> — 영웅별로 자주 사용되는 아티팩트</li>
          <li><strong>기본 능력치</strong> — 50렙 5★ 또는 60렙 6★ 풀각성 기준 스탯</li>
          <li><strong>각인집중 효과</strong> — 각인 등급(D~SSS)별 능력치 보너스</li>
          <li><strong>비슷한 세팅의 영웅</strong> — 같은 세트를 쓰는 다른 영웅들</li>
          <li><strong>외부 가이드</strong> — 디시 갤러리 영웅별 가이드 링크</li>
        </ul>
      </Section>

      <Section title="용어 안내">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-[var(--accent)] font-medium">●</dt>
          <dd>필수 부옵 — 영웅 운용에 반드시 필요</dd>
          <dt className="text-[var(--preferred)] font-medium">○</dt>
          <dd>선호 부옵 — 있으면 좋음</dd>
          <dt className="text-[var(--text-secondary)]">성약</dt>
          <dd>일반 소환으로 얻을 수 있는 영웅 (한정 포함)</dd>
          <dt className="text-[var(--text-secondary)]">월광</dt>
          <dd>월광 극장에서 얻는 빛 / 어둠 속성 영웅</dd>
          <dt className="text-[var(--text-secondary)]">한정</dt>
          <dd>이벤트나 특정 기간에만 소환 가능한 영웅</dd>
          <dt className="text-[var(--text-secondary)]">전직</dt>
          <dd>3성 영웅을 전직 퀘스트로 강화한 형태</dd>
          <dt className="text-[var(--text-secondary)]">2셋 무시</dt>
          <dd>2세트 옵션을 신경 쓰지 않고 4세트 위주로 맞추는 운용</dd>
        </dl>
      </Section>

      <Section title="언어 전환">
        <p className="text-sm">
          우측 상단 <Tag>KO</Tag> / <Tag>EN</Tag> 토글로 한국어와 영어를 전환할 수 있습니다.
          영웅 이름·세트·부옵·각인은 자동 번역되며, 비고는 한국어 원문을 영어로 의역해 두었습니다.
        </p>
      </Section>

      <Section title="데이터 출처">
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>유효 부옵·세트·우선순위·비고: 디시인사이드 에픽세븐 마이너 갤러리 시트</li>
          <li>영웅 메타데이터(등급·속성·직업·별자리·각인집중)와 추천 아티팩트: 디시 장비 시뮬 시트</li>
          <li>영웅 이미지·기본 스탯·영문 이름: <ExtA href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer">Fribbels Optimizer</ExtA></li>
          <li>외부 가이드 링크: <ExtA href="https://gall.dcinside.com/mgallery/board/view/?id=epicseven&no=2468784">디시 갤러리 가이드 모음</ExtA></li>
          <li>게임 이미지·자산: © Smilegate Megaport / Epic Seven</li>
        </ul>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          비공식 팬 사이트로, Smilegate Megaport와 무관합니다.
        </p>
      </Section>
    </article>
  );
}

/* =================== ENGLISH =================== */
function HelpEN() {
  return (
    <article className="prose-custom space-y-10">
      <Section title="What is this site?">
        <p>
          A matching tool for Epic Seven players who don't know{" "}
          <strong>which hero to give a piece of gear to</strong>. It uses
          community-curated data on each hero's valid substats, sets, and
          priorities to rank heroes by score.
        </p>
      </Section>

      <Section title="How to use Gear Search">
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
          <li>
            Go to the <Link href="/" className="text-[var(--accent)]">main page</Link>
          </li>
          <li>Select the gear's <strong>set</strong> (1–3)</li>
          <li>
            Select the gear's <strong>substats</strong> (1–4).
            The main stat is not scored, so focus on substats
          </li>
          <li>(Optional) Narrow results by element / class / rarity</li>
          <li>Matching heroes appear below, sorted by score (highest first)</li>
        </ol>
        <p className="text-sm text-[var(--text-secondary)] mt-4">
          The URL updates automatically — you can share it as{" "}
          <code className="text-[var(--accent)] tabular text-xs">/?set=speed&sub=spd,eff</code>.
        </p>
      </Section>

      <Section title="How the score works">
        <Code>
          {`score = (matched essential substats) × 2
       + (matched preferred substats) × 1
       + set bonus`}
        </Code>
        <h3 className="text-sm font-medium mt-5 mb-2 text-[var(--text-primary)]">Set bonus</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Input set exactly matches one of hero's recommended combos → <strong>+5</strong></li>
          <li>Input set is a subset of hero's combo → <strong>+3</strong></li>
          <li>Otherwise (set is acceptable but not recommended combo) → +0</li>
        </ul>

        <h3 className="text-sm font-medium mt-5 mb-2 text-[var(--text-primary)]">Example</h3>
        <p className="text-sm">
          Ravi (●Essential: HP%, CHD / ○Preferred: Speed, DEF%)
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Substats [HP%, Speed] → 2 + 1 = <strong>3</strong></li>
          <li>Substats [HP%, CHD, Speed] + sets [Counter, Penetration, Health] (Ravi's combo A) → 2+2+1+5 = <strong>10</strong></li>
        </ul>
      </Section>

      <Section title="Reading a hero card">
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Top-left <Tag>5★</Tag>: Hero rarity (3 / 4 / 5)</li>
          <li>Top-right colored dot: Element (🔴Fire 🔵Ice 🟢Earth 🟡Light 🟣Dark)</li>
          <li>Top-right number: Match score (only in search results)</li>
          <li>Red / gold labels below the name: Substats you entered that the hero treats as ●essential / ○preferred</li>
        </ul>
      </Section>

      <Section title="Hero detail page">
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Valid Substats</strong> — Essential, preferred, priority order</li>
          <li><strong>Recommended Sets</strong> — Hero's set combos (A / B / C / ...)</li>
          <li><strong>Notes</strong> — Build tips</li>
          <li><strong>Other Builds</strong> — Variants of the same hero (PvE/PvP/DPS/Tank)</li>
          <li><strong>Recommended Artifacts</strong> — From sim sheet</li>
          <li><strong>Base Stats</strong> — Lv50 5★ or Lv60 6★ fully awakened</li>
          <li><strong>Engraving Focus Bonus</strong> — Per-grade (D~SSS)</li>
          <li><strong>Heroes with Similar Setup</strong> — Same set users</li>
          <li><strong>External Guides</strong> — DCInside guide links</li>
        </ul>
      </Section>

      <Section title="Terms">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-[var(--accent)] font-medium">●</dt>
          <dd>Essential substat — must have</dd>
          <dt className="text-[var(--preferred)] font-medium">○</dt>
          <dd>Preferred substat — nice to have</dd>
          <dt className="text-[var(--text-secondary)]">Covenant</dt>
          <dd>Heroes from the standard summon pool (includes limited)</dd>
          <dt className="text-[var(--text-secondary)]">Moonlight</dt>
          <dd>Light/Dark heroes from the Moonlight shop (alters of the original)</dd>
          <dt className="text-[var(--text-secondary)]">Limited</dt>
          <dd>Available only during specific events</dd>
          <dt className="text-[var(--text-secondary)]">Specialty Change</dt>
          <dd>3★ heroes upgraded via specialty quest</dd>
          <dt className="text-[var(--text-secondary)]">Ignore 2-set</dt>
          <dd>You can ignore 2-piece set bonuses and focus on 4-set</dd>
        </dl>
      </Section>

      <Section title="Language">
        <p className="text-sm">
          Toggle <Tag>KO</Tag> / <Tag>EN</Tag> at the top right. Hero names,
          sets, substats, and engravings translate automatically. Notes are
          paraphrased from the Korean original.
        </p>
      </Section>

      <Section title="Data sources">
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Substats / sets / priority / notes: DCInside Epic Seven Gallery sheet</li>
          <li>Hero meta + recommended artifacts: DCInside gear sim sheet</li>
          <li>Images / base stats / EN names: <ExtA href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer">Fribbels Optimizer</ExtA></li>
          <li>External guides: <ExtA href="https://gall.dcinside.com/mgallery/board/view/?id=epicseven&no=2468784">DCInside guide compilation</ExtA></li>
          <li>Game assets: © Smilegate Megaport / Epic Seven</li>
        </ul>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Unofficial fan site. Not affiliated with Smilegate.
        </p>
      </Section>
    </article>
  );
}

/* ----- shared ----- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
        {title}
      </h2>
      <div className="text-[var(--text-secondary)] leading-relaxed">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-sm px-3 py-2 text-xs tabular text-[var(--text-primary)] overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] mx-0.5">
      {children}
    </span>
  );
}

function ExtA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--text-primary)] hover:text-[var(--accent)]"
    >
      {children}
      <span className="text-[var(--text-muted)] text-xs ml-0.5">↗</span>
    </a>
  );
}
