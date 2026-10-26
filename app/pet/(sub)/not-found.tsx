import { notFoundMetadata } from "@/components/portal/pages/data";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import PetNotFound from "@/components/portal/petproto/decided/common/PetNotFound";

// 種類・エリア・利用シーン・特集(app/pet/(sub)/(portal)/ の下。総合サイトの外枠)の 404。
// 存在しない URL(/pet/zzz・/pet/feature/x など)がここに来ても、ペットの決まったデザインの 404 を出す(外枠は PetFrame。app/pet/not-found.tsx と同じ)。
// (portal) のレイアウトの外に置いているので、総合サイトのヘッダー・フッター(mp-hd)は出ない。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return (
    <PetFrame>
      <PetNotFound />
    </PetFrame>
  );
}
