import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GreenShopPage from "../../bcproto/green/shop/GreenShopPage";
import JsonLd from "../../JsonLd";
import { shopPage, photosOf } from "../../pages/shop";
import { getPlaces } from "@/lib/places";
import { getCategory, getVertical } from "@/lib/verticals";
import { loadBsShop } from "@/lib/portal/vert/bodyshop/model";
import { socialLinks } from "@/lib/portal/sns";
import { breadcrumb, localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";

/**
 * ボディケアの店のページ(/bodycare/shop/<id>)。案4(グリーン。GreenShopPage)。静的に出す(引数は読まない)。
 * メタ情報(題・説明・正規 URL・index の判定)は、今までの店のページと同じ関数(shopPage("bodycare"))。構造化データは LocalBusiness(星なし)と BreadcrumbList。
 * 枠は app/bodycare/(shop)/layout.tsx。
 */
const common = shopPage("bodycare");

export function bodyShopPage() {
  return {
    generateStaticParams: common.generateStaticParams,
    generateMetadata: common.generateMetadata as (props: { params: Promise<{ id: string }> }) => Promise<Metadata>,
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
          <GreenShopPage shop={shop} />
          <JsonLd data={ld} />
          <JsonLd
            data={breadcrumb([
              { name: "マチノワ", url: absUrl("/") },
              { name: v.name, url: absUrl(v.path) },
              { name: place.name, url: absUrl(`${v.path}/shop/${place.id}`) },
            ])}
          />
        </>
      );
    },
  };
}
