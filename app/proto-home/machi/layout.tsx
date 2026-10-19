import type { Metadata } from "next";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi/MachiShell";
import { CATCH, P2, P3 } from "@/components/portal/hproto/machi/copy";

// 総合トップの試作「まち」(見本の完全再現)。プレビュー・ローカル専用(本番は 404)。
// title・description はコンセプトの言葉(キャッチコピーと第 2・3 段落)
export const metadata: Metadata = { title: CATCH, description: `${P2.replace("\n", "")}${P3.replace("\n", "")}`, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <MachiShell>{children}</MachiShell>;
}
