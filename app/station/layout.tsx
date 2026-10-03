import "@/components/portal/portal.css";

// 駅から探す（/station 以下）。総合サイト用の CSS を引く。ヘッダー・フッターは components/SiteShell が isPortalPath で出す。
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
