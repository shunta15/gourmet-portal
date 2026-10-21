import { notFound } from "next/navigation";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import StayArticle from "@/components/portal/stayproto/decided/article/live/StayArticle";
import { loadStayArticle } from "@/components/portal/stayproto/decided/article/live/articleData";
import { stayLine } from "@/components/portal/stayproto/decided/common/live";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { assertPortalLive, liveStaticParams } from "@/lib/portal/launch";
import { countPlaces, getPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

// 宿の記事(決定デザイン ①。実在の宿 1 軒ずつの紹介記事)。/stay/article/{id}(id = 宿の ID。リンク先の宿ページは /stay/shop/{id})
// 宿が無い・紹介記事が無い宿は 404(その宿のページ /stay/shop/{id} は残る)。
// 文は Place.article の事実だけ(articleData.ts)。metadata(title・description・canonical・OGP・robots)は宿のページと同じ作り。
export const revalidate = 3600;
export const dynamicParams = true;
export const generateStaticParams = liveStaticParams(async () => {
  return (await getPlaces("stay")).filter((p) => p.article).map((p) => ({ id: p.id }));
});

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
  const v = await loadStayArticle(id);
  if (!v) return notFoundMetadata();
  const b = VERTICALS.stay;
  const { shop } = v;
  const where = shop.area ? `${shop.area}の` : "";
  return buildMetadata({
    vertical: "stay",
    title: `${shop.name}の紹介記事｜${where}${shop.kindName || b.name}｜${b.brand}`,
    description: stayLine(v.headline) || `${shop.name}の紹介記事。所在地やチェックイン・チェックアウトなど、公式サイトなどで確認できた情報をまとめています。`,
    path: `${b.path}/article/${shop.id}`,
    count: await countPlaces("stay"),
    ...(v.hero ? { image: { url: v.hero.src, width: v.hero.w, height: v.hero.h, alt: `${shop.name}の写真` } } : {}),
  });
}

export default async function Page({ params }: Props) {
  assertPortalLive();
  const id = decode((await params).id);
  const v = await loadStayArticle(id);
  if (!v) notFound();
  return (
    <StayFrame>
      <StayArticle v={v} />
    </StayFrame>
  );
}
