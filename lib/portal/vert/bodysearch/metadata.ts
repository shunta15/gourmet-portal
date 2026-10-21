/**
 * ボディケアの「さがす」(/bodycare/search)の metadata(題・説明・正規 URL・noindex の判定)。app/bodycare/(cp)/search/page.tsx の generateMetadata が使う。
 * 種類・エリア・こだわりだけの URL は、これまでの種類・エリア・利用シーンのページからの転送先なので index 対象(件数 3 件以上。lib/seo/gate.ts)。
 * キーワード・並べ替え・「もっと見る」の付いた URL は noindex(canonical は種類・エリア・こだわりだけの URL)。
 */
import type { Metadata } from "next";
import { loadShops } from "@/lib/portal/colorplay/data";
import { PAGE_SIZE, countBy, parseFilters, searchHref } from "@/lib/portal/colorplay/search";
import { BODYCARE_SITE as site } from "@/lib/portal/vert/bodysearch/site";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";

type SP = Record<string, string | string[] | undefined>;
const PREF = new Map(PREFECTURES.map((p) => [p.slug, p]));

export async function bodySearchMetadata(sp: SP): Promise<Metadata> {
  const shops = await loadShops(site);
  const v = getVertical("bodycare");
  const kindName = (slug: string) => site.kinds.find((k) => k.slug === slug)?.name ?? slug;
  const validKinds = new Set(v.categories.map((c) => c.slug));
  const validPrefs = new Set(PREFECTURES.map((p) => p.slug));
  // こだわり(店のタグ)。データにあるものだけ
  const validTags = new Set<string>();
  for (const sh of shops) for (const t of sh.tags) validTags.add(t);
  const f = parseFilters(sp, site, validKinds, validPrefs, validTags);
  const count = countBy(shops, f);
  const pref = f.pref ? PREF.get(f.pref) : undefined;
  const scope = [f.tag ? `${f.tag}の` : "", pref ? `${pref.short}の` : "", f.kind ? kindName(f.kind) : `${v.name}の店`].join("");
  const title = `${f.kind || pref || f.tag ? scope : `${v.name}の店を探す`}｜${v.brand}`;
  const plain = !f.q && f.sort === "area" && f.n === PAGE_SIZE;
  const canonical = searchHref(site, { kind: f.kind, pref: f.pref, tag: f.tag });
  return buildMetadata({
    vertical: "bodycare",
    title,
    description: `${f.kind ? `${scope}の店` : pref || f.tag ? scope : `${v.name}の店`}を、種類・エリア・こだわり・キーワードで探せます。${count > 0 ? `掲載${count}件。` : ""}`,
    path: canonical,
    count: plain ? count : 0,
  });
}
