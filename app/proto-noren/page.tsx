import GourmetNorenHome from "@/components/portal/pages/gourmet-noren-home";
import { SAMPLE_LINKS } from "@/lib/portal/noren/nav";

// 暖簾のデザインのグルメのトップ（見本）。プレビュー・ローカル専用（門は layout.tsx）。中身は本番 /gourmet と共通（行き先だけ見本のページ）。
export const dynamic = "force-dynamic";

export default function Page() {
  return <GourmetNorenHome links={SAMPLE_LINKS} />;
}
