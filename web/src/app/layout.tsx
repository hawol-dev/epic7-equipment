import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "에픽세븐 장비 가이드",
  description:
    "에픽세븐 영웅별 유효 부옵션·세트·우선순위 검색. 부옵·세트로 어떤 영웅에게 줄지 빠르게 찾기.",
  applicationName: "에픽세븐 장비 가이드",
  authors: [{ name: "fan tool" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
