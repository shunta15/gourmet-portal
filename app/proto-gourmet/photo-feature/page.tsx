import Link from "next/link";
import { getFeatureArticleById } from "@/lib/db/features";
import { getRestaurantById } from "@/lib/db/restaurants";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { buildPhotoFeature } from "@/lib/portal/photoFeature/build";

// 写真が主役の特集記事の試作の入口（例の 3 本へのリンクだけ）。プレビュー・ローカル専用（門は layout.tsx）。
// 3 本は、先に出す 20 本（FEATURED_SINGLE_IDS）のうち、重複を除いた使える写真がいちばん多い記事（同じ枚数のものは、業種がばらけるように）。
export const dynamic = "force-dynamic";

const EXAMPLES = ["日本料理利喜笑店八王子", "紅梅庵", "カフェレガーロ"];

export default async function Page() {
  const items = await Promise.all(
    EXAMPLES.map(async (id) => {
      const A = await getFeatureArticleById(id);
      if (!A) return null;
      const sid = ARTICLE_STORE_ID_BY_FEATURE[A.id];
      const store = sid ? await getRestaurantById(sid) : null;
      const d = buildPhotoFeature(A, store);
      return { id: A.id, title: A.title, shop: store?.name ?? "", cuisine: store?.cuisine ?? "", area: store?.area ?? "", n: d.photoCount };
    }),
  );
  return (
    <main id="main" style={{ width: "var(--box)", margin: "0 auto", padding: "clamp(40px, 6vw, 96px) 0 0" }}>
      <p style={{ fontSize: 13, letterSpacing: "0.16em", color: "var(--ink2)" }}>試作（非公開）</p>
      <h1 style={{ fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 800, letterSpacing: "0.08em", lineHeight: 1.5, margin: "6px 0 28px" }}>写真が主役の特集記事</h1>
      <ul style={{ display: "grid", gap: 0, borderTop: "1px solid var(--line)" }}>
        {items.map((it) =>
          it ? (
            <li key={it.id} style={{ borderBottom: "1px solid var(--line)" }}>
              <Link
                href={`/proto-gourmet/photo-feature/${it.id}`}
                style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "6px 24px", alignItems: "baseline", minHeight: 44, padding: "18px 0" }}
              >
                <span>
                  <b style={{ display: "block", fontSize: 18, fontWeight: 800, letterSpacing: "0.06em" }}>{it.title}</b>
                  <span style={{ fontSize: 14, color: "var(--ink2)", letterSpacing: "0.08em" }}>
                    {it.shop}　{it.cuisine}　{it.area}
                  </span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }}>写真 {it.n} 枚 →</span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
      <p style={{ marginTop: 28, fontSize: 14, color: "var(--ink2)", letterSpacing: "0.06em" }}>
        <Link href="/feature" style={{ borderBottom: "1px solid var(--ink)" }}>特集の一覧へ</Link>
      </p>
    </main>
  );
}
