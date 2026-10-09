import { assertPortalLive } from "@/lib/portal/launch";
import NorenFrame from "@/components/portal/noren/NorenFrame";
import { FOOT_NAV_LIVE_EXTRA, GOURMET_TOP } from "@/lib/portal/noren/nav";

// 本番のグルメのトップ /gourmet（公開スイッチ ON のときだけ。OFF は 404）。暖簾の枠（見本 /proto-noren と共通の NorenFrame）で包む。
// ヘッダー等のシェルは、components/portal/PortalShell が isPortalPath('/gourmet') で SiteShell の代わりに子だけを出す。
// 店ページ・特集記事ページはこの枠ではなく、今のグルメのまま（このレイアウトは /gourmet だけ）。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return (
    <NorenFrame top={GOURMET_TOP} footExtra={FOOT_NAV_LIVE_EXTRA}>
      {children}
    </NorenFrame>
  );
}
