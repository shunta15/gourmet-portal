import RestaurantEditForm from "@/components/admin/RestaurantEditForm";

export default function NewRestaurant() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <a href="/admin/restaurants" style={{ color: "#888", textDecoration: "none", fontSize: 13 }}>← 店舗一覧</a>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>新規店舗追加</h1>
      </div>
      <RestaurantEditForm restaurant={null} />
    </div>
  );
}
