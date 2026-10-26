import { vkTopMetadata } from "@/components/portal/vkit/top/meta";
import { lifeCfg } from "@/components/portal/vkit/configs";
import { LifeTopPage } from "@/components/portal/life/pages";

// くらし・ライフスタイルの最初のページ。オーナーが決めたデザイン(2026-10-26 の見本。components/portal/life/)。中身は実在の店(getPlaces("sports"))。店が 0 件でも壊れない。
// metadata は、共通の業種の入口(components/portal/VerticalHub.tsx。掲載が 3 件未満なら noindex)と同じで、説明文だけ「いま店のある種類」をデータから並べる(vkit/top/meta.ts)。外枠は TopFrame(公開スイッチ OFF のあいだは 404)。
export async function generateMetadata() {
  return vkTopMetadata(lifeCfg);
}

export default async function Page() {
  return <LifeTopPage />;
}
