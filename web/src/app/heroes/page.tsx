import { Suspense } from "react";
import { HeroesBrowser } from "@/components/HeroesBrowser";

export const metadata = {
  title: "영웅 둘러보기 — 에픽세븐 장비 가이드",
};

export default function HeroesPage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
          영웅 둘러보기
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          속성·직업·등급·타입으로 영웅을 좁혀보거나 이름으로 찾으세요.
        </p>
      </header>

      <Suspense fallback={null}>
        <HeroesBrowser />
      </Suspense>
    </main>
  );
}
