import { Suspense } from "react";
import { HeroesBrowser } from "@/components/HeroesBrowser";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "영웅 둘러보기",
  description:
    "에픽세븐 287명 영웅을 속성·직업·등급·타입(성약/월광/한정/전직)으로 좁혀보거나 " +
    "이름으로 검색. 각 영웅의 유효 부옵·추천 세트 조합 확인.",
};

export default function HeroesPage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      <PageHeader titleKey="heroes_title" subtitleKey="heroes_subtitle" />
      <Suspense fallback={null}>
        <HeroesBrowser />
      </Suspense>
    </main>
  );
}
