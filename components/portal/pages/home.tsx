import PortalFonts from "@/components/portal/PortalFonts";
import HubStage from "@/components/portal/hub/HubStage";
import { getHubData } from "@/lib/portal/hub";

/**
 * 総合トップの中身（サーバーコンポーネント）。app/portal-home/page.tsx が出す（公開スイッチ ON のとき `/` として出る）。
 * 業種への入口だけの 1 画面（輪を回して選ぶ）。下にあるのはフッターだけ。
 * フッターと CSS（portal.css・hub.css）は app/portal-home/layout.tsx（PortalLayout）が付ける。
 * 以前の総合トップにあった区画（考え方・6つの入口・エリア・駅・動画・新着の特集・マチノワについて）は外した
 * （部品のファイルは残してある。グルメ側や他のページで使っているものは変えていない）。
 */
export default async function PortalHome() {
  const data = await getHubData();
  return (
    <>
      <PortalFonts />
      <HubStage items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} />
    </>
  );
}
