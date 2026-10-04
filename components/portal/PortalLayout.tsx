import PortalFooter from "./PortalFooter";
import PortalHeader from "./PortalHeader";
import PortalMotion from "./PortalMotion";
import { assertPortalLive } from "@/lib/portal/launch";

/**
 * 総合サイトの各セグメントのレイアウト共通部品（サーバー）。専用ヘッダー・本文（<main>）・フッターを出す。
 * 使うのは app/{area,station,map,videos,find,beauty,bodycare,pet,leisure,stay,portal-home}/layout.tsx。
 *
 * ヘッダー（クライアント部品）をルートの SiteShell ではなくここで出すのは、グルメの全ページの JS に
 * 総合サイトのヘッダーの JS を混ぜないため（公開スイッチ OFF の本番を main と同じに保つ。proto-portal/LAUNCH.md）。
 * 総合サイトの別セグメントへ移るとヘッダーが作り直されるが、メニュー・検索の開閉はページ移動で閉じるので見た目は変わらない。
 * フッターは件数などの実データが要るので、クライアントに実データを入れないよう、サーバーのここから出す。
 * `<main>` の中にフッターまで入る（従来の SiteShell が <main> で子を包み、子の末尾にフッターがあった構造のまま）。
 *
 * 公開スイッチ（lib/portal/launch.ts）が OFF のあいだは、このレイアウトの下の全ルートが 404 になる。
 * notFound() はレイアウトの外側（ルートの app/not-found.tsx＝グルメの見た目）で出るので、`/zzz` と同じ 404 になる。
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  assertPortalLive();
  return (
    <div className="mp">
      <a className="mp-skip" href="#mp-main">本文へ移動</a>
      <PortalHeader />
      <main id="mp-main" tabIndex={-1}>
        {children}
        <PortalFooter />
      </main>
      <PortalMotion />
    </div>
  );
}
