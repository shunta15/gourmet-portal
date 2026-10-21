import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";

// ペットの最初のページ。lib/portal/petDesign.ts の PET_DESIGN で切り替わる(外枠は PetFrame)。
// metadata は、どちらのデザインでもこれまでの /pet(components/portal/VerticalHub.tsx。掲載 0 件なら noindex)と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("pet");
}

export default function Page() {
  return (
    <PetFrame>
      <VerticalHub vertical="pet" />
    </PetFrame>
  );
}
