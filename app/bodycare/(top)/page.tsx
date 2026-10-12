import JsonLd from "@/components/portal/JsonLd";
import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";
import KorogashiPage from "@/components/portal/vert/korogashi/KorogashiPage";
import { BODYCARE_TOP } from "@/lib/portal/vert/bodycareTop";
import { VERTICALS } from "@/lib/verticals";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

// ボディケアの入口は「転がし」のデザイン（オーナー決定 2026-10-13）。種類・都道府県・利用シーンの件数と 0 件の出し分けは KorogashiPage。
// metadata と構造化データ（BreadcrumbList）は、これまでの /bodycare（components/portal/VerticalHub.tsx）と同じ。
// lib/portal/vert/bodycareTop.ts を "legacy" にすると、これまでの共通の入口（VerticalHub）に戻る。
export async function generateMetadata() {
  return verticalHubMetadata("bodycare");
}

export default function Page() {
  if (BODYCARE_TOP === "legacy") return <VerticalHub vertical="bodycare" />;
  const v = VERTICALS.bodycare;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
  ]);
  return (
    <>
      <JsonLd data={ld} />
      <KorogashiPage />
    </>
  );
}
