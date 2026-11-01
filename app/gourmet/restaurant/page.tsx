import Shell from "@/components/portal/gnoren/common/Shell";
import { GN_LIVE_LINKS } from "@/components/portal/gnoren/common/nav";
import ShopListView from "@/components/portal/gnoren/real/search/ShopListView";
import { getShopListCards } from "@/lib/portal/gnoren/search";
import { BROAD_GROUPS } from "@/lib/cuisineBroad";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/meta";
import { assertPortalLive } from "@/lib/portal/launch";
import { NOREN_SHOP_REWRITE } from "@/lib/portal/noren/rewrites";
import { MENU_SHOPS } from "@/lib/portal/noren/nav";
import { VERTICALS } from "@/lib/verticals";
import { notFound } from "next/navigation";

// 店舗紹介の一覧（/restaurant。グルメのメニュー「店舗紹介」の行き先）の実体（内部のパス）。
// 公開スイッチ ON のとき、/restaurant が next.config.ts の rewrites でここに来る（ブラウザの URL・canonical は /restaurant のまま。
// この内部のパス /gourmet/restaurant は直接開くと /restaurant へ恒久リダイレクトされる）。枠（ヘッダー・フッター）はこのページが Shell で付ける（暖簾 2）。
// 中身: 見出し「店舗紹介」と件数（実数）、掲載中の全店の札。札を押すと、その店の店舗紹介ページ（/restaurant/<店 ID>）を開く。絞り込みは付けない。
// 札・並べ方・ページ送りは「さがす」と同じ部品（components/portal/gnoren/real/search の Card・ShopListView）・同じ作法: 1 ページ 24 店・?page=。
// 店の並びは店 ID の番号の順（ページ送りの途中で順番が入れ替わらないように決めておく）。非表示の店（lib/hiddenStores.ts）は getAllRestaurants が外している。
// robots: 1 ページ目は index、2 ページ目以降（?page=2〜）は noindex,follow（他の業種の一覧と同じ決まり）。canonical は、どのページも引数なしの /restaurant（他の業種の店舗紹介の一覧と同じ）。
// 公開スイッチ OFF のあいだは 404（レイアウトとここで assertPortalLive）。

/** 1 ページに出す店の数（「さがす」と同じ） */
const PER = 24;

const BRAND = VERTICALS.gourmet.brand;

const LABELS = Object.fromEntries(BROAD_GROUPS.map((g) => [g.key, g.label]));

const pageOf = (v: string | string[] | undefined) => {
  const s = Array.isArray(v) ? v[0] : v;
  return Math.max(1, parseInt(s ?? "1", 10) || 1);
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  assertPortalLive();
  const items = await getShopListCards();
  const pages = Math.max(1, Math.ceil(items.length / PER));
  const cur = Math.min(pageOf((await searchParams).page), pages);
  const base = buildMetadata({
    vertical: "gourmet",
    title: `店舗紹介${cur > 1 ? `（${cur} ページ目）` : ""} | ${BRAND}`,
    description: `${BRAND}に掲載している全 ${items.length} 店の一覧です。店名・エリア・種類を見て、1 店ずつの紹介ページへ進めます。`,
    // canonical は、どのページも引数なしの /restaurant（ほかの業種の店舗紹介の一覧、/search の ?page= と同じ作法）
    path: MENU_SHOPS,
    count: items.length,
  });
  // 2 ページ目以降は noindex,follow（1 ページ目だけ index）
  return cur > 1 ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  assertPortalLive();
  if (!NOREN_SHOP_REWRITE) notFound();
  const items = await getShopListCards();
  const pages = Math.max(1, Math.ceil(items.length / PER));
  const cur = Math.min(pageOf((await searchParams).page), pages);
  const shown = items.slice((cur - 1) * PER, cur * PER);
  return (
    <Shell page="shop" links={GN_LIVE_LINKS}>
      <ShopListView shops={shown} total={items.length} page={cur} pages={pages} labels={LABELS} basePath={MENU_SHOPS} />
    </Shell>
  );
}
