import PortalFooter from "./PortalFooter";

/**
 * 総合サイトの各セグメントのレイアウト共通部品（サーバー）。ページの後ろにフッターを出す。
 * ヘッダーは components/SiteShell（クライアント）が isPortalPath で出す。フッターは件数などの実データが要るので、
 * クライアントに実データを入れないよう、こちら（サーバー）から出す。
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PortalFooter />
    </>
  );
}
