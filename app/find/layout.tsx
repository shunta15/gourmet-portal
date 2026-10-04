import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// サイト内検索の結果（/find）。総合サイト用の CSS とフッターを出す。ヘッダーは components/SiteShell が isPortalPath で出す。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
