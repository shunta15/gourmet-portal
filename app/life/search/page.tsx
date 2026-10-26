import { vkSearchPage } from "@/components/portal/vkit/search/SearchPage";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LifeSearchPage } from "@/components/portal/life/pages";
import { assertPortalLive } from "@/lib/portal/launch";

// 探すページ(/life/search)。オーナーが決めたデザイン(2026-10-26 の見本。components/portal/life/)。状態は URL の引数(kind・region・pref・q・page)。
// metadata(title・description・canonical・robots)は、これまでの探す(vkit/search/SearchPage.tsx の vkSearchPage)と同じ。
// キーワード・複数の種類・地方・2 ページ目以降の URL は noindex(正本は種類・都道府県だけの URL)。
const live = vkSearchPage(lifeCfg);

type Props = Parameters<typeof live.generateMetadata>[0];

export async function generateMetadata(props: Props) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Props) {
  return <LifeSearchPage searchParams={props.searchParams} />;
}
