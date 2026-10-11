/**
 * 店ページと「その店の特集記事（店 1 軒の記事）」の対応（サーバー専用。lib/data・lib/articleStores を読むのでクライアントから import しない）。
 * 対応表は ARTICLE_STORE_ID_BY_FEATURE（記事 ID → 店 ID）だけを使う。店名の部分一致・推測では探さない。
 * 店 1 軒の記事（isSingleShopFeature）だけを対にする。店ページの帯（PairSwitch）と、記事の帯は、同じ関数から引くので、必ず対で出る。
 * 同じ店を指す店 1 軒の記事が複数あるときは、ARTICLE_STORE_FEATURE_IDS（店 → 記事）の 1 本、無ければ ID の昇順で先頭の 1 本。
 * 切り替え: featureSingle.ts の NOREN_FEATURE_SINGLE が false のときは、店 1 軒の枠（帯を置く側）が出ないので、対を作らない。
 */
import { FEATURE_ARTICLES } from "@/lib/data";
import { ARTICLE_STORE_FEATURE_IDS, ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { NOREN_FEATURE_SINGLE, isSingleShopFeature } from "./featureSingle";

let cache: Map<string, string> | null = null;

/** 店 ID → 対の特集記事 ID */
function pairTable(): Map<string, string> {
  if (cache) return cache;
  const byShop = new Map<string, string[]>();
  for (const [fid, sid] of Object.entries(ARTICLE_STORE_ID_BY_FEATURE)) {
    const a = FEATURE_ARTICLES[fid];
    if (!a || !isSingleShopFeature(a)) continue;
    const l = byShop.get(sid) ?? [];
    l.push(fid);
    byShop.set(sid, l);
  }
  const t = new Map<string, string>();
  for (const [sid, l] of byShop) {
    const preferred = ARTICLE_STORE_FEATURE_IDS[sid];
    t.set(sid, preferred && l.includes(preferred) ? preferred : [...l].sort()[0]);
  }
  cache = t;
  return t;
}

/** 店ページ用: この店の対の特集記事（店 1 軒の記事）。無ければ null */
export function pairedFeatureOfShop(shopId: string): { featureId: string; views: number } | null {
  if (!NOREN_FEATURE_SINGLE) return null;
  const fid = pairTable().get(shopId);
  if (!fid) return null;
  return { featureId: fid, views: FEATURE_ARTICLES[fid]?.ranking.length ?? 0 };
}

/** 特集記事用: この記事の対の店 ID。無い（対の店が無い・同じ店の別の記事が対になっている）ときは null */
export function pairedShopOfFeature(featureId: string): string | null {
  if (!NOREN_FEATURE_SINGLE) return null;
  const sid = ARTICLE_STORE_ID_BY_FEATURE[featureId];
  if (!sid) return null;
  return pairTable().get(sid) === featureId ? sid : null;
}

/** 帯の札の説明。opt は、狭い画面（スマホ）では見えなくする前置き（読み上げには残る） */
export type PairNote = { opt?: string; text: string };

/** 帯の「店の紹介」の説明。その店のデータにあるものだけを並べる */
export function pairShopNote(r: { hours?: string; address?: string; reservationUrl?: string; phone?: string | null }): PairNote {
  const p: string[] = [];
  if (r.hours && r.hours.trim()) p.push("営業時間");
  if (r.address && r.address.trim()) p.push("地図");
  if (r.reservationUrl) p.push("予約");
  else if (r.phone) p.push("電話");
  return { text: p.length > 0 ? p.join("・") : "店の基本情報" };
}

/** 帯の「この店の特集」の説明（視点の数は記事の ranking の数） */
export function pairFeatureNote(views: number): PairNote {
  return views >= 2 ? { opt: "編集部が ", text: `${views} つの視点で紹介` } : { text: "編集部による紹介記事" };
}
