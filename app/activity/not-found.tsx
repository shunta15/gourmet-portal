import { notFoundMetadata } from "@/components/portal/pages/data";
import ActivityNotFound from "@/components/portal/activity/NotFound";

// 最初・探す・店・特集・記事(オーナーが決めたデザイン)の 404。外枠は ActivityFrame(components/portal/activity/NotFound.tsx)。
// 種類・エリア・利用シーンのページの 404 は app/activity/(sub)/not-found.tsx。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return <ActivityNotFound />;
}
