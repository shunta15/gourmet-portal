/**
 * data.ts → Supabase 同期スクリプト（店舗専用）
 *
 * - lib/data.ts の RESTAURANTS 全件を Supabase の restaurants に upsert
 * - ファイルに存在しなくなった orphan 行は Supabase から削除（r71 等）
 *
 * 実行: npx tsx scripts/sync-restaurants-to-supabase.ts
 *
 * 環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← service_role key 必須
 */
import { createClient } from "@supabase/supabase-js";
import { RESTAURANTS } from "../lib/data";
import * as fs from "fs";
import * as path from "path";

// .env.local を読む
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
  console.log(`File-based restaurants: ${RESTAURANTS.length}件`);

  // 1. 現在の Supabase 状態
  const { data: existing, error: e1 } = await supabase
    .from("restaurants")
    .select("id")
    .limit(10000);
  if (e1) {
    console.error("fetch error:", e1);
    process.exit(1);
  }
  const supabaseIds = new Set((existing ?? []).map((x: any) => x.id));
  console.log(`Supabase existing: ${supabaseIds.size}件`);

  const fileIds = new Set(RESTAURANTS.map((r) => r.id));

  // 削除対象: Supabase だけにあるもの
  const toDelete = [...supabaseIds].filter((id) => !fileIds.has(id));
  console.log(`削除対象 (file にない): ${toDelete.length}件`);
  if (toDelete.length > 0) {
    console.log(`  IDs: ${toDelete.join(", ")}`);
  }
  console.log(`Upsert 対象 (file 全件): ${RESTAURANTS.length}件`);

  // 2. Upsert restaurants
  const rows = RESTAURANTS.map((r: any) => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine ?? "",
    area: r.area ?? "",
    region: r.region ?? "",
    shape: r.shape ?? "square",
    image: r.image ?? "",
    hero_images: r.heroImages ?? [],
    gallery: r.gallery ?? [],
    desc: r.desc ?? "",
    address: r.address ?? "",
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

  let upserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from("restaurants")
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
    const { error: errDel } = await supabase
      .from("restaurants")
      .delete()
      .in("id", toDelete);
    if (errDel) {
      console.error("  delete error:", errDel.message);
    } else {
      console.log(`  ✓ ${toDelete.length}件削除`);
    }
  }

  // 4. Final state
  const { count: finalCount } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true });
  console.log(`\n✅ 同期完了`);
  console.log(`Supabase final count: ${finalCount}件`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
