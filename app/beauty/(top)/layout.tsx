import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import CpFrame from "@/components/portal/colorplay/Frame";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";
import { isColorplay } from "@/lib/portal/verticalDesign";

// ビューティーのトップ（/beauty）だけの枠。
// COLOR PLAY（lib/portal/verticalDesign.ts の VERTICAL_DESIGN.beauty）のときは、COLOR PLAY の外枠（ヘッダー・フッターは各ページが出す）。
// "legacy" に戻すと、これまでの枠（共通ヘッダーなし・共通フッターあり。曇り鏡は 1 画面の中に自前のロゴ・「さがす」を持つ。総合トップ app/portal-home と同じ hub の枠）。
// その下のページ（種類・都道府県・利用シーン・特集など）は app/beauty/(sub)/layout.tsx の枠（共通ヘッダーあり）のまま。URL に (top) (sub) (cp) は出ない。
// 公開スイッチ OFF のときはどちらの枠も 404 にする（/beauty は今までどおり 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (isColorplay("beauty")) return <CpFrame site={BEAUTY_SITE}>{children}</CpFrame>;
  return <PortalLayout hub>{children}</PortalLayout>;
}
