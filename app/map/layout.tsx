import "@/components/portal/portal.css";

// 地図で探す（/map）。総合サイト用の CSS を引く。ヘッダー・フッターは components/SiteShell が isPortalPath で出す。
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
