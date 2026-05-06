/** 業種カテゴリー（部分一致フィルタリング用） */
export const CUISINE_GROUPS = [
  { label: "居酒屋",       icon: "🍶", keywords: ["居酒屋"] },
  { label: "焼き鳥",       icon: "🔥", keywords: ["焼き鳥", "焼鳥", "炭火焼"] },
  { label: "焼肉",         icon: "🥩", keywords: ["焼肉", "ホルモン"] },
  { label: "和食・割烹",   icon: "🍱", keywords: ["和食", "割烹", "日本料理"] },
  { label: "寿司・海鮮",   icon: "🍣", keywords: ["寿司", "鮨", "海鮮"] },
  { label: "ラーメン",     icon: "🍜", keywords: ["ラーメン", "担々麺", "担担麺", "まぜそば"] },
  { label: "そば・うどん", icon: "🍝", keywords: ["そば", "うどん"] },
  { label: "中華",         icon: "🥢", keywords: ["中華", "中国料理", "餃子"] },
  { label: "イタリアン",   icon: "🍕", keywords: ["イタリアン", "パスタ", "ピッツァ", "ピザ"] },
  { label: "フレンチ",     icon: "🥂", keywords: ["フレンチ", "ビストロ"] },
  { label: "カフェ・喫茶", icon: "☕", keywords: ["カフェ", "喫茶", "コーヒー", "珈琲"] },
  { label: "定食・洋食",   icon: "🍽️", keywords: ["定食", "食堂", "洋食"] },
  { label: "お好み焼き",   icon: "🥞", keywords: ["お好み焼き", "鉄板焼き"] },
  { label: "バー・バル",   icon: "🍸", keywords: ["バー", "バル"] },
] as const;

export type CuisineLabel = typeof CUISINE_GROUPS[number]["label"];
