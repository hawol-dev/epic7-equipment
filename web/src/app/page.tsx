import { Suspense } from "react";
import { GearSearch } from "@/components/GearSearch";

export default function HomePage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
          이 장비, 누구한테 줄까
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          세트와 부옵션을 입력하면 어울리는 영웅을 점수순으로 보여줍니다.
        </p>
      </header>

      <Suspense fallback={null}>
        <GearSearch />
      </Suspense>
    </main>
  );
}
