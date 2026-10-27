import "@/components/portal/portal.css";
import CpFrame from "@/components/portal/colorplay/Frame";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";

// ビューティーのトップ（/beauty）だけの枠。COLOR PLAY の外枠（ヘッダー・フッターは各ページが出す）。
// その下のページ（種類・都道府県・利用シーン・特集など）は app/beauty/(sub)/(portal)/layout.tsx の枠（共通ヘッダーあり）のまま。URL に (top) (sub) (cp) は出ない。
// 公開スイッチ OFF のときは 404 にする（/beauty は今までどおり 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CpFrame site={BEAUTY_SITE}>{children}</CpFrame>;
}
