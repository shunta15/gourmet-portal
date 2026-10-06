import type { NextConfig } from "next";
import { portalLiveFromEnv } from "./lib/portal/launchEnv";

// 総合サイトの公開スイッチ（lib/portal/launch.ts と同じ判定。proto-portal/LAUNCH.md）。ビルド時に評価する。
const PORTAL_LIVE = portalLiveFromEnv();

/**
 * 公開スイッチ OFF のあいだ 404 にする URL（総合サイトの全ルート・/gourmet・総合トップの実体・事前生成した写真）。
 * 存在しない内部パスに rewrite して、Next.js の標準の 404（`/zzz` と同じ、サーバーで描画した static の _not-found）を出す。
 * main では全部この 404 なので、レスポンスのステータス・HTML が main と一致する。
 * 注意: public/videos/nazatu/*.mp4 などグルメの既存ファイル（/videos/ の2階層目以下）を巻き込まないよう、
 * /videos は「/videos」と「/videos/{1セグメント}」だけ。
 */
const PORTAL_OFF_SOURCES = [
  "/gourmet",
  "/portal-home",
  "/beauty/:path*",
  "/bodycare/:path*",
  "/pet/:path*",
  "/leisure/:path*",
  "/stay/:path*",
  "/area/:path*",
  "/station/:path*",
  "/map/:path*",
  "/find/:path*",
  "/list", // 候補リスト（店を保存して URL で共有）
  "/list-data/:path*", // 候補リストが店ごとに取る JSON
  "/photos/:path*",
  "/omakase/:path*", // おまかせ提案（4つの質問で店を出す）
  "/og/:path*",
  "/videos",
  "/videos/:id",
  "/search-index.json",
  "/_portal/:path*",
  "/proto-sns", // 行動ボタンの見比べ（試作・非公開）
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // Redirect www.machinowa.tokyo to primary domain (301 Permanent)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.machinowa.tokyo" }],
        destination: "https://machinowa.tokyo/:path*",
        permanent: true,
      },
      // Redirect gourmet-portal.vercel.app to primary domain (301 Permanent)
      {
        source: "/:path*",
        has: [{ type: "host", value: "gourmet-portal.vercel.app" }],
        destination: "https://machinowa.tokyo/:path*",
        permanent: true,
      },
      // 総合トップの実体ルート /portal-home は、URL としては公開しない（`/` に集約。重複 URL を作らない）。
      // 公開スイッチが OFF のあいだは、このルートは 404（redirect も出さない）。
      ...(PORTAL_LIVE ? [{ source: "/portal-home", destination: "/", permanent: false }] : []),
    ];
  },
  async rewrites() {
    // 公開スイッチ ON: `/` を総合トップ（app/portal-home）に差し替える（URL は `/` のまま）。
    // 公開スイッチ OFF: `/` は app/page.tsx（グルメのトップ）のまま（main と同一）。総合サイトの URL は 404 にする。
    return {
      beforeFiles: PORTAL_LIVE
        ? [{ source: "/", destination: "/portal-home" }]
        : PORTAL_OFF_SOURCES.map((source) => ({ source, destination: "/__portal-off" })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
