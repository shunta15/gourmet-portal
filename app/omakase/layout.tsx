import "@/components/portal/portal.css";
import "@/components/portal/omakase.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { assertPortalLive } from "@/lib/portal/launch";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";

// おまかせ提案（/omakase）。総合サイト用の CSS とフッター、このページ専用の CSS（omakase.css）を出す。
// ヘッダーは components/portal/PortalShell が isPortalPath で出す。公開スイッチ OFF のあいだは PortalLayout が 404 にする。
// RELEASE_PERIPHERY が true のあいだは、周りのページと同じ枠（上端の竿の帯・ヘッダー・フッター。components/portal/periphery/PeripheryFrame）をページが自分で出すので、
// ここでは総合サイトのヘッダー・フッター（PortalLayout）を出さず、<main> だけ。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (RELEASE_PERIPHERY) {
    assertPortalLive();
    return <main id="mp-main" tabIndex={-1}>{children}</main>;
  }
  return <PortalLayout>{children}</PortalLayout>;
}
