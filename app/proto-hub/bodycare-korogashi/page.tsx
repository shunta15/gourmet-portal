import { notFound } from "next/navigation";
import { isPreviewOrLocal } from "@/lib/portal/launch";
import { verticalHubMetadata } from "@/components/portal/VerticalHub";
import KorogashiPage from "@/components/portal/vert/korogashi/KorogashiPage";

// ボディケア入口の試作「転がし(KOROGASHI)」。ストレッチポールの山を、物理で転がす。プレビュー・ローカル専用（門は layout.tsx と、ここの isPreviewOrLocal）。
export async function generateMetadata() {
  const m = await verticalHubMetadata("bodycare");
  return { ...m, robots: { index: false, follow: false } };
}

export default function Page() {
  if (!isPreviewOrLocal()) notFound();
  return <KorogashiPage />;
}
