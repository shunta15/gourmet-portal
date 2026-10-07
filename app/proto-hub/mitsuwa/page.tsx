import type { Metadata } from "next";
import MitsuwaFonts from "@/components/portal/hubs/mitsuwa/MitsuwaFonts";
import MitsuwaHub from "@/components/portal/hubs/mitsuwa/MitsuwaHub";
import MitsuwaStatement from "@/components/portal/hubs/mitsuwa/MitsuwaStatement";
import "@/components/portal/hubs/mitsuwa/mitsuwa.css";
import { getHubData } from "@/lib/portal/hub";

// 総合トップ案「三つの輪 MITSUWA」（コンセプト 2・試作・非公開）。/proto-hub/mitsuwa
// 公開スイッチ OFF のあいだは app/proto-hub/layout.tsx（PortalLayout）が 404 にする。
export const metadata: Metadata = {
  title: "三つの輪 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const data = await getHubData();
  return (
    <>
      <MitsuwaFonts />
      <MitsuwaHub items={data.items} gourmetTotal={data.gourmetTotal} featureTotal={data.featureTotal} open={data.open} />
      <MitsuwaStatement />
    </>
  );
}
