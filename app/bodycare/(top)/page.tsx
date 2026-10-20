import JsonLd from "@/components/portal/JsonLd";
import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";
import KorogashiPage from "@/components/portal/vert/korogashi/KorogashiPage";
import GreenTop from "@/components/portal/bcproto/green/top/GreenTop";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { BODYCARE_TOP } from "@/lib/portal/vert/bodycareTop";
import { countPlaces } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl, fillTitle } from "@/lib/seo/util";

// ボディケアの入口(/bodycare)。見た目は lib/portal/vert/bodycareDesign.ts の BODYCARE_DESIGN で選ぶ(この 1 つの定数で戻せる)。
//   "green"  : 案4「グリーン」(components/portal/bcproto/green/top/GreenTop)。
//   "current": 「転がし」(オーナー決定 2026-10-13。lib/portal/vert/bodycareTop.ts を "legacy" にするとこれまでの共通の入口 VerticalHub)。
// metadata(題・正規 URL・件数ゲート)と構造化データ(BreadcrumbList)は、どちらも同じ。"green" は説明文の「利用シーン」を直す(ボディケアに利用シーンは無い)。
export async function generateMetadata() {
  if (BODYCARE_DESIGN !== "green") return verticalHubMetadata("bodycare");
  const v = VERTICALS.bodycare;
  const count = await countPlaces("bodycare");
  const counts = await Promise.all(v.categories.map((c) => countPlaces("bodycare", { category: c.slug })));
  const names = v.categories.filter((_, i) => counts[i] > 0).map((c) => c.name).join("・");
  return buildMetadata({
    vertical: "bodycare",
    title: fillTitle(v.titleTemplates.top, { name: v.name, brand: v.brand }),
    description: `${v.brand}。${names}の店を、エリア・種類・こだわりから探せる入口です。`,
    path: v.path,
    count,
  });
}

export default function Page() {
  if (BODYCARE_DESIGN !== "green" && BODYCARE_TOP === "legacy") return <VerticalHub vertical="bodycare" />;
  const v = VERTICALS.bodycare;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
  ]);
  return (
    <>
      <JsonLd data={ld} />
      {BODYCARE_DESIGN === "green" ? <GreenTop /> : <KorogashiPage />}
    </>
  );
}
