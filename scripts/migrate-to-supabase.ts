/**
 * data.ts → Supabase 移行スクリプト
 *
 * 実行方法:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   npx ts-node --project tsconfig.scripts.json scripts/migrate-to-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { RESTAURANTS, FEATURES, FEATURE_ARTICLES } from "../lib/data";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // service_role key（RLS bypass）
);

async function migrateRestaurants() {
  console.log(`\n=== 店舗データ移行 (${RESTAURANTS.length}件) ===`);

  const rows = RESTAURANTS.map((r) => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine ?? "",
    area: r.area ?? "",
    region: r.region,
    shape: r.shape ?? "square",
    image: r.image,
    hero_images: r.heroImages ?? [],
    gallery: r.gallery ?? [],
    desc: r.desc ?? "",
    address: r.address,
    hours: r.hours ?? "",
    closed: r.closed ?? "",
    seats: r.seats ?? "",
    nearest: r.nearest ?? "",
    phone: r.phone ?? null,
    budget: r.budget ?? null,
    rating: r.rating ?? null,
    reservation_url: r.reservationUrl ?? null,
    source_label: r.source?.label ?? null,
    source_url: r.source?.url ?? null,
    tags: r.tags ?? [],
    highlights: r.highlights ?? [],
    body: r.body ?? [],
    published: true,
  }));

  // 50件ずつバッチ挿入
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from("restaurants")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`batch ${i}-${i + 50} error:`, error.message);
    } else {
      console.log(`  ✓ ${i + 1}〜${Math.min(i + 50, rows.length)}件`);
    }
  }
}

async function migrateFeatureArticles() {
  console.log(`\n=== 特集記事移行 ===`);

  const articles = Object.values(FEATURE_ARTICLES);
  console.log(`  記事数: ${articles.length}`);

  const articleRows = articles.map((a) => ({
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
    published: true,
  }));

  for (let i = 0; i < articleRows.length; i += 50) {
    const batch = articleRows.slice(i, i + 50);
    const { error } = await supabase
      .from("feature_articles")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`articles batch error:`, error.message);
    } else {
      console.log(`  ✓ 記事 ${i + 1}〜${Math.min(i + 50, articleRows.length)}件`);
    }
  }

  // ランキングアイテム
  console.log(`  ランキングアイテム移行中...`);
  for (const a of articles) {
    if (!a.ranking || a.ranking.length === 0) continue;

    const rankingRows = a.ranking.map((item: any, idx: number) => ({
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

    const { error } = await supabase
      .from("feature_ranking_items")
      .insert(rankingRows);
    if (error) {
      console.error(`  ranking insert error (${a.id}):`, error.message);
    }
  }
  console.log(`  ✓ ランキングアイテム移行完了`);
}

async function migrateFeatureCards() {
  console.log(`\n=== 特集カード移行 (${FEATURES.length}件) ===`);

  const rows = FEATURES.map((f, idx) => ({
    id: f.id,
    no: f.no ?? "",
    tag: f.tag ?? "",
    kicker: f.kicker ?? "",
    title: f.title,
    sub: f.sub ?? "",
    image: f.image ?? "",
    sort_order: idx,
  }));

  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from("feature_cards")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`cards batch error:`, error.message);
    } else {
      console.log(`  ✓ ${i + 1}〜${Math.min(i + 50, rows.length)}件`);
    }
  }
}

async function main() {
  console.log("マチノワ data.ts → Supabase 移行開始");
  await migrateRestaurants();
  await migrateFeatureArticles();
  await migrateFeatureCards();
  console.log("\n✅ 移行完了");
}

main().catch(console.error);
