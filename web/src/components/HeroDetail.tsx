"use client";

import Image from "next/image";
import Link from "next/link";
import { enums, getVariants, getRelatedHeroes } from "@/lib/data";
import { HeroCard } from "@/components/HeroCard";
import { SlotIcon } from "./SlotIcon";
import { useT, useLang } from "@/i18n/LangProvider";
import { enumLabel, heroName } from "@/i18n/display";
import type { MessageKey } from "@/i18n/messages";
import type {
  Hero,
  SubstatId,
  SetId,
  ElementId,
  EngravingGrade,
  ContentTag,
  MainOptions,
  CommunityAvgStats,
} from "@/lib/types";

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

const CONTENT_LABEL: Record<ContentTag, MessageKey> = {
  pve: "content_pve",
  pvp: "content_pvp",
};

const TYPE_LABEL_KO: Record<string, string> = {
  standard: "성약",
  moonlight5: "월광 5★",
  moonlight4: "월광 4★",
  moonlight4_alt: "월광 4★",
  regular3: "3★",
  specialty3: "전직 3★",
  limited: "한정",
  unknown: "기타",
};
const TYPE_LABEL_EN: Record<string, string> = {
  standard: "Covenant",
  moonlight5: "Moonlight 5★",
  moonlight4: "Moonlight 4★",
  moonlight4_alt: "Moonlight 4★",
  regular3: "3★",
  specialty3: "Specialty 3★",
  limited: "Limited",
  unknown: "Other",
};

export function HeroDetail({ hero }: { hero: Hero }) {
  const t = useT();
  const { lang } = useLang();
  const elementColor = hero.element ? ELEMENT_VAR[hero.element] : undefined;
  const rarityColor = hero.rarity ? RARITY_VAR[hero.rarity] : undefined;
  const TYPE_LABEL = lang === "en" ? TYPE_LABEL_EN : TYPE_LABEL_KO;
  const displayName = heroName(hero, lang);

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[var(--text-secondary)]">
          {t("back_to_home")}
        </Link>
        <span>›</span>
        <Link href="/heroes" className="hover:text-[var(--text-secondary)]">
          {t("nav_heroes")}
        </Link>
        <span>›</span>
        <span className="text-[var(--text-secondary)]">{displayName}</span>
      </nav>

      <header className="relative mb-6 md:mb-8 rounded-sm overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {elementColor && (
          <div className="h-[3px] w-full" style={{ backgroundColor: elementColor }} aria-hidden />
        )}

        <div className="flex items-start gap-4 md:gap-6 p-4 md:p-6">
          {hero.image?.icon && (
            <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-sm overflow-hidden border border-[var(--border-default)] bg-[var(--bg-input)]">
              <Image
                src={hero.image.icon}
                alt={displayName}
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] leading-tight">
              {displayName}
            </h1>
            {/* sub: 다른 언어 이름 (EN 모드면 KO, KO 모드면 EN) */}
            {lang === "ko" && hero.names.en && (
              <p className="text-sm text-[var(--text-muted)] mt-0.5">{hero.names.en}</p>
            )}
            {lang === "en" && (
              <p className="text-sm text-[var(--text-muted)] mt-0.5">{hero.names.ko}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {hero.rarity && <Badge style={{ color: rarityColor }}>{hero.rarity}★</Badge>}
              {hero.element && (
                <Badge>
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                    style={{ backgroundColor: elementColor }}
                  />
                  {enumLabel(enums.elements[hero.element], lang)}
                </Badge>
              )}
              {hero.class && <Badge>{enumLabel(enums.classes[hero.class], lang)}</Badge>}
              {hero.zodiac && <Badge>{enumLabel(enums.zodiacs[hero.zodiac], lang)}</Badge>}
              {TYPE_LABEL[hero.type] && (
                <Badge subtle>{TYPE_LABEL[hero.type]}</Badge>
              )}
              <Badge subtle>{t(CONTENT_LABEL[hero.tags.content])}</Badge>
            </div>

            {hero.engraving_focus && (
              <div className="mt-3 text-sm">
                <span className="text-[var(--text-muted)]">{t("engraving_label")} · </span>
                <span className="text-[var(--text-primary)]">
                  {enumLabel(enums.engravings[hero.engraving_focus], lang)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {hero.valid_options ? <ValidOptionsBlock hero={hero} /> : <NoDataBlock />}

      <ExtrasBlock hero={hero} />
    </main>
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
  const t = useT();
  const { lang } = useLang();
  const vo = hero.valid_options!;

  const essential = SUBSTAT_ORDER.filter((s) => vo.substats[s] === "essential");
  const preferred = SUBSTAT_ORDER.filter((s) => vo.substats[s] === "preferred");

  return (
    <>
      {vo.main_options && <MainOptionsBlock mo={vo.main_options} />}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
      <Section title={t("sec_substats")}>
        <div className="space-y-3">
          <SubstatLine label={t("level_essential")} marker="●" color="var(--essential)" stats={essential} />
          <SubstatLine label={t("level_preferred")} marker="○" color="var(--preferred)" stats={preferred} />
        </div>

        {!vo.priority_unknown && vo.priority_order.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-muted)] mb-2">{t("sec_priority")}</div>
            <div className="flex flex-wrap items-center gap-1.5 text-sm">
              {vo.priority_order.map((s, i) => (
                <span key={`${s}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[var(--text-muted)]">›</span>}
                  <span className="text-[var(--text-primary)]">
                    {enumLabel(enums.substats[s], lang)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
        {vo.priority_unknown && (
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            {t("sec_priority_unknown")}
          </div>
        )}
      </Section>

      <Section title={t("sec_recommended_sets")}>
        {vo.set_combos.length > 0 ? (
          <ol className="space-y-2">
            {vo.set_combos.map((combo, i) => (
              <li key={i} className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="text-[var(--text-muted)] tabular w-4">
                  {String.fromCharCode(65 + i)}.
                </span>
                {combo.map((s, j) => (
                  <span key={`${s}-${j}`} className="flex items-center gap-1.5">
                    {j > 0 && <span className="text-[var(--text-muted)]">+</span>}
                    <SetTag id={s} />
                  </span>
                ))}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">{t("no_recommended_sets")}</div>
        )}

        {vo.valid_sets.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-muted)] mb-2">{t("sec_valid_sets")}</div>
            <div className="flex flex-wrap gap-1.5">
              {vo.valid_sets.map((s) => <SetTag key={s} id={s} />)}
            </div>
          </div>
        )}

        {vo.ignore_2set && (
          <div className="mt-3 text-xs text-[var(--text-muted)]">{t("ignore_2set")}</div>
        )}
      </Section>

      {vo.notes && (
        <Section title={t("sec_notes")} wide>
          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
            {lang === "en" && vo.notes_en ? vo.notes_en : vo.notes}
          </p>
          {lang === "en" && !vo.notes_en && (
            <p className="text-[10px] text-[var(--text-muted)] mt-2">
              (Translation pending — Korean original above)
            </p>
          )}
        </Section>
      )}
    </div>
    </>
  );
}

function NoDataBlock() {
  const t = useT();
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-6">
      <div className="text-sm text-[var(--text-secondary)]">{t("unregistered_note")}</div>
      <div className="mt-3 text-xs text-[var(--text-muted)]">
        {t("external_refs")}{" "}
        <a
          href="https://fribbels.github.io/e7/hero-library.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--text-secondary)]"
        >
          Fribbels Hero Library
        </a>
        {", "}
        <a
          href="https://epic7db.com/heroes"
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

function ExtrasBlock({ hero }: { hero: Hero }) {
  const t = useT();
  const { lang } = useLang();
  const variants = getVariants(hero);
  const related = hero.has_data ? getRelatedHeroes(hero, 8) : [];
  const stats = hero.base_stats?.lv60_6 || hero.base_stats?.lv50_5 || null;
  const isLv60 = !!hero.base_stats?.lv60_6;
  const artifacts = hero.recommended_artifacts || [];
  const guides = hero.guides || [];
  const eng = hero.engraving_focus
    ? enums.engraving_grades?.[hero.engraving_focus]
    : undefined;
  const engLevel = hero.rarity ? String(hero.rarity) : null;
  const engRow = eng && engLevel ? eng[engLevel] : undefined;

  const hasAny =
    variants.length > 0 ||
    related.length > 0 ||
    !!stats ||
    !!hero.community_avg_stats ||
    artifacts.length > 0 ||
    guides.length > 0 ||
    !!engRow;

  if (!hasAny) return null;

  return (
    <div className="mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
      {variants.length > 0 && (
        <Section title={t("sec_variants")} wide>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {variants.map((v) => <HeroCard key={v.id} hero={v} />)}
          </div>
        </Section>
      )}

      {artifacts.length > 0 && (
        <Section title={t("sec_artifacts")}>
          <ol className="space-y-2">
            {artifacts.map((a, i) => {
              const display = lang === "en" ? (a.en || a.ko) : a.ko;
              const sub = lang === "en" ? a.ko : a.en;
              return (
                <li key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="text-[var(--text-muted)] tabular text-xs w-4 shrink-0">{i + 1}.</span>
                  <span className="text-[var(--text-primary)]">{display}</span>
                  {sub && (
                    <span className="text-[10px] text-[var(--text-muted)]">{sub}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {stats && (
        <Section title={`${t("sec_base_stats")} — ${isLv60 ? t("base_stats_lv60") : t("base_stats_lv50")}`}>
          <dl className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-2 text-sm">
            <Stat label={t("stat_atk")} value={stats.atk} />
            <Stat label={t("stat_hp")} value={stats.hp} />
            <Stat label={t("stat_def")} value={stats.def} />
            <Stat label={t("stat_spd")} value={stats.spd} />
            <Stat label={t("stat_chc")} value={`${(stats.chc * 100).toFixed(0)}%`} />
            <Stat label={t("stat_chd")} value={`${(stats.chd * 100).toFixed(0)}%`} />
            {stats.dac !== undefined && stats.dac > 0 && (
              <Stat label={t("stat_dac")} value={`${(stats.dac * 100).toFixed(0)}%`} />
            )}
            {stats.cp !== undefined && (
              <Stat label={t("stat_cp")} value={stats.cp} />
            )}
          </dl>
        </Section>
      )}

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

      {engRow && hero.engraving_focus && (
        <Section title={`${t("sec_engraving")} — ${enumLabel(enums.engravings[hero.engraving_focus], lang)}`} wide>
          <div className="overflow-x-auto -mx-4 md:-mx-5 px-4 md:px-5">
            <table className="w-full text-sm tabular border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-xs text-[var(--text-muted)] font-normal pb-2 pr-3">
                    {t("engraving_grade")}
                  </th>
                  {(["D", "C", "B", "A", "S", "SS", "SSS"] as EngravingGrade[]).map((g) => (
                    <th key={g} className="text-center text-xs text-[var(--text-muted)] font-normal pb-2 px-2">
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-[var(--text-secondary)] py-1.5 pr-3 text-xs">
                    {lang === "en" ? `Lv ${hero.rarity}` : `${hero.rarity}단계`}
                  </td>
                  {(["D", "C", "B", "A", "S", "SS", "SSS"] as EngravingGrade[]).map((g) => (
                    <td key={g} className="text-center py-1.5 px-2 text-[var(--text-primary)]">
                      {engRow[g] ?? "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {guides.length > 0 && (
        <Section title={t("sec_guides")}>
          <ul className="space-y-2 text-sm">
            {guides.map((g, i) => (
              <li key={i}>
                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-primary)] hover:text-[var(--accent)] inline-flex items-center gap-1.5"
                >
                  <span>{g.title}</span>
                  <span className="text-[var(--text-muted)] text-xs">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-[var(--text-muted)] mt-3">{t("guides_source")}</p>
        </Section>
      )}

      {related.length > 0 && (
        <Section title={t("sec_related")} wide>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
            {related.map((h) => <HeroCard key={h.id} hero={h} />)}
          </div>
        </Section>
      )}
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
      <h2 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">{title}</h2>
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
  const { lang } = useLang();
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
              {enumLabel(enums.substats[s], lang)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function SetTag({ id }: { id: SetId }) {
  const { lang } = useLang();
  const set = enums.sets[id];
  if (!set) return <span>{id}</span>;
  const label = enumLabel(set, lang);
  const effect = lang === "en" ? (set.effect_en || set.effect) : set.effect;
  const tooltip = effect
    ? `${label} (${set.pieces}) — ${effect}`
    : `${label} (${set.pieces})`;
  return (
    <span
      title={tooltip}
      className="inline-flex items-baseline gap-1 text-xs px-2 py-0.5 rounded-sm border border-[var(--border-default)] bg-[var(--bg-elevated)] cursor-help"
    >
      <span className="text-[var(--text-primary)]">{label}</span>
      <span className="text-[var(--text-muted)] tabular text-[10px]">{set.pieces}</span>
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</dt>
      <dd className="text-[var(--text-primary)] font-medium">
        {typeof value === "number" ? value.toLocaleString() : value}
      </dd>
    </div>
  );
}

function MainOptionsBlock({ mo }: { mo: MainOptions }) {
  const t = useT();
  const { lang } = useLang();
  const slots: { key: keyof MainOptions; label: string }[] = [
    { key: "necklace", label: t("slot_necklace") },
    { key: "ring",     label: t("slot_ring") },
    { key: "boots",    label: t("slot_boots") },
  ];
  return (
    <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 md:p-5 mt-4 md:mt-6">
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
