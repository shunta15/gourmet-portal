import "@/components/portal/portal.css";
import PetRoot from "./PetRoot";

/**
 * /pet の最初・探す・店・記事のページの外枠(サーバー)。決定デザインの外枠 PetRoot(ヘッダー・フッターは各ページの Shell が出す。共通のポータルのヘッダー・フッターは出さない)。
 * app/pet/layout.tsx は置かない(ページごとに外枠が違うため)。このページ群は各 page.tsx の一番外側でこれを使う。
 * 種類・エリア・利用シーン・特集のページは app/pet/(sub)/layout.tsx(PortalLayout)の下。
 */
export default function PetFrame({ children }: { children: React.ReactNode }) {
  return <PetRoot>{children}</PetRoot>;
}
