/** 業種カテゴリー（部分一致フィルタリング用） */
export const CUISINE_GROUPS = [
  { label: "居酒屋",       keywords: ["居酒屋"] },
  { label: "焼き鳥",       keywords: ["焼き鳥", "焼鳥", "炭火焼"] },
  { label: "焼肉",         keywords: ["焼肉", "ホルモン"] },
  { label: "和食・割烹",   keywords: ["和食", "割烹", "日本料理"] },
  { label: "寿司・海鮮",   keywords: ["寿司", "鮨", "海鮮"] },
  { label: "ラーメン",     keywords: ["ラーメン", "担々麺", "担担麺", "まぜそば"] },
  { label: "そば・うどん", keywords: ["そば", "うどん"] },
  { label: "中華",         keywords: ["中華", "中国料理", "餃子"] },
  { label: "イタリアン",   keywords: ["イタリアン", "パスタ", "ピッツァ", "ピザ"] },
  { label: "フレンチ",     keywords: ["フレンチ", "ビストロ"] },
  { label: "カフェ・喫茶", keywords: ["カフェ", "喫茶", "コーヒー", "珈琲"] },
  { label: "定食・洋食",   keywords: ["定食", "食堂", "洋食"] },
  { label: "お好み焼き",   keywords: ["お好み焼き", "鉄板焼き"] },
  { label: "バー・バル",   keywords: ["バー", "バル"] },
] as const;

export type CuisineLabel = typeof CUISINE_GROUPS[number]["label"];
