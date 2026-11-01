import { cpSpecialPage } from "@/components/portal/colorplay/pages/special";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";

// 特集の記事(/beauty/special/{slug})。利用シーン・業種の特集記事 3 本。それ以外の slug は 404。節に出てくる店は店舗紹介(/beauty/shop/{id})へのリンク。
const cp = cpSpecialPage(BEAUTY_SITE);

export const dynamicParams = false;
export const generateStaticParams = liveStaticParams(async () => cp.staticParams());

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return cp.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  return cp.Page(props);
}
