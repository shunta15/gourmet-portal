import VkFrame from "@/components/portal/vkit/common/VkFrame";
import { vkSearchPage } from "@/components/portal/vkit/search/SearchPage";
import { activityCfg } from "@/components/portal/vkit/configs";
import { assertPortalLive } from "@/lib/portal/launch";

// 探すページ(/activity/search)。状態は URL の引数(kind・region・pref・scene・q・sort・page)。
// キーワード・こだわり条件・複数の種類・地方・並べ替え・2 ページ目以降の URL は noindex(正本は種類・都道府県だけの URL)。
const live = vkSearchPage(activityCfg);

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  assertPortalLive();
  return <VkFrame cfg={activityCfg}>{await live.Page(props)}</VkFrame>;
}
