import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import GreenShell from "@/components/portal/bcproto/green/common/GreenShell";
import { BODYCARE_DESIGN } from "@/lib/portal/vert/bodycareDesign";
import { assertPortalLive } from "@/lib/portal/launch";

// ボディケアの下の階層(特集記事 /bodycare/special など。種類・都道府県・利用シーン・旧特集は next.config.ts の 308 転送で、ここまで来ない)。
// 見た目は lib/portal/vert/bodycareDesign.ts の BODYCARE_DESIGN で選ぶ。"green" は案4の枠(GreenShell)、"current" はこれまでの共通ヘッダー付きの枠。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (BODYCARE_DESIGN === "green") {
    assertPortalLive();
    return <GreenShell>{children}</GreenShell>;
  }
  return <PortalLayout>{children}</PortalLayout>;
}
