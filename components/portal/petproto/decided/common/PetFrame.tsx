import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { isPetDecided } from "@/lib/portal/petDesign";
import PetRoot from "./PetRoot";

/**
 * /pet の最初・探す・店・記事のページの外枠(サーバー)。lib/portal/petDesign.ts の PET_DESIGN で切り替わる。
 *   "decided" … 決定デザインの外枠 PetRoot(ヘッダー・フッターは各ページの Shell が出す。共通のポータルのヘッダー・フッターは出さない)
 *   "legacy"  … これまでの共通の外枠 PortalLayout(共通ヘッダー・フッター)
 * app/pet/layout.tsx は置かない(ページごとに外枠が違うため)。このページ群は各 page.tsx の一番外側でこれを使う。
 * これまでの種類・エリア・利用シーン・特集のページは app/pet/(sub)/layout.tsx(PortalLayout)の下。
 */
export default function PetFrame({ children }: { children: React.ReactNode }) {
  return isPetDecided() ? <PetRoot>{children}</PetRoot> : <PortalLayout>{children}</PortalLayout>;
}
