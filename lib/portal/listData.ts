/**
 * 候補リスト（/list）が店 1 軒ごとに取る小さなデータ。サーバー専用（lib/places を読むのでクライアントから import しない）。
 *
 * クライアントに全店データは渡さない。/list は、必要な店の分だけ /list-data/{店ID} を取る
 * （app/list-data/[id]/route.ts がビルド時に店ごとの JSON として静的に配る。実行時に DB は叩かない）。
 * 中身は実データだけ（店名・業態・街・写真・営業予定）。星・点数・口コミ数は持たない。推測で埋めない。
 * 写真は店ページ・駅ページと同じ規則（lib/portal/photos.ts。食べログ系・検閲済み・プレースホルダは出さない）。
 * 営業中かどうかは現在時刻で変わるので、営業予定（lib/portal/openNow の Week）を渡してクライアントで判定する。
 */
import { getPlaces } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import { prefOfGourmetRegion } from "@/lib/areas/gourmet";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { placeCategoryName, placeHref } from "@/lib/stations/query";
import { VERTICAL_FACE } from "./meta";
import { shopPhoto } from "./photos";
import { weekFromText } from "./openNow";
import type { ListShop } from "./listShop";

async function build(): Promise<Map<string, ListShop>> {
  const map = new Map<string, ListShop>();
  for (const v of Object.values(VERTICALS)) {
    for (const p of await getPlaces(v.key)) {
      if (map.has(p.id)) continue;
      const prefSlug = v.key === "gourmet" ? prefOfGourmetRegion(p.pref) : p.pref;
      const prefShort = prefSlug ? (getPrefBySlug(prefSlug)?.short ?? "") : "";
      const area =
        p.cityName && prefShort && p.cityName.startsWith(prefShort) ? p.cityName : [prefShort, p.cityName].filter(Boolean).join(" ");
      const ph = shopPhoto(p.image);
      map.set(p.id, {
        id: p.id,
        name: p.name,
        category: placeCategoryName(v, p),
        area,
        href: placeHref(v, p),
        vertical: v.key,
        color: v.accent.color,
        light: v.accent.lightColor,
        glyph: VERTICAL_FACE[v.key].glyph,
        ...(ph ? { photo: { src: ph.src, srcSet: ph.srcSet, width: ph.width, height: ph.height } } : {}),
        week: weekFromText(p.hours, p.holidays).week,
      });
    }
  }
  return map;
}

// ビルド中は店ごとのルートが同じ集計を使うので、短い時間だけ使い回す（ISR の再生成では取り直す）
let memo: { at: number; p: Promise<Map<string, ListShop>> } | null = null;
function load(): Promise<Map<string, ListShop>> {
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

export async function getListShop(id: string): Promise<ListShop | null> {
  return (await load()).get(id) ?? null;
}

export async function getListShopIds(): Promise<string[]> {
  return [...(await load()).keys()];
}
