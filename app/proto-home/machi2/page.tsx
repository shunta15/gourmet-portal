import type { Metadata } from "next";
import Page from "@/components/portal/hproto/machi2/Page";
import { CATCH, P2, P3 } from "@/components/portal/hproto/machi2/copy";
import { seasonNowJst } from "@/components/portal/hproto/machi2/season";

// 最初の季節を日本時間の今日の月で決めるので、リクエストごとに作る(静的に固めない)
export const dynamic = "force-dynamic";

// title = キャッチコピー、description = 第 2 段落+第 3 段落(改行を除く)
export const metadata: Metadata = { title: CATCH, description: `${P2.replace("\n", "")}${P3.replace("\n", "")}`, robots: { index: false, follow: false } };

export default function Route() {
  return <Page mihon={false} season={seasonNowJst()} />;
}
