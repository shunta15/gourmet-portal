import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { buildOrganizationJsonLd } from "@/lib/jsonld";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://machinowa.tokyo"),
  title: "マチノワ / 街の輪 — 全国飲食店ポータル",
  description:
    "全国47都道府県の飲食店を、エリア・業種・特集で巡れる食のポータル「マチノワ」。食べたい気分から、お店が見つかります。",
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
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;600;700&family=Zen+Kaku+Gothic+Antique:wght@300;400;500;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationJsonLd()),
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
