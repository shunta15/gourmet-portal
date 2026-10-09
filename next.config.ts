import type { NextConfig } from "next";
import { portalLiveFromEnv } from "./lib/portal/launchEnv";
import { NOREN_FEATURE_REWRITE, NOREN_SHOP_REWRITE } from "./lib/portal/noren/rewrites";

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
  "/gourmet/:path*", // グルメのトップ（暖簾）と、その配下の内部ルート（暖簾の店ページ・特集記事ページ。本物の URL は /restaurant/<id>・/feature/<id>）
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
  "/proto-hub/:path*", // 総合トップ「にぎわいの輪」の色を固定して見るルート（プレビュー・ローカル専用。本番は ON でも 404）
  "/proto-noren/:path*", // グルメの暖簾デザインの見本（店ページ・特集記事。プレビュー・ローカル専用。本番は ON でも 404）
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
      // 暖簾の店ページ・特集記事ページの内部のパス（/gourmet/restaurant/<id>・/gourmet/feature/<id>）は、直接開かれたら本物の URL へ恒久リダイレクトする。
      // 本物の URL（/restaurant/<id>）→ 内部のパスは下の rewrites で差し替えるだけ（リダイレクトは書き換え後のパスには再適用されない）。
      ...(PORTAL_LIVE && NOREN_SHOP_REWRITE ? [{ source: "/gourmet/restaurant/:id", destination: "/restaurant/:id", permanent: true }] : []),
      ...(PORTAL_LIVE && NOREN_FEATURE_REWRITE ? [{ source: "/gourmet/feature/:id", destination: "/feature/:id", permanent: true }] : []),
    ];
  },
  async rewrites() {
    // 公開スイッチ ON: `/` を総合トップ（app/portal-home）に差し替える（URL は `/` のまま）。
    // 公開スイッチ OFF: `/` は app/page.tsx（グルメのトップ）のまま（main と同一）。総合サイトの URL は 404 にする。
    // 公開スイッチ ON のとき、暖簾の店ページ・特集記事ページも同じ仕組みで差し替える（URL は /restaurant/<id>・/feature/<id> のまま）。
    //   - /feature/search は検索の専用ルートなので書き換えない（/feature/:id に当たってしまうため除く）。/feature/region/<key> は 2 階層なので当たらない
    // OFF では、これらの行は 1 行も使われない（/restaurant/<id>・/feature/<id> は今のグルメのページ。/gourmet/** は上の 404）。
    return {
      beforeFiles: PORTAL_LIVE
        ? [
            { source: "/", destination: "/portal-home" },
            ...(NOREN_SHOP_REWRITE ? [{ source: "/restaurant/:id", destination: "/gourmet/restaurant/:id" }] : []),
            ...(NOREN_FEATURE_REWRITE ? [{ source: "/feature/:id((?!search$)[^/]+)", destination: "/gourmet/feature/:id" }] : []),
          ]
        : PORTAL_OFF_SOURCES.map((source) => ({ source, destination: "/__portal-off" })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
