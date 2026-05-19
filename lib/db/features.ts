/**
 * 特集記事データの DB 駆動アクセス層
 *
 * - feature_articles + feature_ranking_items の JOIN を扱う
 * - DB に該当 ID がない場合は lib/data.ts の FEATURE_ARTICLES にフォールバック
 */
import { createClient } from "@supabase/supabase-js";
import {
  FEATURE_ARTICLES,
  FEATURE_INDEXABLE_IDS,
  type FeatureArticle,
  type RankItem,
} from "@/lib/data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function db() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

type DbArticleRow = {
  id: string;
  no: string;
  kicker: string;
  title: string;
  title_html: string;
  subtitle: string;
  lede: string;
  date: string;
  reading: string;
  author: string;
  hero_image: string;
  published: boolean;
};

type DbRankItemRow = {
  id: number;
  article_id: string;
  rank: string;
  rank_num: number;
  name: string;
  cuisine: string;
  images: string[] | null;
  catch: string;
  desc: string;
  address: string;
  nearest: string;
  hours: string;
  closed: string;
  budget: string;
  sort_order: number;
};

function rowToRankItem(row: DbRankItemRow): RankItem {
  return {
    rank: row.rank || String(row.rank_num),
    rankNum: row.rank_num,
    name: row.name,
    cuisine: row.cuisine || "",
    area: "",
    desc: row.desc || "",
    images: row.images ?? [],
    specs: [],
  };
}

function rowToArticle(row: DbArticleRow, ranks: DbRankItemRow[] = []): FeatureArticle {
  return {
    id: row.id,
    no: row.no || "",
    kicker: row.kicker || "",
    title: row.title,
    titleHTML: row.title_html || row.title,
    subtitle: row.subtitle || "",
    lede: row.lede || "",
    date: row.date || "",
    reading: row.reading || "",
    author: row.author || "マチノワ編集部",
    heroImage: row.hero_image || "",
    ranking: ranks
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(rowToRankItem),
    sideArticles: [],
    quote: "",
    quoteCite: row.author || "マチノワ編集部",
    closing: "",
  };
}

/**
 * 1 記事を返す。
 * DB → なければ data.ts にフォールバック。
 * DB の ranking_items は specs / quote / closing が欠落するので、
 * data.ts に同 ID があればそちらをマージする（DB の hero/title/lede 優先）。
 */
export async function getFeatureArticleById(id: string): Promise<FeatureArticle | null> {
  let dbArticle: FeatureArticle | null = null;
  try {
    const { data, error } = await db()
      .from("feature_articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      const { data: ranks } = await db()
        .from("feature_ranking_items")
        .select("*")
        .eq("article_id", id);
      dbArticle = rowToArticle(data as DbArticleRow, (ranks ?? []) as DbRankItemRow[]);
    }
  } catch (e) {
    console.warn(`[db] getFeatureArticleById(${id}) fallback:`, e);
  }

  const fallback = FEATURE_ARTICLES[id];

  // どちらもない
  if (!dbArticle && !fallback) return null;

  // DB のみ
  if (dbArticle && !fallback) return dbArticle;

  // フォールバックのみ
  if (!dbArticle && fallback) return fallback;

  // 両方 → DB の値を優先し、欠けている構造化情報は data.ts から補完
  return {
    ...fallback!,
    ...dbArticle!,
    // 構造化フィールドは DB に未実装なので data.ts のものを使う
    ranking: fallback!.ranking,
    sideArticles: fallback!.sideArticles,
    quote: fallback!.quote,
    closing: fallback!.closing,
    articleType: fallback!.articleType,
  };
}

/**
 * 静的生成用に全記事 ID を返す（DB + data.ts の union）。
 */
export async function getAllFeatureArticleIds(): Promise<string[]> {
  const ids = new Set<string>();
  try {
    const { data, error } = await db()
      .from("feature_articles")
      .select("id")
      .limit(10000);
    if (error) throw error;
    for (const row of data ?? []) ids.add((row as { id: string }).id);
  } catch (e) {
    console.warn("[db] getAllFeatureArticleIds DB read failed:", e);
  }
  for (const id of Object.keys(FEATURE_ARTICLES)) ids.add(id);
  return [...ids];
}

/**
 * 記事が公開対象（indexable）か。
 * 現状は data.ts の FEATURE_INDEXABLE_IDS をそのまま使用。
 * 0002 適用後に DB の noindex 列を使うよう拡張予定。
 */
export function isFeatureIndexable(id: string): boolean {
  return FEATURE_INDEXABLE_IDS.has(id);
}
