import type { Metadata } from "next";
import NigiwaiPage from "@/components/portal/hubs/nigiwai/NigiwaiPage";

// 総合トップ 案「にぎわいの輪」（試作・非公開）。コンセプト 3。/proto-hub/nigiwai（いまの色＝朱）
// 色ちがいは /proto-hub/nigiwai/<名前>（app/proto-hub/nigiwai/[theme]）。
// 公開スイッチ OFF のあいだは、枠（app/proto-hub/layout.tsx）が 404 にする。検索エンジンには載せない。
export const metadata: Metadata = {
  title: "にぎわいの輪 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NigiwaiPage theme="shu" />;
}
