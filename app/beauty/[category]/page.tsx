/**
 * ビューティーのカテゴリトップページ
 * /beauty/{category}
 */

import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/portal/Breadcrumbs";
import JsonLd from "@/components/portal/JsonLd";
import { getPlaces, countPlaces } from "@/lib/places";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { getVertical, getCategory } from "@/lib/verticals";
import { fillTitle } from "@/lib/seo/util";

const VERTICAL = getVertical('beauty');
const CATEGORY_SLUGS = VERTICAL.categories.map((c) => c.slug);

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(VERTICAL, category);
  if (!cat) return { title: "カテゴリが見つかりません — マチノワ" };

  const count = await countPlaces('beauty', { category });

  const title = fillTitle(VERTICAL.titleTemplates.area, {
    area: '全国',
    category: cat.name,
    count,
    brand: VERTICAL.brand,
  });

  return buildMetadata({
    vertical: 'beauty',
    title,
    description: `全国の${cat.name}。エリアから探す。`,
    path: `/beauty/${category}`,
    count,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(VERTICAL, category);
  if (!cat) notFound();

  const places = await getPlaces('beauty', { category });

  const breadcrumbItems = [
    { name: "トップ", href: "/" },
    { name: VERTICAL.name, href: "/beauty" },
    { name: cat.name, href: `/beauty/${category}` },
  ];

  // エリアグループ化
  const byPref = new Map<string, typeof places>();
  for (const place of places) {
    if (!byPref.has(place.pref)) {
      byPref.set(place.pref, []);
    }
    byPref.get(place.pref)!.push(place);
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <main className="portal-main">
        <h1>{cat.name}</h1>
        <p>{places.length}件</p>

        {places.length === 0 && (
          <div className="coming-soon">
            <p>申し訳ございません。このカテゴリはまだ掲載準備中です。</p>
          </div>
        )}

        {/* エリアごとのリスト */}
        {[...byPref.entries()].map(([pref, prefPlaces]) => (
          <div key={pref} className="area-group">
            <h2>
              <a href={`/beauty/${category}/${pref}`}>
                {PREFECTURES.find((p) => p.slug === pref)?.short || pref}
                （{prefPlaces.length}件）
              </a>
            </h2>
          </div>
        ))}
      </main>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `https://machinowa.tokyo${item.href}`,
        })),
      }} />
    </>
  );
}
