/**
 * 店舗データの DB 駆動アクセス層
 *
 * - Supabase を真実の源として扱う
 * - DB に該当 ID がない場合は lib/data.ts の RESTAURANTS にフォールバック
 *   （移行期の安全装置。data.ts を真の source-of-truth から切り離した後も
 *   旧 ID への参照を壊さないため）
 * - 一覧系（getAllRestaurants / getRestaurantsByRegion）は「DB の公開行 ＋ DB に行が無いコード側の店」の和集合。
 *   以前は DB が 1 行でも返すと DB だけを返しており、コードにだけある店（teleapo r241〜・記事由来 r299〜）が
 *   トップ・地域一覧・シーン・検索から漏れていた（個別ページとサイトマップは和集合なので出ていた）。
 *   DB に行がある店（公開・非公開を問わない）は DB を優先し、非公開行はコード側から復活させない。
 *   ※ 非公開行を見分けるには service role キーが必要（anon だと RLS で非公開行が見えず、コード側の店として出てしまう）。
 */
import { createClient } from "@supabase/supabase-js";
import { RESTAURANTS, type Restaurant, type RegionKey } from "@/lib/data";
import { sanitizeRestaurant } from "@/lib/imageBlocklist";
import { applyShopPhotos } from "@/lib/shopPhotos";
import { cleanRestaurantText } from "@/lib/otherSiteRatings";

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
  /** 今の DB には無い列。将来できたら DB の値を優先する */
  google_rating?: number | null;
  google_review_count?: number | null;
  published: boolean;
};

/** コード側の店（ID の完全一致だけで引く。店名では引かない） */
const CODE_BY_ID = new Map<string, Restaurant>(RESTAURANTS.map((r) => [r.id, r]));

/**
 * 店を返す前の仕上げ: 表示禁止の画像を除き（sanitizeRestaurant）、そのあと、使える写真が 1 枚も無い店にだけ
 * 集めた写真を当てはめる（lib/shopPhotos.ts。lib/shopPhotos.generated.json が `{}` なら何もしない）。
 * 最後に、文章（desc・body・highlights）から、ほかのサイト・サービスの点数・星・評価の高さ・口コミやレビューの件数に触れた
 * 文／句を取り除く（lib/otherSiteRatings.ts。DB の文章にもコード側の文章にも効く。2026-10-11 発注者指示。DB は書き換えない）。
 * map(finish) のように 1 引数で呼ぶ（2 番目以降の引数は受けない）。
 */
const finish = (r: Restaurant): Restaurant => cleanRestaurantText(applyShopPhotos(sanitizeRestaurant(r)));

/**
 * DB の行から店を作る。Google の評価（googleRating・googleReviewCount）は DB に列が無いので、
 * 同じ ID のコード側の店（lib/data.ts）にあればそれを付ける（DB の行に値があれば DB を優先）。
 * 新しく取りに行かない・何も書き込まない。付けた店には googleShopOnly を立て、暖簾の店ページ以外では使わせない。
 */
export function rowToRestaurant(r: DbRestaurantRow): Restaurant {
  const code = CODE_BY_ID.get(r.id);
  const googleRating = r.google_rating ?? code?.googleRating;
  const googleReviewCount = r.google_review_count ?? code?.googleReviewCount;
  const restaurant = {
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
    ...(googleRating
      ? { googleRating, googleReviewCount: googleReviewCount ?? undefined, googleShopOnly: true }
      : {}),
  };
  return finish(restaurant as Restaurant);
}

/**
 * 一覧用: DB の行を「公開行」と「DB に行がある ID の集合（非公開を含む）」に分ける。
 * DB にある店はコード側の古い値で上書きせず、非公開にした店をコード側から復活させないために使う。
 */
function splitRows(rows: DbRestaurantRow[]): { published: Restaurant[]; knownIds: Set<string> } {
  return {
    published: rows.filter((r) => r.published).map(rowToRestaurant),
    knownIds: new Set(rows.map((r) => r.id)),
  };
}

/**
 * 全店舗を返す（公開フラグが true のもののみ）。
 * DB から取得失敗 or 空の場合は data.ts にフォールバック。
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const { data, error } = await db().from("restaurants").select("*").limit(1000);
    if (error) throw error;
    const { published, knownIds } = splitRows((data ?? []) as DbRestaurantRow[]);
    if (published.length > 0) {
      // DB の公開行 ＋ DB に行が無いコード側の店（DB を優先。非公開行は復活させない）
      return [...published, ...RESTAURANTS.filter((r) => !knownIds.has(r.id)).map(finish)];
    }
  } catch (e) {
    console.warn("[db] getAllRestaurants fallback to data.ts:", e);
  }
  return RESTAURANTS.map(finish);
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
  return fallback ? finish(fallback) : null;
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
 * サイトマップ用に全店舗 ID と updated_at を返す（DB + data.ts の union）。
 * DB の更新日時を反映し、data.ts のレコードは updated_at なしで返す。
 */
export async function getAllRestaurantIdsWithUpdatedAt(): Promise<
  { id: string; updatedAt?: string }[]
> {
  const dbMap = new Map<string, string>();
  try {
    const { data, error } = await db()
      .from("restaurants")
      .select("id, updated_at")
      .eq("published", true)
      .limit(10000);
    if (error) throw error;
    for (const row of data ?? []) {
      const r = row as { id: string; updated_at: string };
      dbMap.set(r.id, r.updated_at);
    }
  } catch (e) {
    console.warn("[db] getAllRestaurantIdsWithUpdatedAt DB read failed:", e);
  }
  const result: { id: string; updatedAt?: string }[] = [];
  // DB から取得した ID は updated_at 付き
  for (const [id, updatedAt] of dbMap) {
    result.push({ id, updatedAt });
  }
  // data.ts からのフォールバック（DB にない ID）は updated_at なし
  for (const r of RESTAURANTS) {
    if (!dbMap.has(r.id)) {
      result.push({ id: r.id });
    }
  }
  return result;
}

/**
 * リージョン別の店舗を返す。
 */
export async function getRestaurantsByRegion(region: RegionKey): Promise<Restaurant[]> {
  try {
    // この地域の DB 行 と、DB に行がある全 ID（地域をまたぐ。コード側と DB で地域が食い違う店が二重に出ないように）
    const [regionRes, idsRes] = await Promise.all([
      db().from("restaurants").select("*").eq("region", region).limit(1000),
      db().from("restaurants").select("id").limit(1000),
    ]);
    if (regionRes.error) throw regionRes.error;
    if (idsRes.error) throw idsRes.error;
    const { published } = splitRows((regionRes.data ?? []) as DbRestaurantRow[]);
    if (published.length > 0) {
      const knownIds = new Set((idsRes.data ?? []).map((r) => (r as { id: string }).id));
      // DB の公開行 ＋ DB に行が無い、この地域のコード側の店
      return [
        ...published,
        ...RESTAURANTS.filter((r) => r.region === region && !knownIds.has(r.id)).map(finish),
      ];
    }
  } catch (e) {
    console.warn(`[db] getRestaurantsByRegion(${region}) fallback to data.ts:`, e);
  }
  return RESTAURANTS.filter((r) => r.region === region).map(finish);
}
