import "server-only";
/**
 * さがす /search・店舗紹介一覧 /restaurant のデータ(サーバー専用)。店 → 札(GnShopCard + 絞り込み用の項目)。
 * 設計: components/portal/gnoren/REAL_PLAN.md「さがす」。置き場: components/portal/gnoren/real/search/。
 * - 店は getAllRestaurants()(限定公開・非表示の店は、そこで外れている)。
 * - 料理 = lib/cuisineBroad.ts の BROAD_GROUPS(店数)。エリア = 店数の多い地域の上位 8。シーン = lib/scenes.ts から店数の多い順の上位 7。
 * - シーンの当てはまり = lib/portal/noren/sceneMatch.ts の shopInScene(店のタグとの完全一致)。サーバーで店ごとに評価して sceneSlugs で渡す。
 */
import { getAllRestaurants } from "@/lib/db/restaurants";
import { BROAD_GROUPS, broadKeysOf } from "@/lib/cuisineBroad";
import { CUISINE_GROUPS } from "@/lib/cuisineGroups";
import { REGIONS, type Restaurant } from "@/lib/regions";
import { SCENES } from "@/lib/scenes";
import { shopInScene } from "@/lib/portal/noren/sceneMatch";
import { regionCenters } from "@/lib/portal/noren/regionCenters";
import { parseTown } from "@/lib/towns";
import { GEO } from "@/lib/geo";
import { allShopPhotos } from "@/components/portal/gnoren/real/common/img";
import { shopHref } from "@/components/portal/gnoren/real/common/links";
import type { SearchData, SearchShop } from "@/components/portal/gnoren/real/search/types";

/** 新しい部品に出さない語(ほかのサイトの評価・順位に当たる語など)を含むタグは、札に出さない(?tag= の絞り込みは動く)。BlockSearchParts の isShowableTag と同じ規則 */
const HIDDEN_TAG = /おすすめ|オススメ|人気|厳選|名店|ランキング|受賞|ミシュラン|食べログ|ホットペッパー|ぐるなび|Google|口コミ/i;

/** 札の紹介文に出さない文(他サイトの評価・口コミ・順位・金額・「その他」)。shop.ts の PICK_BAN と同じ趣旨(あちらは別担当のファイルなので複製) */
const DESC_BAN = /口コミ|クチコミ|レビュー|評価|ミシュラン|食べログ|百名店|ホットペッパー|ぐるなび|Google|ナンバー|No\.?\s?1|[★☆]|[一二三]つ星|その他|[¥￥]|[\d０-９,，千万]円/i;

/** 紹介文の先頭 n 文。DESC_BAN に当たる文は飛ばす(全部飛ばされたら空 = 紹介文なし。文を作らない) */
function safeSentences(text: string, n: number): string {
  const sents: string[] = [];
  for (const block of (text ?? "").split(/(?:\\n|\n)+/)) {
    const t = block.trim();
    if (!t) continue;
    for (const x of t.split(/(?<=[。！？])(?![」』）])/)) {
      const u = x.trim();
      if (u && !DESC_BAN.test(u)) sents.push(u);
    }
    if (sents.length >= n) break;
  }
  return sents.slice(0, n).join("");
}

/** 店 ID の番号(r12 → 12)。r＋数字でない ID は最後 */
export const idNo = (id: string) => (/^r\d+$/.test(id) ? parseInt(id.slice(1), 10) : Number.MAX_SAFE_INTEGER);

const legacyLabels = CUISINE_GROUPS.map((g) => g.label as string);

export function toShop(r: Restaurant): SearchShop {
  const tags = (r.tags ?? []).filter((t) => t && !HIDDEN_TAG.test(t));
  const shown = tags.filter((t) => t !== r.area && t !== r.cuisine && !r.name.includes(t)).slice(0, 2);
  const lg = CUISINE_GROUPS.flatMap((g, i) => (g.keywords.some((kw) => (r.cuisine ?? "").includes(kw)) ? [i] : []));
  const town = parseTown(r.address || "", r.region)?.town;
  const photos = allShopPhotos(r);
  const card: SearchShop = {
    id: r.id,
    name: r.name,
    href: shopHref(r.id),
    tags: shown,
    cuisineKeys: broadKeysOf(r),
    region: r.region,
    sceneSlugs: SCENES.filter((s) => shopInScene(s.matchTags, r.tags)).map((s) => s.slug),
    kw: [r.cuisine, r.area, r.address, r.desc].filter(Boolean).join(" "),
    allTags: r.tags ?? [],
  };
  if (photos[0]) card.img = photos[0];
  if (r.nearest) card.nearest = r.nearest;
  const d = safeSentences(r.desc ?? "", 2);
  if (d) card.desc = d;
  if (town) card.town = town;
  if (lg.length) card.lg = lg;
  return card;
}

/** さがす用: 札 + 絞り込みの選択肢 */
export async function getSearchData(): Promise<SearchData> {
  const all = await getAllRestaurants();
  const shops = all.map(toShop);

  // 料理 7(BROAD_GROUPS・店数)
  const cuisines = BROAD_GROUPS.map((g) => ({ key: g.key, label: g.label, count: shops.filter((s) => s.cuisineKeys.includes(g.key)).length }));

  // 写真: 丸・札の写真は、その地域・シーンの店の最初の写真(店 ID の若い順)。丸どうしで同じ写真にならないよう、使った写真は飛ばす
  const byId = [...all].sort((a, b) => idNo(a.id) - idNo(b.id) || a.id.localeCompare(b.id));
  const used = new Set<string>();
  const pickPhoto = (pred: (r: Restaurant) => boolean): string | undefined => {
    for (const r of byId) {
      if (!pred(r)) continue;
      const p = allShopPhotos(r).find((u) => !used.has(u));
      if (p) {
        used.add(p);
        return p;
      }
    }
    return undefined;
  };

  // 地域ごとの店数
  const regionN = new Map<string, number>();
  for (const s of shops) regionN.set(s.region, (regionN.get(s.region) ?? 0) + 1);
  const regionName = (k: string) => (REGIONS as Record<string, { name: string }>)[k]?.name ?? k;
  const regionsSorted = [...regionN.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const areas = regionsSorted.slice(0, 8).map(([key, count]) => ({ key, name: regionName(key), count, img: pickPhoto((r) => r.region === key) }));

  // シーン 7(店数の多い順)
  const sceneN = SCENES.map((s) => ({ s, count: shops.filter((x) => x.sceneSlugs.includes(s.slug)).length })).sort((a, b) => b.count - a.count);
  const scenes = sceneN
    .slice(0, 7)
    .map(({ s, count }) => ({ slug: s.slug, name: s.name, count, img: pickPhoto((r) => shopInScene(s.matchTags, r.tags)) }));

  // 全地域(REGIONS の全部。店のある地域は店数つき)
  const regions = Object.keys(REGIONS)
    .map((key) => ({ key, name: regionName(key), count: regionN.get(key) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja"));

  // 地図のピン: 地域ごとの目印の位置(店の座標の中央値)
  const coords: Record<string, [number, number]> = {};
  for (const r of all) {
    const g = GEO[r.id];
    if (g) coords[r.id] = [g.lat, g.lng];
  }
  const centers = regionCenters(all, coords);
  const mapPins = regionsSorted.flatMap(([key, count]) => {
    const c = centers.get(key);
    return c ? [{ key, name: regionName(key), count, lat: Math.round(c.lat * 1e4) / 1e4, lng: Math.round(c.lng * 1e4) / 1e4 }] : [];
  });

  const sceneNames = Object.fromEntries(SCENES.map((s) => [s.slug, s.name]));
  return { shops, total: shops.length, regionCount: regionN.size, cuisines, areas, scenes, sceneNames, regions, legacyLabels, mapPins };
}

/** 店舗紹介一覧 /restaurant 用: 店 ID の番号の順の札(ページ送りの途中で順番が入れ替わらない)。5 分だけ覚える */
let memo: { at: number; rows: SearchShop[] } | null = null;
export async function getShopListCards(): Promise<SearchShop[]> {
  if (memo && Date.now() - memo.at < 5 * 60 * 1000) return memo.rows;
  const all = await getAllRestaurants();
  const rows = all
    .map(toShop)
    .sort((a, b) => idNo(a.id) - idNo(b.id) || a.id.localeCompare(b.id))
    .map((r) => ({ ...r, kw: "", allTags: [] }));
  if (rows.length) memo = { at: Date.now(), rows };
  return rows;
}
