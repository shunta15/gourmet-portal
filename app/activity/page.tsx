import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("activity");
}

export default function Page() {
  return <VerticalHub vertical="activity" />;
}
