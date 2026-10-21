import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("life");
}

export default function Page() {
  return <VerticalHub vertical="life" />;
}
