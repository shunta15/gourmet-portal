import type { Metadata } from "next";
import Page from "@/components/portal/hproto/machi2/Page";
import { MIHON_TITLE } from "@/components/portal/hproto/machi2/copy";

// 見本の最初の画面の文のまま(見比べ用)
export const metadata: Metadata = { title: `${MIHON_TITLE} — マチノワ`, robots: { index: false, follow: false } };

export default function Route() {
  return <Page mihon />;
}
