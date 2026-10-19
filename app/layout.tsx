import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import PortalShell from "@/components/portal/PortalShell";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/jsonld";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { isPortalLive } from "@/lib/portal/launch";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// サイト全体の既定の題・説明（ページが自分の題を持たないときと、SNS のカードの既定に使われる）。
// 総合サイトとして公開したあと（公開スイッチ ON）は、飲食店だけの言い方（「全国飲食店ポータル」）をやめる。
// 言葉は総合トップと同じ（proto-portal/hub-concepts/COPY-FINAL.md）。公開スイッチ OFF（グルメだけのサイト）の出力は変えない。
const PORTAL_ON = isPortalLive();
const DEFAULT_TITLE = PORTAL_ON ? "マチノワ — 街の輪" : "マチノワ / 街の輪 — 全国飲食店ポータル";
const DEFAULT_DESCRIPTION = PORTAL_ON
  ? "ひとつの店との出会いが、次の出会いにつながり、その小さな輪が、街へと広がっていく。マチノワは、店と人をつなぎ、街の魅力を広げていく地域ポータルサイトです。"
  : '全国の街の"いいお店"を、エリア・業種・特集で巡れる食のポータル「マチノワ」。食べたい気分から、お店が見つかります。';
const DEFAULT_SOCIAL_DESCRIPTION = PORTAL_ON
  ? "街と店、店と人。つながる輪を、マチノワから。"
  : "全国飲食店ポータル。街の“いいお店”、ぜんぶここに。";

export const metadata: Metadata = {
  metadataBase: new URL("https://machinowa.tokyo"),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  // app/icon.png(512)・app/apple-icon.png(180)・app/favicon.ico の静的ファイルが自動登録されるが、
  // 確実に Google / SNS が拾うように明示しておく
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "マチノワ — 街の輪",
    description: DEFAULT_SOCIAL_DESCRIPTION,
    type: "website",
    locale: "ja_JP",
    siteName: "マチノワ",
    images: [{ url: "/apple-icon.png", width: 180, height: 180, alt: "マチノワ" }],
  },
  twitter: {
    card: "summary",
    title: "マチノワ — 街の輪",
    description: DEFAULT_SOCIAL_DESCRIPTION,
    images: ["/apple-icon.png"],
  },
  // Google Search Console の所有権確認。
  // Vercel の環境変数 GOOGLE_SITE_VERIFICATION に
  // Search Console で発行されるコード（content の値）を設定すると
  // <meta name="google-site-verification"> が自動で出力される。
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const WM_FALLBACK_JS =
  '(function(){var R=/^(https:\\/\\/upload\\.wikimedia\\.org\\/wikipedia\\/[a-z-]+)\\/thumb\\/([0-9a-f]\\/[0-9a-f]{2}\\/[^\\/?#]+)\\/\\d+px-[^\\/?#]+$/,T=/\\/_thumbs\\/\\d+\\/(restaurants\\/[^?#]+)\\.webp(?:[?#].*)?$/;function f(i){try{if(!i||i.tagName!=="IMG"||i.getAttribute("data-wm-fb"))return;var u=i.currentSrc||i.src,m=R.exec(u),n;if(m)n=m[1]+"/"+m[2];else if(m=T.exec(u))n="/"+m[1];else return;i.setAttribute("data-wm-fb","1");i.removeAttribute("srcset");i.src=n}catch(e){}}document.addEventListener("error",function(e){f(e.target)},true);document.addEventListener("DOMContentLoaded",function(){var l=document.images;for(var k=0;k<l.length;k++)if(l[k].complete&&l[k].naturalWidth===0)f(l[k])})})();';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 総合サイトの公開スイッチ（lib/portal/launch.ts）。OFF のあいだは従来の SiteShell だけを描画する
  const Shell = isPortalLive() ? PortalShell : SiteShell;
  return (
    <html lang="ja" data-region="tokyo" className={cn("font-sans", geist.variable)}>
      <head>
        {/* Wikimedia の縮小版（thumb。lib/imageUrl.ts の wikimediaSized）と、自前の縮小版（/_thumbs/<幅>/restaurants/….webp。scripts/thumbs.mjs）が読み込めなかった img を、その場で元の画像に差し替える保険（1 つの img につき 1 回）。
            error は伝わらないので capture で受ける。script より前に失敗が済んでいた img は DOMContentLoaded で 1 回見る。それ以外の画像には何もしない */}
        <script dangerouslySetInnerHTML={{ __html: WM_FALLBACK_JS }} />
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
            __html: JSON.stringify(buildWebSiteJsonLd(isPortalLive() ? "/find" : "/search")),
          }}
        />
      </head>
      <body>
        <Shell>{children}</Shell>
        <Analytics />
      </body>
    </html>
  );
}
