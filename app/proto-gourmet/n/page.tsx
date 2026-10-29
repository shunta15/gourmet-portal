import Shell from "@/components/portal/gnoren/common/Shell";

// 仮の置き場(土台)。ページ担当が中身を作り直す。トップ(見本 1)
export default function Page() {
  return (
    <Shell page="top">
      <main style={{ minHeight: "60vh", padding: "120px 24px 80px", textAlign: "center" }}>トップ(見本 1)</main>
    </Shell>
  );
}
