import type { Metadata } from "next";
import GourmetNorenHomeReal from "@/components/portal/noren-real/GourmetNorenHomeReal";
import { SAMPLE_LINKS } from "@/lib/portal/noren/nav";

// 暖簾の入口を、もう少し本物らしくした試作（最初の画面だけ差し替え）。プレビュー・ローカル専用（門は app/proto-noren/layout.tsx。本番は 404）。
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return <GourmetNorenHomeReal links={SAMPLE_LINKS} />;
}
