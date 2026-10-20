import type { Metadata } from "next";
import Page from "@/components/portal/hproto/machi2/Page";
import { CATCH, P2, P3 } from "@/components/portal/hproto/machi2/copy";
import { latestNews } from "@/components/portal/hproto/machi2/news";
import { seasonNowJst } from "@/components/portal/hproto/machi2/season";

// 本番(app/portal-home)と同じ中身・文・リンク(prod の形)。違うのは airy(帯を出さない)と airy.css の余白・飾りだけ。
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: CATCH, description: `${P2.replace("\n", "")}${P3.replace("\n", "")}`, robots: { index: false, follow: false } };

export default function Route() {
  return <Page mihon={false} season={seasonNowJst()} prod news={latestNews(4)} airy />;
}
