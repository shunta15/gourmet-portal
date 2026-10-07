import type { Metadata } from "next";
import "@/components/portal/hubs/hikariwa/hikariwa.css";
import HikariwaFonts from "@/components/portal/hubs/hikariwa/HikariwaFonts";
import HikariwaStage from "@/components/portal/hubs/hikariwa/HikariwaStage";
import Statement from "@/components/portal/hubs/hikariwa/Statement";
import { getHubData } from "@/lib/portal/hub";

// 総合トップ案（試作・非公開）: コンセプト 1「光の輪 HIKARIWA」。設計書は proto-portal/hub-concepts/hikariwa.md
export const metadata: Metadata = {
  title: "光の輪 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const data = await getHubData();
  return (
    <>
      <HikariwaFonts />
      <HikariwaStage items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} />
      <Statement items={data.items} />
    </>
  );
}
