import type { Hero } from "@/lib/types";
import { HeroCard } from "./HeroCard";

interface Props {
  heroes: Hero[];
  emptyMessage?: string;
}

export function HeroGrid({ heroes, emptyMessage }: Props) {
  if (heroes.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[var(--text-muted)]">
        {emptyMessage ?? "결과가 없습니다."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
      {heroes.map((h) => (
        <HeroCard key={h.id} hero={h} />
      ))}
    </div>
  );
}
