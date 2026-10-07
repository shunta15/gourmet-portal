import type { Metadata } from "next";
import "@/components/portal/hubs/hamon/hamon.css";
import HamonFonts from "@/components/portal/hubs/hamon/HamonFonts";
import HamonHub from "@/components/portal/hubs/hamon/HamonHub";
import HamonStatement from "@/components/portal/hubs/hamon/HamonStatement";
import { getHubData } from "@/lib/portal/hub";
import { getHamonShops } from "@/lib/portal/hubs/hamon/shops";

// 総合トップ案「波紋 HAMON」（試作・非公開）。コンセプト 4。/proto-hub/hamon
export const metadata: Metadata = {
  title: "波紋 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const [data, shops] = await Promise.all([getHubData(), getHamonShops()]);
  return (
    <>
      <HamonFonts />
      <HamonHub shops={shops} items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} />
      <HamonStatement />
    </>
  );
}
