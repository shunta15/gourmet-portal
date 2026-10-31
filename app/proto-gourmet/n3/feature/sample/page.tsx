import Shell from "@/components/portal/gnoren3/common/Shell";

// 暖簾 3 店の特集記事(仮)。ページ担当が中身を作るまでの見出し 1 行だけ。
export default function Page() {
  return (
    <Shell page="feature">
      <main style={{ padding: "48px 16px", minHeight: "60vh", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--gn3-f-mincho)", fontSize: 24 }}>店の特集記事(仮)</h1>
      </main>
    </Shell>
  );
}
