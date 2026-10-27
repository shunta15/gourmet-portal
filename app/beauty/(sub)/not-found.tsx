import { notFoundMetadata } from "@/components/portal/pages/data";
import CpFrame from "@/components/portal/colorplay/Frame";
import CpNotFound from "@/components/portal/colorplay/pages/notFound";
import { BEAUTY_SITE } from "@/lib/portal/colorplay/site";

// 種類・エリア・利用シーン・特集(app/beauty/(sub)/(portal)/ の下。総合サイトの外枠)の 404。
// 存在しない URL(/beauty/zzz・/beauty/feature/x など)がここに来ても、ビューティーの決まったデザイン(COLOR PLAY)の 404 を出す(app/beauty/(cp)/not-found.tsx と同じ中身。外枠は CpFrame)。
// (portal) のレイアウトの外に置いているので、総合サイトのヘッダー・フッター(mp-hd)は出ない。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return (
    <CpFrame site={BEAUTY_SITE}>
      <CpNotFound site={BEAUTY_SITE} />
    </CpFrame>
  );
}
