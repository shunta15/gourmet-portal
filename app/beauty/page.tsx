import VerticalHub, { verticalHubMetadata } from "@/components/portal/VerticalHub";

export async function generateMetadata() {
  return verticalHubMetadata("beauty");
}

export default function Page() {
  return <VerticalHub vertical="beauty" />;
}
