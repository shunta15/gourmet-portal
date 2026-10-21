import Shell from "@/components/portal/petproto/decided/common/Shell";
import { Hero, Picks, Features, Experts, Recommend } from "@/components/portal/petproto/decided/article/Sections";
import LatestTabs from "@/components/portal/petproto/decided/article/LatestTabs";
import { TABS } from "@/components/portal/petproto/decided/article/data";
import "@/components/portal/petproto/decided/article/article.css";

// ④ 業種の記事 — 一覧(見本 記事.webp の完全再現)。layout(親)が見本の帯・noindex・プレビュー限定を持つ。
export default function Page() {
  return (
    <Shell page="article">
      <Hero />
      <Picks />
      <Features />
      <LatestTabs tabs={TABS} />
      <Experts />
      <Recommend />
    </Shell>
  );
}
