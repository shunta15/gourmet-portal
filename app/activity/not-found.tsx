import { notFoundMetadata } from "@/components/portal/pages/data";
import VkFrame from "@/components/portal/vkit/common/VkFrame";
import VkNotFound from "@/components/portal/vkit/common/VkNotFound";
import { activityCfg } from "@/components/portal/vkit/configs";

// 最初・探す・店・記事(決定デザインのページ)の 404。外枠は VkFrame。
// 種類・エリア・利用シーンのページの 404 は app/activity/(sub)/not-found.tsx。検索エンジンには載せない
export const metadata = notFoundMetadata();
export default function NotFound() {
  return (
    <VkFrame cfg={activityCfg}>
      <VkNotFound cfg={activityCfg} />
    </VkFrame>
  );
}
