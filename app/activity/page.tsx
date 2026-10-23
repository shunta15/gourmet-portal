import { vkTopMetadata } from "@/components/portal/vkit/top/meta";
import { activityCfg } from "@/components/portal/vkit/configs";
import { ActivityTopPage } from "@/components/portal/activity/pages";

// 体験・アクティビティの最初のページ。オーナーが決めたデザイン(青と黄の切手・チケット風。components/portal/activity/)。中身は実在の店(getPlaces("activity"))。店が 0 件でも壊れない。
// metadata は、共通の業種の入口(components/portal/VerticalHub.tsx。掲載が 3 件未満なら noindex)と同じで、説明文だけ「いま店のある種類」をデータから並べる(vkit/top/meta.ts)。
// 外枠は ActivityFrame(公開スイッチ OFF のあいだは 404)。
export async function generateMetadata() {
  return vkTopMetadata(activityCfg);
}

export default async function Page() {
  return <ActivityTopPage />;
}
