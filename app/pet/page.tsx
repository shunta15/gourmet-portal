import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import PetTop from "@/components/portal/petproto/decided/top/live/PetTop";

// ペットの最初のページ(決定デザイン。実在の店で出す。PetTop)。外枠は PetFrame。
// metadata は、これまでの /pet(components/portal/VerticalHub.tsx。掲載 0 件なら noindex)と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("pet");
}

export default function Page() {
  return (
    <PetFrame>
      <PetTop />
    </PetFrame>
  );
}
