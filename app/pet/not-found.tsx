import PortalNotFound from "@/components/portal/pages/not-found";
import { notFoundMetadata } from "@/components/portal/pages/data";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import PetNotFound from "@/components/portal/petproto/decided/common/PetNotFound";
import { isPetDecided } from "@/lib/portal/petDesign";

// 最初・探す・店・記事(決定デザインのページ)の 404。外枠は PetFrame(PET_DESIGN で決定デザイン / これまでの共通枠)。
// これまでの種類・エリア・利用シーンのページの 404 は app/pet/(sub)/not-found.tsx。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <PetFrame>{isPetDecided() ? <PetNotFound /> : <PortalNotFound />}</PetFrame>;
}
