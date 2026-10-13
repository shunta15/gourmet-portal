/**
 * 1 店 1 ページ(/{v}/shop/{id})。COLOR PLAY(試作 app/proto-beauty/colorplay/shop/page.tsx の本番版)。特集記事は店のページと一緒(1 店 1 ページ)。
 *
 * 組み(?fx なし=今の形): 入口(色面が開いて店名と写真が出てくる) → 帯 → 写真 → 紹介(見出しごとに色面が替わる。文は短く見せて「続きを読む」に畳む)
 *       → メニュー(名前だけ) → 店舗情報(黒い面。住所・営業時間・電話・公式サイト・予約・地図) → 同じエリアの店・同じ種類の店。
 * 動きを強くした 3 つの案が、見本(VERCEL_ENV が production 以外)で URL の ?fx=1 / 2 / 3 で見られる(fx1.tsx 留める・fx2.tsx 重ねる・fx3.tsx 弾む)。
 * 既定は lib/portal/verticalDesign.ts の BEAUTY_SHOP_FX(0 = 今の形)。本番では URL の ?fx= を読まない(静的なまま)。案の部品・CSS は ./fxPages から動的に読む(本番の店のページには載らない)。
 * 特集記事のある店(店 ID と特集の placeId が完全一致)は、短い紹介文の代わりに特集記事の本文を出す(二重にしない)。
 * 写真は 0〜3 枚(特集のある店はもっと)。枚数に合わせて組み方を変える(0 枚は色面と店名の大きな字。空の枠・壊れた画像・同じ写真の繰り返しを出さない)。
 * 紹介文が無い店は、入口・帯・店舗情報だけのページ。メニューの料金は出さない。
 * 動きは transform・opacity・clip-path だけ。prefers-reduced-motion と JS なしでは、動かない完成形のまま読める。
 * 構造化データ・metadata は、これまでの店ページ(components/portal/pages/shop.tsx)と同じ考え方(URL は変えない)。
 */
import { notFound } from "next/navigation";
import Footer from "../Footer";
import { IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { sized } from "@/lib/imageUrl";
import { BEAUTY_SHOP_FX, shopFxOverrideAllowed } from "@/lib/portal/verticalDesign";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { AccessSection, buildShopModel, Crumb, GallerySection, InfoButton, JsonLds, MenuSection, MoreShops, nameSize, PanelList, PrimaryCta, QuoteSection, Ribbons, ShopHeader, Tabs, type ShopModel } from "./shopModel";

type SP = { [key: string]: string | string[] | undefined };
type Props = { params: Promise<{ id: string }>; searchParams?: Promise<SP> };

function BaseShop({ m }: { m: ShopModel }) {
  const { site, d, s, n, tone } = m;
  return (
    <>
      <JsonLds m={m} />
      <ShopHeader m={m} />
      <main id="cp-main" tabIndex={-1}>
        <section className={`sh-hero t-${tone} ${n > 0 ? "has-ph" : "no-ph"}`} id="top" data-sp="o">
          <div className="sh-curtain" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="sh-shape sh-s1" aria-hidden="true" />
          <div className="sh-shape sh-s2" aria-hidden="true" />
          <div className="cp-wrap sh-hero-in">
            <Crumb m={m} />
            <div className="sh-hero-grid">
              <div className="sh-hero-copy">
                <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
                <h1 className={`sh-name sz-${nameSize(s.name.length)}`}><span className="cp-line" style={{ ["--l" as string]: 0 }}>{s.name}</span></h1>
                {d.nameKana && <p className="cp-kana">{d.nameKana}</p>}
                <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}{d.headline && (<><br /><small>{d.headline}</small></>)}</span></p>
                <PrimaryCta m={m} />
                <p className="sh-info-p"><InfoButton /></p>
              </div>
              {n > 0 && (
                <div className="sh-hero-ph">
                  <div className="sh-cut">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sized(d.photos[0].src, 1024)} alt={d.photos[0].alt} width={d.photos[0].w ?? 1200} height={d.photos[0].h ?? 800} fetchPriority="high" decoding="async" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <span className="cp-hero-cut" aria-hidden="true" />
        </section>

        <Ribbons m={m} />
        <Tabs m={m} />
        <GallerySection m={m} />
        <PanelList m={m} />
        <QuoteSection m={m} />
        <MenuSection m={m} />
        <AccessSection m={m} />
        <MoreShops m={m} />
      </main>
      <Footer site={site} />
    </>
  );
}

export function cpShopPage(site: CpSite) {
  return async function Page({ params, searchParams }: Props) {
    const { id } = await params;
    const m = await buildShopModel(site, id);
    if (!m) notFound();
    // 見本(production 以外)でだけ、URL の ?fx=0(今の形)・1(留める)・2(重ねる)・3(弾む)で見比べられる。本番は読まない(静的なまま)
    let fx: number = BEAUTY_SHOP_FX;
    if (shopFxOverrideAllowed() && searchParams) {
      const sp = await searchParams;
      const x = Array.isArray(sp.fx) ? sp.fx[0] : sp.fx;
      if (x && /^[0-3]$/.test(x)) fx = Number(x);
    }
    if (fx >= 1 && fx <= 3) {
      // 案の部品と CSS は、案を出すときだけ読み込む(本番の店のページには載せない)
      const { Fx1Shop, Fx2Shop, Fx3Shop } = await import("./fxPages");
      if (fx === 1) return <Fx1Shop m={m} />;
      if (fx === 2) return <Fx2Shop m={m} />;
      return <Fx3Shop m={m} />;
    }
    return <BaseShop m={m} />;
  };
}
