import type { NextConfig } from "next";
import { portalLiveFromEnv } from "./lib/portal/launchEnv";
import { FEATURE_REGION_KEYS_OLD, NOREN_FEATURE_INDEX_REWRITE, NOREN_FEATURE_REWRITE, NOREN_SHOP_REWRITE } from "./lib/portal/noren/rewrites";
import { NOREN_ONE_PAGE, ONE_PAGE_SHOP_OF_FEATURE } from "./lib/portal/noren/onePage";
import { ONE_PAGE_UNLISTED_SHOP_OF_FEATURE } from "./lib/portal/noren/onePageUnlisted";
// ── scene ここから
import { NOREN_SCENE_TO_SEARCH, NOREN_SEARCH_REWRITE } from "./lib/portal/noren/rewrites";
// ── scene ここまで
// ── area ここから
import { NOREN_REGION_TO_SEARCH } from "./lib/portal/noren/rewrites";
// ── area ここまで

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
  "/stay/:path*",
  "/activity/:path*", // 体験・アクティビティ（旧おでかけ /leisure）
  "/sports/:path*", // スポーツ・フィットネス
  "/life/:path*", // くらし・ライフスタイル
  "/special", // 総合の特集一覧（8 業種の特集への入口）
  "/list", // 候補リスト（店を保存して URL で共有）
  "/list-data/:path*", // 候補リストが店ごとに取る JSON
  "/photos/:path*",
  "/og/:path*",
  "/videos",
  "/videos/:id",
  "/search-index.json",
  "/_portal/:path*",
];

/** くらしからグルメへ移した店(くらしの店 ID → グルメの店 ID。2026-10-28)。旧 URL の 301 に使う */
const LIFE_TO_GOURMET: ReadonlyArray<readonly [string, string]> = [
  ["li0046", "r774"], // 雲仙湯せんぺい 遠江屋本舗
  ["li0053", "r775"], // 野菜専門店 マルシェノグチ
];

/** ビューティーからくらしへ移した店(ビューティーの店 ID → くらしの店 ID。2026-10-28)。旧 URL の 301 に使う */
const BEAUTY_TO_LIFE: ReadonlyArray<readonly [string, string]> = [
  ["be0108", "li0078"], // ベニフィット(美容院向けの美容材料の卸の会社。サロンではないのでくらしへ)
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
      // 旧「おでかけ」(/leisure)は「体験・アクティビティ」(/activity)に置き換えた(2026-10-22 オーナー決定)。配下も同じパスのまま 308 で転送する(`:path*` は /leisure そのものにも当たる)。
      // 公開スイッチが OFF のあいだは /leisure も /activity も 404 のまま(redirect を出さない)
      ...(PORTAL_LIVE ? [{ source: "/leisure/:path*", destination: "/activity/:path*", permanent: true }] : []),
      // 旧「ショート動画」(/nazatu。ナーザトゥの 5 本を並べただけのページ)は、全業種共通の動画ページ /videos に置き換えた(2026-10-24 オーナー決定「動画は共通ページ作成してまとめて」)。308 で /videos へ転送する。
      // 5 本は /videos に載っている。公開スイッチが OFF のあいだは /videos が 404 なので、redirect を出さず /nazatu は今のまま(main と同じ)
      ...(PORTAL_LIVE ? [{ source: "/nazatu", destination: "/videos", permanent: true }] : []),
      // おまかせ提案(/omakase)は廃止した(2026-10-24 オーナー決定「なくていいよ」)。グルメのさがす(/search)へ 308 で転送する(答えのクエリは /search では使わない)。
      // 公開スイッチが OFF のあいだは redirect を出さず、/omakase は元からないページなので 404(main と同じ)
      ...(PORTAL_LIVE && NOREN_SEARCH_REWRITE ? [{ source: "/omakase/:path*", destination: "/search", permanent: true }] : []),
      // 暖簾の店ページ・特集記事ページの内部のパス（/gourmet/restaurant/<id>・/gourmet/feature/<id>）は、直接開かれたら本物の URL へ恒久リダイレクトする。
      // 本物の URL（/restaurant/<id>）→ 内部のパスは下の rewrites で差し替えるだけ（リダイレクトは書き換え後のパスには再適用されない）。
      ...(PORTAL_LIVE && NOREN_SHOP_REWRITE ? [{ source: "/gourmet/restaurant/:id", destination: "/restaurant/:id", permanent: true }] : []),
      // 1 店 1 ページ（見本）: 写真が主役の特集記事（対象は lib/portal/noren/onePage.ts の表）の URL /feature/<記事 ID> は、同じ店の /restaurant/<店の ID> へ恒久リダイレクト（308・1 回）。
      // 対象を、記事 ID の完全一致（1 本ずつ）で書く。サイト内のリンクははじめから /restaurant/<店の ID> を指す（lib/portal/noren/onePage.ts の featureHrefOf）。
      // source は path-to-regexp の書き方なので、百分率エンコードしたあと、( ) { } : * + ? が残っていたら \\ で打ち消す（今の 53 本の ID には無い。入れ忘れの保険）。
      // 切り替え NOREN_ONE_PAGE（RELEASE_REST）が false のとき・公開スイッチ OFF のときは 1 行も出ない。
      ...(PORTAL_LIVE && NOREN_FEATURE_REWRITE && NOREN_ONE_PAGE
        ? Object.entries({ ...ONE_PAGE_SHOP_OF_FEATURE, ...ONE_PAGE_UNLISTED_SHOP_OF_FEATURE }).map(([fid, sid]) => ({
            source: `/feature/${encodeURIComponent(fid).replace(/[(){}:*+?]/g, "\\$&")}`,
            destination: `/restaurant/${sid}`,
            permanent: true,
          }))
        : []),
      // くらしからグルメへ移した 2 店(2026-10-28 オーナー決定)。旧 URL(/life/shop/<ID>・/life/article/<ID>)は、グルメの店ページ /restaurant/<店 ID> へ 301。
      // 2 店とも限定公開(lib/unlisted.ts)のまま。移した先も限定公開なので、転送先もサイトのどこにも出ない。
      ...(PORTAL_LIVE && NOREN_SHOP_REWRITE
        ? LIFE_TO_GOURMET.flatMap(([lifeId, shopId]) => [
            { source: `/life/shop/${lifeId}`, destination: `/restaurant/${shopId}`, statusCode: 301 },
            { source: `/life/article/${lifeId}`, destination: `/restaurant/${shopId}`, statusCode: 301 },
          ])
        : []),
      // ビューティーからくらしへ移した店(2026-10-28 オーナー決定「暮らしでいいよ」)。旧 URL(/beauty/shop/<ID>・/beauty/article/<ID>)は、くらしの店ページ /life/shop/<店 ID> へ 301。
      // 移した店は限定公開(lib/unlisted.ts)のまま。転送先もサイトのどこにも出ない。
      ...(PORTAL_LIVE
        ? BEAUTY_TO_LIFE.flatMap(([beautyId, lifeId]) => [
            { source: `/beauty/shop/${beautyId}`, destination: `/life/shop/${lifeId}`, statusCode: 301 },
            { source: `/beauty/article/${beautyId}`, destination: `/life/shop/${lifeId}`, statusCode: 301 },
          ])
        : []),
      // 店舗紹介の一覧（/restaurant。2026-10-24 新設）の内部のパス /gourmet/restaurant も、直接開かれたら本物の URL へ（?page= もそのまま渡る）
      ...(PORTAL_LIVE && NOREN_SHOP_REWRITE ? [{ source: "/gourmet/restaurant", destination: "/restaurant", permanent: true }] : []),
      // 特集のトップの内部のパス（/gourmet/feature）も同じ。/gourmet/feature/search と /gourmet/feature/region/:key は、旧 URL の転送先（下）と同じ行き先へ 1 回で（:id より前に置く）
      ...(PORTAL_LIVE && NOREN_FEATURE_INDEX_REWRITE
        ? [
            { source: "/gourmet/feature", destination: "/feature", permanent: true },
            { source: "/gourmet/feature/search", destination: "/feature", permanent: true },
            { source: `/gourmet/feature/region/:key(${FEATURE_REGION_KEYS_OLD.join("|")})`, destination: "/feature?region=:key", permanent: true },
            // 【2026-10-24 オーナー決定】特集を探す /feature/search は、/feature の中の検索欄へ（?q= ?region= ?tag= はそのまま渡る）。
            // 地域別 /feature/region/<キー>（19 ページ）は、/feature の地域の絞り込み ?region=<キー> へ。旧 URL があった 19 キーだけ（元から 404 のキーは 404 のまま）
            { source: "/feature/search", destination: "/feature", permanent: true },
            { source: `/feature/region/:key(${FEATURE_REGION_KEYS_OLD.join("|")})`, destination: "/feature?region=:key", permanent: true },
          ]
        : []),
      ...(PORTAL_LIVE && NOREN_FEATURE_REWRITE ? [{ source: "/gourmet/feature/:id", destination: "/feature/:id", permanent: true }] : []),
      // ── scene ここから（シーン・店をさがすの内部のパスを直接開いたら本物の URL へ）
      // 利用シーンのページは「さがす」へ統合（2026-10-12 オーナー決定。lib/portal/noren/rewrites.ts の NOREN_SCENE_TO_SEARCH）。1 回の恒久転送で /search の絞り込みに着く:
      //   /scene → /search、/scene/:slug → /search?scene=:slug。暖簾版の内部のパス（/gourmet/scene/**）も同じ行き先へ 1 回で。
      ...(PORTAL_LIVE && NOREN_SCENE_TO_SEARCH
        ? [
            { source: "/scene", destination: "/search", permanent: true },
            { source: "/scene/:slug", destination: "/search?scene=:slug", permanent: true },
            { source: "/gourmet/scene", destination: "/search", permanent: true },
            { source: "/gourmet/scene/:slug", destination: "/search?scene=:slug", permanent: true },
          ]
        : []),
      ...(PORTAL_LIVE && NOREN_SEARCH_REWRITE ? [{ source: "/gourmet/search", destination: "/search", permanent: true }] : []),
      // ── scene ここまで
      // ── area ここから
      // 地域・街のページは「さがす」へ統合（2026-10-12 オーナー決定。lib/portal/noren/rewrites.ts の NOREN_REGION_TO_SEARCH）。1 回の恒久転送で /search の絞り込みに着く:
      //   /region → /search、/region/:key → /search?region=:key、/region/:key/:town → /search?region=:key&town=:town（街は日本語のまま。/search 側が完全一致で絞る）。
      // 地域のOG画像（/region/:key/opengraph-image…）には当てない。暖簾版の内部のパス（/gourmet/region/**）も同じ行き先へ 1 回で。
      ...(PORTAL_LIVE && NOREN_REGION_TO_SEARCH
        ? [
            { source: "/region", destination: "/search", permanent: true },
            { source: "/region/:key", destination: "/search?region=:key", permanent: true },
            { source: "/region/:key/:town((?!opengraph-image)[^/]+)", destination: "/search?region=:key&town=:town", permanent: true },
            { source: "/gourmet/region", destination: "/search", permanent: true },
            { source: "/gourmet/region/:key", destination: "/search?region=:key", permanent: true },
            { source: "/gourmet/region/:key/:town((?!opengraph-image)[^/]+)", destination: "/search?region=:key&town=:town", permanent: true },
          ]
        : []),
      // ── area ここまで
    ];
  },
  async rewrites() {
    // 公開スイッチ ON: `/` を総合トップ（app/portal-home）に差し替える（URL は `/` のまま）。
    // 公開スイッチ OFF: `/` は app/page.tsx（グルメのトップ）のまま（main と同一）。総合サイトの URL は 404 にする。
    // 公開スイッチ ON のとき、暖簾の店ページ・特集記事ページも同じ仕組みで差し替える（URL は /restaurant/<id>・/feature/<id> のまま）。
    //   - /feature/search は redirects で /feature へ転送するので、書き換えない（/feature/:id に当たってしまうため除く）。/feature/region/<key> は 2 階層なので当たらない
    // OFF では、これらの行は 1 行も使われない（/restaurant/<id>・/feature/<id> は今のグルメのページ。/gourmet/** は上の 404）。
    return {
      beforeFiles: PORTAL_LIVE
        ? [
            { source: "/", destination: "/portal-home" },
            ...(NOREN_SHOP_REWRITE ? [{ source: "/restaurant/:id", destination: "/gourmet/restaurant/:id" }] : []),
            ...(NOREN_FEATURE_REWRITE ? [{ source: "/feature/:id((?!search$)[^/]+)", destination: "/gourmet/feature/:id" }] : []),
            // 店舗紹介の一覧（/restaurant）と特集のトップ（/feature）も同じ仕組み（URL は /restaurant・/feature のまま）。
            // /feature/search と /feature/region/<キー> は、上の redirects で /feature へ転送するので、書き換えは持たない
            ...(NOREN_SHOP_REWRITE ? [{ source: "/restaurant", destination: "/gourmet/restaurant" }] : []),
            ...(NOREN_FEATURE_INDEX_REWRITE ? [{ source: "/feature", destination: "/gourmet/feature" }] : []),
            // ── scene ここから（シーン一覧・シーンごと・店をさがす。URL は /scene・/scene/<slug>・/search のまま）
            ...(NOREN_SEARCH_REWRITE ? [{ source: "/search", destination: "/gourmet/search" }] : []),
            // ── scene ここまで
            // ── area ここから
            // ── area ここまで
          ]
        : PORTAL_OFF_SOURCES.map((source) => ({ source, destination: "/__portal-off" })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
