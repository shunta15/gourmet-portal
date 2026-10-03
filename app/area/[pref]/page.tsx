/**
 * 業種横断の街ページ（県）
 * /area/{pref} - グルメ含む6業種の概覧
 */

import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/portal/Breadcrumbs";
import JsonLd from "@/components/portal/JsonLd";
import { getPlaces } from "@/lib/places";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { VERTICALS } from "@/lib/verticals";

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

  const title = `${prefData.short}の施設を探す — マチノワ`;
  const description = `${prefData.short}のグルメ・美容・ボディケア・ペット・おでかけ・ステイ。エリアと種類から簡単検索。`;

  return buildMetadata({
    vertical: "portal",
    title,
    description,
    path: `/area/${pref}`,
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

  // 各業種の件数を取得
  const verticalArray = Object.values(VERTICALS);
  const counts = await Promise.all(
    verticalArray.map(async (v) => ({
      vertical: v.key,
      count: (await getPlaces(v.key, { pref })).length,
    }))
  );

  const breadcrumbItems = [
    { name: "トップ", href: "/" },
    { name: prefData.short, href: `/area/${pref}` },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <main className="portal-main">
        <h1>{prefData.short}の施設</h1>
        <p>
          {counts.filter((c) => c.count > 0).length} 業種で施設を掲載中
        </p>

        {/* 0件の場合は準備中メッセージ */}
        {counts.every((c) => c.count === 0) && (
          <div className="coming-soon">
            <p>申し訳ございません。このエリアはまだ掲載準備中です。</p>
            <p>他のエリアをお試しください。</p>
          </div>
        )}

        {/* 業種ごとのブロック */}
        <div className="verticals-grid">
          {verticalArray.map((v) => {
            const count = counts.find((c) => c.vertical === v.key)?.count ?? 0;
            return (
              <div key={v.key} className="vertical-block">
                <h2>{v.name}</h2>
                <p className="count">{count > 0 ? `${count}件` : "掲載準備中"}</p>
                {count > 0 && (
                  <a href={`${v.path}/area/${pref}`}>
                    {v.name}を探す →
                  </a>
                )}
              </div>
            );
          })}
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
