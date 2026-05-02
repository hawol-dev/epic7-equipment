import { PageHeader } from "@/components/PageHeader";
import { SetsList } from "@/components/SetsList";

export const metadata = {
  title: "세트 정보",
  description:
    "에픽세븐 22개 장비 세트 (속도/공격/면역/파멸/반격 등) 효과와 " +
    "각 세트를 사용하는 대표 영웅 정리.",
};

export default function SetsPage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      <PageHeader titleKey="sets_title" subtitleKey="sets_subtitle" />
      <SetsList />
    </main>
  );
}
