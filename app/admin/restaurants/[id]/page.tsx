import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import RestaurantEditForm from "@/components/admin/RestaurantEditForm";
import { ArrowLeft } from "lucide-react";

export default async function EditRestaurant({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (!restaurant) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/admin/restaurants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> 店舗一覧に戻る
      </Link>
      <RestaurantEditForm restaurant={restaurant} />
    </div>
  );
}
