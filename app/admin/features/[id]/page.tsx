import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FeatureEditForm from "@/components/admin/FeatureEditForm";

export default async function EditFeature({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("feature_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <a href="/admin/features" style={{ color: "#888", textDecoration: "none", fontSize: 13 }}>← 特集記事一覧</a>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{article.title}</h1>
        <span style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>{article.id}</span>
      </div>
      <FeatureEditForm article={article} />
    </div>
  );
}
