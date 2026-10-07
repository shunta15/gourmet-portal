import type { Metadata } from "next";
import NigiwaiPage from "@/components/portal/hubs/nigiwai/NigiwaiPage";

// 総合トップ「にぎわいの輪」。総合トップ `/`（app/portal-home → components/portal/pages/home.tsx）と同じもの（プレビュー・ローカル専用）。/proto-hub/nigiwai
// 採用された 2 色（sometsuke 白磁と藍・akagane 濃紺と銅）のどちらかを、開くたびに半々で出す。抽選は NigiwaiPage の script と RandomTheme。
// 色を固定して見るルートは /proto-hub/nigiwai/<名前>（app/proto-hub/nigiwai/[theme]）。
// このページは、cookies()・headers()・searchParams・force-dynamic を使わない（静的に配信できる）。
// 公開スイッチ OFF のあいだ、および本番（公開スイッチ ON でも）は、枠（app/proto-hub/layout.tsx）が 404 にする。検索エンジンには載せない。
export const metadata: Metadata = {
  title: "にぎわいの輪 — 総合トップ（プレビュー）",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NigiwaiPage theme="sometsuke" random />;
}
