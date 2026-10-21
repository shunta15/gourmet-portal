import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";
import PetFrame from "@/components/portal/petproto/decided/common/PetFrame";
import PetTop from "@/components/portal/petproto/decided/top/live/PetTop";
import { isPetDecided } from "@/lib/portal/petDesign";

// ペットの最初のページ。lib/portal/petDesign.ts の PET_DESIGN が "decided" なら決定デザイン(実在の店で出す。PetTop)、
// "legacy" ならこれまでの VerticalHub。外枠は PetFrame。
// metadata は、どちらのデザインでもこれまでの /pet(components/portal/VerticalHub.tsx。掲載 0 件なら noindex)と同じ。
export async function generateMetadata() {
  return verticalHubMetadata("pet");
}

export default function Page() {
  return <PetFrame>{isPetDecided() ? <PetTop /> : <VerticalHub vertical="pet" />}</PetFrame>;
}
