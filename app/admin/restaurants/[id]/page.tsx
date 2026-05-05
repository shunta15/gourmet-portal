import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RestaurantEditForm from "@/components/admin/RestaurantEditForm";

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
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <a href="/admin/restaurants" style={{ color: "#888", textDecoration: "none", fontSize: 13 }}>← 店舗一覧</a>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{restaurant.name}</h1>
        <span style={{ fontSize: 12, color: "#666", fontFamily: "monospace" }}>{restaurant.id}</span>
      </div>
      <RestaurantEditForm restaurant={restaurant} />
    </div>
  );
}
