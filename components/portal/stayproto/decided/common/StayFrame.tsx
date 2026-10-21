import "@/components/portal/portal.css";
import StayRoot from "./StayRoot";

/**
 * /stay の最初・探す・宿・記事のページの外枠(サーバー)。決定デザインの外枠 StayRoot(ヘッダー・フッターは各ページの Shell が出す。共通のポータルのヘッダー・フッターは出さない)。
 * app/stay/layout.tsx は置かない(ページごとに外枠が違うため。ペットの app/pet/(sub)/layout.tsx と同じ)。このページ群は各 page.tsx の一番外側でこれを使う。
 * 種類・エリア・利用シーンのページは app/stay/(sub)/layout.tsx(PortalLayout)の下。
 */
export default function StayFrame({ children }: { children: React.ReactNode }) {
  return <StayRoot>{children}</StayRoot>;
}
