import type { Metadata } from "next";
import { Noto_Sans_KR, Manrope } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "TabiBox — たびBOX",
  description: "일본 여행 사진을 자동으로 정리하고 AI로 다시 찾는 여행 아카이브",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
