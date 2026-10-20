import type { Metadata } from "next";
import "@/components/portal/portal.css";
import { assertPreviewOrLocal } from "@/lib/portal/launch";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";
import "@/components/portal/hproto/machi2/space/1/space-1.css";

// 総合トップの試作「余白パターン 1 水彩の葉と淡い色の帯」(本番の総合トップ = machi2 の部品をそのまま使い、節と節の間・ページの地・左右の余白の見せ方だけを space-1.css で変える)。
// 飾りは全部 .h2-sp1 の下の CSS(節の ::before/::after)で描く。ほかのルート(/ ・ /proto-home/cat-d など)には効かない。
// プレビュー・ローカル専用(本番は 404)。検索エンジンに載せない。
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return (
    <div className="h2-sp1">
      <MachiShell prod airy simple>{children}</MachiShell>
    </div>
  );
}
