import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("pet");
}

export default function Page() {
  return <VerticalHub vertical="pet" />;
}
