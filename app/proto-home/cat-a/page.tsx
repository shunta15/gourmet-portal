import type { Metadata } from "next";
import Page from "@/components/portal/hproto/machi2/Page";
import CatsA from "@/components/portal/hproto/machi2/cats/a/CatsA";
import { CATCH, P2, P3 } from "@/components/portal/hproto/machi2/copy";
import { latestNews } from "@/components/portal/hproto/machi2/news";
import { seasonNowJst } from "@/components/portal/hproto/machi2/season";
import { cardPhotos } from "@/components/portal/hproto/machi2/cards";

// 本番(app/portal-home)と同じ中身・文・リンク・最新情報(prod の形)。違うのは業種の節だけ(案A「誌面」= CatsA)。
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: CATCH, description: `${P2.replace("\n", "")}${P3.replace("\n", "")}`, robots: { index: false, follow: false } };

export default async function Route() {
  return <Page mihon={false} season={seasonNowJst()} prod news={latestNews(4)} cards={await cardPhotos()} airy cats={<CatsA />} />;
}
