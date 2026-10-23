import { notFound } from "next/navigation";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { StaySpecialArticle } from "@/components/portal/stayproto/decided/special/StaySpecial";
import { STAY_SPECIALS, leadSnippet, staySpecialBySlug } from "@/components/portal/stayproto/decided/special/data";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

// ステイの特集記事 1 本(/stay/special/{slug})。lib/specials/stay.json の 3 本だけ(それ以外の slug は 404)。
// 記事の節に出てくる宿は、店舗紹介ページ(/stay/shop/{id})へのリンク。robots は他の一覧と同じ gate。
export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = liveStaticParams(() => STAY_SPECIALS.map((s) => ({ slug: s.slug })));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  assertPortalLive();
  const s = staySpecialBySlug((await params).slug);
  if (!s) return notFoundMetadata();
  return buildMetadata({
    vertical: "stay",
    title: `${s.title}｜${VERTICALS.stay.brand}`,
    description: leadSnippet(s.lead),
    path: `/stay/special/${s.slug}`,
    count: await countPlaces("stay"),
  });
}

export default async function Page({ params }: Props) {
  assertPortalLive();
  const slug = (await params).slug;
  if (!staySpecialBySlug(slug)) notFound();
  return (
    <StayFrame>
      <StaySpecialArticle slug={slug} />
    </StayFrame>
  );
}
