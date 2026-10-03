import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("stay");
}

export default function Page() {
  return <VerticalHub vertical="stay" />;
}
