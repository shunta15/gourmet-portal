/**
 * ボディケアの地域ページ（県）
 * /bodycare/area/{pref}
 */

import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/portal/Breadcrumbs";
import JsonLd from "@/components/portal/JsonLd";
import { getPlaces, countPlaces } from "@/lib/places";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { getVertical } from "@/lib/verticals";
import { fillTitle } from "@/lib/seo/util";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return PREFECTURES.map((p) => ({ pref: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pref: string }>;
}): Promise<Metadata> {
  const { pref } = await params;
  const prefData = getPrefBySlug(pref);
  if (!prefData) return { title: "都道府県が見つかりません — マチノワ" };

  const count = await countPlaces('bodycare', { pref });
  const vertical = getVertical('bodycare');
  
  const title = fillTitle(vertical.titleTemplates.area, {
    area: prefData.short,
    category: vertical.name,
    count,
    brand: vertical.brand,
  });

  return buildMetadata({
    vertical: 'bodycare',
    title,
    description: `${prefData.short}の${vertical.name}。エリアと種類から探す。`,
    path: `/bodycare/area/${pref}`,
    count,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ pref: string }>;
}) {
  const { pref } = await params;
  const prefData = getPrefBySlug(pref);
  if (!prefData) notFound();

  const places = await getPlaces('bodycare', { pref });
  const vertical = getVertical('bodycare');

  const breadcrumbItems = [
    { name: "トップ", href: "/" },
    { name: vertical.name, href: "/bodycare" },
    { name: prefData.short, href: `/bodycare/area/${pref}` },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <main className="portal-main">
        <h1>{prefData.short}の{vertical.name}</h1>
        <p>{places.length}件</p>

        {places.length === 0 && (
          <div className="coming-soon">
            <p>申し訳ございません。このエリアはまだ掲載準備中です。</p>
            <p>他のエリアをお試しください。</p>
          </div>
        )}

        {/* 店舗リスト */}
        <div className="places-grid">
          {places.map((place) => (
            <div key={place.id} className="place-card">
              <h3>
                <a href={`/bodycare/shop/${place.id}`}>{place.name}</a>
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
