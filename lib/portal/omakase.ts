/**
 * 「おまかせ提案」（/omakase）の店の表をサーバーで作る（公開スイッチ ON の /omakase だけが呼ぶ。サーバー専用）。
 * クライアントへ渡すのは、店ID＋判定（県・予算の帯・気分・事実のビット）の小さな表だけ。店の名前・写真は、
 * 結果に出す 3 軒ぶんだけ /list-data/{店ID}（候補リストと同じ静的 JSON）から取る。
 * 判定の元はこだわり条件（lib/portal/facets.ts）と同じ。基準を満たさなくなった設備・予算の帯は、自動で使われなくなる。
 */
import "server-only";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { prefOfGourmetRegion } from "@/lib/areas/gourmet";
import { buildFacetPayload } from "./facets";
import { buildOmakaseData } from "./omakaseRows";
import type { OmakaseData } from "./omakaseDefs";

// 同じ集計をリクエストごとに繰り返さない（ISR の再生成のたびに取り直す）
let memo: { at: number; p: Promise<OmakaseData> } | null = null;

async function build(): Promise<OmakaseData> {
  const restaurants = await getAllRestaurants();
  const fp = buildFacetPayload(restaurants);
  return buildOmakaseData({
    restaurants,
    facetRows: fp.rows,
    shown: fp.shown,
    shownBands: fp.shownBands,
    prefOfRegion: prefOfGourmetRegion,
  });
}

export function loadOmakaseData(): Promise<OmakaseData> {
  const now = Date.now();
  if (!memo || now - memo.at > 60_000) {
    const p = build();
    memo = { at: now, p };
    p.catch(() => {
      if (memo?.p === p) memo = null;
    });
  }
  return memo.p;
}
