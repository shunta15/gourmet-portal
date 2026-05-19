import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import FeatureEditForm from "@/components/admin/FeatureEditForm";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-4">
      <Link
        href="/admin/features"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> 特集記事一覧に戻る
      </Link>
      <FeatureEditForm article={article} />
    </div>
  );
}
