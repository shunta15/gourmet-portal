import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import { staySearchPage } from "@/components/portal/stayproto/decided/search/SearchPage";
import { assertPortalLive } from "@/lib/portal/launch";

// 探すページ(/stay/search)。決定デザイン。
// 状態は URL の引数(kind・region・pref・scene・q・sort・page)。キーワード・こだわり条件・複数の種類・地方・並べ替え・2 ページ目以降の URL は noindex(正本は種類・都道府県だけの URL)。
const live = staySearchPage();

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  assertPortalLive();
  return <StayFrame>{await live.Page(props)}</StayFrame>;
}
