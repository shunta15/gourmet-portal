import Shell, { type PtPage } from "@/components/portal/petproto/decided/common/Shell";

// 仮のページ(Common が Shell の動作確認に置いたもの。最初のページ担当が上書きする)。?p=top|search|shop|article で Shell の page を切り替えて見られる。
export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string; f?: string }> }) {
  const sp = await searchParams;
  const page = (["top", "search", "shop", "article"].includes(sp.p ?? "") ? sp.p : "top") as PtPage;
  return (
    <Shell page={page} footer={sp.f !== "0"}>
      <div style={{ height: "2200px", paddingTop: 120, textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--pt-ff-min)", fontSize: 32 }}>マチノワPet 仮ページ({page})</h1>
        <p className="pt-hand" style={{ fontSize: 22, marginTop: 16 }}>いっしょの時間が、この街を、もっと好きにする。</p>
        <h2 className="pt-h2 io" style={{ marginTop: 600 }}>Category</h2>
      </div>
    </Shell>
  );
}
