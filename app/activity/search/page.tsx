import { vkSearchPage } from "@/components/portal/vkit/search/SearchPage";
import { activityCfg } from "@/components/portal/vkit/configs";
import { ActivitySearchPage } from "@/components/portal/activity/pages";
import { assertPortalLive } from "@/lib/portal/launch";

// 探すページ(/activity/search)。オーナーが決めたデザイン(components/portal/activity/)。状態は URL の引数(kind・region・pref・scene・q。日付は when・date、お気に入りだけは fav=1)で、絞り込みの最初の状態になる。
// metadata(title・description・canonical・robots)は、これまでの探す(vkit/search/SearchPage.tsx の vkSearchPage)と同じ。
// キーワード・こだわり条件・複数の種類・地方・並べ替え・2 ページ目以降の URL は noindex(正本は種類・都道府県だけの URL)。
const live = vkSearchPage(activityCfg);

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  return <ActivitySearchPage searchParams={props.searchParams} />;
}
