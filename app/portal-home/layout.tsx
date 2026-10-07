import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// 総合トップ（公開スイッチ ON のときの `/`。next.config.ts の rewrites で `/` がここに来る）。
// 総合サイト用の CSS（フッターの見た目を含む portal.css）を読み、フッターを出す。にぎわいの輪の CSS は NigiwaiPage が読む。
// ヘッダーは共通のものを出さない（輪の画面の中に、ロゴと検索の入口がある）。
// フッターの色をにぎわいの輪の配色に合わせる指定（nigiwai.css の body:has(.ngp)）は、`/` でも効く。
// OFF のあいだは PortalLayout が 404 にする（/portal-home という URL は公開しない）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub>{children}</PortalLayout>;
}
