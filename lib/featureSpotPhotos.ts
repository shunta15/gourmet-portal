/**
 * 特集記事の「写真の無いポイント」に、集めた写真を当てはめる（サーバー専用）。
 *
 * 写真は Google マップのその店の写真（public/restaurants/fs/<dir>/…）。記録は automation/feature-spot-photos/<dir>.json、
 * それを検査してまとめたものが lib/featureSpotPhotos.generated.json（`node automation/feature-spot-photos/build.mjs` で作る。手で編集しない）。
 *   { "<featureId>": { "hero": "/restaurants/fs/…/hero.jpg", "spots": { "3": "/restaurants/fs/…/p3.jpg" } } }
 * spots の鍵は「ranking の何番めか」（1 始まり。ranking[i] の i + 1）。
 *
 * 当てはめる所は lib/db/features.ts の getFeatureArticleById（sanitizeFeatureArticle のあと・DB の値を重ねたあと）。
 *   - ポイントに使える写真が 1 枚も無いときだけ、そのポイントの images を [写真] にする（使える写真があるポイントは変えない）。
 *   - 一番上の写真（heroImage）が使えないときだけ hero を入れる。ogImage も、あって使えないときだけ同じものにする。
 *   - 「使える」は暖簾の特集ページ（FeaturePage.tsx）と同じ関数 isUsableFeatureImage（lib/portal/noren/usableImage.ts）。
 *
 * まとめたファイルは実行時に fs で読む（import しない）。無いとき・空のとき・壊れているときは何も当てない（ビルドは壊れない）。
 * 読み方は Next.js の公式の書き方（join(process.cwd(), '<リポジトリからの相対パス>')）で、出力ファイルのトレースに入る。
 * クライアントの束には入らない（server-only・node:fs）。
 */
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FeatureArticle } from "@/lib/regions";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";

export type FeatureSpotPhotoEntry = {
  /** 一番上の写真（公開パス） */
  hero?: string;
  /** ポイントの番号（ranking の何番めか。1 始まり。文字列）→ 写真（公開パス） */
  spots?: Record<string, string>;
};
export type FeatureSpotPhotos = Record<string, FeatureSpotPhotoEntry>;

let cache: FeatureSpotPhotos | null = null;

/** lib/featureSpotPhotos.generated.json を読む（1 回だけ）。無い・空・壊れているときは {}（何も当てない） */
export function getFeatureSpotPhotos(): FeatureSpotPhotos {
  if (cache) return cache;
  let data: FeatureSpotPhotos = {};
  let text: string | null = null;
  try {
    text = readFileSync(join(process.cwd(), "lib/featureSpotPhotos.generated.json"), "utf8");
  } catch {
    // ファイルが無い（まだ作っていない）。何も当てない
  }
  if (text && text.trim()) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) data = parsed as FeatureSpotPhotos;
    } catch (e) {
      console.warn("[featureSpotPhotos] lib/featureSpotPhotos.generated.json が読めない。写真は当てない:", e);
    }
  }
  cache = data;
  return data;
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
