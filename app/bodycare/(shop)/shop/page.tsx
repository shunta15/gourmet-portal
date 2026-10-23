import ShopList from "@/components/portal/bcproto/green/shop/ShopList";
import JsonLd from "@/components/portal/JsonLd";
import { shopListHref } from "@/components/portal/bcproto/green/common/site";
import { loadGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import { PAGE_SIZE, parseGreenListN } from "@/lib/portal/vert/bodygreen/filter";
import { assertPortalLive } from "@/lib/portal/launch";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

// 店舗紹介の一覧(/bodycare/shop)。メニューの「店舗紹介」の行き先。掲載中の全店の札(見た目は案4「グリーン」の GreenShop 札)。絞り込みは付けない。
// 状態は URL の引数 n(「さらに 20 件を見る」)だけ。引数なしの一覧は掲載 3 件以上で index(lib/seo/gate.ts。探すと同じ)。n の付いた URL は noindex で、canonical は引数なしの一覧。
type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  const n = parseGreenListN(await searchParams);
  const v = VERTICALS.bodycare;
  const total = (await loadGreenShops()).length;
  return buildMetadata({
    vertical: "bodycare",
    title: `店舗紹介｜${v.brand}`,
    description: `${v.name}に掲載している店を、すべて並べた一覧です。掲載${total}件。`,
    path: shopListHref(),
    count: n === PAGE_SIZE ? total : 0,
  });
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  const n = parseGreenListN(await searchParams);
  const v = VERTICALS.bodycare;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "店舗紹介", url: absUrl(shopListHref()) },
  ]);
  return (
    <>
      <JsonLd data={ld} />
      <ShopList n={n} />
    </>
  );
}
