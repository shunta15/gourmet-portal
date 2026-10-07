import type { Metadata } from "next";
import MitsuwaPage from "@/components/portal/hubs/mitsuwa/MitsuwaPage";

// 総合トップ案「三つの輪 MITSUWA」（コンセプト 2・試作・非公開）。/proto-hub/mitsuwa（いまの色＝黄と黒）。
// 色ちがいは /proto-hub/mitsuwa/<名前>（[theme]/page.tsx）。公開スイッチ OFF のあいだは app/proto-hub/layout.tsx（PortalLayout）が 404 にする。
export const metadata: Metadata = {
  title: "三つの輪 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MitsuwaPage theme="ki" />;
}
