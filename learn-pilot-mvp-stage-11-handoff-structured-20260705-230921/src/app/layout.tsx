import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "学径 AI",
  description: "移动端优先的 AI 学习计划 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
