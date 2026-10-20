import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopDesign from "bodyshop-design";
import GreenShopPage from "../../bcproto/green/shop/GreenShopPage";
import JsonLd from "../../JsonLd";
import { shopPage, photosOf } from "../../pages/shop";
import { getPlaces } from "@/lib/places";
import { getCategory, getVertical } from "@/lib/verticals";
import { loadBsShop } from "@/lib/portal/vert/bodyshop/model";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { BODYCARE_SHOP_DESIGN } from "@/lib/portal/vert/bodycareStructure";
import { socialLinks } from "@/lib/portal/sns";
import { localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";

/**
 * ボディケアの店のページ(/bodycare/shop/<id>)。BODYCARE_DESIGN(lib/portal/vert/bodycareDesign.ts)が "green" のときは案4(グリーン。GreenShopPage)。
 *  "current" のときは、BODYCARE_SHOP_DESIGN(lib/portal/vert/bodycareStructure.ts)で選んだ案で、静的に出す(引数は読まない)。
 *  - "legacy": 今までの shopPage("bodycare") そのまま。
 *  - "a" | "b" | "c": 選んだ案の部品("bodyshop-design" の別名。next.config.ts)+ 構造化データ。メタ情報(題・説明・正規 URL・index の判定)は、今までの店のページと同じ関数。
 * メタ情報(題・説明・正規 URL・index の判定)と構造化データ(LocalBusiness。星なし)は、どの見た目でも同じ。
 * 枠は app/bodycare/(shop)/layout.tsx(案のときは共通ヘッダーなしの枠。案は自前のヘッダーを持つ)。
 */
const legacy = shopPage("bodycare");

export function bodyShopPage() {
  if (BODYCARE_DESIGN !== "green" && BODYCARE_SHOP_DESIGN === "legacy") return legacy;
  return {
    generateStaticParams: legacy.generateStaticParams,
    generateMetadata: legacy.generateMetadata as (props: { params: Promise<{ id: string }> }) => Promise<Metadata>,
    async Page({ params }: { params: Promise<{ id: string }> }) {
      const { id } = await params;
      const want = safeDecode(id);
      const shop = await loadBsShop(want);
      if (!shop) notFound();
      const place = (await getPlaces("bodycare")).find((p) => p.id === want);
      if (!place) notFound();
      const v = getVertical("bodycare");
      const cat = getCategory(v, place.category);
      const social = socialLinks({ instagram: place.instagram, tiktok: place.tiktok, x: place.x, facebook: place.facebook, line: place.line, website: place.website });
      const img = photosOf(place)[0]?.path ?? place.image;
      const art = place.article;
      const ld: Record<string, unknown> = {
        ...localBusiness(place, cat?.schemaType ?? "LocalBusiness"),
        ...(art ? { description: art.headline } : {}),
        ...(img ? { image: img.startsWith("/") ? absUrl(encodeURI(img)) : img } : {}),
        ...(social.length > 0 ? { sameAs: social.map((s) => s.href) } : {}),
      };
      if (!ld.url) ld.url = `${SITE_URL}${v.path}/shop/${place.id}`;
      return (
        <>
          {BODYCARE_DESIGN === "green" ? <GreenShopPage shop={shop} /> : <ShopDesign shop={shop} v={0} />}
          <JsonLd data={ld} />
        </>
      );
    },
  };
}
