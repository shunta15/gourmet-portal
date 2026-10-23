/**
 * 新業種(体験・アクティビティ / スポーツ・フィットネス / くらし・ライフスタイル)の「最初・探す・店舗紹介・記事」を同じ作りで出す共通部品(vkit)の設定。
 * 土台はステイの決定デザイン(components/portal/stayproto/decided/)。業種ごとの違い(名前・色・写真・種類の札・節の言葉・文言)は、この設定 1 つに全部集める。
 * 設定は「データだけ」(関数・RegExp を持たない)。サーバーの部品もクライアントの部品も import してよい。
 * 業種の定義(種類・場面・題名の型)は lib/verticals/*.ts が持つ。ここは見た目と文言だけ。
 */
import type { VerticalKey } from "@/lib/verticals/types";

export type VkKey = "activity" | "sports" | "life";
export const VK_KEYS: VkKey[] = ["activity", "sports", "life"];
export function isVkKey(k: string): k is VkKey {
  return (VK_KEYS as string[]).includes(k);
}

/** 色。CSS の --vk-{名前} になる(components/portal/vkit/common/base.css の既定値と同じ名前)。*-rgb は「R G B」の 3 つ組 */
export type VkTheme = {
  paper: string;
  paper2: string;
  cream: string;
  sand: string;
  white: string;
  chip: string;
  ink: string;
  text: string;
  text2: string;
  body: string;
  mut: string;
  labc: string;
  dim: string;
  line: string;
  bd: string;
  gold: string;
  "gold-d": string;
  "gold-l": string;
  "gold-pale": string;
  deep: string;
  "deep-h": string;
  deep2: string;
  night: string;
  onnight: string;
  dark: string;
  dark2: string;
  onband: string;
  onband2: string;
  heart: string;
  "paper-rgb": string;
  "white-rgb": string;
  "ink-rgb": string;
  "shade-rgb": string;
  "gold-rgb": string;
  "night-rgb": string;
  "dark-rgb": string;
};

/** 種類・場面のアイコンの名前(common/Icons.tsx の KindIcon が絵にする) */
export type VkIconKey =
  | "wave"
  | "mountain"
  | "craft"
  | "garden"
  | "dumbbell"
  | "yoga"
  | "martial"
  | "dance"
  | "golf"
  | "court"
  | "book"
  | "torii"
  | "hanger"
  | "camera"
  | "wrench"
  | "flower"
  | "star";

export type VkKind = {
  /** lib/verticals の categories の slug */
  slug: string;
  /** 英字のラベル(最初のページの札・探す・記事の一覧のカードの小さな英字。2 行に収まる短さ) */
  en: string;
  /** 札の写真(public/_portal/vkit/{key}/top/ の下のファイル名) */
  img: string;
  icon: VkIconKey;
};

/** 設備・サービスの札。記事の文に regex(RegExp のソース)が当たり、打ち消しの語が無い文があるときだけ出す */
export type VkFacRule = { k: string; t: string; re: string };

/** 店の紹介の右上の箱(事実の欄)に使うデータの種類 */
export type VkBoxKey = "station" | "area" | "hours" | "holidays" | "phone";

export type VkConfig = {
  key: VkKey;
  /** 業種の URL の根(= lib/verticals の path) */
  base: string;
  /** 業種名(見出し)。lib/verticals の name と同じ */
  name: string;
  /** 呼び名(ブランド)。lib/verticals の brand と同じ */
  brand: string;
  /** ロゴの英字 */
  brandEn: string;
  /** ロゴの印の絵 */
  mark: "wave" | "track" | "leaf";
  /** 店・場所を数える言い方(「体験」「施設」「場所」)。画面の「〇〇を探す」「〇〇の記事」に入る */
  noun: string;
  /** 画面の見出しの英字(掲載している〇〇 の英字ラベル) */
  nounEn: string;
  theme: VkTheme;
  /** 検索の箱のぼたん「〇〇を探す」の幅(見本の px。字数に合わせる)。最初のページのヘッダーの「〇〇を探す →」を外した(2026-10-23)ので、今は CSS 変数 --vk-cta-n に出るだけで使われていない */
  ctaW: number;
  /**
   * 飾りの写真まわりの調整(写真の明るさに合わせる)。
   *   photoDim: 飾りの写真の明るさ(1 = そのまま)/ heroDim: 探す・記事の一覧のヒーローの上と右の暗い霞の濃さ(1 = ステイと同じ)/
   *   areaDim: 最初のページのエリア帯の暗い霞の濃さ(0.3 = ステイと同じ)/ navShift: ヘッダーのナビの左端を右へずらす量(見本の px。ロゴの字数が多い業種用。探す・店・記事のページ)/
   *   navChars: ナビの字数の見積もり(探すのヘッダーの明るい帯の幅に使う。ナビ 3 つ(トップ・〇〇を探す・特集記事)で 18。ステイは旧ナビ 4 つの 40)
   */
  fx: { photoDim: number; heroDim: number; areaDim: number; navShift: number; navChars: number };
  /** 種類の並び(最初のページの札・ラウンドロビンの順)。lib/verticals の categories の slug と同じ */
  kinds: VkKind[];
  /** 種類のスラッグごとの、探す・記事の一覧の絞り込みの 1 つ目の既定アイコン(kinds[0].icon) */
  /** 事実の欄に出す項目(上から) */
  boxes: VkBoxKey[];
  /** 紹介記事の節として使わない見出しの正規表現(場所・時間など。基本情報・アクセスに回す) */
  placeHeading: string;
  /** 設備・サービス */
  facilities: VkFacRule[];
  /** 紹介の見出しの「この〇〇の / ご案内」 */
  introH: [string, string];

  top: {
    edition: string;
    vertical: [string, string];
    h1: [string, string, string];
    lead: [string, string];
    intro: string;
    hint: string;
    featH: [string, string];
    featP: [string, string, string, string];
    listedEn: [string, string];
    areaH: [string, string];
    areaP: [string, string];
    areaScript: [string, string];
    /** ヒーローの写真の寸法 */
    heroW: number;
    heroH: number;
    /** 写真の見せる位置(object-position の縦 %) */
    heroFocus: number;
    prep: string;
  };
  search: {
    h1: [string, string];
    sub: string;
    note: [string, string];
    boxQ: string;
    kwEx: string;
    heroFocus: number;
    foot: string;
    emptyNone: [string, string];
  };
  list: {
    h1: [string, string];
    sub: string;
    note: [string, string];
    boxQ: string;
    kwEx: string;
    heroFocus: number;
    /** 飾りの写真を左右反転する(写真の人・物が見出しの文字に重なるとき。体験: パラグライダーが「休日を見つける。」に重なる) */
    heroFlip?: boolean;
    emptyNone: [string, string];
  };
  shop: {
    official: string;
    note: string;
  };
  article: {
    desc: string;
  };
  /** 画面に出さない出典(画像の出どころ)の記録の場所 */
  creditsNote: string;
};

/** 画像の置き場(public)。ページごとに top/・search/・articlelist/ */
export function vkImg(cfg: VkConfig) {
  const root = `/_portal/vkit/${cfg.key}`;
  return { root, top: `${root}/top`, search: `${root}/search`, list: `${root}/articlelist` };
}

export type VkSearchArgs = { kind?: string; pref?: string; q?: string };

export type VkLinks = {
  home: string;
  search: string;
  articles: string;
  searchWith: (f: VkSearchArgs) => string;
  shop: (id?: string) => string;
  article: (id?: string) => string;
};

/** 画面の行き先(最初 /{業種}・探す /{業種}/search・店 /{業種}/shop/{id}・記事の一覧 /{業種}/article・記事 /{業種}/article/{id})。純関数 */
export function vkLinks(cfg: Pick<VkConfig, "base">): VkLinks {
  const base = cfg.base;
  const search = `${base}/search`;
  return {
    home: base,
    search,
    articles: `${base}/article`,
    searchWith: (f) => {
      const p = new URLSearchParams();
      if (f.kind) p.set("kind", f.kind);
      if (f.pref) p.set("pref", f.pref);
      if (f.q) p.set("q", f.q);
      const s = p.toString();
      return s ? `${search}?${s}` : search;
    },
    shop: (id) => (id ? `${base}/shop/${encodeURIComponent(id)}` : search),
    article: (id) => (id ? `${base}/article/${encodeURIComponent(id)}` : `${base}/article`),
  };
}

/** 種類のスラッグ → 種類のアイコンの名前(設定の kinds)。無い・未選択なら先頭の種類の絵 */
export function iconOf(cfg: Pick<VkConfig, "kinds">, slug: string): VkIconKey {
  return (cfg.kinds.find((k) => k.slug === slug) ?? cfg.kinds[0]).icon;
}

/** 業種の key(VerticalKey)として使う(lib/places・lib/seo の関数に渡す) */
export function verticalKeyOf(cfg: Pick<VkConfig, "key">): VerticalKey {
  return cfg.key;
}

/** theme → .vk-root の style(--vk-paper など) */
export function themeStyle(cfg: Pick<VkConfig, "theme" | "ctaW" | "fx">): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(cfg.theme)) out[`--vk-${k}`] = v;
  out["--vk-cta-n"] = cfg.ctaW;
  out["--vk-photo-dim"] = cfg.fx.photoDim;
  out["--vk-hero-dim"] = cfg.fx.heroDim;
  out["--vk-area-dim"] = cfg.fx.areaDim;
  out["--vk-ns"] = cfg.fx.navShift;
  out["--vk-ncc"] = cfg.fx.navChars;
  return out;
}
