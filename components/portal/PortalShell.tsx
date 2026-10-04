"use client";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import Cursor from "../Cursor";
import SiteShell from "../SiteShell";
import { isPortalPath } from "./isPortalPath";

/**
 * 総合サイトの公開スイッチ（lib/portal/launch.ts）が ON のときだけ、ルートレイアウト（app/layout.tsx）が
 * 既存の components/SiteShell の代わりに出すシェル。
 *   - 総合サイト（/・/area/**・/station/**・/videos/**・/map・/find・新業種）: グルメのヘッダー・サイドラベル等は出さず、
 *     子（各セグメントの PortalLayout。専用ヘッダー・フッター・<main>）だけを出す。
 *   - それ以外（グルメの既存ページ・/admin など）: 従来の SiteShell をそのまま出す。
 * OFF のあいだ、ルートレイアウトはこのファイルを描画しない。SiteShell は main から変えていない。
 *
 * ここには総合サイトのヘッダーの JS を入れない（入れると、描画しなくても JS がグルメの全ページに混ざる。
 * Next.js は、静的 import・動的 import（サーバーコンポーネント側）・next/dynamic のどれでも、ページの入口から辿れる
 * クライアント部品の JS を、描画の有無に関わらず読み込ませる。proto-portal/compare-off.mjs の JS 検査で確認）。
 * ヘッダー等は、総合サイトのルートだけが使う components/portal/PortalLayout（サーバー）から出す。
 */
export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 該当ルートが無い URL（グローバル 404）は、静的に作られた 404 の HTML と手元のパスが食い違い
  // ハイドレーションエラーになるので、セグメントが "/_not-found" のときは従来どおりの見た目にする。
  const segment = useSelectedLayoutSegment();
  const isPortal = segment !== "/_not-found" && isPortalPath(pathname);

  if (isPortal) {
    return (
      <>
        <Cursor />
        {children}
      </>
    );
  }

  return <SiteShell>{children}</SiteShell>;
}
