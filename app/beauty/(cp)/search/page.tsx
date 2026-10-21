import { cpSearchPage } from "@/components/portal/colorplay/pages/search";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { assertPortalLive } from "@/lib/portal/launch";

// さがす専用ページ。状態は URL の引数（kind・pref・q・sort・n）。
const cp = cpSearchPage(BEAUTY_SITE);

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return cp.generateMetadata(props);
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  return cp.Page(props);
}
