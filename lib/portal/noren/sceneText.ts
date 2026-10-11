/**
 * 暖簾のシーンのページの、見出しまわりの小さな純関数（サーバー・クライアントのどちらからも使える。データは読まない）。
 *  - sceneAccent: シーンの見出し（tagline）を「前の部分」と「朱にする最後の語」に分ける（「探す。」の形）
 *  - sceneCloth:  見出しの暖簾に染める字（5 字まで）。短くできるものは短く
 */

/** 「、」が無い見出しだけ、朱にする語を指定する（それ以外は最後の「、」の後ろ） */
const ACCENT_FROM: Record<string, string> = {
  "late-night": "気にしない夜",
  bread: "誘われる朝",
};

export function sceneAccent(slug: string, tagline: string): [string, string] {
  const key = ACCENT_FROM[slug];
  if (key && tagline.endsWith(key)) return [tagline.slice(0, tagline.length - key.length), key];
  const i = tagline.lastIndexOf("、");
  if (i > 0 && i < tagline.length - 1) return [tagline.slice(0, i + 1), tagline.slice(i + 1)];
  return ["", tagline];
}

/** 暖簾に染める字。名前が 5 字（漢字・かな・カナ）を超えるものは、短い呼び名にする */
const CLOTH_SHORT: Record<string, string> = {
  "pet-friendly": "ペット",
  bread: "パン",
};

export function sceneCloth(slug: string, name: string): string {
  return CLOTH_SHORT[slug] ?? name;
}
