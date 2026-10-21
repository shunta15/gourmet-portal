import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import StayFrame from "@/components/portal/stayproto/decided/common/StayFrame";
import StayTop from "@/components/portal/stayproto/decided/top/live/StayTop";

// ステイの最初のページ(決定デザイン。実在の宿で出す。StayTop)。外枠は StayFrame。
// metadata は、これまでの /stay(components/portal/VerticalHub.tsx。掲載 0 件なら noindex)と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("stay");
}

export default function Page() {
  return (
    <StayFrame>
      <StayTop />
    </StayFrame>
  );
}
