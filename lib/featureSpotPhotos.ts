/**
 * 特集記事の「写真の無いポイント」に、集めた写真を当てはめる（サーバー専用）。
 *
 * 写真は Google マップのその店の写真（public/restaurants/fs/<dir>/…）。記録は automation/feature-spot-photos/<dir>.json、
 * それを検査してまとめたものが lib/featureSpotPhotos.generated.json（`node automation/feature-spot-photos/build.mjs` で作る。手で編集しない）。
 *   { "<featureId>": { "hero": "/restaurants/fs/…/hero.jpg", "spots": { "3": "/restaurants/fs/…/p3.jpg" } } }
 * spots の鍵は「ranking の何番めか」（1 始まり。ranking[i] の i + 1）。
 *
 * 当てはめる所は lib/db/features.ts の getFeatureArticleById（sanitizeFeatureArticle のあと・DB の値を重ねたあと）と、
 * 記事を直接読む lib/townFeatures.ts の linkOf（一番上の写真だけ。featureHeroImage）。
 *   - ポイントに使える写真が 1 枚も無いときだけ、そのポイントの images を [写真] にする（使える写真があるポイントは変えない）。
 *   - 一番上の写真（heroImage）が使えないときだけ hero を入れる。ogImage も、あって使えないときだけ同じものにする。
 *   - 「使える」は暖簾の特集ページ（FeaturePage.tsx）と同じ関数 isUsableFeatureImage（lib/portal/noren/usableImage.ts）。
 *
 * まとめたファイルは静的に import する（サーバーの束に必ず入る。ISR の再生成でも消えない）。中身が `{}` でも、形が想定と違っても、何も当てない。
 * このモジュールを読むのは lib/db/features.ts と lib/townFeatures.ts だけ（どちらもサーバー専用）。server-only なのでクライアントの束に入ればビルドが失敗する。
 */
import "server-only";
import type { FeatureArticle } from "@/lib/regions";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import generated from "./featureSpotPhotos.generated.json";

export type FeatureSpotPhotoEntry = {
  /** 一番上の写真（公開パス） */
  hero?: string;
  /** ポイントの番号（ranking の何番めか。1 始まり。文字列）→ 写真（公開パス） */
  spots?: Record<string, string>;
};
export type FeatureSpotPhotos = Record<string, FeatureSpotPhotoEntry>;

/** 読んだ中身を整える。連想配列でなければ {}（何も当てない）。中身がオブジェクトでない特集は捨てる */
export function normalizeFeatureSpotPhotos(raw: unknown): FeatureSpotPhotos {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: FeatureSpotPhotos = {};
  for (const [id, e] of Object.entries(raw as Record<string, unknown>)) {
    if (e && typeof e === "object" && !Array.isArray(e)) out[id] = e as FeatureSpotPhotoEntry;
  }
  return out;
}

const photosOfFile: FeatureSpotPhotos = normalizeFeatureSpotPhotos(generated);

/** lib/featureSpotPhotos.generated.json の中身（`{}` なら何も当たらない） */
export function getFeatureSpotPhotos(): FeatureSpotPhotos {
  return photosOfFile;
}

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const isPath = (v: unknown): v is string => typeof v === "string" && v.startsWith("/");

/**
 * 記事に写真を当てはめて返す（元の記事は変えない。当てはめるものが無ければ同じオブジェクトをそのまま返す）。
 * photos を渡さなければ lib/featureSpotPhotos.generated.json（getFeatureSpotPhotos）を使う。
 */
export function applyFeatureSpotPhotos<A extends FeatureArticle>(article: A, photos: FeatureSpotPhotos = getFeatureSpotPhotos()): A {
  if (!article || !has(photos, article.id)) return article;
  const entry = photos[article.id];
  if (!entry || typeof entry !== "object") return article;
  let out: A = article;

  // 一番上の写真: 使えないときだけ
  if (isPath(entry.hero) && !isUsableFeatureImage(article.heroImage)) {
    out = { ...out, heroImage: entry.hero };
    // ogImage は、指定があって使えないときだけ同じものに（指定が無ければ heroImage が使われる）
    if (out.ogImage !== undefined && !isUsableFeatureImage(out.ogImage)) out = { ...out, ogImage: entry.hero };
  }

  // ポイント: 使える写真が 1 枚も無いときだけ
  const spots = entry.spots;
  if (spots && typeof spots === "object" && Array.isArray(article.ranking)) {
    let ranking: typeof article.ranking | null = null;
    for (let i = 0; i < article.ranking.length; i++) {
      const key = String(i + 1);
      const photo = has(spots, key) ? spots[key] : undefined;
      if (!isPath(photo)) continue;
      const r = article.ranking[i];
      if ((r.images ?? []).some(isUsableFeatureImage)) continue;
      if (!ranking) ranking = article.ranking.slice();
      ranking[i] = { ...r, images: [photo] };
    }
    if (ranking) out = { ...out, ranking };
  }
  return out;
}

/**
 * 記事の一番上の写真だけを返す（記事を直接読む所用。街ページのカードなど）。
 * heroImage が使えないときだけ、まとめた hero に替える。それ以外は heroImage のまま。
 */
export function featureHeroImage(article: Pick<FeatureArticle, "id" | "heroImage">, photos: FeatureSpotPhotos = getFeatureSpotPhotos()): string {
  const hero = has(photos, article.id) ? photos[article.id]?.hero : undefined;
  return isPath(hero) && !isUsableFeatureImage(article.heroImage) ? hero : article.heroImage;
}
