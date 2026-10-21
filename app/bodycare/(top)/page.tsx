import JsonLd from "@/components/portal/JsonLd";
import GreenTop from "@/components/portal/bcproto/green/top/GreenTop";
import { countPlaces } from "@/lib/places";
import { VERTICALS } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl, fillTitle } from "@/lib/seo/util";

// ボディケアの入口(/bodycare)。案4「グリーン」(components/portal/bcproto/green/top/GreenTop)。
// metadata(題・正規 URL・件数ゲート)と構造化データ(BreadcrumbList)。説明文の「利用シーン」は直してある(ボディケアに利用シーンは無い)。
export async function generateMetadata() {
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
  const v = VERTICALS.bodycare;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
  ]);
  return (
    <>
      <JsonLd data={ld} />
      <GreenTop />
    </>
  );
}
