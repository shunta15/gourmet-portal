import type { MetadataRoute } from "next";

/**
 * robots.txt
 *
 * - /admin: 管理画面（認証必須・ユーザー向け以外）をクロール拒否
 * - /api:   内部 API（インデックス不要）を拒否
 * - /agent-teams/: エージェント運用ファイル（万一公開されても）を拒否
 * - サイトマップは https://machinowa.tokyo/sitemap.xml
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
    sitemap: "https://machinowa.tokyo/sitemap.xml",
    host: "https://machinowa.tokyo",
  };
}
