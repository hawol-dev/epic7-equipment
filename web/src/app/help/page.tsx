import { PageHeader } from "@/components/PageHeader";
import { HelpContent } from "@/components/HelpContent";

export const metadata = {
  title: "사용법",
  description:
    "에픽세븐 장비 가이드 사이트 사용법: 장비 검색, 영웅 둘러보기, " +
    "점수 계산, 표기 의미, 데이터 출처 안내.",
};

export default function HelpPage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[820px] w-full mx-auto">
      <PageHeader titleKey="nav_help" />
      <HelpContent />
    </main>
  );
}
