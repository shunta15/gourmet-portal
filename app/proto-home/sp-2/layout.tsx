import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";
import "@/components/portal/hproto/machi2/space/2/sp2.css";
import SpaceReveal from "@/components/portal/hproto/machi2/space/2/SpaceReveal";

// 総合トップの試作「余白パターン 2 紙と罫線、小さな絵」(本番の総合トップ = machi2 の部品をそのまま使い、<div class="h2-sp2"> で包んで、地・節の間・左右の飾りだけ sp2.css で変える)。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className="h2-sp2">
      <SpaceReveal />
      <MachiShell prod airy simple>{children}</MachiShell>
    </div>
  );
}
