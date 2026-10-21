import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import StayTop from "@/components/portal/stayproto/decided/top/live/StayTop";
import { isStayDecided } from "@/lib/portal/stayDesign";

// ステイの最初のページ。lib/portal/stayDesign.ts の STAY_DESIGN が "decided" なら決定デザイン(実在の宿で出す。StayTop)、
// "legacy" ならこれまでの VerticalHub。外枠は StayFrame。
// metadata は、どちらのデザインでもこれまでの /stay(components/portal/VerticalHub.tsx。掲載 0 件なら noindex)と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("stay");
}

export default function Page() {
  return <StayFrame>{isStayDecided() ? <StayTop /> : <VerticalHub vertical="stay" />}</StayFrame>;
}
