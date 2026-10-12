import JsonLd from "@/components/portal/JsonLd";
import KumoriPage from "@/components/portal/vert/kumori/KumoriPage";
import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import { cpTopPage } from "@/components/portal/colorplay/pages/top";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";
import { VERTICALS } from "@/lib/verticals";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

// ビューティーの最初のページ。lib/portal/verticalDesign.ts の VERTICAL_DESIGN.beauty が "colorplay" なら COLOR PLAY（最初の画面の動きは BEAUTY_HERO）、
// "legacy" なら「曇り鏡」のデザイン（オーナー決定 2026-10-09。件数 0／1 以上の出し分けは KumoriPage）。
// metadata と構造化データ（BreadcrumbList）は、どちらでもこれまでの /beauty（components/portal/VerticalHub.tsx）と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("beauty");
}

const Cp = cpTopPage(BEAUTY_SITE);

export default async function Page(props: Parameters<typeof Cp>[0]) {
  if (isColorplay("beauty")) return Cp(props);
  const v = VERTICALS.beauty;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
  ]);
  return (
    <>
      <JsonLd data={ld} />
      <KumoriPage />
    </>
  );
}
