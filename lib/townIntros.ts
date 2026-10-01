/**
 * 街ページ（/region/<region>/<街>）の紹介文。
 *
 * 鍵は `<region>/<街>`（lib/towns.ts の townKey と同じ。例: "osaka/大阪市北区"）。
 * 中身は別担当が書く（3店以上の街が対象。WebSearch で事実確認・マチノワ編集部トーン・推測と誇張なし）。
 * ここに無い街は、街ページが掲載店の数と一覧だけの簡素な導入になる。
 *
 *   lede   導入文（200〜400字。事実だけ・来店体験の創作禁止）
 *   facts  事実の箇条書き。1項目ごとに出典（公式サイト名・URL・統計名など）を必ず付ける。
 *          出典を示せない事実は書かない。
 */
export type TownFact = { k: string; v: string; source: string };
export type TownIntro = { lede: string; facts: TownFact[] };

export const TOWN_INTROS: Record<string, TownIntro> = {};
