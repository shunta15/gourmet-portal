import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { BODYCARE_TOP } from "@/lib/portal/vert/bodycareTop";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアのトップ（/bodycare）だけの枠。見た目は lib/portal/vert/bodycareDesign.ts の BODYCARE_DESIGN で選ぶ（この 1 つの定数で戻せる）。
//   "green"  : 案4「グリーン」。自前のヘッダー・フッターを持つので、共通のヘッダー・フッター・PortalMotion は出さない（GreenShell）。
//   "current": これまでの枠。「転がし」は 1 画面の中に自前のロゴ・「さがす」を持つので、共通ヘッダーなし・共通フッターあり
//              （ビューティーの app/beauty/(top)/layout.tsx と同じ hub の枠）。lib/portal/vert/bodycareTop.ts を "legacy" にすると、共通ヘッダー付きの枠に戻る。
// その下のページ（探す・店・特集記事）は (cp)(shop)(sub) の layout が同じ定数で切り替える。URL に (top) (sub) は出ない。
// 公開スイッチ OFF のときは 404 になる（/bodycare は今までどおり 404）。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (BODYCARE_DESIGN === "green") {
    assertPortalLive();
    return <GreenShell>{children}</GreenShell>;
  }
  return <PortalLayout hub={BODYCARE_TOP === "korogashi"}>{children}</PortalLayout>;
}
