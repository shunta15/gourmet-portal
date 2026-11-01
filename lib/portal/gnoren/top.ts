import "server-only";
/**
 * 暖簾 2 本番化: トップ /gourmet(見本 1)のデータ整形(サーバー専用)。設計 = components/portal/gnoren/REAL_PLAN.md「### トップ」。
 * - 統計 3 = 掲載店数(getAllRestaurants の件数)・地域数(その店の region の種類数)・料理分類(BROAD_GROUPS の数)
 * - 料理 7 = BROAD_GROUPS。写真 = その分類の店のうち、店 ID の若い順で最初に写真のある店の 1 枚(同じ節・ほかの節とも同じ店を重ねない。足りない節だけ重複を許す)
 * - エリア 8 = 店数の多い地域(REGIONS の key)上位 8。縦写真 = その地域の店の写真
 * - シーン 6 = lib/scenes.ts の 12 種から、店数の多い順 6(数え方は lib/portal/noren/sceneMatch.ts の shopInScene)
 * - 特集 4 = lib/data.ts の FEATURES から、記事の日付の新しい 4 本(使える写真のあるもの。非表示の店の記事は除く)
 * 店との対応はすべて ID・キーの完全一致(店名の部分一致は使わない)。数・並び・写真はすべて実データ。
 */
import { getAllRestaurants } from "@/lib/db/restaurants";
import { FEATURES, FEATURE_ARTICLES } from "@/lib/data";
import { REGIONS, type Restaurant } from "@/lib/regions";
import { BROAD_GROUPS, matchesBroadKey } from "@/lib/cuisineBroad";
import { SCENES } from "@/lib/scenes";
import { shopInScene } from "@/lib/portal/noren/sceneMatch";
import { countRegions } from "@/lib/portal/noren/openSearch";
import { cardImage } from "@/lib/portal/noren/featureList";
import { isHiddenFeature } from "@/lib/hiddenStores";
import { allShopPhotos, imgProps, featureHref, searchHref, firstSentences } from "@/components/portal/gnoren/real/common";

export type TopPhoto = { src: string; srcSet?: string; sizes?: string };

export type TopCat = { key: string; label: string; href: string; photo?: TopPhoto };
export type TopArea = { key: string; name: string; href: string; photo?: TopPhoto };
export type TopScene = { slug: string; name: string; tagline: string; count: number; href: string; photo?: TopPhoto };
export type TopFeature = { id: string; title: string; sub: string; href: string; photo?: TopPhoto };

export type TopData = {
  stats: { shops: number; areas: number; cuisines: number };
  /** 料理分類の先頭・末尾の名前(統計の小さな説明に使う) */
  cuisineFirst: string;
  cuisineLast: string;
  cats: TopCat[];
  areas: TopArea[];
  scenes: TopScene[];
  features: TopFeature[];
  /** 特集の本数(非表示の店の記事を除く) */
  featureTotal: number;
  /** 利用シーンの種類数(12) */
  sceneTotal: number;
};

/** 店 ID(r6・r06・r299 …)を数字で並べるための番号。数字が取れなければ最後 */
const idNo = (id: string): number => {
  const m = /(\d+)/.exec(id);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};

/**
 * 店の並び(ID の若い順)のうち、条件に合う店で最初に写真のある店の 1 枚。
 * all = ページ全体で使った店 ID(料理 → エリア → シーン の順に節をまたいで重ねない)。sec = この節で使った店 ID。
 * まず「ページ全体でまだ使っていない店」を探し、無いときだけ「この節でまだ使っていない店」まで許す(写真が足りない節だけ重複を許す)。
 * 写真が 1 枚も見つからなければ undefined(札は写真なしの布だけになる)。
 */
function pickPhoto(shops: readonly Restaurant[], photos: ReadonlyMap<string, string>, all: Set<string>, sec: Set<string>, w: number, sizes: string): TopPhoto | undefined {
  const take = (r: Restaurant): TopPhoto | undefined => {
    const u = photos.get(r.id);
    if (!u) return undefined;
    all.add(r.id);
    sec.add(r.id);
    return { ...imgProps(u, w, sizes) };
  };
  for (const r of shops) {
    if (all.has(r.id)) continue;
    const t = take(r);
    if (t) return t;
  }
  for (const r of shops) {
    if (sec.has(r.id)) continue;
    const t = take(r);
    if (t) return t;
  }
  return undefined;
}

export async function buildTopData(): Promise<TopData> {
  const all = await getAllRestaurants();
  const shops = [...all].sort((a, b) => idNo(a.id) - idNo(b.id) || a.id.localeCompare(b.id));
  const photos = new Map<string, string>();
  for (const r of shops) {
    const p = allShopPhotos(r)[0];
    if (p) photos.set(r.id, p);
  }

  // ── 料理 7(ページ全体で使った店 usedAll は、この後のエリア・シーンにも引き継ぐ)
  const usedAll = new Set<string>();
  const usedCat = new Set<string>();
  const cats: TopCat[] = BROAD_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    href: searchHref({ cuisine: g.label }),
    photo: pickPhoto(
      shops.filter((r) => matchesBroadKey(g.key, r)),
      photos,
      usedAll,
      usedCat,
      480,
      "160px",
    ),
  }));

  // ── エリア 8(店数の多い順)
  const regionCounts = countRegions(shops);
  const usedArea = new Set<string>();
  const areas: TopArea[] = regionCounts.slice(0, 8).map((rc) => ({
    key: rc.key,
    name: REGIONS[rc.key as keyof typeof REGIONS]?.name ?? rc.name,
    href: searchHref({ region: rc.key }),
    photo: pickPhoto(
      shops.filter((r) => r.region === rc.key),
      photos,
      usedAll,
      usedArea,
      400,
      "100px",
    ),
  }));

  // ── シーン 6(12 種から店数の多い順。同数は scenes.ts の並び)
  const usedScene = new Set<string>();
  const sceneRows = SCENES.map((s, i) => ({ s, i, inScene: shops.filter((r) => shopInScene(s.matchTags, r.tags)) }));
  sceneRows.sort((a, b) => b.inScene.length - a.inScene.length || a.i - b.i);
  const scenes: TopScene[] = sceneRows.slice(0, 6).map(({ s, inScene }) => ({
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    count: inScene.length,
    href: searchHref({ scene: s.slug }),
    photo: pickPhoto(inScene, photos, usedAll, usedScene, 640, "(max-width: 768px) 50vw, 210px"),
  }));

  // ── 特集 4(記事の日付の新しい順。同日は FEATURES の並び)
  const feats = FEATURES.filter((f) => !isHiddenFeature(f.id));
  const dated = feats.map((f, i) => ({ f, i, date: FEATURE_ARTICLES[f.id]?.date ?? "" }));
  dated.sort((a, b) => b.date.localeCompare(a.date) || a.i - b.i);
  const features: TopFeature[] = [];
  for (const { f } of dated) {
    if (features.length >= 4) break;
    const img = cardImage(f);
    if (!img) continue; // 使える写真が無い記事は飛ばす(AI 画像・仮画像で埋めない)
    const a = FEATURE_ARTICLES[f.id];
    const sub = (f.sub ?? "").trim() || (a?.subtitle ?? "").trim() || firstSentences(a?.lede ?? "", 1);
    features.push({ id: f.id, title: f.title, sub, href: featureHref(f.id), photo: { ...imgProps(img, 800, "(max-width: 768px) 100vw, 320px") } });
  }

  return {
    stats: { shops: shops.length, areas: new Set(shops.map((r) => r.region)).size, cuisines: BROAD_GROUPS.length },
    cuisineFirst: BROAD_GROUPS[0].label,
    cuisineLast: BROAD_GROUPS[BROAD_GROUPS.length - 1].label,
    cats,
    areas,
    scenes,
    features,
    featureTotal: feats.length,
    sceneTotal: SCENES.length,
  };
}
