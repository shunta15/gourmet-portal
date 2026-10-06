import "@/components/portal/portal.css";
import "@/components/portal/hub/hub.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 総合トップ（公開スイッチ ON のときの `/`。next.config.ts の rewrites で `/` がここに来る）。
// 総合サイト用の CSS（フッターの見た目を含む portal.css）と、輪の CSS（hub.css）を読み、フッターを出す。
// ヘッダーは共通のものを出さない（輪の画面の中に、ロゴと検索の入口がある）。
// OFF のあいだは PortalLayout が 404 にする（/portal-home という URL は公開しない）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub>{children}</PortalLayout>;
}
