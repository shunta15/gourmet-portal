import type { Metadata } from "next";
import "./globals.css";
import Cursor from "@/components/Cursor";
import ProgressBar from "@/components/ProgressBar";
import Nav from "@/components/Nav";
import SideLabel from "@/components/SideLabel";

export const metadata: Metadata = {
  title: "味処 日本 — AJIDOKORO NIPPON / 全国飲食店ポータル",
  description:
    "全国47都道府県、編集部が一軒ずつ足を運んで取材した飲食店だけを掲載。広告や掲載料ではなく、編集部の舌と足で選んだ一軒ずつを、取材記事とともにお届けします。",
  openGraph: {
    title: "味処 日本 — AJIDOKORO NIPPON",
    description:
      "編集部取材 × 全国飲食店ポータル。街の\u201cいいお店\u201d、ぜんぶここに。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" data-region="shitamachi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Zen+Kaku+Gothic+Antique:wght@300;400;500;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap"
        />
      </head>
      <body>
        <Cursor />
        <ProgressBar />
        <Nav />
        <SideLabel />
        {children}
      </body>
    </html>
  );
}
