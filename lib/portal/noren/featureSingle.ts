/**
 * 特集記事ページを「店 1 軒の記事」と「複数の店・場所の記事」で、別の枠にするスイッチ。軽いファイル（サーバー専用の import は足さない）。
 *
 * - NOREN_FEATURE_SINGLE が true: 店 1 軒の記事（isSingleShopFeature が true の記事）は、components/portal/noren/FeatureSinglePage.tsx の枠で出る。
 *   複数の店・場所の記事は、今までどおり components/portal/noren/FeaturePage.tsx（出力は変わらない）。
 * - NOREN_FEATURE_SINGLE が false: 全記事が今までどおり FeaturePage の枠に戻る（出力は変わらない）。
 * - 元に戻し方: 下の値を false にして再デプロイする（メタ情報・構造化データ・静的生成の対象・再生成の間隔は、このスイッチと関係なく同じ）。
 */
export const NOREN_FEATURE_SINGLE = true;

/**
 * 店 1 軒の記事か。ranking が「POINT 01〜」という視点の並びになっている記事（店の並びではない）。
 * 判定は components/portal/noren/FeaturePage.tsx の isSinglePoint と同じ条件。
 */
export function isSingleShopFeature(a: { ranking: { rank: string }[] }): boolean {
  return a.ranking.length > 0 && /^POINT/i.test(a.ranking[0].rank);
}

/**
 * 中身が真っ黒な仮の画像（4KB・全部同じ画像。記事由来の店のうち写真が無かった店に、パイプラインが hero.jpg / point2.jpg として置いたもの）。
 * パスに "_placeholder" が入っていないので、usableImage.ts の判定（isUsableFeatureImage）では除けない。
 * 店 1 軒用の枠では、これを「写真なし」として扱う（暗い空の枠を出さない）。
 * 一覧は public/restaurants の中の、同じ画像（md5 14cb342f…）のファイルを調べて作った（2026-10-11）。
 * 本物の写真に差し替えた店は、この一覧からそのパスを消す（消し忘れても、その写真が出ないだけで、壊れはしない）。
 */
const DUMMY_FEATURE_IMAGES: ReadonlySet<string> = new Set([
  "/restaurants/_placeholder/feature-hero.jpg",
  "/restaurants/teleapo-BetterDays/hero.jpg",
  "/restaurants/teleapo-BetterDays/point2.jpg",
  "/restaurants/teleapo-CAFEDEFLEUR/hero.jpg",
  "/restaurants/teleapo-CAFEDEFLEUR/point2.jpg",
  "/restaurants/teleapo-CafeFuu/hero.jpg",
  "/restaurants/teleapo-CafeFuu/point2.jpg",
  "/restaurants/teleapo-USHIWAKAMARU/hero.jpg",
  "/restaurants/teleapo-USHIWAKAMARU/point2.jpg",
  "/restaurants/teleapo-WHITEBASECAFE/hero.jpg",
  "/restaurants/teleapo-WHITEBASECAFE/point2.jpg",
  "/restaurants/teleapo-cafebarGroovy/hero.jpg",
  "/restaurants/teleapo-cafebarGroovy/point2.jpg",
  "/restaurants/teleapo-filmcafebar/hero.jpg",
  "/restaurants/teleapo-filmcafebar/point2.jpg",
  "/restaurants/teleapo-kanekocoffeebeans旭川/hero.jpg",
  "/restaurants/teleapo-kanekocoffeebeans旭川/point2.jpg",
  "/restaurants/teleapo-vegeeggLABO/hero.jpg",
  "/restaurants/teleapo-vegeeggLABO/point2.jpg",
  "/restaurants/teleapo-ぎゃらりー喫茶なよたけ/hero.jpg",
  "/restaurants/teleapo-ぎゃらりー喫茶なよたけ/point2.jpg",
  "/restaurants/teleapo-オッティモ/hero.jpg",
  "/restaurants/teleapo-オッティモ/point2.jpg",
  "/restaurants/teleapo-クッチーナウッチーノ/hero.jpg",
  "/restaurants/teleapo-クッチーナウッチーノ/point2.jpg",
  "/restaurants/teleapo-トラットリアネロnero/hero.jpg",
  "/restaurants/teleapo-トラットリアネロnero/point2.jpg",
  "/restaurants/teleapo-ナナンテアnananthea/hero.jpg",
  "/restaurants/teleapo-ナナンテアnananthea/point2.jpg",
  "/restaurants/teleapo-メモアール/hero.jpg",
  "/restaurants/teleapo-メモアール/point2.jpg",
  "/restaurants/teleapo-ライブカフェNobodyKnows/hero.jpg",
  "/restaurants/teleapo-ライブカフェNobodyKnows/point2.jpg",
  "/restaurants/teleapo-リストランテドラマティコ/hero.jpg",
  "/restaurants/teleapo-リストランテドラマティコ/point2.jpg",
  "/restaurants/teleapo-備後ピザ/hero.jpg",
  "/restaurants/teleapo-備後ピザ/point2.jpg",
  "/restaurants/teleapo-割烹なり田/hero.jpg",
  "/restaurants/teleapo-割烹なり田/point2.jpg",
  "/restaurants/teleapo-大和/hero.jpg",
  "/restaurants/teleapo-大和/point2.jpg",
  "/restaurants/teleapo-天や椀や/hero.jpg",
  "/restaurants/teleapo-天や椀や/point2.jpg",
  "/restaurants/teleapo-岡崎天然昆布水つけ麺礼音/hero.jpg",
  "/restaurants/teleapo-岡崎天然昆布水つけ麺礼音/point2.jpg",
  "/restaurants/teleapo-忍者喫茶小田原道michi/hero.jpg",
  "/restaurants/teleapo-忍者喫茶小田原道michi/point2.jpg",
  "/restaurants/teleapo-炉端と地酒まる文すが原/hero.jpg",
  "/restaurants/teleapo-炉端と地酒まる文すが原/point2.jpg",
  "/restaurants/teleapo-炭焼き日本料理三ツ井/hero.jpg",
  "/restaurants/teleapo-炭焼き日本料理三ツ井/point2.jpg",
  "/restaurants/teleapo-紅谷食堂/hero.jpg",
  "/restaurants/teleapo-紅谷食堂/point2.jpg",
  "/restaurants/teleapo-酒場むゆう/hero.jpg",
  "/restaurants/teleapo-酒場むゆう/point2.jpg",
  "/restaurants/teleapo-銀しゃも鶏焼肉玄/hero.jpg",
  "/restaurants/teleapo-銀しゃも鶏焼肉玄/point2.jpg",
  "/restaurants/teleapo-鎌倉由比ヶ浜蕎麦slove/hero.jpg",
  "/restaurants/teleapo-鎌倉由比ヶ浜蕎麦slove/point2.jpg",
  "/restaurants/teleapo-馳走かねこ/hero.jpg",
  "/restaurants/teleapo-馳走かねこ/point2.jpg",
]);
export const isDummyFeatureImage = (u: string | undefined | null): boolean => !!u && DUMMY_FEATURE_IMAGES.has(u.normalize("NFC"));
