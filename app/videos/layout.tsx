import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { assertPortalLive } from "@/lib/portal/launch";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";

// 動画で探す（/videos 以下）。総合サイト用の CSS とフッターを出す。ヘッダーは components/SiteShell が isPortalPath で出す。
// RELEASE_PERIPHERY が true のあいだは、/feature と同じ世界の枠（上端の竿の帯・ヘッダー・フッター。components/portal/periphery/PeripheryFrame）を各ページが自分で出すので、
// ここでは総合サイトのヘッダー・フッター（PortalLayout）を出さず、<main> だけ（見つからないときも同じ）。公開スイッチ OFF のあいだは今までどおり 404。
export default function Layout({ children }: { children: React.ReactNode }) {
  if (RELEASE_PERIPHERY) {
    assertPortalLive();
    return <main id="mp-main" tabIndex={-1}>{children}</main>;
  }
  return <PortalLayout>{children}</PortalLayout>;
}
