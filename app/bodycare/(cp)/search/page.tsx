import { notFound } from "next/navigation";
import BodySearch, { bodySearchMetadata } from "@/components/portal/vert/bodysearch/BodySearch";
import GreenSearch from "@/components/portal/bcproto/green/search/GreenSearch";
import JsonLd from "@/components/portal/JsonLd";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { bodycareSearchOn } from "@/lib/portal/vert/bodycareStructure";
import { assertPortalLive } from "@/lib/portal/launch";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

// さがす専用ページ(さがすにまとまる構成のときだけ。本番は今のまま=404)。状態は URL の引数(kind・pref・tag・q・sort・n)。
// 見た目は lib/portal/vert/bodycareDesign.ts の BODYCARE_DESIGN で選ぶ("green" = 案4 の GreenSearch / "current" = 今の BodySearch)。
// metadata(題・説明・正規 URL・noindex の判定)は bodySearchMetadata のまま、構造化データ(BreadcrumbList)も同じ内容。
type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  return bodycareSearchOn() ? bodySearchMetadata(await searchParams) : notFoundMetadata();
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  if (!bodycareSearchOn()) notFound();
  const sp = await searchParams;
  if (BODYCARE_DESIGN !== "green") return <BodySearch sp={sp} />;
  const v = VERTICALS.bodycare;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "店をさがす", url: absUrl("/bodycare/search") },
  ]);
  return (
    <>
      <JsonLd data={ld} />
      <GreenSearch sp={sp} />
    </>
  );
}
