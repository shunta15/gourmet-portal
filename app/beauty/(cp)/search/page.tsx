import { notFound } from "next/navigation";
import { cpSearchPage } from "@/components/portal/colorplay/pages/search";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";
import { assertPortalLive } from "@/lib/portal/launch";

// さがす専用ページ（COLOR PLAY のときだけ。"legacy" のあいだは 404）。状態は URL の引数（kind・pref・q・sort・n）。
const cp = cpSearchPage(BEAUTY_SITE);

export async function generateMetadata(props: Parameters<typeof cp.generateMetadata>[0]) {
  assertPortalLive();
  return isColorplay("beauty") ? cp.generateMetadata(props) : notFoundMetadata();
}

export default async function Page(props: Parameters<typeof cp.Page>[0]) {
  assertPortalLive();
  if (!isColorplay("beauty")) notFound();
  return cp.Page(props);
}
