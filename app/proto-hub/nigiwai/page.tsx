import type { Metadata } from "next";
import NigiwaiPage from "@/components/portal/hubs/nigiwai/NigiwaiPage";

// 総合トップ 案「にぎわいの輪」（試作・非公開）。コンセプト 3。/proto-hub/nigiwai
// 採用された 2 色（sometsuke 白磁と藍・akagane 濃紺と銅）のどちらかを、開くたびに半々で出す（色見本なし）。抽選は NigiwaiPage の script と RandomTheme。
// 固定の色（色見本つき・見比べ用）は /proto-hub/nigiwai/<名前>（app/proto-hub/nigiwai/[theme]）。朱は /proto-hub/nigiwai/shu。
// このページは、cookies()・headers()・searchParams・force-dynamic を使わない（静的に配信できる）。
// 公開スイッチ OFF のあいだは、枠（app/proto-hub/layout.tsx）が 404 にする。検索エンジンには載せない。
export const metadata: Metadata = {
  title: "にぎわいの輪 — 総合トップ案（試作）",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NigiwaiPage theme="sometsuke" random />;
}
