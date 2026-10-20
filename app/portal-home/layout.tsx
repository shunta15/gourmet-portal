import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import MachiShell from "@/components/portal/hproto/machi2/MachiShell";
import "@/components/portal/hproto/machi2/airy.css";
import "@/components/portal/hproto/machi2/simple.css";
import { HOME_AIRY, HOME_DESIGN, HOME_SIMPLE } from "@/lib/portal/homeDesign";
import { assertPortalLive } from "@/lib/portal/launch";

// 総合トップ（公開スイッチ ON のときの `/`。next.config.ts の rewrites で `/` がここに来る）。
// 見た目は lib/portal/homeDesign.ts の HOME_DESIGN で選ぶ（この 1 つの定数で戻せる）。
//   "machi2": 「まち」改（自前のヘッダー・フッターを持つので、共通のヘッダー・フッター・PortalMotion は出さない）。
//   "nigiwai": 従来の「にぎわいの輪」（総合サイト用の CSS portal.css と、共通フッターを PortalLayout が出す）。
// どちらも、公開スイッチ OFF のあいだは 404（assertPortalLive。/portal-home という URL は公開しない）。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (HOME_DESIGN === "machi2") {
    assertPortalLive();
    // airy.css / simple.css は .h2-airy / .h2-simple の下の規則だけなので、定数が false のときは読み込んでも見た目は変わらない
    return <MachiShell prod airy={HOME_AIRY} simple={HOME_SIMPLE}>{children}</MachiShell>;
  }
  return <PortalLayout hub>{children}</PortalLayout>;
}
