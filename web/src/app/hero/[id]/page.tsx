import { notFound } from "next/navigation";
import { heroes, enums, getHero } from "@/lib/data";
import { HeroDetail } from "@/components/HeroDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return heroes.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const hero = getHero(id);
  if (!hero) return { title: "찾을 수 없음" };

  const elementKo = hero.element ? enums.elements[hero.element]?.ko : null;
  const classKo = hero.class ? enums.classes[hero.class]?.ko : null;
  const meta = [
    hero.rarity ? `${hero.rarity}★` : null,
    elementKo,
    classKo,
  ].filter(Boolean).join(" ");

  const descParts: string[] = [`${hero.names.ko}${meta ? ` (${meta})` : ""}`];
  if (hero.valid_options) {
    const essential = (Object.entries(hero.valid_options.substats) as Array<[string, string | null]>)
      .filter(([, v]) => v === "essential")
      .map(([k]) => enums.substats[k as keyof typeof enums.substats]?.ko)
      .filter(Boolean);
    if (essential.length) descParts.push(`필수 부옵: ${essential.join(", ")}`);
    if (hero.valid_options.set_combos.length > 0) {
      const combo = hero.valid_options.set_combos[0]
        .map((s) => enums.sets[s]?.ko)
        .filter(Boolean)
        .join(" + ");
      descParts.push(`추천 세트: ${combo}`);
    }
  }
  const description = descParts.join(" · ") + " — 에픽세븐 장비 가이드";

  return {
    title: hero.names.ko,
    description,
    openGraph: {
      title: `${hero.names.ko} — 에픽세븐 장비 가이드`,
      description,
      images: hero.image?.icon ? [{ url: hero.image.icon }] : undefined,
    },
  };
}

export default async function HeroDetailPage({ params }: Props) {
  const { id } = await params;
  const hero = getHero(id);
  if (!hero) notFound();
  return <HeroDetail hero={hero} />;
}
