import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { bodycareSearchOn } from "@/lib/portal/vert/bodycareStructure";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアの「さがす」(/bodycare/search)の枠。見た目は lib/portal/vert/bodycareDesign.ts の BODYCARE_DESIGN で選ぶ。
//   "green"  : 案4「グリーン」の枠(GreenShell。自前のヘッダー・フッター)。
//   "current": さがすにまとまる構成のとき(lib/portal/vert/bodycareStructure.ts)は、1 画面の中に自前のロゴを持つ作りなので、共通ヘッダーなし・共通フッターあり(hub)。
//              そうでないとき(本番は今のまま)は、これまでの共通ヘッダー付きの枠(/bodycare/search は 404。出力は今までと同じ)。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (BODYCARE_DESIGN === "green") {
    assertPortalLive();
    return <GreenShell>{children}</GreenShell>;
  }
  return <PortalLayout hub={bodycareSearchOn()}>{children}</PortalLayout>;
}
