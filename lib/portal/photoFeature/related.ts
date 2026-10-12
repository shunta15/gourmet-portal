import "server-only";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { getFeatureArticleById } from "@/lib/db/features";
import { getRestaurantById } from "@/lib/db/restaurants";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { FEATURED_SINGLE_IDS, isDummyFeatureImage } from "@/lib/portal/noren/featureSingle";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";

/** 記事の終わりの「ほかの特集記事」の 1 件（特集の一覧の「特集記事」の棚（FEATURED_SINGLE_IDS。どれも写真が主役の形の 1 店 1 ページ）の中から） */
export type PfRelated = { id: string; href: string; title: string; shop: string; area: string; img: string };

const NFC = (s: string) => s.normalize("NFC");

/**
 * 「ほかの特集記事」: 特集の一覧の「特集記事」の棚（FEATURED_SINGLE_IDS。どれも写真が主役の形の 1 店 1 ページ）のうち、この記事以外から最大 3 本。
 * 選び方（点数・人気・おすすめは使わない。決まった並びだけ）:
 *   1. 対の店ページの地域（region）が同じ記事（棚の並びの順）
 *   2. 足りなければ、対の店ページの業種（cuisine）が同じ記事（棚の並びの順）
 *   3. それでも足りなければ、棚の並びで、この記事の次から一巡（この記事の前で止まる）
 * 札の写真・店名・地域は、特集の一覧の「特集記事」の棚（getFeaturedSingleCards）と同じ取り方（記事の主役の写真・対の店ページの店名と地域）。
 */
export async function getRelatedFeatured(selfId: string, self: { region?: string; cuisine?: string } | null, max = 3): Promise<PfRelated[]> {
  const me = NFC(selfId);
  const ids = FEATURED_SINGLE_IDS.filter((id) => NFC(id) !== me);
  const at = FEATURED_SINGLE_IDS.findIndex((id) => NFC(id) === me);
  const ring = at < 0 ? ids : [...FEATURED_SINGLE_IDS.slice(at + 1), ...FEATURED_SINGLE_IDS.slice(0, at)];

  const metas = await Promise.all(
    ids.map(async (id) => {
      const sid = ARTICLE_STORE_ID_BY_FEATURE[id];
      const shop = sid ? await getRestaurantById(sid) : null;
      return { id, shop };
    }),
  );
  const shopOf = new Map(metas.map((m) => [m.id, m.shop]));

  const picked: string[] = [];
  const add = (id: string) => {
    if (picked.length < max && !picked.includes(id) && shopOf.get(id)) picked.push(id);
  };
  if (self?.region) for (const id of ids) if (shopOf.get(id)?.region === self.region) add(id);
  if (self?.cuisine) for (const id of ids) if (shopOf.get(id)?.cuisine === self.cuisine) add(id);
  for (const id of ring) add(id);

  const usableShot = (u: string | undefined | null) => isUsableFeatureImage(u) && !isDummyFeatureImage(u);
  const out: PfRelated[] = [];
  for (const id of picked) {
    const a = await getFeatureArticleById(id);
    const shop = shopOf.get(id);
    if (!a || !shop) continue;
    const img = usableShot(a.heroImage) ? a.heroImage : a.ranking.flatMap((r) => r.images).find(usableShot) ?? "";
    out.push({ id, href: LIVE_LINKS.feature(id), title: a.title, shop: shop.name, area: shop.area, img });
  }
  return out;
}
