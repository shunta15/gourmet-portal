/**
 * 波紋 HAMON の「真ん中の店」。サーバー専用（店データ・写真の対応表が大きいので、クライアントから import しない）。
 *
 * 店は、掲載店の実データ（名前・住所）と、総合サイトの既存の料理写真（lib/portal/photoWall.ts の壁＝isUsableImage 済み・事前生成の WebP）から作る。
 * どの店を出すかは、全 285 枚を丸く切ったコンタクトシートで 1 枚ずつ目視して選んだ 12 軒（HAMON_PICKS。並びは固定）。
 *   - 基準: 実際の店のテーブル・カウンター・器・トレイで撮られたと分かる／元画像の幅 1200（Retina でも甘くならない）／丸く切って強い／
 *           都道府県と料理の種類がばらける。評価・順位・人気ではない。
 *   - 目視で外したもの: 画像の上端に不自然なぼかし（r324）／左上に「N」のバッジ（r159・r201・r81・r409）／
 *           無地の白い背景でスタジオ撮影のように見えるもの（r184・r39・r35・r43）／幅が足りないもの（r43=447・r39=640・r393=600）／暗くて粒子の荒いもの（r394）。
 * 店の名前と街（都道府県・市区町村）は店データのまま。街は住所から lib/towns.ts の parseTown で取り出す（街ページと同じ単位）。
 */
import "server-only";
import { getAllRestaurants } from "@/lib/db/restaurants";
import { loadWall } from "@/lib/portal/photoWall";
import { photoSrc, photoSrcSet } from "@/lib/portal/photoWallShared";
import { parseTown } from "@/lib/towns";

/** 真ん中に出す店（並びは固定）。z = 写真の拡大（1 = そのまま）、x・y = 切り抜きの中心（%） */
const HAMON_PICKS: { id: string; z?: number; x?: number; y?: number }[] = [
  { id: "r06", z: 1.14, y: 56 }, // らーめん渡邉 東京都台東区
  { id: "r230" }, // 焼とり かい華 福岡県福津市
  { id: "r72" }, // Kitchen Sunny 愛知県名古屋市北区
  { id: "r225" }, // 洋食膳処 ハレレア 広島県広島市中区
  { id: "r123" }, // 勇すし 兵庫県神戸市中央区
  { id: "r142" }, // 鶏心 京都府京都市右京区
  { id: "r41" }, // STONE Cafe 大阪府大阪市西区
  { id: "r472" }, // 大衆天ぷら天ノ松 長野県飯田市
  { id: "r86" }, // HOURS 神奈川県横浜市神奈川区
  { id: "r58" }, // まいこカフェ 埼玉県上尾市
  { id: "r239" }, // 麺や 貴一 北海道札幌市東区
  { id: "r420" }, // 多幸 静岡県焼津市
];

export interface HamonShop {
  id: string;
  name: string;
  /** 都道府県（例: 東京都） */
  pref: string;
  /** 市区町村（政令市は区まで。例: 大阪市西区） */
  town: string;
  src: string;
  srcSet: string;
  /** 写真の拡大と切り抜きの中心 */
  z: number;
  x: number;
  y: number;
}

export async function getHamonShops(): Promise<HamonShop[]> {
  const [wall, all] = await Promise.all([loadWall(), getAllRestaurants()]);
  const items = new Map(wall.items.map((x) => [x.id, x]));
  const shops = new Map(all.map((r) => [r.id, r]));
  const out: HamonShop[] = [];
  for (const p of HAMON_PICKS) {
    const w = items.get(p.id);
    const r = shops.get(p.id);
    if (!w || !r) continue; // 掲載から外れた・写真が使えなくなった店は黙って外す
    const t = parseTown(r.address || "", r.region);
    if (!t) continue;
    const ws = w.ws.filter((n) => n >= 400);
    const use = ws.length ? ws : w.ws;
    out.push({
      id: r.id,
      name: r.name,
      pref: t.pref,
      town: t.town,
      src: photoSrc(w.h, use[use.length > 1 ? 1 : 0]),
      srcSet: photoSrcSet(w.h, use),
      z: p.z ?? 1,
      x: p.x ?? 50,
      y: p.y ?? 50,
    });
  }
  return out;
}
