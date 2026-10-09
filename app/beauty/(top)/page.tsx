import JsonLd from "@/components/portal/JsonLd";
import KumoriPage from "@/components/portal/vert/kumori/KumoriPage";
import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import { VERTICALS } from "@/lib/verticals";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

// ビューティーの入口は「曇り鏡」のデザイン（オーナー決定 2026-10-09）。件数 0／1 以上の出し分けは KumoriPage。
// metadata と構造化データ（BreadcrumbList）は、これまでの /beauty（components/portal/VerticalHub.tsx）と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("beauty");
}

export default function Page() {
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
