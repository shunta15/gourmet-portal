/**
 * ステイのカテゴリ×県ページ
 * /stay/{category}/{pref}
 */

import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/portal/Breadcrumbs";
import JsonLd from "@/components/portal/JsonLd";
import { getPlaces, countPlaces } from "@/lib/places";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { getVertical, getCategory } from "@/lib/verticals";
import { fillTitle } from "@/lib/seo/util";

const VERTICAL = getVertical('stay');
const CATEGORY_SLUGS = VERTICAL.categories.map((c) => c.slug);

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  const params: Array<{ category: string; pref: string }> = [];
  for (const cat of VERTICAL.categories) {
    for (const pref of PREFECTURES) {
      params.push({ category: cat.slug, pref: pref.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; pref: string }>;
}): Promise<Metadata> {
  const { category, pref } = await params;
  const cat = getCategory(VERTICAL, category);
  const prefData = getPrefBySlug(pref);
  if (!cat || !prefData) return { title: "ページが見つかりません — マチノワ" };

  const count = await countPlaces('stay', { category, pref });
  
  const title = fillTitle(VERTICAL.titleTemplates.area, {
    area: prefData.short,
    category: cat.name,
    count,
    brand: VERTICAL.brand,
  });

  return buildMetadata({
    vertical: 'stay',
    title,
    description: `${prefData.short}の${cat.name}。`,
    path: `/stay/${category}/${pref}`,
    count,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; pref: string }>;
}) {
  const { category, pref } = await params;
  const cat = getCategory(VERTICAL, category);
  const prefData = getPrefBySlug(pref);
  if (!cat || !prefData) notFound();

  const places = await getPlaces('stay', { category, pref });

  const breadcrumbItems = [
    { name: "トップ", href: "/" },
    { name: VERTICAL.name, href: "/stay" },
    { name: cat.name, href: `/stay/${category}` },
    { name: prefData.short, href: `/stay/${category}/${pref}` },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <main className="portal-main">
        <h1>{prefData.short}の{cat.name}</h1>
        <p>{places.length}件</p>

        {places.length === 0 && (
          <div className="coming-soon">
            <p>申し訳ございません。このエリアはまだ掲載準備中です。</p>
          </div>
        )}

        {/* 店舗リスト */}
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <h3>
                <a href={`/stay/shop/${place.id}`}>{place.name}</a>
              </h3>
              {place.address && <p>{place.address}</p>}
            </div>
          ))}
        </div>
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
