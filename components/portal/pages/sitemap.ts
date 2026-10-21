/**
 * 新業種のサイトマップの共通部品。/{v}/sitemap.xml
 * index 対象（判定は lib/seo/gate.ts の1か所）のURLだけを出す。載せるもの: 業種のトップ・都道府県・種類・種類×都道府県・シーン・店ページ（/shop/{id}）。
 * 各ページの robots は件数で決まる（buildMetadata の count）。ここでも同じ件数を gate に通す:
 *   店ページの count はその業種の掲載数（components/portal/pages/shop.tsx）、ほかは絞り込んだあとの件数。掲載数が 3 件未満なら店ページも載せない。
 * ビューティー・ボディケアの特集ページ（/{v}/feature/{id}）は店のページへ転送するので載せない。
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
    // 「さがす」にまとまる構成か。ビューティー(COLOR PLAY)・ボディケアは「さがす」にまとまっている
    const cp = key === "beauty" || key === "bodycare";
    if (cp) {
      // COLOR PLAY: 種類・エリアのページは「さがす」へ転送するので載せない。転送先（種類・エリアだけの絞り込み）を載せる（件数は同じ gate）
      add(`${v.path}/search`, all.length);
      for (const p of PREFECTURES) add(`${v.path}/search?pref=${p.slug}`, pick(all, { pref: p.slug }).length);
      for (const c of v.categories) {
        add(`${v.path}/search?kind=${c.slug}`, pick(all, { category: c.slug }).length);
        for (const p of PREFECTURES) add(`${v.path}/search?kind=${c.slug}&pref=${p.slug}`, pick(all, { category: c.slug, pref: p.slug }).length);
      }
    } else {
      for (const p of PREFECTURES) add(`${v.path}/area/${p.slug}`, pick(all, { pref: p.slug }).length);
      for (const c of v.categories) {
        add(`${v.path}/${c.slug}`, pick(all, { category: c.slug }).length);
        for (const p of PREFECTURES) add(`${v.path}/${c.slug}/${p.slug}`, pick(all, { category: c.slug, pref: p.slug }).length);
      }
    }
    if (cp) {
      // COLOR PLAY: 利用シーンのページは「さがす」の「こだわり」(店のタグ)へ転送するので載せない。転送先を載せる(件数は同じ gate)
      const tags = new Set<string>();
      for (const s of v.scenes) {
        const tag = s.matchTags.find((t) => all.some((p) => p.tags.includes(t)));
        if (tag) tags.add(tag);
      }
      for (const tag of tags) add(`${v.path}/search?tag=${encodeURIComponent(tag)}`, all.filter((p) => p.tags.includes(tag)).length);
    } else {
      for (const s of v.scenes) add(`${v.path}/scene/${s.slug}`, pick(all, { scene: s }).length);
    }
    for (const p of all) add(`${v.path}/shop/${encodeURIComponent(p.id)}`, all.length);
    // COLOR PLAY: 特集記事は店のページと一緒（/feature/{id} は店のページへ転送）なので、特集の URL は載せない

    // Next.js は <loc> を XML エスケープしないので、クエリの & は自分で &amp; にする(さがすの絞り込み URL に & がある)
    return paths.map((path) => ({ url: absUrl(path).replace(/&/g, "&amp;") }));
  };
}
