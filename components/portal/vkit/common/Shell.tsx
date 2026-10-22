import Header from "./Header";
import Footer from "./Footer";
import MotionFx from "./Motion";
import type { CSSProperties } from "react";
import type { VkConfig } from "../config";

export type VkPage = "top" | "search" | "shop" | "article";

/** 見本の画像の幅(px)。見本の px は calc(N * var(--u)) でそのまま置く。--u = ページ幅 ÷ この値(上限 1600px)。店の紹介だけ見本が 864 幅 */
export const REF_WIDTH: Record<VkPage, number> = { top: 1024, search: 1024, shop: 864, article: 1024 };

/**
 * 各ページの外枠(サーバー)。ヘッダー・フッター・動きの仕組み(MotionFx)を出す。
 * 使い方(ページの中身の一番外側に置く):
 *   <Shell cfg={cfg} page="top">…ページの中身…</Shell>
 * props:
 *   cfg    : 業種の設定(components/portal/vkit/configs/*.ts)。ロゴ・ナビ・リンクがこれで決まる。
 *   page   : "top"(最初)| "search"(探す。記事の一覧も同じ)| "shop"(店の紹介)| "article"(記事)。帯の見た目・--u の基準幅が切り替わる(既定 "top")。
 *            "top" と "search" だけ、ヘッダーがヒーローの上に重なる(ページの先頭の要素 = ヒーローがヘッダーの下まで来る。高さは --vk-hh)。
 *            "shop"(濃い面の帯)と "article"(明るい帯)は帯の下から中身が始まる。
 *   footer : false にするとフッターを出さない。既定 true。
 * 色・書体の変数・公開スイッチは外側の VkRoot が受け持つ(各 page.tsx は VkFrame で包む)。
 * 中身は <div class="vk-main">(<main> ではない。共通の枠が既に <main> を出す)。
 */
export default function Shell({ cfg, page = "top", footer = true, children }: { cfg: VkConfig; page?: VkPage; footer?: boolean; children: React.ReactNode }) {
  return (
    <div className="vk-shell" data-vk-page={page} style={{ ["--vk-ref" as string]: REF_WIDTH[page] } as CSSProperties}>
      <Header cfg={cfg} page={page} />
      <div className="vk-main" id="vk-main">
        {children}
      </div>
      {footer ? <Footer cfg={cfg} /> : null}
      <MotionFx />
    </div>
  );
}
