import "@/components/portal/portal.css";
import "@/components/portal/omakase.css";
import PortalLayout from "@/components/portal/PortalLayout";

// おまかせ提案（/omakase）。総合サイト用の CSS とフッター、このページ専用の CSS（omakase.css）を出す。
// ヘッダーは components/portal/PortalShell が isPortalPath で出す。公開スイッチ OFF のあいだは PortalLayout が 404 にする。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
