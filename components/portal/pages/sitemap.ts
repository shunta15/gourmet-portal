/**
 * 新業種のサイトマップの共通部品。/{v}/sitemap.xml
 * index 対象（判定は lib/seo/gate.ts の1か所）のURLだけを出す。載せるもの: 業種のトップ・都道府県・種類・種類×都道府県・シーン・店ページ（/shop/{id}）。
 * 各ページの robots は件数で決まる（buildMetadata の count）。ここでも同じ件数を gate に通す:
 *   店ページの count はその業種の掲載数（components/portal/pages/shop.tsx）、ほかは絞り込んだあとの件数。掲載数が 3 件未満なら店ページも載せない。
 * 特集ページ（/{v}/feature/{id}）は載せない（今回の公開の対象外。lib/places/features.ts の VERTICAL_FEATURES_ENABLED）。
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
    for (const p of all) add(`${v.path}/shop/${encodeURIComponent(p.id)}`, all.length);

    return paths.map((path) => ({ url: absUrl(path) }));
  };
}
