/**
 * 店舗データの DB 駆動アクセス層
 *
 * - Supabase を真実の源として扱う
 * - DB に該当 ID がない場合は lib/data.ts の RESTAURANTS にフォールバック
 *   （移行期の安全装置。data.ts を真の source-of-truth から切り離した後も
 *   旧 ID への参照を壊さないため）
 */
import { createClient } from "@supabase/supabase-js";
import { RESTAURANTS, type Restaurant, type RegionKey } from "@/lib/data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function db() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

type DbRestaurantRow = {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  region: string;
  shape: string;
  image: string;
  hero_images: string[] | null;
  gallery: string[] | null;
  desc: string;
  address: string;
  hours: string;
  closed: string;
  seats: string;
  nearest: string;
  phone: string | null;
  budget: string | null;
  rating: string | null;
  reservation_url: string | null;
  source_label: string | null;
  source_url: string | null;
  tags: string[] | null;
  highlights: string[] | null;
  body: string[] | null;
  published: boolean;
};

function rowToRestaurant(r: DbRestaurantRow): Restaurant {
  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine || "",
    area: r.area || "",
    region: (r.region || "tokyo") as RegionKey,
    rating: r.rating ?? undefined,
    shape: (r.shape as Restaurant["shape"]) || "square",
    image: r.image || "",
    heroImages: r.hero_images ?? [],
    gallery: r.gallery ?? [],
    desc: r.desc || "",
    address: r.address || "",
    hours: r.hours || "",
    closed: r.closed || "",
    seats: r.seats || "",
    budget: r.budget ?? undefined,
    nearest: r.nearest || "",
    reservationUrl: r.reservation_url ?? undefined,
    phone: r.phone ?? undefined,
    source: r.source_label && r.source_url
      ? { label: r.source_label, url: r.source_url }
      : undefined,
    body: r.body ?? undefined,
    highlights: r.highlights ?? undefined,
    tags: r.tags ?? undefined,
  };
}

/**
 * 全店舗を返す（公開フラグが true のもののみ）。
 * DB から取得失敗 or 空の場合は data.ts にフォールバック。
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const { data, error } = await db()
      .from("restaurants")
      .select("*")
      .eq("published", true)
      .limit(1000);
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((row) => rowToRestaurant(row as DbRestaurantRow));
    }
  } catch (e) {
    console.warn("[db] getAllRestaurants fallback to data.ts:", e);
  }
  return RESTAURANTS;
}

/**
 * 1 店舗を返す。
 * DB を優先 → なければ data.ts にフォールバック。
 */
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const { data, error } = await db()
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (data) return rowToRestaurant(data as DbRestaurantRow);
  } catch (e) {
    console.warn(`[db] getRestaurantById(${id}) fallback to data.ts:`, e);
  }
  const fallback = RESTAURANTS.find((r) => r.id === id);
  return fallback ?? null;
}

/**
 * 静的生成用に全店舗 ID を返す（DB + data.ts の union）。
 * generateStaticParams から使用。
 */
export async function getAllRestaurantIds(): Promise<string[]> {
  const ids = new Set<string>();
  try {
    const { data, error } = await db()
      .from("restaurants")
      .select("id")
      .eq("published", true)
      .limit(10000);
    if (error) throw error;
    for (const row of data ?? []) ids.add((row as { id: string }).id);
  } catch (e) {
    console.warn("[db] getAllRestaurantIds DB read failed:", e);
  }
  for (const r of RESTAURANTS) ids.add(r.id);
  return [...ids];
}

/**
 * リージョン別の店舗を返す。
 */
export async function getRestaurantsByRegion(region: RegionKey): Promise<Restaurant[]> {
  try {
    const { data, error } = await db()
      .from("restaurants")
      .select("*")
      .eq("region", region)
      .eq("published", true)
      .limit(10000);
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((row) => rowToRestaurant(row as DbRestaurantRow));
    }
  } catch (e) {
    console.warn(`[db] getRestaurantsByRegion(${region}) fallback to data.ts:`, e);
  }
  return RESTAURANTS.filter((r) => r.region === region);
}
