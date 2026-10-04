/**
 * サイト内検索の候補データ（サーバー専用。lib/data・lib/places を読むのでクライアントから import しない）。
 *
 * 候補は実データから作る: 都道府県（47）・駅（店のある駅エリア＝ページがあるもの）・市区町村（グルメの街ページがあるもの）・
 * 業種と種類・店（全業種の掲載店）。サンプルの語は入れない。
 * 読み仮名は固定の語（都道府県・業種・種類）だけ（lib/portal/readings.ts）。駅・店・市区町村の読みは持たない。
 *
 * 配り方: app/search-index.json/route.ts がビルド時に JSON にして静的に配る。クライアントは初回フォーカス時に取得。
 * /find（サーバー）は getSearchIndex() の prepared をそのまま使う（クライアントに data は入れない）。
 */
import { getPlaces } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { prefOfGourmetRegion } from "@/lib/areas/gourmet";
import { CUISINE_GROUPS } from "@/lib/cuisineGroups";
import { getAllTowns } from "@/lib/db/towns";
import { getStationIndex, placeCategoryName, placeHref, stationAliases, stationHref } from "@/lib/stations/query";
import { CATEGORY_KANA, CUISINE_KANA, PREF_KANA, VERTICAL_KANA } from "./readings";
import { prepare, type Prepared, type RawItem, type SearchIndexJson } from "./searchCore";

const K = { pref: 0, station: 1, town: 2, category: 3, shop: 4 } as const;

function item(kind: number, name: string, sub: string, href: string, keys: (string | undefined | false)[] = []): RawItem {
  const extra = [...new Set(keys.filter((k): k is string => !!k && k !== name))].join("|");
  return extra ? [kind, name, sub, href, extra] : [kind, name, sub, href];
}

async function build(): Promise<SearchIndexJson> {
  const items: RawItem[] = [];

  // 都道府県（正式名・短い名前・ローマ字 slug・読み）。飛び先は業種横断の街 /area/{pref}
  for (const p of PREFECTURES) {
    const kana = PREF_KANA[p.slug];
    items.push(item(K.pref, p.name, p.block, `/area/${p.slug}`, [p.short, p.slug, kana?.[0], kana?.[1]]));
  }

  // 業種と種類
  for (const v of Object.values(VERTICALS)) {
    items.push(item(K.category, v.name, "業種", v.path, [v.brand, VERTICAL_KANA[v.key]]));
    if (v.key === "gourmet") {
      for (const g of CUISINE_GROUPS) {
        items.push(
          item(K.category, g.label, "グルメの業態", `/search?cuisine=${encodeURIComponent(g.label)}`, [CUISINE_KANA[g.label], ...g.keywords]),
        );
      }
    } else {
      for (const c of v.categories) {
        items.push(item(K.category, c.name, `${v.name}の種類`, `${v.path}/${c.slug}`, [CATEGORY_KANA[`${v.key}/${c.slug}`]]));
      }
    }
  }

  // 駅（店のある駅エリア）
  const idx = await getStationIndex();
  for (const s of idx.all) {
    const st = s.station;
    const prefName = st.pref ? (getPrefBySlug(st.pref)?.name ?? "") : "";
    const label = st.name.endsWith("駅") ? st.name : `${st.name}駅`;
    items.push(item(K.station, label, [prefName, `${s.count}店`].filter(Boolean).join("・"), stationHref(st), [st.name, ...stationAliases(st)]));
  }

  // 市区町村（グルメの街ページ）
  for (const t of await getAllTowns()) {
    items.push(item(K.town, t.town, `${t.pref}・グルメ${t.count}店`, `/region/${t.region}/${t.town}`));
  }

  // 店（全業種）
  for (const v of Object.values(VERTICALS)) {
    for (const p of await getPlaces(v.key)) {
      const prefSlug = v.key === "gourmet" ? prefOfGourmetRegion(p.pref) : p.pref;
      const prefShort = prefSlug ? (getPrefBySlug(prefSlug)?.short ?? "") : "";
      // 店の地域名が県名から始まっていれば（「福岡県・北九州市…」）県名は重ねない
      const where = p.cityName && prefShort && p.cityName.startsWith(prefShort) ? p.cityName : [prefShort, p.cityName].filter(Boolean).join(" ");
      const sub = [placeCategoryName(v, p), where].filter(Boolean).join("・");
      items.push(item(K.shop, p.name, sub, placeHref(v, p), [p.nameKana]));
    }
  }

  return { v: 1, items };
}

export interface SearchIndexData {
  json: SearchIndexJson;
  prepared: Prepared[];
}

// ビルド中・/find の表示で同じ集計を使うので、短い時間だけ使い回す（ISR の再生成では取り直す）
let memo: { at: number; p: Promise<SearchIndexData> } | null = null;
export function getSearchIndex(): Promise<SearchIndexData> {
  const now = Date.now();
  if (!memo || now - memo.at > 60_000) {
    const p = build().then((json) => ({ json, prepared: prepare(json) }));
    memo = { at: now, p };
    p.catch(() => {
      if (memo?.p === p) memo = null;
    });
  }
  return memo.p;
}
