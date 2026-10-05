/**
 * 「写真から探す」（/photos）の壁のデータ。サーバー専用（店データ・写真の対応表が大きいので、クライアントから import しない）。
 *
 * 元データ
 *   - lib/portal/foodPhotos.ts … 載せる料理写真（店ID → 写真のパス）。料理だけに絞ってある
 *   - lib/portal/foodPhotoVariants.json … 事前生成した WebP の対応表（automation/portal/build-images.mjs が書く）
 *   - 店の名前・街・ジャンル・都道府県 … 店データ（getAllRestaurants）から引く。ここに二重に持たない
 * 実行時に出すのは次を全部満たす写真だけ（満たさない店は黙って外す。壁に壊れた画像・掲載の無い店を出さない）:
 *   掲載中の店である ／ 事前生成の WebP がある ／ 使ってよい写真（photoRules.ts）／ 目視で除いた店ではない（FOOD_PHOTO_DROPPED）。
 *   実行時に fs で public/ を調べない（Vercel の関数に public/ が同梱されるため）。生成済みかは build-images.mjs --check が見る。
 *
 * 並び順は決まった順（無作為にしない。同じ入力なら必ず同じ並び）:
 *   地域（都道府県）とジャンルが近くで重ならないよう、貪欲に選ぶ（直近 6 枚と同じ県・同じ主ジャンルを避ける。
 *   同点なら、残りが多い県を先に、それでも同点なら店IDの順）。
 */
import "server-only";
import { getAllRestaurants } from "@/lib/db/restaurants";
import type { Restaurant } from "@/lib/data";
import { CUISINE_GROUPS } from "@/lib/cuisineGroups";
import { prefOfGourmetRegion } from "@/lib/areas/gourmet";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { FOOD_PHOTO, FOOD_PHOTO_DROPPED, FOOD_PHOTO_FEATURED } from "./foodPhotos";
import variantsJson from "./foodPhotoVariants.json";
import { isUsableImage } from "./photoRules";
import { FEATURE_MIN_WIDTH, FEATURE_RATIO, type WallData, type WallFacet, type WallItem } from "./photoWallShared";

type Variant = { width: number; height: number; items: { w: number; h: number; src: string }[] };
const VARIANTS = variantsJson.variants as Record<string, Variant>;

/** ジャンルの絞り込みの URL 上の識別子（CUISINE_GROUPS の label → key）。label が増えたら足す（無いと key は label のまま） */
const GENRE_KEY: Record<string, string> = {
  居酒屋: "izakaya",
  焼き鳥: "yakitori",
  焼肉: "yakiniku",
  "和食・割烹": "washoku",
  "寿司・海鮮": "sushi",
  ラーメン: "ramen",
  "そば・うどん": "soba-udon",
  中華: "chuka",
  イタリアン: "italian",
  フレンチ: "french",
  "カフェ・喫茶": "cafe",
  "定食・洋食": "teishoku",
  お好み焼き: "okonomiyaki",
  "バー・バル": "bar",
};
const OTHER = { key: "other", label: "その他" } as const;

/**
 * 既存の CUISINE_GROUPS の keywords（店のジャンル文字列への部分一致。検索ページと同じ判定）に、この壁だけで足す言い換え。
 * 「蕎麦店」「イタリア料理店」「会席・懐石料理店」など、書き方が違うだけで同じジャンルのものが「その他」に落ちるのを防ぐ。
 * CUISINE_GROUPS 自体は変えない（グルメの既存ページに影響させない）。
 */
const EXTRA_KEYWORDS: Record<string, string[]> = {
  "和食・割烹": ["会席", "懐石", "うなぎ", "郷土料理"],
  "そば・うどん": ["蕎麦"],
  イタリアン: ["イタリア"],
  フレンチ: ["フランス"],
};

const GENRE_DEFS = CUISINE_GROUPS.map((g) => ({
  key: GENRE_KEY[g.label] ?? g.label,
  label: g.label,
  words: [...g.keywords, ...(EXTRA_KEYWORDS[g.label] ?? [])] as string[],
}));

/** 店のジャンル文字列が当たるグループ（複数に当たってよい。CUISINE_GROUPS の順） */
function genresOf(cuisine: string): number[] {
  const hit: number[] = [];
  GENRE_DEFS.forEach((g, i) => {
    if (g.words.some((w) => cuisine.includes(w))) hit.push(i);
  });
  return hit;
}

function hashOf(v: Variant): string | null {
  const m = /photo-([0-9a-f]{8})-\d+\.webp$/.exec(v.items[0]?.src ?? "");
  return m ? m[1] : null;
}

interface Raw extends Omit<WallItem, "g" | "p"> {
  genres: number[]; // GENRE_DEFS の番号
  pref: string; // 都道府県 slug（無ければ空）
}

/** 貪欲な交互並び（上のコメントのとおり。入力の並びに依らず、店IDの順を起点にする） */
function interleave(list: Raw[]): Raw[] {
  const rest = [...list].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  const out: Raw[] = [];
  const left = new Map<string, number>();
  for (const x of rest) left.set(x.pref, (left.get(x.pref) ?? 0) + 1);
  const W = 6;
  while (rest.length) {
    let best = 0;
    let bestScore = Infinity;
    for (let i = 0; i < rest.length; i++) {
      const c = rest[i];
      let s = 0;
      for (let k = 1; k <= W; k++) {
        const prev = out[out.length - k];
        if (!prev) break;
        const weight = W - k + 1;
        if (prev.pref === c.pref) s += weight * 4;
        if ((prev.genres[0] ?? -1) === (c.genres[0] ?? -1)) s += weight * 3;
      }
      s -= (left.get(c.pref) ?? 0) * 0.05;
      if (s < bestScore - 1e-9) {
        bestScore = s;
        best = i;
      }
    }
    const [pick] = rest.splice(best, 1);
    left.set(pick.pref, (left.get(pick.pref) ?? 1) - 1);
    out.push(pick);
  }
  return out;
}

/** 店データ（掲載中の店）から壁のデータを作る。トップの入口など、すでに店データを持っている呼び出し側はそれを渡す */
export function buildWall(restaurants: Restaurant[]): WallData {
  const live = new Map(restaurants.map((r) => [r.id, r]));
  const featured = new Set(FOOD_PHOTO_FEATURED);
  const raws: Raw[] = [];
  for (const [id, src] of Object.entries(FOOD_PHOTO)) {
    if (id in FOOD_PHOTO_DROPPED) continue;
    const r = live.get(id);
    const v = VARIANTS[src];
    if (!r || !v || v.items.length === 0 || !isUsableImage(src)) continue;
    const hash = hashOf(v);
    if (!hash) continue;
    const ws = v.items.map((i) => i.w);
    const ratio = Math.round((v.width / v.height) * 1000) / 1000;
    const wide = ws[ws.length - 1] >= FEATURE_MIN_WIDTH && ratio >= FEATURE_RATIO[0] && ratio <= FEATURE_RATIO[1];
    raws.push({
      id,
      n: r.name,
      a: r.area || "",
      c: r.cuisine || "",
      h: hash,
      ws,
      r: ratio,
      f: featured.has(id) && wide ? 1 : 0,
      genres: genresOf(r.cuisine || ""),
      pref: prefOfGourmetRegion(r.region) ?? "",
    });
  }

  // ジャンル・県は、実際に写真がある選択肢だけ（枚数の多い順）。0 枚の選択肢は作らない
  const genreCount = new Map<number, number>();
  let other = 0;
  const prefCount = new Map<string, number>();
  for (const x of raws) {
    if (x.genres.length === 0) other++;
    for (const g of x.genres) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
    if (x.pref) prefCount.set(x.pref, (prefCount.get(x.pref) ?? 0) + 1);
  }
  const genreOrder = [...genreCount.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([g]) => g);
  const genres: WallFacet[] = genreOrder.map((g) => ({ key: GENRE_DEFS[g].key, label: GENRE_DEFS[g].label }));
  if (other > 0) genres.push({ key: OTHER.key, label: OTHER.label });
  const otherIdx = genres.length - 1;
  const genreIdx = new Map(genreOrder.map((g, i) => [g, i]));

  const prefOrder = PREFECTURES.filter((p) => prefCount.has(p.slug)).sort(
    (a, b) => (prefCount.get(b.slug) ?? 0) - (prefCount.get(a.slug) ?? 0),
  );
  const prefs: WallFacet[] = prefOrder.map((p) => ({ key: p.slug, label: p.short }));
  const prefIdx = new Map(prefOrder.map((p, i) => [p.slug, i]));

  const items: WallItem[] = interleave(raws).map((x) => ({
    id: x.id,
    n: x.n,
    a: x.a,
    c: x.c,
    p: prefIdx.get(x.pref) ?? -1,
    g: x.genres.length ? x.genres.map((g) => genreIdx.get(g) as number) : [otherIdx],
    h: x.h,
    ws: x.ws,
    r: x.r,
    f: x.f,
  }));
  return { items, genres, prefs };
}

// 一覧ページは同じ集計を何度も使うので、短い時間だけ使い回す（lib/portal/mapData.ts と同じ作法）
let memo: { at: number; p: Promise<WallData> } | null = null;
export function loadWall(): Promise<WallData> {
  const now = Date.now();
  if (!memo || now - memo.at > 60_000) {
    const p = getAllRestaurants().then(buildWall);
    memo = { at: now, p };
    p.catch(() => {
      if (memo?.p === p) memo = null;
    });
  }
  return memo.p;
}

/** グルメのトップの入口に出す写真（特に良い写真から、ジャンルが重ならないよう n 枚。並びは壁と同じ順） */
export function entrancePhotos(data: WallData, n: number): WallItem[] {
  const feat = data.items.filter((x) => x.f === 1);
  const picked: WallItem[] = [];
  const seen = new Set<number>();
  for (const x of feat) {
    const g = x.g[0];
    if (seen.has(g)) continue;
    seen.add(g);
    picked.push(x);
    if (picked.length >= n) break;
  }
  for (const x of feat) {
    if (picked.length >= n) break;
    if (!picked.includes(x)) picked.push(x);
  }
  return picked;
}
