import { Suspense } from "react";
import { GearSearch } from "@/components/GearSearch";
import { PageHeader } from "@/components/PageHeader";

export default function HomePage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-[1400px] w-full mx-auto">
      <PageHeader titleKey="home_title" subtitleKey="home_subtitle" />
      <Suspense fallback={null}>
        <GearSearch />
      </Suspense>
    </main>
  );
}
