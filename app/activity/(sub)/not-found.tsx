import { notFoundMetadata } from "@/components/portal/pages/data";
import ActivityNotFound from "@/components/portal/activity/NotFound";

// 種類・エリア・利用シーン・特集(app/activity/(sub)/(portal)/ の下。総合サイトの外枠)の 404。
// 存在しない URL(/activity/zzz・/activity/feature/x など)がここに来ても、アクティビティの決まったデザインの 404 を出す(外枠は ActivityFrame。app/activity/not-found.tsx と同じ)。
// (portal) のレイアウトの外に置いているので、総合サイトのヘッダー・フッター(mp-hd)は出ない。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <ActivityNotFound />;
}
