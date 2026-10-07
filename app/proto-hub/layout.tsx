import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { assertPreviewOrLocal } from "@/lib/portal/launch";

// 総合トップ「にぎわいの輪」を、色を固定して見るルート（プレビュー・ローカル専用）。/proto-hub/nigiwai（総合トップ `/` と同じ）と、/proto-hub/nigiwai/<色>。
// 総合トップ（app/portal-home）と同じ枠（共通ヘッダーなし・フッターあり）。にぎわいの輪の CSS はページが読む。
// 404 になる条件: 公開スイッチ OFF（PortalLayout と next.config.ts の PORTAL_OFF_SOURCES）、または プレビュー・ローカルでない（本番は、公開スイッチ ON でも 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPreviewOrLocal();
  return <PortalLayout hub>{children}</PortalLayout>;
}
