import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: restaurantCount }, { count: featureCount }] = await Promise.all([
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("feature_articles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "掲載店舗数", value: restaurantCount ?? 0, href: "/admin/restaurants" },
    { label: "特集記事数", value: featureCount ?? 0, href: "/admin/features" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32, color: "#fff" }}>ダッシュボード</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 48 }}>
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: 24, textDecoration: "none", display: "block" }}
          >
            <div style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{stat.label}</div>
          </a>
        ))}
      </div>

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 16 }}>クイックアクション</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/admin/restaurants/new" style={{ padding: "10px 20px", background: "#fff", color: "#000", borderRadius: 4, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            + 店舗を追加
          </a>
          <a href="/admin/features" style={{ padding: "10px 20px", background: "transparent", border: "1px solid #333", color: "#fff", borderRadius: 4, textDecoration: "none", fontSize: 13 }}>
            特集記事を管理
          </a>
        </div>
      </div>
    </div>
  );
}
