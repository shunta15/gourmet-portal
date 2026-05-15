import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Filter = "active" | "published" | "drafts" | "legacy" | "all";

const FILTER_LABEL: Record<Filter, string> = {
  active: "実稼働 (公開＋下書き)",
  published: "公開のみ",
  drafts: "下書き (noindex)",
  legacy: "旧 legacy のみ",
  all: "全件",
};

/**
 * id prefix で「実稼働」か「legacy か」を判別する。
 * - new- / guide- / course- / scene- = 実稼働
 * - feature- = 旧 legacy（公開サイトのカード一覧からはリンクされていない）
 */
function isLegacyId(id: string): boolean {
  return id.startsWith("feature-");
}

export default async function AdminFeatures({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: Filter }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const filter: Filter = (params.filter as Filter) ?? "active";
  const page = parseInt(params.page ?? "1");
  const perPage = 30;

  const supabase = await createClient();

  // 件数集計用に全件 (id, published) だけ取得して JS 側で分類する
  const { data: idIndex } = await supabase
    .from("feature_articles")
    .select("id, published")
    .limit(10000);

  const ids = idIndex ?? [];
  const counts = {
    all: ids.length,
    published: ids.filter((x: any) => x.published).length,
    drafts: ids.filter((x: any) => !x.published && !isLegacyId(x.id)).length,
    legacy: ids.filter((x: any) => isLegacyId(x.id)).length,
    active: ids.filter((x: any) => !isLegacyId(x.id)).length,
  };

  // 表示対象 id のフィルタ条件
  let allowedIds: string[] | null = null;
  if (filter === "active") {
    allowedIds = ids.filter((x: any) => !isLegacyId(x.id)).map((x: any) => x.id);
  } else if (filter === "published") {
    allowedIds = ids.filter((x: any) => x.published).map((x: any) => x.id);
  } else if (filter === "drafts") {
    allowedIds = ids.filter((x: any) => !x.published && !isLegacyId(x.id)).map((x: any) => x.id);
  } else if (filter === "legacy") {
    allowedIds = ids.filter((x: any) => isLegacyId(x.id)).map((x: any) => x.id);
  } // "all" は null のまま=フィルタなし

  let query = supabase
    .from("feature_articles")
    .select("id, no, title, kicker, date, published", { count: "exact" })
    .order("no");

  if (allowedIds !== null) {
    if (allowedIds.length === 0) {
      // 0件のときに Supabase の .in([]) が全件返してしまう対策
      query = query.in("id", ["__empty_sentinel__"]);
    } else {
      query = query.in("id", allowedIds);
    }
  }
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: articles, count } = await query
    .range((page - 1) * perPage, page * perPage - 1);

  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
          特集記事 <span style={{ fontSize: 14, color: "#888", fontWeight: 400 }}>({count ?? 0}件)</span>
        </h1>
        <a href="/admin/features/new"
          style={{ padding: "8px 20px", background: "#fff", color: "#000", borderRadius: 4, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          + 新規追加
        </a>
      </div>

      {/* 件数サマリ */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "12px 16px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12, color: "#999" }}>
        <span><span style={{ color: "#86efac" }}>●</span> 公開: <strong style={{ color: "#fff" }}>{counts.published}</strong></span>
        <span><span style={{ color: "#fca5a5" }}>●</span> 下書き: <strong style={{ color: "#fff" }}>{counts.drafts}</strong></span>
        <span><span style={{ color: "#fde047" }}>●</span> 旧 legacy: <strong style={{ color: "#fff" }}>{counts.legacy}</strong></span>
        <span style={{ marginLeft: "auto" }}>合計: <strong style={{ color: "#fff" }}>{counts.all}</strong></span>
      </div>

      {/* フィルタタブ */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(Object.keys(FILTER_LABEL) as Filter[]).map((k) => {
          const n = counts[k];
          const active = filter === k;
          return (
            <Link
              key={k}
              href={`/admin/features?filter=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 12,
                textDecoration: "none",
                background: active ? "#fff" : "#1a1a1a",
                color: active ? "#000" : "#aaa",
                border: `1px solid ${active ? "#fff" : "#333"}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {FILTER_LABEL[k]} ({n})
            </Link>
          );
        })}
      </div>

      <form style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          type="hidden"
          name="filter"
          value={filter}
        />
        <input
          name="q"
          defaultValue={q}
          placeholder="タイトルで検索..."
          style={{ flex: 1, padding: "8px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, color: "#fff", fontSize: 13 }}
        />
        <button type="submit" style={{ padding: "8px 16px", background: "#333", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 13 }}>
          検索
        </button>
      </form>

      <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
              {["No", "タイトル", "キッカー", "日付", "状態", "操作"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#888", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles?.map((a) => {
              const legacy = isLegacyId(a.id);
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: "12px 16px", color: "#666", fontFamily: "monospace" }}>{a.no}</td>
                  <td style={{ padding: "12px 16px", color: "#fff" }}>
                    {a.title}
                    {legacy && <span style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "#3a2a0a", color: "#fde047" }}>LEGACY</span>}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{a.kicker}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{a.date}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 999,
                      background: a.published ? "#14532d" : "#3f1515",
                      color: a.published ? "#86efac" : "#fca5a5"
                    }}>
                      {a.published ? "公開" : "非公開"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/features/${a.id}`} style={{ color: "#60a5fa", textDecoration: "none", fontSize: 12 }}>
                      編集
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#666" }}>
                  該当する記事がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/admin/features?filter=${filter}&q=${encodeURIComponent(q)}&page=${p}`}
              style={{ padding: "6px 12px", borderRadius: 4, textDecoration: "none", fontSize: 13, background: p === page ? "#fff" : "#1a1a1a", color: p === page ? "#000" : "#888", border: "1px solid #333" }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
