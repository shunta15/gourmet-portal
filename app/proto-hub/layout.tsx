import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 総合トップ 5案の見比べ（試作・非公開）。/proto-hub/<案の名前>
// 総合トップ（app/portal-home）と同じ枠（共通ヘッダーなし・フッターあり）。各案の CSS は各案のページが読む。
// 公開スイッチ OFF のあいだは PortalLayout が 404 にする（next.config.ts の PORTAL_OFF_SOURCES にも登録済み）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub>{children}</PortalLayout>;
}
