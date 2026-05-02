import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LangProvider } from "@/i18n/LangProvider";
import type { Lang } from "@/i18n/messages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://epic7-equipment.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "에픽세븐 장비 가이드 — 부옵·세트로 영웅 매칭",
    template: "%s | 에픽세븐 장비 가이드",
  },
  description:
    "에픽세븐(Epic Seven) 영웅별 유효 부옵션·세트·우선순위·추천 아티팩트 검색. " +
    "장비를 누구에게 줘야할지 모르는 뉴비를 위한 매칭 도구. 287명 영웅 데이터.",
  applicationName: "에픽세븐 장비 가이드",
  keywords: [
    "에픽세븐", "Epic Seven", "에세", "장비", "유효옵션", "부옵션",
    "세트", "장비 추천", "영웅 가이드", "에픽세븐 장비",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "에픽세븐 장비 가이드",
    description: "장비를 누구에게 줘야할지 빠르게 찾는 매칭 도구. 287명 영웅 유효옵·세트·우선순위.",
    siteName: "에픽세븐 장비 가이드",
  },
  twitter: {
    card: "summary",
    title: "에픽세븐 장비 가이드",
    description: "부옵·세트로 어울리는 영웅 매칭. 287명 데이터.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d12",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버에서 cookie 읽어 초기 lang 결정 (hydration 일치 + flash 방지)
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("lang")?.value;
  const initialLang: Lang =
    langCookie === "en" || langCookie === "ko" ? langCookie : "ko";

  return (
    <html lang={initialLang} className="h-full">
      <body className="min-h-full flex flex-col">
        <LangProvider initialLang={initialLang}>
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
