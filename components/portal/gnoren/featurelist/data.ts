import type { ThemeKey } from "./icons";

// 見本 5 の仮の文章をそのまま入れる(本物のデータへの置き換えは後)。
export const SAMPLE_HREF = "/proto-gourmet/n/feature/sample";

export type Theme = {
  key: ThemeKey;
  noren: string; // 暖簾のラベル
  head: string; // カード見出し「ランチ」+「の特集」
  tone: "red" | "linen" | "green" | "olive";
  title: [string, string];
  desc: [string, string];
  // 見本 5 での位置(画素)。行・左端・幅
  row: 1 | 2;
  x: number;
  w: number;
};

export const THEMES: Theme[] = [
  { key: "lunch", noren: "ランチ", head: "ランチ", tone: "red", title: ["心もお腹も満たされる、", "ごほうびランチ"], desc: ["地元で人気のランチスポットを厳選。", "日常にちょっとした幸せを。"], row: 1, x: 42, w: 241 },
  { key: "cafe", noren: "カフェ", head: "カフェ", tone: "linen", title: ["やさしい時間が流れる", "街のカフェ案内"], desc: ["こだわりのコーヒーと、心ほどける甘いもの。", "お気に入りのカフェがきっと見つかる。"], row: 1, x: 298, w: 237 },
  { key: "walk", noren: "街歩き", head: "街歩き", tone: "green", title: ["歩いて見つける、", "街の美味しい景色"], desc: ["食べて、歩いて、また食べて。", "街歩きがもっと楽しくなるスポットを紹介。"], row: 1, x: 553, w: 237 },
  { key: "date", noren: "デート", head: "デート", tone: "red", title: ["大切な人と行きたい", "とっておきの店"], desc: ["記念日や特別な日に。", "雰囲気の良いレストランや隠れ家をご紹介。"], row: 1, x: 806, w: 242 },
  { key: "solo", noren: "ひとり時間", head: "ひとり時間", tone: "olive", title: ["ひとりだから見つかる、", "お気に入りの一軒"], desc: ["気ままに、ゆったりと。", "ひとり時間を豊かにしてくれるお店たち。"], row: 2, x: 42, w: 327 },
  { key: "family", noren: "家族で", head: "家族で", tone: "red", title: ["みんなで楽しむ", "家族のグルメ時間"], desc: ["子どもと一緒に楽しめるお店や、", "家族でのおでかけにぴったりのスポットを。"], row: 2, x: 388, w: 315 },
  { key: "area", noren: "エリア別", head: "エリア別", tone: "linen", title: ["エリアでめぐる", "この街の美味しい店"], desc: ["駅周辺・中心街・海辺エリアなど、", "エリアごとにおすすめのお店をまとめました。"], row: 2, x: 721, w: 324 },
];

export type NewItem = { img: string; title: [string, string]; tags: { t: string; warm: boolean }[]; date: string; x: number; w: number };
export const NEWS: NewItem[] = [
  { img: "n1", title: ["地元食材で味わう、", "季節のごちそう"], tags: [{ t: "ランチ", warm: true }, { t: "地元食材", warm: true }], date: "2024.05.10", x: 43, w: 185 },
  { img: "n2", title: ["春に行きたい", "とっておきのカフェ5選"], tags: [{ t: "カフェ", warm: false }, { t: "スイーツ", warm: true }], date: "2024.05.08", x: 246, w: 186 },
  { img: "n3", title: ["夜の街を楽しむ", "はしご酒さんぽ"], tags: [{ t: "街歩き", warm: false }, { t: "居酒屋", warm: false }], date: "2024.05.06", x: 450, w: 186 },
  { img: "n4", title: ["大人のデートにおすすめ", "雰囲気のいいイタリアン"], tags: [{ t: "デート", warm: true }, { t: "記念日", warm: true }], date: "2024.05.02", x: 654, w: 186 },
  { img: "n5", title: ["子どもと一緒に行きたい", "やさしい味のお店"], tags: [{ t: "家族で", warm: false }, { t: "子連れ", warm: false }], date: "2024.04.28", x: 860, w: 184 },
];

// 暖簾の中身の位置(見本の画素)。icon/label = 中心。ih = アイコンの高さ。rot = 傾き(度)。tone = 文字色
export const NOREN_CONTENT: Record<ThemeKey, { icon: [number, number]; ih: number; label: [number, number]; lh: number; rot: number; tone: "red" | "dark" | "green" }> = {
  lunch: { icon: [375.5, 124.5], ih: 33, label: [373.5, 161.5], lh: 13, rot: 6, tone: "red" },
  cafe: { icon: [470.5, 131.5], ih: 28, label: [467.7, 168], lh: 13, rot: 2, tone: "dark" },
  walk: { icon: [567, 134.5], ih: 34, label: [566, 172.5], lh: 13.5, rot: 0.5, tone: "green" },
  date: { icon: [668, 139.5], ih: 34, label: [665.5, 178], lh: 13.5, rot: 0.5, tone: "red" },
  solo: { icon: [770, 138.5], ih: 30, label: [770.5, 176.5], lh: 13.5, rot: 0, tone: "green" },
  family: { icon: [873.5, 137.5], ih: 31, label: [873.7, 175.7], lh: 13.5, rot: -0.5, tone: "red" },
  area: { icon: [980.5, 131], ih: 33, label: [982.7, 167.5], lh: 13.5, rot: -2, tone: "red" },
};
