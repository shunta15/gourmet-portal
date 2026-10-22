import { notFound } from "next/navigation";
import VkFrame from "@/components/portal/vkit/common/VkFrame";
import VkArticle from "@/components/portal/vkit/article/VkArticle";
import { loadArticle } from "@/components/portal/vkit/article/articleData";
import { vkLine } from "@/components/portal/vkit/common/live";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { countPlaces, getPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

// 店の記事(実在の店 1 軒ずつの紹介記事)。/sports/article/{id}(id = 店の ID。リンク先の店のページは /sports/shop/{id})
// 店が無い・紹介記事が無い店は 404(その店のページ /sports/shop/{id} は残る)。
// 文は Place.article の事実だけ(article/articleData.ts)。metadata(title・description・canonical・OGP・robots)は店のページと同じ作り。
export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => (await getPlaces("sports")).filter((p) => p.article).map((p) => ({ id: p.id })));

type Props = { params: Promise<{ id: string }> };

function decode(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

export async function generateMetadata({ params }: Props) {
  assertPortalLive();
  const id = decode((await params).id);
  const v = await loadArticle(sportsCfg, id);
  if (!v) return notFoundMetadata();
  const b = VERTICALS.sports;
  const { shop } = v;
  const where = shop.area ? `${shop.area}の` : "";
  return buildMetadata({
    vertical: "sports",
    title: `${shop.name}の紹介記事｜${where}${shop.kindName || b.name}｜${b.brand}`,
    description: vkLine(v.headline) || `${shop.name}の紹介記事。所在地や営業時間など、公式サイトなどで確認できた情報をまとめています。`,
    path: `${b.path}/article/${shop.id}`,
    count: await countPlaces("sports"),
    ...(v.hero ? { image: { url: v.hero.src, width: v.hero.w, height: v.hero.h, alt: `${shop.name}の写真` } } : {}),
  });
}

export default async function Page({ params }: Props) {
  assertPortalLive();
  const id = decode((await params).id);
  const v = await loadArticle(sportsCfg, id);
  if (!v) notFound();
  return (
    <VkFrame cfg={sportsCfg}>
      <VkArticle cfg={sportsCfg} v={v} />
    </VkFrame>
  );
}
