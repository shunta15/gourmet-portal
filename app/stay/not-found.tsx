import PortalNotFound from "@/components/portal/pages/not-found";
import { notFoundMetadata } from "@/components/portal/pages/data";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import StayNotFound from "@/components/portal/stayproto/decided/common/StayNotFound";
import { isStayDecided } from "@/lib/portal/stayDesign";

// 最初・探す・宿・記事(決定デザインのページ)の 404。外枠は StayFrame(STAY_DESIGN で決定デザイン / これまでの共通枠)。
// これまでの種類・エリア・利用シーンのページの 404 は app/stay/(sub)/not-found.tsx。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <StayFrame>{isStayDecided() ? <StayNotFound /> : <PortalNotFound />}</StayFrame>;
}
