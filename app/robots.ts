import type { MetadataRoute } from "next";
import { isPortalLive } from "@/lib/portal/launch";
import { NEW_VERTICAL_KEYS, VERTICALS } from "@/lib/verticals";

const BASE = "https://machinowa.tokyo";

/**
 * 総合サイトのサイトマップ（公開スイッチ ON のときだけ robots.txt に載せる。lib/portal/launch.ts）。
 * 中身は index 対象（掲載3件以上。lib/seo/gate.ts）のURLだけで、まだ空のものもある。
 */
const PORTAL_SITEMAPS = [
  "/station/sitemap.xml",
  ...NEW_VERTICAL_KEYS.map((k) => `${VERTICALS[k].path}/sitemap.xml`),
  "/videos/sitemap.xml",
  "/photos/sitemap.xml",
];

/**
 * robots.txt
 *
 * - /admin: 管理画面（認証必須・ユーザー向け以外）をクロール拒否
 * - /api:   内部 API（インデックス不要）を拒否
 * - /agent-teams/: エージェント運用ファイル（万一公開されても）を拒否
 * - サイトマップは https://machinowa.tokyo/sitemap.xml
 *   （公開スイッチ OFF のあいだはこれだけ。出力は従来と1バイトも変えない。ON のときだけ総合サイトのサイトマップを足す）
 *
 * 注意: ここで意図しない Disallow を増やすと検索流入が止まるので、
 *       追加時は SEO 担当のレビューを必須にすること。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/agent-teams/"],
      },
    ],
    sitemap: isPortalLive()
      ? [`${BASE}/sitemap.xml`, ...PORTAL_SITEMAPS.map((p) => `${BASE}${p}`)]
      : "https://machinowa.tokyo/sitemap.xml",
  };
}
