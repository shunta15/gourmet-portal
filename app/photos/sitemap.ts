import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { assertPortalLive } from "@/lib/portal/launch";
import { loadWall } from "@/lib/portal/photoWall";

export const revalidate = 3600;

/**
 * /photos/sitemap.xml。写真から探す（/photos）1 ページだけ。写真が 3 枚以上あるときだけ載せる（lib/seo/gate.ts）。
 * 絞り込み（?genre= ?pref=）は canonical を /photos にして noindex なので載せない。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
  const wall = await loadWall();
  return isIndexable(wall.items.length) ? [{ url: absUrl("/photos") }] : [];
}
