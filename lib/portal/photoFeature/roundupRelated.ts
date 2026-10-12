import "server-only";
import { FEATURES, FEATURE_ARTICLES } from "@/lib/data";
import { SCENE_FEATURE_META } from "@/lib/sceneFeatures";
import { getFeatureArticleById } from "@/lib/db/features";
import { LIVE_LINKS } from "@/lib/portal/noren/nav";
import { isSceneShopFeature } from "@/lib/portal/noren/featureScene";
import { isPhotoUsable } from "./collect";

/** 記事の終わりの「ほかのシーン別まとめ記事」の 1 件 */
export type RpRelated = { id: string; href: string; title: string; tag: string; area: string; img: string };

/** 利用シーン+店舗紹介の記事 ID を、特集の並び（lib/data の FEATURES の順）で */
function sceneIds(): { id: string; tag: string }[] {
  return FEATURES.filter((f) => {
    const a = FEATURE_ARTICLES[f.id];
    return !!a && isSceneShopFeature(f.id, a);
  }).map((f) => ({ id: f.id, tag: f.tag }));
}

/** 地域の鍵（"<地域>" または "<地域>/<街>" の地域の部分） */
const regionOf = (area: string | undefined) => (area ?? "").split("/")[0];

/**
 * 「ほかのシーン別まとめ記事」: この記事以外のシーン別まとめ記事から最大 3 本。選び方は決まった並びだけ（点数・人気・おすすめは使わない）:
 *   1. 同じ地域の記事（特集の並びで、この記事の次から一巡）
 *   2. 足りなければ、同じ利用シーンの記事（同じ順）
 *   3. それでも足りなければ、残りをこの記事の次から一巡の順
 * 札の写真・題・利用シーンの語・地域の言い方は、データの値だけ（写真は巻頭の写真。使えなければ店の写真の 1 枚目）。
 */
export async function getRelatedRoundups(selfId: string, max = 3): Promise<RpRelated[]> {
  const all = sceneIds();
  const at = all.findIndex((x) => x.id === selfId);
  const ring = at < 0 ? all : [...all.slice(at + 1), ...all.slice(0, at)];
  const me = SCENE_FEATURE_META[selfId];
  const picked: string[] = [];
  const add = (id: string) => {
    if (picked.length < max && !picked.includes(id)) picked.push(id);
  };
  if (me) for (const x of ring) if (regionOf(SCENE_FEATURE_META[x.id]?.area) === regionOf(me.area)) add(x.id);
  if (me) for (const x of ring) if (SCENE_FEATURE_META[x.id]?.scene === me.scene) add(x.id);
  for (const x of ring) add(x.id);

  const out: RpRelated[] = [];
  for (const id of picked) {
    const a = await getFeatureArticleById(id);
    if (!a) continue;
    const m = SCENE_FEATURE_META[id];
    const img = isPhotoUsable(a.heroImage) ? a.heroImage : (a.ranking.flatMap((r) => r.images ?? []).find((u) => isPhotoUsable(u)) ?? "");
    out.push({ id, href: LIVE_LINKS.feature(id), title: a.title, tag: all.find((x) => x.id === id)?.tag ?? "", area: m?.areaLabel ?? "", img });
  }
  return out;
}
