import Link from "next/link";
import RestaurantEditForm from "@/components/admin/RestaurantEditForm";
import { ArrowLeft } from "lucide-react";

export default function NewRestaurant() {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/restaurants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> 店舗一覧に戻る
      </Link>
      <RestaurantEditForm restaurant={null} />
    </div>
  );
}
