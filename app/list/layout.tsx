import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 候補リスト（/list）。総合サイト用の CSS とフッターを出す。ヘッダーは components/portal/PortalShell が isPortalPath で出す。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
