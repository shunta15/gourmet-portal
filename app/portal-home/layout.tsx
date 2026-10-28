import "@/components/portal/portal.css";
import { HomeShell } from "@/components/portal/hproto/homeDesign";
import { assertPortalLive } from "@/lib/portal/launch";

// 総合トップ（公開スイッチ ON のときの `/`。next.config.ts の rewrites で `/` がここに来る）。
// 見た目は components/portal/hproto/homeDesign.tsx で選ぶ（今は見本4・丸い切り抜き。前の「まち」改 machi2 にもそこで戻せる）。
// 自前のヘッダー・フッターを持つので、共通のヘッダー・フッター・PortalMotion は出さない。
// portal.css は、これまでどおり総合トップの CSS にも載せる（本番の出力を変えないため）。
// 公開スイッチ OFF のあいだは 404（assertPortalLive。/portal-home という URL は公開しない）。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <HomeShell>{children}</HomeShell>;
}
