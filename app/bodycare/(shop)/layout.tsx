import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { BODYCARE_SHOP_DESIGN } from "@/lib/portal/vert/bodycareStructure";

// ボディケアの店のページ(/bodycare/shop/<id>)だけの枠。案(a・b・c)は 1 画面の中に自前のヘッダーを持つので、共通ヘッダーなし・共通フッターあり(hub)。
// "legacy" のときは、これまでの共通ヘッダー付きの枠(app/bodycare/(sub)/layout.tsx と同じ)。URL に (shop) は出ない。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub={BODYCARE_SHOP_DESIGN !== "legacy"}>{children}</PortalLayout>;
}
