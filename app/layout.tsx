import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/jsonld";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://machinowa.tokyo"),
  title: "マチノワ / 街の輪 — 全国飲食店ポータル",
  description:
    '全国の街の"いいお店"を、エリア・業種・特集で巡れる食のポータル「マチノワ」。食べたい気分から、お店が見つかります。',
  // app/icon.tsx と app/apple-icon.tsx が自動登録されるが、
  // 確実に Google / SNS が拾うように明示しておく
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "マチノワ — 街の輪",
    description:
      "全国飲食店ポータル。街の“いいお店”、ぜんぶここに。",
    type: "website",
    locale: "ja_JP",
    siteName: "マチノワ",
    images: [{ url: "/apple-icon", width: 180, height: 180, alt: "マチノワ" }],
  },
  twitter: {
    card: "summary",
    title: "マチノワ — 街の輪",
    description:
      "全国飲食店ポータル。街の“いいお店”、ぜんぶここに。",
    images: ["/apple-icon"],
  },
  // Google Search Console の所有権確認。
  // Vercel の環境変数 GOOGLE_SITE_VERIFICATION に
  // Search Console で発行されるコード（content の値）を設定すると
  // <meta name="google-site-verification"> が自動で出力される。
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" data-region="tokyo" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;700&family=Noto+Sans+JP:wght@400;500&family=Zen+Kaku+Gothic+Antique:wght@500&family=JetBrains+Mono:wght@500&display=swap"
        />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://tblg.k-img.com" />
        <link rel="dns-prefetch" href="https://tblg.k-img.com" />
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildWebSiteJsonLd()),
          }}
        />
      </head>
      <body>
        <SiteShell>
          {children}
        </SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
