import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("bodycare");
}

export default function Page() {
  return <VerticalHub vertical="bodycare" />;
}
