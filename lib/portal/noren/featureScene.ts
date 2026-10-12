import { RELEASE_REST } from "./release";
/**
 * 利用シーン+店舗紹介の記事を、専用の枠（components/portal/noren/FeatureScenePage.tsx）で出すスイッチ。軽いファイル（サーバー専用の import は足さない）。
 * 記事の枠は 3 種類: ①店 1 軒の特集（featureSingle.ts）／②利用シーン+店舗紹介（これ）／③街の特集・コース（今の FeaturePage）。
 * - NOREN_FEATURE_SCENE が true: isSceneShopFeature が true の記事は FeatureScenePage の枠で出る。
 * - false: 全記事が今までの枠（店 1 軒の記事は FeatureSinglePage、それ以外は FeaturePage）に戻る。メタ情報・構造化データ・静的生成・再生成の間隔はこのスイッチと関係なく同じ。
 */
export const NOREN_FEATURE_SCENE = RELEASE_REST;

/**
 * 利用シーン+店舗紹介の記事（シーン別まとめ記事）を、店舗特集記事と同じ「写真が主役の形」（components/portal/photoFeature/roundup/RoundupPage.tsx）で出すスイッチ。
 * 特集の一覧（/feature）の見た目（和紙の地・筆の線・朱の印・小さな暖簾の見出し）も、このスイッチに従う。軽いファイル（サーバー専用の import は足さない）。
 * - true（RELEASE_REST と同じ）: isSceneShopFeature が true の記事は、入口の暖簾（WebGL）・和紙と暗い面が交互・写真が主役の形で出る。一覧もその世界に合わせた見た目。
 * - false（RELEASE_REST が false のときも）: 記事は今までの枠（NOREN_FEATURE_SCENE が true なら FeatureScenePage、false なら FeaturePage）に、一覧は今までの暗い暖簾の見た目に戻る。
 *   メタ情報・構造化データ・canonical・静的生成の対象・再生成の間隔は、このスイッチと関係なく同じ。
 * - 街歩き・コースの記事（isSceneShopFeature が false）は、このスイッチと関係なく今までの枠（FeaturePage）。
 */
export const NOREN_FEATURE_ROUNDUP_PHOTO = RELEASE_REST;

/**
 * 利用シーン+店舗紹介の記事か。記事の ID が `scene-` で始まり、店の並び（ranking）の全項目の href が /restaurant/<店 ID> を指すもの。
 * （店 1 軒の記事は POINT 01〜の視点の並びで ID も scene- ではないので重ならない。呼び出し側は店 1 軒の判定を先にする。）
 */
export function isSceneShopFeature(id: string, a: { ranking: { href?: string }[] }): boolean {
  return id.startsWith("scene-") && a.ranking.length > 0 && a.ranking.every((r) => typeof r.href === "string" && r.href.startsWith("/restaurant/"));
}

/** 見比べる表の行になる項目名: 2 店以上に共通する項目（現れる順）。1 店だけの項目は表に出さず、その店の節で出す */
export function commonSpecKeys(ranking: { specs: { k: string; v: string }[] }[]): string[] {
  const count = new Map<string, number>();
  for (const r of ranking) {
    for (const k of new Set(r.specs.map((s) => s.k))) count.set(k, (count.get(k) ?? 0) + 1);
  }
  const out: string[] = [];
  for (const r of ranking) for (const s of r.specs) if ((count.get(s.k) ?? 0) >= 2 && !out.includes(s.k)) out.push(s.k);
  return out;
}
