import Link from "next/link";
import { enums, searchIndex, getHeroes } from "@/lib/data";
import type { SetId } from "@/lib/types";

export const metadata = {
  title: "세트 정보 — 에픽세븐 장비 가이드",
};

// 4세트 먼저, 다음 2세트. 같은 종류 안에선 사용 영웅 수 내림차순
function sortSets(): SetId[] {
  const ids = Object.keys(enums.sets) as SetId[];
  return ids.sort((a, b) => {
    const ap = enums.sets[a].pieces ?? 0;
    const bp = enums.sets[b].pieces ?? 0;
    if (ap !== bp) return bp - ap;
    const ac = (searchIndex.by_set[a] || []).length;
    const bc = (searchIndex.by_set[b] || []).length;
    if (ac !== bc) return bc - ac;
    return enums.sets[a].ko.localeCompare(enums.sets[b].ko, "ko");
  });
}

export default function SetsPage() {
  const orderedSets = sortSets();

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
          세트 정보
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          22개 세트의 효과와 어떤 영웅이 사용하는지 확인하세요.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        {orderedSets.map((id) => (
          <SetCard key={id} id={id} />
        ))}
      </div>
    </main>
  );
}

function SetCard({ id }: { id: SetId }) {
  const set = enums.sets[id];
  const userIds = searchIndex.by_set[id] || [];
  const users = getHeroes(userIds);

  // 5★ 우선, 가나다순
  const sortedUsers = users.sort((a, b) => {
    const ar = a.rarity ?? 0;
    const br = b.rarity ?? 0;
    if (ar !== br) return br - ar;
    return a.names.ko.localeCompare(b.names.ko, "ko");
  });
  const topUsers = sortedUsers.slice(0, 12);

  return (
    <article className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-sm p-4 md:p-5 flex flex-col">
      <header className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-base font-medium text-[var(--text-primary)]">
          {set.ko}
          <span className="ml-2 text-xs text-[var(--text-muted)] tabular">
            {set.pieces}세트
          </span>
        </h2>
        <span className="text-xs text-[var(--text-muted)] tabular shrink-0">
          {users.length}명 사용
        </span>
      </header>

      {set.effect && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          {set.effect}
        </p>
      )}

      {topUsers.length > 0 && (
        <div className="mt-auto pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] mb-2">
            대표 영웅
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topUsers.map((h) => (
              <Link
                key={h.id}
                href={`/hero/${h.id}`}
                className="text-xs px-2 py-1 rounded-sm border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              >
                {h.names.ko}
              </Link>
            ))}
            {users.length > topUsers.length && (
              <Link
                href={`/?set=${id}`}
                className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                +{users.length - topUsers.length}명 →
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
