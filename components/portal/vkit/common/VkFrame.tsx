import VkRoot from "./VkRoot";
import type { VkConfig } from "../config";

/**
 * 最初・探す・店・記事のページの外枠(サーバー)。決定デザインの外枠 VkRoot(ヘッダー・フッターは各ページの Shell が出す。共通のポータルのヘッダー・フッターは出さない)。
 * app/{業種}/layout.tsx を (sub) に分けてあるので(ステイ・ペットと同じ)、このページ群は各 page.tsx の一番外側でこれを使う。
 */
export default function VkFrame({ cfg, children }: { cfg: VkConfig; children: React.ReactNode }) {
  return <VkRoot cfg={cfg}>{children}</VkRoot>;
}
