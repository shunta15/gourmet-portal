"use client";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";
import Cursor from "./Cursor";
import ProgressBar from "./ProgressBar";
import Nav from "./Nav";
import SideLabel from "./SideLabel";
import PortalHeader from "./portal/PortalHeader";
import PortalFooter from "./portal/PortalFooter";
import PortalMotion from "./portal/PortalMotion";
import { isPortalPath } from "./portal/isPortalPath";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  // 総合サイト（/・/area/**・新業種）だけ専用のヘッダー・フッターを出す。グルメ側の出力は下の既存の分岐のまま。
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
          <PortalHeader />
          <main>{children}</main>
          <PortalFooter />
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
