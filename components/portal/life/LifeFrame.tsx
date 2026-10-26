import type { ReactNode } from "react";
import { assertPortalLive } from "@/lib/portal/launch";
import { sm, ns, en } from "./fonts";
import "./base.css";
import "./top.css";
import "./search.css";
import "./shop.css";
import "./special.css";

/**
 * くらし(マチノワライフ。2026-10-26 の見本 4 枚)の外枠(サーバー)。見本の画像の幅(1024)を基準に --u(= ページ幅 ÷ 1024)で拡大し、1920px を超えたら中央寄せ。
 * 公開スイッチ OFF のあいだは 404。共通のポータルのヘッダー・フッターは出さない(ヘッダー・フッターは各ページの部品)。
 */
export default function LifeFrame({ children }: { children: ReactNode }) {
  assertPortalLive();
  return (
    <div className={`lf-root ${sm.variable} ${ns.variable} ${en.variable}`}>
      <div className="lf-box">{children}</div>
    </div>
  );
}
