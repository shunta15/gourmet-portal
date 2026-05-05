import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminRestaurants({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const region = params.region ?? "";
  const page = parseInt(params.page ?? "1");
  const perPage = 30;

  const supabase = await createClient();

  let query = supabase
    .from("restaurants")
    .select("id, name, area, region, cuisine, published", { count: "exact" })
    .order("id");

  if (q) query = query.ilike("name", `%${q}%`);
  if (region) query = query.eq("region", region);

  const { data: restaurants, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
          店舗一覧 <span style={{ fontSize: 14, color: "#888", fontWeight: 400 }}>({count ?? 0}件)</span>
        </h1>
        <Link
          href="/admin/restaurants/new"
          style={{ padding: "10px 20px", background: "#fff", color: "#000", borderRadius: 4, textDecoration: "none", fontSize: 13, fontWeight: 600 }}
        >
          + 新規追加
        </Link>
      </div>

      {/* 検索・フィルター */}
      <form style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="店舗名で検索..."
          style={{ flex: 1, padding: "8px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }}
        />
        <select
          name="region"
          defaultValue={region}
          style={{ padding: "8px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }}
        >
          <option value="">全エリア</option>
          {["tokyo","osaka","kyoto","nagoya","fukuoka","hyogo","kanagawa","saitama","nara","hiroshima","shiga","gunma","kagoshima","wakayama","hokkaido"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: "8px 16px", background: "#333", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 13 }}>
          絞り込み
        </button>
      </form>

      {/* テーブル */}
      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
              {["ID", "店舗名", "エリア", "ジャンル", "状態", "操作"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#888", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {restaurants?.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "12px 16px", color: "#666", fontFamily: "monospace" }}>{r.id}</td>
                <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: "12px 16px", color: "#888" }}>{r.area}</td>
                <td style={{ padding: "12px 16px", color: "#888" }}>{r.cuisine}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 999,
                    background: r.published ? "#14532d" : "#3f1515",
                    color: r.published ? "#86efac" : "#fca5a5"
                  }}>
                    {r.published ? "公開" : "非公開"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/restaurants/${r.id}`} style={{ color: "#60a5fa", textDecoration: "none", fontSize: 12 }}>
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/restaurants?q=${q}&region=${region}&page=${p}`}
              style={{
                padding: "6px 12px", borderRadius: 4, textDecoration: "none", fontSize: 13,
                background: p === page ? "#fff" : "#1a1a1a",
                color: p === page ? "#000" : "#888",
                border: "1px solid #333",
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
