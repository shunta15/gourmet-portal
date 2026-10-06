import PortalFooter from "./PortalFooter";
import PortalHeader from "./PortalHeader";
import PortalMotion from "./PortalMotion";
import { assertPortalLive } from "@/lib/portal/launch";

/**
 * 総合サイトの各セグメントのレイアウト共通部品（サーバー）。専用ヘッダー・本文（<main>）・フッターを出す。
 * 使うのは app/{area,station,map,videos,find,beauty,bodycare,pet,leisure,stay,portal-home}/layout.tsx。
 * hub: 総合トップ（輪）だけ true。共通ヘッダーと PortalMotion を出さない（1 画面の中に自前のロゴ・検索の入口がある）。
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
export default function PortalLayout({ children, hub = false }: { children: React.ReactNode; hub?: boolean }) {
  assertPortalLive();
  return (
    <div className={hub ? "mp mp-hubpage" : "mp"}>
      <a className="mp-skip" href="#mp-main">本文へ移動</a>
      {/* 総合トップ（hub）は、1 画面の中に自前のロゴと検索の入口を持つので、共通ヘッダーは出さない */}
      {!hub && <PortalHeader />}
      <main id="mp-main" tabIndex={-1}>
        {children}
        {hub ? (
          <div id="mp-footer">
            <PortalFooter />
          </div>
        ) : (
          <PortalFooter />
        )}
      </main>
      {!hub && <PortalMotion />}
    </div>
  );
}
