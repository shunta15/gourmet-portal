import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 総合トップ（公開スイッチ ON のときの `/`。next.config.ts の rewrites で `/` がここに来る）。
// 総合サイト用の CSS とフッターを出す。ヘッダーは components/portal/PortalShell が isPortalPath で出す。
// OFF のあいだは PortalLayout が 404 にする（/portal-home という URL は公開しない）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
