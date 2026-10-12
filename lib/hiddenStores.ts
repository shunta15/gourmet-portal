/**
 * 非表示の店の一覧（戻せる形の非表示。データは消さない・Supabase には書き込まない）。
 *
 * 2026-10-12 オーナー決定「業種が決まっていない 4 店は『これ削除でいいよ一旦めんどいから』」。
 * ここに ID を書いた店は、店の一覧を返す入口（lib/db/restaurants.ts）で外す＝/search・地図・件数・最初のページ・地域ごとの件数・特集の一覧・
 * 「同じ地域の店」・sitemap のどこにも出ず、店のページ（/restaurant/<ID>）は 404 になる。店 1 軒だけを扱う記事（featureIds）も、記事を返す入口
 * （lib/db/features.ts）で外す（記事のページは 404・sitemap から外れる）。複数の店を並べる記事に載っている場合は、記事は残して、その店への
 * リンク（/restaurant/<ID>）だけを外す（リンク切れを作らない）。
 * 戻すとき: 該当の行を消す（データ本体は lib/data.ts・lib/teleapo-restaurants.ts・lib/articleStores.ts に残してある）。
 *
 * 照合は ID の完全一致だけ（店名の部分一致は使わない。OWL が SEAFOODBOWL に部分一致して別の店が消えた事故の再発防止）。
 * 軽い定数と純関数だけ（node の点検スクリプトからも、サーバーからも読める。クライアントの部品からは import しない）。
 */

export interface HiddenStore {
  /** 店 ID（完全一致） */
  id: string;
  /** 店名（人が読む用。照合には使わない） */
  name: string;
  /** この店だけを扱う記事 ID（FEATURE_ARTICLES のキー。完全一致）。無ければ空 */
  featureIds: readonly string[];
}

/** 非表示にした日と理由（オーナーの言葉）。4 店とも同じ */
export const HIDDEN_STORES_DECISION = {
  date: "2026-10-12",
  reason: "業種が決まっていない店（lib/cuisineBroad.ts の 7 つの大分類のどれにも入らない）",
  ownerWords: "これ削除でいいよ一旦めんどいから",
} as const;

export const HIDDEN_STORES: readonly HiddenStore[] = [
  { id: "r72", name: "Kitchen Sunny", featureIds: [] },
  // 大阪府大阪市北区のナイトクラブ。FEATURE_ARTICLES の "OWL" は福岡県北九州市門司区の別の店（OWL MOJI）の記事なので、対象にしない
  { id: "r277", name: "OWL(営業時間状況で変わります)", featureIds: [] },
  { id: "r330", name: "Nulla", featureIds: ["ヌーラNulla"] },
  { id: "r368", name: "「野菜が主役のレストラン」やさいやVege TABLEベジテーブル", featureIds: ["「野菜が主役のレストラン」やさいやVegeTABLEベジテーブル"] },
];

export const HIDDEN_STORE_IDS: ReadonlySet<string> = new Set(HIDDEN_STORES.map((s) => s.id));
export const HIDDEN_FEATURE_IDS: ReadonlySet<string> = new Set(HIDDEN_STORES.flatMap((s) => s.featureIds));

export const isHiddenStore = (id: string): boolean => HIDDEN_STORE_IDS.has(id);
export const isHiddenFeature = (id: string): boolean => HIDDEN_FEATURE_IDS.has(id);

/** 店の配列から非表示の店を外す（ID の完全一致） */
export function visibleStores<T extends { id: string }>(list: readonly T[]): T[] {
  return list.filter((x) => !HIDDEN_STORE_IDS.has(x.id));
}

/** `/restaurant/<非表示の店 ID>`（後ろが / ? # か終わり）か。ID の完全一致（r72 が r720 に当たらない） */
export function isHiddenStoreHref(href: string | undefined | null): boolean {
  if (!href) return false;
  const m = href.match(/^\/restaurant\/([^/?#]+)(?:[/?#]|$)/);
  return !!m && HIDDEN_STORE_IDS.has(m[1]);
}

/**
 * 記事の中の、非表示の店へのリンク（各スポットの href）を外す。ほかは変えない。
 * 当てはまるスポットが無ければ、同じ記事をそのまま返す。
 */
export function stripHiddenStoreLinks<A extends { ranking: { href?: string }[] }>(a: A): A {
  if (!a.ranking.some((x) => isHiddenStoreHref(x.href))) return a;
  return { ...a, ranking: a.ranking.map((x) => (isHiddenStoreHref(x.href) ? { ...x, href: undefined } : x)) };
}
