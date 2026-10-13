import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { bodycareSearchOn } from "@/lib/portal/vert/bodycareStructure";

// ボディケアの「さがす」(/bodycare/search)の枠。さがすにまとまる構成のとき(lib/portal/vert/bodycareStructure.ts)は、1 画面の中に自前のロゴを持つ作りなので、共通ヘッダーなし・共通フッターあり(hub)。
// そうでないとき(本番は今のまま)は、これまでの共通ヘッダー付きの枠(/bodycare/search は 404。出力は今までと同じ)。
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout hub={bodycareSearchOn()}>{children}</PortalLayout>;
}
