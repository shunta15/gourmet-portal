import GreenSearch from "@/components/portal/bcproto/green/search/GreenSearch";
import JsonLd from "@/components/portal/JsonLd";
import { bodySearchMetadata } from "@/lib/portal/vert/bodysearch/metadata";
import { assertPortalLive } from "@/lib/portal/launch";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";

// さがす専用ページ。状態は URL の引数(kind・pref・tag・q・sort・n)。見た目は案4 の GreenSearch。
// metadata(題・説明・正規 URL・noindex の判定)は bodySearchMetadata(lib/portal/vert/bodysearch/metadata.ts)、構造化データ(BreadcrumbList)もここで出す。
type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  return bodySearchMetadata(await searchParams);
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  const sp = await searchParams;
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
