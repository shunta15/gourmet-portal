import "@/components/portal/portal.css";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";
import { assertPortalLive } from "@/lib/portal/launch";

// 総合トップ（公開スイッチ ON のときの `/`。next.config.ts の rewrites で `/` がここに来る）。
// 見た目は「まち」改（components/portal/hproto/machi2）だけ。自前のヘッダー・フッターを持つので、共通のヘッダー・フッター・PortalMotion は出さない。
// portal.css は、これまでどおり総合トップの CSS にも載せる（本番の出力を変えないため）。
// 公開スイッチ OFF のあいだは 404（assertPortalLive。/portal-home という URL は公開しない）。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <MachiShell>{children}</MachiShell>;
}
