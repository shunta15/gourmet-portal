import Shell from "@/components/portal/petproto/decided/common/Shell";
import ArticleBody from "@/components/portal/petproto/decided/article/ArticleBody";
import "@/components/portal/petproto/decided/article/article.css";

// ④ 業種の記事 — 本文(見本なし。一覧の見た目で足した)。
export default function Page() {
  return (
    <Shell page="article">
      <ArticleBody />
    </Shell>
  );
}
