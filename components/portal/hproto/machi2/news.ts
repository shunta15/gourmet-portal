import { FEATURES, FEATURE_ARTICLES } from "@/lib/data";
import { sized } from "@/lib/imageUrl";

/** 「まちの最新情報」1 行。本番の形で、特集記事（/feature/{id}）の実データから作る。 */
export type NewsRow = { href: string; title: string; date: string; img: string };

/**
 * 特集記事の新しい順 n 本。並べ方は /feature の「最新の特集」(app/feature/page.tsx の getLatestFeatures) と同じ
 * （FEATURE_ARTICLES[id].date の降順。同じ日付は FEATURES の並びのまま）。日付は記事の date（YYYY-MM-DD）を YYYY.MM.DD に直しただけ。
 * 写真は記事の一覧用の写真（Feature.image）を、一覧と同じ sized() で縮小版にしたもの。
 */
export function latestNews(n = 4): NewsRow[] {
  return FEATURES.map((f) => ({ f, date: FEATURE_ARTICLES[f.id]?.date ?? "" }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n)
    .map(({ f, date }) => ({ href: `/feature/${f.id}`, title: f.title, date: date.replace(/-/g, "."), img: sized(f.image, 480) }));
}
