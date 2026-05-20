import Link from "next/link";
import RestaurantEditForm from "@/components/admin/RestaurantEditForm";
import { ArrowLeft, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function NewRestaurant({
  searchParams,
}: {
  searchParams: Promise<{ cloneFrom?: string }>;
}) {
  const params = await searchParams;
  const cloneFrom = params.cloneFrom;
  let initial: any = null;

  if (cloneFrom) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", cloneFrom)
      .maybeSingle();
    if (data) {
      // ID と画像はクリアして「似た店」のテンプレートに
      initial = {
        ...data,
        id: "",
        image: "",
        hero_images: [],
        gallery: [],
      };
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/restaurants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> 店舗一覧に戻る
      </Link>
      {cloneFrom && (
        <div className="inline-flex items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Copy className="size-3.5" />
          <span>
            <span className="font-mono text-xs">{cloneFrom}</span> を複製しました。ID と画像は新規入力してください。
          </span>
        </div>
      )}
      <RestaurantEditForm restaurant={initial} />
    </div>
  );
}
