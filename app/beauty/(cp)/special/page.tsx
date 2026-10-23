import { cpSpecialListPage } from "@/components/portal/colorplay/pages/specialList";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { assertPortalLive } from "@/lib/portal/launch";

// 特集の一覧(/beauty/special)。メニューの「特集」の行き先。利用シーン・業種の特集記事 3 本(lib/specials/beauty.json)。店 1 軒の記事は並べない。
const cp = cpSpecialListPage(BEAUTY_SITE);

export async function generateMetadata() {
  assertPortalLive();
  return cp.generateMetadata();
}

export default async function Page() {
  assertPortalLive();
  return cp.Page();
}
