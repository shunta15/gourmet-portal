import { vkSearchPage } from "@/components/portal/vkit/search/SearchPage";
import { sportsCfg } from "@/components/portal/vkit/configs";
import { SportsSearchPage } from "@/components/portal/sports/pages";
import { assertPortalLive } from "@/lib/portal/launch";

// 探すページ(/sports/search)。オーナーが決めたデザイン(見本2。components/portal/sports/)。状態は URL の引数(kind・pref・city・feat・q・page)。
// metadata(title・description・canonical・robots)は、これまでの探す(vkit/search/SearchPage.tsx の vkSearchPage)と同じ。
// キーワード・複数の種類・2 ページ目以降の URL は noindex(正本は種類・都道府県だけの URL)。設備・特徴(feat)・市区町村(city)の絞り込みも noindex にする(下の trick)。
const live = vkSearchPage(sportsCfg);

type Props = Parameters<typeof live.generateMetadata>[0];

export async function generateMetadata(props: Props) {
  assertPortalLive();
  const sp = await props.searchParams;
  // vkSearchPage は feat・city を知らない。この 2 つが付いた URL は「2 ページ目以降」と同じ扱い(noindex・正本は引数なし側)で metadata を作る
  if (sp.feat || sp.city) return live.generateMetadata({ searchParams: Promise.resolve({ ...sp, feat: undefined, city: undefined, page: "2" }) });
  return live.generateMetadata(props);
}

export default async function Page(props: Props) {
  return <SportsSearchPage searchParams={props.searchParams} />;
}
