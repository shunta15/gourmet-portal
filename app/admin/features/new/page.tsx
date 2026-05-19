import Link from "next/link";
import FeatureEditForm from "@/components/admin/FeatureEditForm";
import { ArrowLeft } from "lucide-react";

export default function NewFeature() {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/features"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> 特集記事一覧に戻る
      </Link>
      <FeatureEditForm article={null} />
    </div>
  );
}
