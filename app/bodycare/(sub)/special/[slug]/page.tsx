import { notFound } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import SpecialArticle from "@/components/portal/bcproto/green/article/SpecialArticles";
import { SPECIALS, SOURCES_CHECKED_AT, specialBySlug, type SpecialSlug } from "@/lib/portal/vert/bodygreen/special";
import { buildMetadata } from "@/lib/seo/meta";
import { article, breadcrumb } from "@/lib/seo/jsonld";
import { ogImage } from "@/lib/seo/og";
import { absUrl } from "@/lib/seo/util";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { assertPortalLive } from "@/lib/portal/launch";
import { VERTICALS } from "@/lib/verticals";

// 業種の特集記事 3 本(/bodycare/special/<difference|choose|weekend>)。静的な 3 本だけ(それ以外の slug は 404)。
// 静的なページなので件数ゲートの対象外。JSON-LD は BreadcrumbList と Article(著者 マチノワ編集部。星・評価は無い)。
export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = () => SPECIALS.map((s) => ({ slug: s.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  assertPortalLive();
  const meta = specialBySlug((await params).slug);
  if (!meta || BODYCARE_DESIGN !== "green") return notFoundMetadata();
  return buildMetadata({
    vertical: "bodycare",
    title: `${meta.title}｜マチノワ ボディケア`,
    description: meta.description,
    path: `/bodycare/special/${meta.slug}`,
    count: 3,
  });
}

export default async function Page({ params }: Props) {
  assertPortalLive();
  const slug = (await params).slug;
  const meta = specialBySlug(slug);
  if (!meta || BODYCARE_DESIGN !== "green") notFound(); // 定数を "current" に戻したら 404
  const v = VERTICALS.bodycare;
  const path = `/bodycare/special/${meta.slug}`;
  return (
    <>
      <JsonLd
        data={breadcrumb([
          { name: "マチノワ", url: absUrl("/") },
          { name: v.name, url: absUrl(v.path) },
          { name: "特集記事", url: absUrl("/bodycare/special") },
          { name: meta.title, url: absUrl(path) },
        ])}
      />
      <JsonLd
        data={article({
          headline: meta.title,
          description: meta.description,
          image: absUrl(ogImage(path, meta.title).url),
          url: absUrl(path),
          dateModified: SOURCES_CHECKED_AT,
        })}
      />
      <SpecialArticle slug={meta.slug as SpecialSlug} />
    </>
  );
}
