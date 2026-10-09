import type { Metadata } from "next";
import GourmetNorenHomeReal from "@/components/portal/noren-real/GourmetNorenHomeReal";
import { SAMPLE_LINKS } from "@/lib/portal/noren/nav";
import DyePanel from "./DyePanel";

// 暖簾の入口を、もう少し本物らしくした試作（最初の画面だけ差し替え）。プレビュー・ローカル専用（門は app/proto-noren/layout.tsx。本番は 404）。
// 左下の小さな操作盤（DyePanel）は、この見本のルートだけにある。布の色（藍・濃紺・墨・柿渋・臙脂）を、読み込み直しなしで切り替える。
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <GourmetNorenHomeReal links={SAMPLE_LINKS} allowUrlOverride />
      <DyePanel />
    </>
  );
}
