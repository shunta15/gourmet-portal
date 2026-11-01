import { assertPortalLive } from "@/lib/portal/launch";
import { mincho, gothic, script } from "@/components/portal/gnoren/common/fonts";
import "@/components/portal/gnoren/common/base.css";

// 本番のグルメ(/gourmet 系の内部ルート。公開スイッチ ON のときだけ。OFF は 404)。暖簾 2 の枠(components/portal/gnoren)。
// このレイアウトはフォントと base.css の読み込みだけ。ヘッダー・フッターは各 page.tsx が <Shell page=... links={GN_LIVE_LINKS}> で付ける
// (ナビの下線のタブがページごとに違うため)。構成は components/portal/gnoren/real/README.md。
// ヘッダー等のシェルは、components/portal/PortalShell が isPortalPath('/gourmet') で SiteShell の代わりに子だけを出す。
export default function Layout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return <div className={`${mincho.variable} ${gothic.variable} ${script.variable}`}>{children}</div>;
}
