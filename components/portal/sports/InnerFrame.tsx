import type { ReactNode } from "react";
import { assertPortalLive } from "@/lib/portal/launch";
import { jp, sf, en } from "./inner/fonts";
import "./inner/base.css";

/**
 * スポーツの店舗紹介・店舗紹介の一覧・特集・記事・404 の外枠(サーバー。見本2の「店舗紹介」「特集」)。
 * 幅は見本の画像の幅を基準に --u(= ページ幅 ÷ 見本の幅)で拡大し、1920 を超えたら中央寄せ。公開スイッチ OFF のあいだは 404。
 * 共通のポータルのヘッダー・フッターは出さない(ヘッダーは各ページの Header)。見本にフッターが無いので、フッターは付けない(アクティビティで「見本に無い」としてフッターのナビを外した 2026-10-24 の決定と同じ)。
 */
export default function InnerFrame({ children }: { children: ReactNode }) {
  assertPortalLive();
  return (
    <div className={`s2b-root ${jp.variable} ${sf.variable} ${en.variable}`}>
      <div className="s2b-box">
        {children}
      </div>
    </div>
  );
}
