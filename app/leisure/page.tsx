import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("leisure");
}

export default function Page() {
  return <VerticalHub vertical="leisure" />;
}
