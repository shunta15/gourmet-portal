/**
 * 写真が主役の特集記事（試作 /proto-gourmet/photo-feature）に出す写真を集めて、整える（純関数。fs・process は使わない。サーバー・クライアントのどちらからも読める）。
 *
 * 集め方:
 *  - 記事の写真（主役 heroImage と、視点 ranking[i].images。featureSinglePhotos の補い・fs 写真の当てはめは getFeatureArticleById が済ませている）
 *  - ＋ 対の店ページの実物の写真（店のデータの image・heroImages・gallery）
 *  - 使えない写真は除く: 食べログ・仮の画像（isUnusableImage）、表示禁止（isBlockedImage）、中身が真っ黒な仮の画像（isDummyFeatureImage）、/restaurants/ の外（素材写真・外部の写真）
 *  - 同じ写真は 1 回だけ: パスが同じ、または見た目の指紋（photoMeta.generated.ts の dHash 256 bit）がほぼ同じもの（同じ絵の大きさ違い・圧縮違い）。
 *    見た目の指紋が表に無い写真は、パスの一致だけで見る。残すのは、先に出てきたもの（同じ絵なら、大きいほうに差し替える）
 *  - 写真の対応は、記事の中身（ranking の何番めか）と店の ID の完全一致だけ。店名の中間一致は使わない
 */
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import { isDummyFeatureImage } from "@/lib/portal/noren/featureSingle";
import { PHOTO_META } from "./photoMeta.generated";

export type Photo = {
  /** 公開パス（/restaurants/…） */
  src: string;
  /** 元の幅・高さ（photoMeta に無ければ 0） */
  w: number;
  h: number;
};

const norm = (u: string) => u.normalize("NFC");

/** 写真として使えるか（/restaurants/ の中のファイルで、使えない写真・仮の画像ではない） */
export function isPhotoUsable(u: string | undefined | null): u is string {
  if (!u) return false;
  const p = norm(u);
  if (!p.startsWith("/restaurants/")) return false;
  return isUsableFeatureImage(p) && !isDummyFeatureImage(p);
}

const metaOf = (src: string) => PHOTO_META[src] ?? PHOTO_META[norm(src)] ?? null;
export function toPhoto(src: string): Photo {
  const m = metaOf(src);
  return { src, w: m ? m[0] : 0, h: m ? m[1] : 0 };
}

const popcnt4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
/** 指紋（16 進 64 字）の違うビットの数 */
export function hashDistance(a: string, b: string): number {
  if (a.length !== b.length) return 256;
  let d = 0;
  for (let i = 0; i < a.length; i++) d += popcnt4[parseInt(a[i], 16) ^ parseInt(b[i], 16)];
  return d;
}

/** 「ほぼ同じ絵」とみなす指紋の差（256 bit 中）。同じ絵の大きさ違い・圧縮違いは 0〜10 に収まる。別の絵は 60 以上 */
export const SAME_PHOTO_BITS = 24;

/** 同じ写真か（パスが同じ、または指紋がほぼ同じ） */
export function isSamePhoto(a: string, b: string): boolean {
  if (norm(a) === norm(b)) return true;
  const ma = metaOf(a);
  const mb = metaOf(b);
  if (!ma || !mb) return false;
  // 縦横の比が大きく違うものは、別の写真（同じ絵でも切り抜きが違えば別の写真として残す）
  const ra = ma[0] / ma[1];
  const rb = mb[0] / mb[1];
  if (Math.abs(ra - rb) / Math.max(ra, rb) > 0.12) return false;
  return hashDistance(ma[2], mb[2]) <= SAME_PHOTO_BITS;
}

/** 写真の並びから、同じ写真を除く（先に出たものを残す。大きいほうが後に来たら差し替える）。使えない写真も除く */
export function uniquePhotos(srcs: (string | undefined | null)[], seen: Photo[] = []): Photo[] {
  const out: Photo[] = [];
  for (const s of srcs) {
    if (!isPhotoUsable(s)) continue;
    const p = toPhoto(s);
    const dupIn = (list: Photo[]) => list.findIndex((q) => isSamePhoto(q.src, p.src));
    if (dupIn(seen) >= 0) continue;
    const i = dupIn(out);
    if (i >= 0) {
      if (p.w * p.h > out[i].w * out[i].h * 1.2) out[i] = p;
      continue;
    }
    out.push(p);
  }
  return out;
}

export type ArticleLike = {
  heroImage: string;
  ranking: { name: string; images: string[] }[];
};
export type ShopLike = { image?: string; heroImages?: string[]; gallery?: string[] };

export type Collected = {
  /** 主役の写真（無ければ null） */
  hero: Photo | null;
  /** 視点ごとの、記事に元からある写真（全体で重複なし。主役とも重ならない） */
  views: Photo[][];
  /** 店ページの写真のうち、記事に出ていないもの（重複なし） */
  shop: Photo[];
  /** 記事・店ページの写真を、重複なしで全部並べた枚数 */
  total: number;
};

/** 記事と店の写真を集めて、重複を除く。視点の順・店の写真の順は、元のデータの並びのまま */
export function collectPhotos(a: ArticleLike, shop: ShopLike | null): Collected {
  const used: Photo[] = [];
  const take = (srcs: (string | undefined | null)[]) => {
    const got = uniquePhotos(srcs, used);
    used.push(...got);
    return got;
  };
  // 主役: heroImage（使えなければ、視点の写真の 1 枚目が主役になる）
  let hero: Photo | null = take([a.heroImage])[0] ?? null;
  const views = a.ranking.map((r) => take(r.images ?? []));
  if (!hero) {
    const i = views.findIndex((l) => l.length > 0);
    if (i >= 0) hero = views[i].shift() ?? null;
  }
  const shopPhotos = shop ? take([shop.image, ...(shop.heroImages ?? []), ...(shop.gallery ?? [])]) : [];
  return { hero, views, shop: shopPhotos, total: used.length };
}
