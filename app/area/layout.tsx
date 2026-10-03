import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 業種横断の街（/area/{pref}）。総合サイト用の CSS とフッターを出す。ヘッダーは components/SiteShell が isPortalPath で出す。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
