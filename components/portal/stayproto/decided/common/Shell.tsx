import Header from "./Header";
import Footer from "./Footer";
import MotionFx from "./Motion";
import type { CSSProperties } from "react";
import type { SyMode } from "./site";

export type StayPage = "top" | "search" | "shop" | "article";

/** 見本の画像の幅(px)。見本の px は calc(N * var(--u)) でそのまま置く。--u = ページ幅 ÷ この値(上限 1600px)。宿の紹介だけ見本が 864 幅 */
export const REF_WIDTH: Record<StayPage, number> = { top: 1024, search: 1024, shop: 864, article: 1024 };

/**
 * ステイ決定案の各ページの外枠(サーバー)。ヘッダー・フッター・動きの仕組み(MotionFx)を出す。
 * 使い方(ページの default export の一番外側に置く):
 *   import Shell from "@/components/portal/stayproto/decided/common/Shell";
 *   <Shell page="top" mode="live">…ページの中身…</Shell>
 * props:
 *   page   : "top"(最初)| "search"(探す)| "shop"(宿の紹介)| "article"(記事)。見本の帯・--u の基準幅が切り替わる(既定 "top")。
 *            "top" と "search" だけ、ヘッダーがヒーローの上に重なる(ページの先頭の要素 = ヒーローがヘッダーの下まで来る。高さは --sy-hh)。
 *            "shop"(濃い紺の帯)と "article"(明るい帯)は帯の下から中身が始まる。
 *   footer : false にするとフッターを出さない。既定 true。
 *   mode   : "proto"(試作。既定。リンクは /proto-stay/decided 以下)| "live"(本番。リンクは /stay 以下・SNS 等の行き先のない物は出さない)。site.ts の syLinks。
 * 見本の帯(28px)・noindex・assertPreviewOrLocal・フォントの変数は app/proto-stay/decided/layout.tsx が受け持つ(本番は StayRoot)。
 * 中身は <div class="sy-main">(<main> ではない。共通の枠が既に <main> を出す)。
 */
export default function Shell({ page = "top", footer = true, mode = "proto", children }: { page?: StayPage; footer?: boolean; mode?: SyMode; children: React.ReactNode }) {
  return (
    <div className="sy-shell" data-sy-page={page} style={{ ["--sy-ref" as string]: REF_WIDTH[page] } as CSSProperties}>
      <Header mode={mode} page={page} />
      <div className="sy-main" id="sy-main">
        {children}
      </div>
      {footer ? <Footer mode={mode} /> : null}
      <MotionFx />
    </div>
  );
}
