import "@/components/portal/portal.css";
import PortalLayout from "@/components/portal/PortalLayout";
import { isStayDecided } from "@/lib/portal/stayDesign";
import StayRoot from "./StayRoot";

/**
 * /stay の最初・探す・宿・記事のページの外枠(サーバー)。lib/portal/stayDesign.ts の STAY_DESIGN で切り替わる。
 *   "decided" … 決定デザインの外枠 StayRoot(ヘッダー・フッターは各ページの Shell が出す。共通のポータルのヘッダー・フッターは出さない)
 *   "legacy"  … これまでの共通の外枠 PortalLayout(共通ヘッダー・フッター)
 * app/stay/layout.tsx は PortalLayout を出しているので、決定デザインのページを出すときは、ページごとに外枠が違えられるよう
 * app/stay/layout.tsx を (sub) などに分けて(ペットの app/pet/(sub)/layout.tsx と同じ)、このページ群は各 page.tsx の一番外側でこれを使う。
 */
export default function StayFrame({ children }: { children: React.ReactNode }) {
  return isStayDecided() ? <StayRoot>{children}</StayRoot> : <PortalLayout>{children}</PortalLayout>;
}
