import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "API 학습용 서비스",
  description: "API 수업용 Next.js 서비스 뼈대"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
