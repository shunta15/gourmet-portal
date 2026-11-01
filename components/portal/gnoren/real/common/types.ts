/**
 * 暖簾 2 本番化(REAL_PLAN.md)の共通の型。軽い型だけ(サーバー・クライアントのどちらからも import してよい)。
 */

/** 特集記事ビュー。店 1 軒・シーン別まとめ・街歩きの 3 種の記事を、見本 4 の見た目で描くための共通の形(変換: lib/portal/gnoren/article.ts / 描画: real/article の ArticleView) */
export type GnArticleVM = {
  id: string; kind: 'single' | 'roundup' | 'walk';
  kicker: string; title: string; subtitle?: string; lede: string[]; date: string; // 日付は記事の date(YYYY.MM.DD)
  hero?: { src: string; alt: string };                      // 無い記事は無し(5 本)
  chapters: Array<{                                          // 見本の章 01/02/03 の組を章の数だけ繰り返す(1〜6)
    no: string; label: string; heading: string; body: string[];
    photos: Array<{ src: string; alt: string }>;             // 0〜3 枚。無ければ写真無しの章
    note?: string;                                           // メモ紙(短い一文)。無ければ出さない
    shop?: { id?: string; name: string; href?: string; info: Array<[string, string]> }; // まとめ・街歩きの店/スポット
  }>;
  quote?: { text: string; cite: string };                    // 編集部の言葉(メモ紙の引用)
  closing?: string[];
  shop?: { id: string; name: string; href: string; info: Array<[string, string]>; mapsUrl?: string }; // 店 1 軒の記事で対の店があるとき(376 本)
  related: Array<{ id: string; title: string; href: string; img?: string; date?: string }>;
};

/**
 * 店の札(さがす・店舗紹介一覧・トップなどで使う軽い形。クライアントの部品へ props で渡してよい。約 509 件で数百 KB に収まる軽さを保つこと)。
 * - img: 店の最初の写真(allShopPhotos(r)[0])。無ければ省く
 * - nearest: 最寄り / desc: 紹介文の先頭(短く切ったもの)
 * - tags: 札に出すタグ(表示用)
 * - cuisineKeys: lib/cuisineBroad.ts の BROAD_GROUPS の key のうち、この店が当てはまるもの(?cuisine= の絞り込み用)
 * - region: lib/regions.ts の REGIONS の key / town: 市区町村(lib/towns.ts の parseTown。取れなければ省く)
 * - sceneSlugs: lib/scenes.ts のシーンのうち、この店が当てはまるもの(?scene= の絞り込み用。lib/portal/noren/sceneMatch.ts の規則をサーバーで評価して渡す)
 */
export type GnShopCard = {
  id: string;
  name: string;
  href: string;
  img?: string;
  nearest?: string;
  desc?: string;
  tags: string[];
  cuisineKeys: string[];
  region: string;
  town?: string;
  sceneSlugs: string[];
  isNew?: boolean;
};
