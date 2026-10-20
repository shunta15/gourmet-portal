import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { BODYCARE_SHOP_DESIGN } from "@/lib/portal/vert/bodycareStructure";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアの店のページ(/bodycare/shop/<id>)だけの枠。見た目は lib/portal/vert/bodycareDesign.ts の BODYCARE_DESIGN で選ぶ。
//   "green"  : 案4「グリーン」の枠(GreenShell。自前のヘッダー・フッター)。
//   "current": 案(a・b・c)は 1 画面の中に自前のヘッダーを持つので、共通ヘッダーなし・共通フッターあり(hub)。
//              BODYCARE_SHOP_DESIGN が "legacy" のときは、これまでの共通ヘッダー付きの枠(app/bodycare/(sub)/layout.tsx と同じ)。URL に (shop) は出ない。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (BODYCARE_DESIGN === "green") {
    assertPortalLive();
    return <GreenShell>{children}</GreenShell>;
  }
  return <PortalLayout hub={BODYCARE_SHOP_DESIGN !== "legacy"}>{children}</PortalLayout>;
}
