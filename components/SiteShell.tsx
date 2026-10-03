"use client";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";
import Cursor from "./Cursor";
import ProgressBar from "./ProgressBar";
import Nav from "./Nav";
import SideLabel from "./SideLabel";
import PortalHeader from "./portal/PortalHeader";
import PortalMotion from "./portal/PortalMotion";
import { isPortalPath } from "./portal/isPortalPath";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  // 総合サイト（/・/area/**・新業種）だけ専用のヘッダーを出す（フッターは各レイアウトから）。グルメ側の出力は下の既存の分岐のまま。
  // 該当ルートが無い URL（グローバル 404）は、静的に作られた 404 の HTML と手元のパスが食い違い
  // ハイドレーションエラーになるので、セグメントが "/_not-found" のときは従来どおりの見た目にする。
  const segment = useSelectedLayoutSegment();
  const isPortal = segment !== "/_not-found" && isPortalPath(pathname);

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("no-cursor");
    } else {
      document.body.classList.remove("no-cursor");
    }
  }, [isAdmin]);

  if (isPortal) {
    return (
      <>
        <Cursor />
        <div className="mp">
          <a className="mp-skip" href="#mp-main">本文へ移動</a>
          <PortalHeader />
          {/* フッターは各ページのレイアウト（app/{area,station,map,videos,beauty,…}/layout.tsx と総合トップ）がサーバーで出す（件数などの実データが要るため） */}
          <main id="mp-main" tabIndex={-1}>{children}</main>
          <PortalMotion />
        </div>
      </>
    );
  }

  return (
    <>
      {!isAdmin && <Cursor />}
      {!isAdmin && <ProgressBar />}
      {!isAdmin && <Nav />}
      {!isAdmin && <SideLabel />}
      {isAdmin ? (
        children
      ) : (
        <main>{children}</main>
      )}
    </>
  );
}
