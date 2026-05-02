import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { heroes, enums, getHero, getVariants, getRelatedHeroes } from "@/lib/data";
import { HeroCard } from "@/components/HeroCard";
import type {
  Hero,
  SubstatId,
  SetId,
  ElementId,
  EngravingGrade,
} from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

const SUBSTAT_ORDER: SubstatId[] = [
  "spd", "atk_p", "hp_p", "def_p",
  "chc", "chd", "eff", "effres",
];

const ELEMENT_VAR: Record<ElementId, string> = {
  fire: "var(--el-fire)",
  ice: "var(--el-ice)",
  earth: "var(--el-earth)",
  light: "var(--el-light)",
  dark: "var(--el-dark)",
};

const RARITY_VAR: Record<number, string> = {
  3: "var(--rar-3)",
  4: "var(--rar-4)",
  5: "var(--rar-5)",
};

const TYPE_LABEL: Record<string, string> = {
  standard: "성약",
  moonlight5: "월광 5★",
  moonlight4: "월광 4★",
  moonlight4_alt: "월광 4★",
  regular3: "3★",
  specialty3: "전직 3★",
  limited: "한정",
  unknown: "기타",
};

export async function generateStaticParams() {
  return heroes.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const hero = getHero(id);
  if (!hero) return { title: "찾을 수 없음" };
  return {
    title: `${hero.names.ko} — 에픽세븐 장비 가이드`,
    description: `${hero.names.ko} 유효 부옵션·세트·우선순위 정보`,
  };
}

export default async function HeroDetailPage({ params }: Props) {
  const { id } = await params;
  const hero = getHero(id);
  if (!hero) notFound();

  const elementColor = hero.element ? ELEMENT_VAR[hero.element] : undefined;
  const rarityColor = hero.rarity ? RARITY_VAR[hero.rarity] : undefined;

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[var(--text-secondary)]">
          홈
        </Link>
        <span>›</span>
        <Link href="/heroes" className="hover:text-[var(--text-secondary)]">
          영웅
        </Link>
        <span>›</span>
        <span className="text-[var(--text-secondary)]">{hero.names.ko}</span>
      </nav>

      {/* 헤더 — 깔끔한 카드 + 속성색 상단 스트라이프 */}
      <header className="relative mb-6 md:mb-8 rounded-sm overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {/* 속성 컬러 상단 스트라이프 (3px, 의도적 액센트) */}
        {elementColor && (
          <div
            className="h-[3px] w-full"
            style={{ backgroundColor: elementColor }}
            aria-hidden
          />
        )}

        <div className="flex items-start gap-4 md:gap-6 p-4 md:p-6">
          {/* face icon */}
          {hero.image?.icon && (
            <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-sm overflow-hidden border border-[var(--border-default)] bg-[var(--bg-input)]">
              <Image
                src={hero.image.icon}
                alt={hero.names.ko}
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] leading-tight">
              {hero.names.ko}
            </h1>
            {hero.names.en && (
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {hero.names.en}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {hero.rarity && (
                <Badge style={{ color: rarityColor }}>{hero.rarity}★</Badge>
              )}
              {hero.element && (
                <Badge>
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                    style={{ backgroundColor: elementColor }}
                  />
                  {enums.elements[hero.element].ko}
                </Badge>
              )}
              {hero.class && <Badge>{enums.classes[hero.class].ko}</Badge>}
              {hero.zodiac && <Badge>{enums.zodiacs[hero.zodiac].ko}</Badge>}
              {TYPE_LABEL[hero.type] && (
                <Badge subtle>{TYPE_LABEL[hero.type]}</Badge>
              )}
            </div>

            {hero.engraving_focus && (
              <div className="mt-3 text-sm">
                <span className="text-[var(--text-muted)]">각인집중 · </span>
                <span className="text-[var(--text-primary)]">
                  {enums.engravings[hero.engraving_focus]?.ko ??
                    hero.engraving_focus}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 유효옵 본문 */}
      {hero.valid_options ? (
        <ValidOptionsBlock hero={hero} />
      ) : (
        <NoDataBlock hero={hero} />
      )}

      {/* 추가 섹션들 */}
      <ExtrasBlock hero={hero} />
    </main>
  );
}

function ExtrasBlock({ hero }: { hero: Hero }) {
  const variants = getVariants(hero);
  const related = hero.has_data ? getRelatedHeroes(hero, 8) : [];
  const stats = hero.base_stats?.lv60_6 || hero.base_stats?.lv50_5 || null;
  const isLv60 = !!hero.base_stats?.lv60_6;
  const artifacts = hero.recommended_artifacts || [];
  const eng = hero.engraving_focus
    ? enums.engraving_grades?.[hero.engraving_focus]
    : undefined;
  const engLevel = hero.rarity ? String(hero.rarity) : null;
  const engRow = eng && engLevel ? eng[engLevel] : undefined;

  const hasAny =
    variants.length > 0 ||
    related.length > 0 ||
    !!stats ||
    artifacts.length > 0 ||
    !!engRow;

  if (!hasAny) return null;

  return (
    <div className="mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
      {variants.length > 0 && (
        <Section title="다른 운영법" wide>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {variants.map((v) => (
              <HeroCard key={v.id} hero={v} />
            ))}
          </div>
        </Section>
      )}

      {artifacts.length > 0 && (
        <Section title="추천 아티팩트">
          <ol className="space-y-2">
            {artifacts.map((name, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-[var(--text-primary)]"
              >
                <span className="text-[var(--text-muted)] tabular text-xs w-4">
                  {i + 1}.
                </span>
                <span>{name}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {stats && (
        <Section title={`기본 능력치 ${isLv60 ? "(60렙 6★ 풀각성)" : "(50렙 5★ 풀각성)"}`}>
          <dl className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-2 text-sm">
            <Stat label="공격력" value={stats.atk} />
            <Stat label="생명력" value={stats.hp} />
            <Stat label="방어력" value={stats.def} />
            <Stat label="속도" value={stats.spd} />
            <Stat label="치명확률" value={`${(stats.chc * 100).toFixed(0)}%`} />
            <Stat label="치명피해" value={`${(stats.chd * 100).toFixed(0)}%`} />
            {stats.dac !== undefined && stats.dac > 0 && (
              <Stat label="협공률" value={`${(stats.dac * 100).toFixed(0)}%`} />
            )}
            {stats.cp !== undefined && (
              <Stat label="전투력" value={stats.cp} />
            )}
          </dl>
        </Section>
      )}

      {engRow && hero.engraving_focus && (
        <Section title={`각인집중 효과 — ${enums.engravings[hero.engraving_focus]?.ko}`} wide>
          <div className="overflow-x-auto -mx-4 md:-mx-5 px-4 md:px-5">
            <table className="w-full text-sm tabular border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-xs text-[var(--text-muted)] font-normal pb-2 pr-3">
                    등급
                  </th>
                  {(["D", "C", "B", "A", "S", "SS", "SSS"] as EngravingGrade[]).map((g) => (
                    <th
                      key={g}
                      className="text-center text-xs text-[var(--text-muted)] font-normal pb-2 px-2"
                    >
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-[var(--text-secondary)] py-1.5 pr-3 text-xs">
                    {hero.rarity}단계
                  </td>
                  {(["D", "C", "B", "A", "S", "SS", "SSS"] as EngravingGrade[]).map((g) => (
                    <td
                      key={g}
                      className="text-center py-1.5 px-2 text-[var(--text-primary)]"
                    >
                      {engRow[g] ?? "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {related.length > 0 && (
        <Section title="비슷한 세팅의 영웅" wide>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
            {related.map((h) => (
              <HeroCard key={h.id} hero={h} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-[var(--text-primary)] font-medium">
        {typeof value === "number" ? value.toLocaleString() : value}
      </dd>
    </div>
  );
}

function Badge({
  children,
  subtle,
  style,
}: {
  children: React.ReactNode;
  subtle?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={
        "inline-flex items-center text-xs px-2 py-1 rounded-sm border " +
        (subtle
          ? "border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--bg-surface)]"
          : "border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-surface)]")
      }
      style={style}
    >
      {children}
    </span>
  );
}

function ValidOptionsBlock({ hero }: { hero: Hero }) {
  const vo = hero.valid_options!;

  // 부옵 essential / preferred 분리
  const essential = SUBSTAT_ORDER.filter(
    (s) => vo.substats[s] === "essential"
  );
  const preferred = SUBSTAT_ORDER.filter(
    (s) => vo.substats[s] === "preferred"
  );

  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
      {/* 부옵 */}
      <Section title="유효 부옵션">
        <div className="space-y-3">
          <SubstatLine
            label="필수"
            marker="●"
            color="var(--essential)"
            stats={essential}
          />
          <SubstatLine
            label="선호"
            marker="○"
            color="var(--preferred)"
            stats={preferred}
          />
        </div>

        {!vo.priority_unknown && vo.priority_order.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-muted)] mb-2">우선순위</div>
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              {vo.priority_order.map((s, i) => (
                <span key={`${s}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[var(--text-muted)]">›</span>}
                  <span className="text-[var(--text-primary)]">
                    {enums.substats[s].ko}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
        {vo.priority_unknown && (
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            우선순위 정보 없음 (몰루)
          </div>
        )}
      </Section>

      {/* 세트 */}
      <Section title="추천 세트">
        {vo.set_combos.length > 0 ? (
          <ol className="space-y-2">
            {vo.set_combos.map((combo, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-1.5 text-sm"
              >
                <span className="text-[var(--text-muted)] tabular w-4">
                  {String.fromCharCode(65 + i)}.
                </span>
                {combo.map((s, j) => (
                  <span key={`${s}-${j}`} className="flex items-center gap-1.5">
                    {j > 0 && (
                      <span className="text-[var(--text-muted)]">+</span>
                    )}
                    <SetTag id={s} />
                  </span>
                ))}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            추천 세트 정보 없음
          </div>
        )}

        {vo.valid_sets.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-muted)] mb-2">
              유효 세트 (어떤 세트든 OK)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {vo.valid_sets.map((s) => (
                <SetTag key={s} id={s} />
              ))}
            </div>
          </div>
        )}

        {vo.ignore_2set && (
          <div className="mt-3 text-xs text-[var(--text-muted)]">
            ※ 2세트 옵션 무시 (4세트 위주)
          </div>
        )}
      </Section>

      {/* 비고 */}
      {vo.notes && (
        <Section title="비고" wide>
          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
            {vo.notes}
          </p>
        </Section>
      )}
    </div>
  );
}

function NoDataBlock({ hero }: { hero: Hero }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-6">
      <div className="text-sm text-[var(--text-secondary)]">
        이 영웅의 유효옵션 정보가 아직 등록되지 않았습니다.
      </div>
      <div className="mt-3 text-xs text-[var(--text-muted)]">
        외부 참고: {" "}
        <a
          href={`https://fribbels.github.io/e7/hero-library.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text-secondary)]"
        >
          Fribbels Hero Library
        </a>
        ,{" "}
        <a
          href={`https://epic7db.com/heroes`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text-secondary)]"
        >
          Epic7DB
        </a>
      </div>
    </div>
  );
}

function Section({
  title,
  wide,
  children,
}: {
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 md:p-5 " +
        (wide ? "md:col-span-2" : "")
      }
    >
      <h2 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubstatLine({
  label,
  marker,
  color,
  stats,
}: {
  label: string;
  marker: string;
  color: string;
  stats: SubstatId[];
}) {
  return (
    <div className="flex items-baseline gap-3">
      <div className="w-12 shrink-0 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <span style={{ color }}>{marker}</span>
        {label}
      </div>
      <div className="flex-1 flex flex-wrap gap-1.5">
        {stats.length === 0 ? (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        ) : (
          stats.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-sm border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            >
              {enums.substats[s].ko}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function SetTag({ id }: { id: SetId }) {
  const set = enums.sets[id];
  if (!set) return <span>{id}</span>;
  const tooltip = set.effect
    ? `${set.ko} (${set.pieces}세트) — ${set.effect}`
    : `${set.ko} (${set.pieces}세트)`;
  return (
    <span
      title={tooltip}
      className="inline-flex items-baseline gap-1 text-xs px-2 py-0.5 rounded-sm border border-[var(--border-default)] bg-[var(--bg-elevated)] cursor-help"
    >
      <span className="text-[var(--text-primary)]">{set.ko}</span>
      <span className="text-[var(--text-muted)] tabular text-[10px]">
        {set.pieces}
      </span>
    </span>
  );
}
