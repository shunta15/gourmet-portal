/**
 * 街ページ（/region/<region>/<街>）に出す特集記事の選び方（サーバー専用）。
 *
 *  - 街ガイド特集（lib/data.ts の FEATURES）: 地域が同じで、タイトル・副題・各項目の area に街の名前が出ているもの。
 *      名前の照合は「街の正式名」＋「区だけ（政令市で曖昧でないとき）」＋「市区町村を除いた語（曖昧でないとき）」。
 *      曖昧 = 同じ地域の他の街の名前の頭と重なる（例: 富士市の「富士」は富士宮市の頭と重なる）。
 *  - 店の特集記事: 街にある店の featureId（記事由来の店）。
 */
import { FEATURES, FEATURE_ARTICLES, type RegionKey, type Restaurant } from "@/lib/data";
import { getFeatureRegions } from "@/lib/featureRegions";
import { ARTICLE_STORE_FEATURE_IDS } from "@/lib/articleStores";
import { isSceneFeatureId } from "@/lib/sceneFeatureLinks";

export type TownFeatureLink = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  image: string;
};

const WARD_RE = /^(.+?市)(.+区)$/;

function matchKeys(town: string, regionTowns: string[]): string[] {
  const keys = [town];
  const others = regionTowns.filter((t) => t !== town);
  const w = town.match(WARD_RE);
  if (w) {
    // 政令市の区: 同じ地域に別の政令市があると「北区」「中区」が曖昧になる
    const cities = new Set(regionTowns.map((t) => t.match(WARD_RE)?.[1]).filter(Boolean));
    if (cities.size === 1) keys.push(w[2]);
  } else {
    const base = town.replace(/[市区町村]$/, "");
    if (base.length >= 2 && !others.some((t) => t.startsWith(base))) keys.push(base);
  }
  return keys;
}

const linkOf = (id: string): TownFeatureLink | null => {
  const a = FEATURE_ARTICLES[id];
  if (!a) return null;
  return { id, href: `/feature/${encodeURIComponent(id)}`, kicker: a.kicker, title: a.title, image: a.heroImage };
};

export function getTownFeatureLinks(
  region: RegionKey,
  town: string,
  stores: Restaurant[],
  regionTowns: string[],
  limits = { guides: 4, stores: 8 },
): TownFeatureLink[] {
  const keys = matchKeys(town, regionTowns);
  const out: TownFeatureLink[] = [];
  const seen = new Set<string>();

  for (const f of FEATURES) {
    if (out.length >= limits.guides) break;
    if (isSceneFeatureId(f.id) || seen.has(f.id)) continue;
    if (!getFeatureRegions(f.id).includes(region)) continue;
    const a = FEATURE_ARTICLES[f.id];
    if (!a) continue;
    const text = [a.title, a.subtitle, ...a.ranking.map((r) => r.area)].join(" ");
    if (!keys.some((k) => text.includes(k))) continue;
    const l = linkOf(f.id);
    if (l) {
      out.push(l);
      seen.add(f.id);
    }
  }

  let n = 0;
  for (const r of stores) {
    if (n >= limits.stores) break;
    const id = r.featureId ?? ARTICLE_STORE_FEATURE_IDS[r.id];
    if (!id || seen.has(id)) continue;
    const l = linkOf(id);
    if (l) {
      out.push(l);
      seen.add(id);
      n++;
    }
  }
  return out;
}
