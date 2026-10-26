import { notFoundMetadata } from "@/components/portal/pages/data";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import StayNotFound from "@/components/portal/stayproto/decided/common/StayNotFound";

// 種類・エリア・利用シーン・特集(app/stay/(sub)/(portal)/ の下。総合サイトの外枠)の 404。
// 存在しない URL(/stay/zzz・/stay/feature/x など)がここに来ても、ステイの決まったデザインの 404 を出す(外枠は StayFrame。app/stay/not-found.tsx と同じ)。
// (portal) のレイアウトの外に置いているので、総合サイトのヘッダー・フッター(mp-hd)は出ない。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return (
    <StayFrame>
      <StayNotFound />
    </StayFrame>
  );
}
