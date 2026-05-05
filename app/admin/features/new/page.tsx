import FeatureEditForm from "@/components/admin/FeatureEditForm";

export default function NewFeature() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <a href="/admin/features" style={{ color: "#888", textDecoration: "none", fontSize: 13 }}>← 特集記事一覧</a>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>新規特集記事追加</h1>
      </div>
      <FeatureEditForm article={null} />
    </div>
  );
}
