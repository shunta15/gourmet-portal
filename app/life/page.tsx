import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import VkFrame from "@/components/portal/vkit/common/VkFrame";
import VkTop from "@/components/portal/vkit/top/VkTop";
import { lifeCfg } from "@/components/portal/vkit/configs";

// くらし・ライフスタイルの最初のページ(ステイの決定デザインと同じ組み立て。components/portal/vkit/)。中身は実在の店(getPlaces("life"))。店が 0 件でも「掲載準備中」で壊れない。
// metadata は、共通の業種の入口(components/portal/VerticalHub.tsx。掲載が 3 件未満なら noindex)と同じ。外枠は VkFrame(公開スイッチ OFF のあいだは 404)。
export async function generateMetadata() {
  return verticalHubMetadata("life");
}

export default function Page() {
  return (
    <VkFrame cfg={lifeCfg}>
      <VkTop cfg={lifeCfg} />
    </VkFrame>
  );
}
