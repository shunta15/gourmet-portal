/**
 * 新業種のサイトマップの共通部品。/{v}/sitemap.xml
 * index 対象（掲載 3 件以上。判定は lib/seo/gate.ts の1か所）のURLだけを出す。外枠の段階は空。
 * 店ページ（/shop/{id}）は実体ができるまで載せない。
 */
import type { MetadataRoute } from "next";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { isIndexable } from "@/lib/seo/gate";
import { absUrl } from "@/lib/seo/util";
import { assertPortalLive } from "@/lib/portal/launch";
import { loadVertical, pick, type PortalVertical } from "./data";

export function verticalSitemap(key: PortalVertical) {
  return async function sitemap(): Promise<MetadataRoute.Sitemap> {
    assertPortalLive(); // 公開スイッチ OFF のあいだは 404（lib/portal/launch.ts）
    const { v, all } = await loadVertical(key);
    const paths: string[] = [];
    const add = (path: string, count: number) => {
      if (isIndexable(count)) paths.push(path);
    };

    add(v.path, all.length);
    for (const p of PREFECTURES) add(`${v.path}/area/${p.slug}`, pick(all, { pref: p.slug }).length);
    for (const c of v.categories) {
      add(`${v.path}/${c.slug}`, pick(all, { category: c.slug }).length);
      for (const p of PREFECTURES) add(`${v.path}/${c.slug}/${p.slug}`, pick(all, { category: c.slug, pref: p.slug }).length);
    }
    for (const s of v.scenes) add(`${v.path}/scene/${s.slug}`, pick(all, { scene: s }).length);

    return paths.map((path) => ({ url: absUrl(path) }));
  };
}
