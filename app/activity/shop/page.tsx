import { ActivityShopListPage, activityShopListMetadata } from "@/components/portal/activity/pages";

// 店舗紹介の一覧(/activity/shop)。メニューの「店舗紹介」の行き先。見出し「店舗紹介」と件数(掲載している全店の実数。保留の店 ac0012 は出ない)・全店の札。札を押すと、その店の店舗紹介ページ /activity/shop/{id}。
// 描くのは A 組の部品(components/portal/activity/ShopList.tsx。特集のヒーローと探すの札の並べ方。新しいデザインは作っていない)。絞り込みは付けない。
// title は「店舗紹介 | マチノワアクティビティ」、canonical は自分自身。robots は他の新業種ページと同じ gate(業種の掲載が 3 件未満なら noindex)。2 ページ目以降は noindex。
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  return activityShopListMetadata(await searchParams);
}

export default async function Page({ searchParams }: Props) {
  return <ActivityShopListPage searchParams={searchParams} />;
}
