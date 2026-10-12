/**
 * 「さがす」で利用シーンを選んだとき、結果の上に出す「シーン別のまとめ記事」の札（型と並べ方。軽いファイル。サーバー・クライアントのどちらからも使える）。
 * 札を作る側（データを読む）は lib/portal/noren/sceneRoundups.ts（サーバー専用）。
 */

export type SceneRoundupCard = {
  /** 記事 ID（FEATURE_ARTICLES のキー） */
  id: string;
  title: string;
  /** 使える写真（無ければ空文字。札は写真なしの色の面だけで出る） */
  img: string;
  /** 地域の見出し（例: 「名古屋」「静岡」）。記事のデータ（SCENE_FEATURE_META.areaLabel）のとおり */
  areaLabel: string;
  /** 記事のデータの地域のキー（"<region>" または "<region>/<街>"。SCENE_FEATURE_META.area）。並べ替えの完全一致に使う */
  area: string;
  /** 記事の URL（今の記事の URL を作る関数 LIVE_LINKS.feature の結果） */
  href: string;
};

/** 最初に見せる札の数（残りは「すべて見る」で開く） */
export const SCENE_ROUNDUP_VISIBLE = 3;

/**
 * 地域（?region=）・街（?town=）が選ばれているとき、その地域の記事を先に並べる。照合は記事のデータの地域のキーとの完全一致だけ
 * （街の記事 "<region>/<街>" は、地域が同じなら地域の記事として扱う。題や本文の字は見ない）。
 * 順位: 0 = 選んだ街の記事、1 = 選んだ地域の記事、2 = そのほか（そのシーンの記事）。同じ順位の中は元の並びのまま。
 * 地域が選ばれていない、または当てはまる記事が無いときは、元の並びのまま（シーンだけで合う記事を出す）。
 */
export function orderSceneRoundups(cards: readonly SceneRoundupCard[], region: string, town: string): SceneRoundupCard[] {
  const rank = (c: SceneRoundupCard): number => {
    if (region && town && c.area === `${region}/${town}`) return 0;
    if (region && (c.area === region || c.area.startsWith(`${region}/`))) return 1;
    return 2;
  };
  return cards
    .map((c, i) => ({ c, i, r: rank(c) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.c);
}
