/**
 * File → Supabase 同期スクリプト（特集記事専用）
 *
 * - lib/data.ts の FEATURE_ARTICLES (350件) を Supabase の feature_articles に upsert
 * - ファイルに存在しなくなった orphan 行は Supabase から削除
 * - feature_ranking_items も再生成（既存 article 紐付けは delete → insert）
 *
 * 実行: npx tsx scripts/sync-features-to-supabase.ts
 *
 * 環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← anon key ではなく service_role key 必須
 */
import { createClient } from "@supabase/supabase-js";
import { FEATURE_ARTICLES, FEATURE_INDEXABLE_IDS } from "../lib/data";
import * as fs from "fs";
import * as path from "path";

// .env.local を読む（next/dotenv は CLI から使えないので手書きで）
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = process.env[m[1]] ?? m[2];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !serviceKey) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  const articles = Object.values(FEATURE_ARTICLES);
  console.log(`File-based articles: ${articles.length}件`);

  // 1. 現在の Supabase 状態
  const { data: existing, error: e1 } = await supabase
    .from("feature_articles")
    .select("id")
    .limit(10000);
  if (e1) { console.error("fetch error:", e1); process.exit(1); }
  const supabaseIds = new Set((existing ?? []).map((x: any) => x.id));
  console.log(`Supabase existing: ${supabaseIds.size}件`);

  const fileIds = new Set(articles.map((a) => a.id));

  // 削除対象: Supabase だけにあるもの
  const toDelete = [...supabaseIds].filter((id) => !fileIds.has(id));
  // 新規 + 更新対象: ファイル全件
  console.log(`削除対象 (file にない): ${toDelete.length}件`);
  console.log(`Upsert 対象 (file 全件): ${articles.length}件`);

  // 2. Upsert articles
  const rows = articles.map((a) => ({
    id: a.id,
    no: a.no ?? "",
    tag: "",
    kicker: a.kicker ?? "",
    title: a.title,
    title_html: a.titleHTML ?? a.title,
    subtitle: a.subtitle ?? "",
    lede: a.lede ?? "",
    date: a.date ?? "",
    reading: a.reading ?? "",
    author: a.author ?? "マチノワ編集部",
    hero_image: a.heroImage ?? "",
    published: FEATURE_INDEXABLE_IDS.has(a.id), // indexable = published
  }));

  let upserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from("feature_articles")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`  batch ${i} error:`, error.message);
    } else {
      upserted += batch.length;
      process.stdout.write(`\r  upserted ${upserted}/${rows.length}件`);
    }
  }
  console.log();

  // 3. Delete orphans
  if (toDelete.length > 0) {
    console.log(`削除実行: ${toDelete.length}件`);
    // First delete dependent ranking items
    const { error: errDelRank } = await supabase
      .from("feature_ranking_items")
      .delete()
      .in("article_id", toDelete);
    if (errDelRank) console.error("  ranking delete:", errDelRank.message);
    const { error: errDel } = await supabase
      .from("feature_articles")
      .delete()
      .in("id", toDelete);
    if (errDel) console.error("  article delete:", errDel.message);
    else console.log(`  ✓ ${toDelete.length}件削除`);
  }

  // 4. Recreate ranking_items for all file articles
  console.log(`\nランキングアイテム再生成中…`);
  // Delete all existing first (clean slate per article)
  const allFileIds = [...fileIds];
  // Process in chunks for "delete in" (Supabase limits IN clause)
  for (let i = 0; i < allFileIds.length; i += 100) {
    const chunk = allFileIds.slice(i, i + 100);
    await supabase.from("feature_ranking_items").delete().in("article_id", chunk);
  }
  // Insert fresh
  let rankInserted = 0;
  let rankSkipped = 0;
  for (const a of articles) {
    if (!a.ranking || a.ranking.length === 0) { rankSkipped++; continue; }
    const rankRows = a.ranking.map((item: any, idx: number) => ({
      article_id: a.id,
      rank: item.rank ?? String(idx + 1),
      rank_num: item.rankNum ?? idx + 1,
      restaurant_id: null,
      name: item.name ?? "",
      cuisine: item.cuisine ?? "",
      images: item.images ?? [],
      catch: item.catch ?? "",
      desc: item.desc ?? "",
      address: item.address ?? "",
      nearest: item.nearest ?? "",
      hours: item.hours ?? "",
      closed: item.closed ?? "",
      budget: item.budget ?? "",
      sort_order: idx,
    }));
    const { error } = await supabase.from("feature_ranking_items").insert(rankRows);
    if (error) console.error(`  rank insert (${a.id}):`, error.message);
    else rankInserted += rankRows.length;
  }
  console.log(`  ✓ ranking items inserted: ${rankInserted}件 (skipped: ${rankSkipped} articles with no ranking)`);

  // 5. Final state
  const { count: finalCount } = await supabase
    .from("feature_articles")
    .select("id", { count: "exact", head: true });
  console.log(`\n✅ 同期完了`);
  console.log(`Supabase final count: ${finalCount}件`);
}

main().catch((e) => { console.error(e); process.exit(1); });
