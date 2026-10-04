import "@/components/portal/portal.css";
import "@/components/portal/photos.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 写真から探す（/photos）。総合サイト用の CSS とフッター、このページ専用の CSS（photos.css）を出す。
// ヘッダーは components/SiteShell が isPortalPath で出す。公開スイッチ OFF のあいだは PortalLayout が 404 にする。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
