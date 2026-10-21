/**
 * 1 店 1 ページ(/{v}/shop/{id})。COLOR PLAY。特集記事は店のページと一緒(1 店 1 ページ)。
 *
 * 組み: 「留める」(fx1.tsx。オーナー決定 2026-10-13)。入口は最初の画面を留めて、色面・店名・窓の写真が順に入れ替わる → 紹介(見出しごとに色面が替わる。文は短く見せて「続きを読む」に畳む)
 *       → メニュー(名前だけ) → 店舗情報(黒い面。住所・営業時間・電話・公式サイト・予約・地図) → 同じエリアの店・同じ種類の店。
 * 部品・CSS(fx.css)は ./fxPages から動的に読む(従来どおり)。
 * 特集記事のある店(店 ID と特集の placeId が完全一致)は、短い紹介文の代わりに特集記事の本文を出す(二重にしない)。
 * 写真は 0〜3 枚(特集のある店はもっと)。枚数に合わせて組み方を変える(0 枚は色面と店名の大きな字。空の枠・壊れた画像・同じ写真の繰り返しを出さない)。
 * 紹介文が無い店は、入口・帯・店舗情報だけのページ。メニューの料金は出さない。
 * 動きは transform・opacity・clip-path だけ。prefers-reduced-motion と JS なしでは、動かない完成形のまま読める。
 * 構造化データ・metadata は、これまでの店ページ(components/portal/pages/shop.tsx)と同じ考え方(URL は変えない)。
 */
import { notFound } from "next/navigation";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { buildShopModel } from "./shopModel";

type Props = { params: Promise<{ id: string }> };

export function cpShopPage(site: CpSite) {
  return async function Page({ params }: Props) {
    const { id } = await params;
    const m = await buildShopModel(site, id);
    if (!m) notFound();
    // 部品と CSS は動的に読み込む(従来どおり)
    const { Fx1Shop } = await import("./fxPages");
    return <Fx1Shop m={m} />;
  };
}
