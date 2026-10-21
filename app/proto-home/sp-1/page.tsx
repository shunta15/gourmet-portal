import type { Metadata } from "next";
import Page from "@/components/portal/hproto/machi2/Page";
import CatsD from "@/components/portal/hproto/machi2/cats/d/CatsD";
import { CATCH, P2, P3 } from "@/components/portal/hproto/machi2/copy";
import { latestNews } from "@/components/portal/hproto/machi2/news";
import { seasonNowJst } from "@/components/portal/hproto/machi2/season";
import { cardPhotos } from "@/components/portal/hproto/machi2/cards";

// 余白パターン 1「水彩の葉と淡い色の帯」。中身・文・リンク・最新情報は /proto-home/cat-d(業種の札 = CatsD)と同じ。違うのは余白の見せ方だけ(layout.tsx の .h2-sp1 + space-1.css)。
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: CATCH, description: `${P2.replace("\n", "")}${P3.replace("\n", "")}`, robots: { index: false, follow: false } };

export default async function Route() {
  return <Page mihon={false} season={seasonNowJst()} prod news={latestNews(4)} cards={await cardPhotos()} airy cats={<CatsD />} />;
}
