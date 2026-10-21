import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import { cpTopPage } from "@/components/portal/colorplay/pages/top";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";

// ビューティーの最初のページ（COLOR PLAY。最初の画面の動きは「塗る」）。
// metadata は、これまでの /beauty（components/portal/VerticalHub.tsx）と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("beauty");
}

const Cp = cpTopPage(BEAUTY_SITE);

export default async function Page() {
  return Cp();
}
