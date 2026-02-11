import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const _inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const _jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "БАЛКА — Расчёты для тех, кто строит",
  description:
    "Нормативы СП, калькуляторы, чек-листы и пояснительные записки. Инструмент инженера, а не бюрократа.",
};

export const viewport: Viewport = {
  themeColor: "#0a0d14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
