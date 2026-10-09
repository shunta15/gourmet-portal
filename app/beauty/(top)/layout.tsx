import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";

// ビューティーのトップ（/beauty）だけの枠。共通ヘッダーなし・共通フッターあり（曇り鏡は 1 画面の中に自前のロゴ・「さがす」を持つ。総合トップ app/portal-home と同じ hub の枠）。
// その下のページ（種類・都道府県・利用シーン・店ページなど）は app/beauty/(sub)/layout.tsx の枠（共通ヘッダーあり）のまま。URL に (top) (sub) は出ない。
// 公開スイッチ OFF のときは PortalLayout が 404 にする（/beauty は今までどおり 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub>{children}</PortalLayout>;
}
