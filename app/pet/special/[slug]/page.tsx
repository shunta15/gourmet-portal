import { notFound } from "next/navigation";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import { PetSpecialArticle } from "@/components/portal/petproto/decided/special/PetSpecial";
import { PET_SPECIALS, leadSnippet, petSpecialBySlug } from "@/components/portal/petproto/decided/special/data";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

// ペットの特集記事 1 本(/pet/special/{slug})。lib/specials/pet.json の 4 本だけ(それ以外の slug は 404)。
// 記事の節に出てくる店は、店舗紹介ページ(/pet/shop/{id})へのリンク。robots は他の一覧と同じ gate。
export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = liveStaticParams(() => PET_SPECIALS.map((s) => ({ slug: s.slug })));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  assertPortalLive();
  const s = petSpecialBySlug((await params).slug);
  if (!s) return notFoundMetadata();
  return buildMetadata({
    vertical: "pet",
    title: `${s.title}｜${VERTICALS.pet.brand}`,
    description: leadSnippet(s.lead),
    path: `/pet/special/${s.slug}`,
    count: await countPlaces("pet"),
  });
}

export default async function Page({ params }: Props) {
  const slug = (await params).slug;
  if (!petSpecialBySlug(slug)) notFound();
  return (
    <PetFrame>
      <PetSpecialArticle slug={slug} />
    </PetFrame>
  );
}
