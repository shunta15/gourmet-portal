import { notFound } from "next/navigation";
import BodySearch, { bodySearchMetadata } from "@/components/portal/vert/bodysearch/BodySearch";
import { notFoundMetadata } from "@/components/portal/pages/data";
import { bodycareSearchOn } from "@/lib/portal/vert/bodycareStructure";
import { assertPortalLive } from "@/lib/portal/launch";

// さがす専用ページ(さがすにまとまる構成のときだけ。本番は今のまま=404)。状態は URL の引数(kind・pref・tag・q・sort・n)。
type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  return bodycareSearchOn() ? bodySearchMetadata(await searchParams) : notFoundMetadata();
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  assertPortalLive();
  if (!bodycareSearchOn()) notFound();
  return <BodySearch sp={await searchParams} />;
}
