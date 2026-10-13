import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { assertPortalLive } from "@/lib/portal/launch";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";

// 候補リスト（/list）。総合サイト用の CSS とフッターを出す。ヘッダーは components/portal/PortalShell が isPortalPath で出す。
// RELEASE_PERIPHERY が true のあいだは、周りのページと同じ枠（上端の竿の帯・ヘッダー・フッター。components/portal/periphery/PeripheryFrame）をページが自分で出すので、
// ここでは総合サイトのヘッダー・フッター（PortalLayout）を出さず、<main> だけ。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (RELEASE_PERIPHERY) {
    assertPortalLive();
    return <main id="mp-main" tabIndex={-1}>{children}</main>;
  }
  return <PortalLayout>{children}</PortalLayout>;
}
