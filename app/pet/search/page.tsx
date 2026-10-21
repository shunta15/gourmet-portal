import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import { petSearchPage } from "@/components/portal/petproto/decided/search/live/LiveSearch";
import { assertPortalLive } from "@/lib/portal/launch";

// ③探すページ(/pet/search)。決定デザイン。
// 状態は URL の引数(kind・pref・tag・animal・q・sort・page)。キーワード・並べ替え・2 ページ目以降の URL は noindex(正本は種類・エリアだけの URL)。
const live = petSearchPage();

export async function generateMetadata(props: Parameters<typeof live.generateMetadata>[0]) {
  assertPortalLive();
  return live.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof live.Page>[0]) {
  assertPortalLive();
  return <PetFrame>{await live.Page(props)}</PetFrame>;
}
