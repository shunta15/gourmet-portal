import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("sports");
}

export default function Page() {
  return <VerticalHub vertical="sports" />;
}
