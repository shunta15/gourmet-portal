import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { BODYCARE_TOP } from "@/lib/portal/vert/bodycareTop";

// ボディケアのトップ（/bodycare）だけの枠。「転がし」は 1 画面の中に自前のロゴ・「さがす」を持つので、共通ヘッダーなし・共通フッターあり
// （ビューティーの app/beauty/(top)/layout.tsx と同じ hub の枠）。lib/portal/vert/bodycareTop.ts を "legacy" にすると、これまでの共通ヘッダー付きの枠に戻る。
// その下のページ（種類・都道府県・利用シーン・店ページなど）は app/bodycare/(sub)/layout.tsx の枠（共通ヘッダーあり）のまま。URL に (top) (sub) は出ない。
// 公開スイッチ OFF のときは PortalLayout が 404 にする（/bodycare は今までどおり 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub={BODYCARE_TOP === "korogashi"}>{children}</PortalLayout>;
}
