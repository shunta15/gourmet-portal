import { vkLine, vkLineOk, type LiveShop } from "../common/live";
import type { VkConfig } from "../config";

/**
 * 記事の一覧(/{業種}/article)の各カードの文言(見出し 2 行・文・アイコンつきの特徴)。
 *
 * 決まり: 全部、その店の紹介記事(lib/places/generated/{業種}.json の article。headline・lede)に書いてある事実だけから作る。
 * 料金・金額・星・口コミ・「おすすめ」「人気」「〇選」・効き目・体験した言い回し・順位づけは書かない。
 * どの文も画面に出す前に vkLineOk(common/live.ts の文の点検)に通す。通らない文は、自動の文に差し替える。
 *
 * 見出し 2 行 = 1 行目「所在地+種類の句(「、」で終わる)」+ 2 行目「店の名前」。
 * 文 = 記事の見出し(headline。事実の 1 行)。無いときは導入の最初の 1 文。
 * 特徴 = アイコンつきの札(所在地・種類・店のタグ 2 つまで)。
 * 写真の切り抜き位置(focus)= 写真の枠が横長(2.3:1)なので、被写体が切れないよう縦の位置を決める。写真の説明(what)に「人」「看板」などがない前提で、上寄り(40%)を既定にする。
 */

export type CardCopy = {
  /** 見出しの 1 行目・2 行目 */
  l1: string;
  l2: string;
  text: string;
  /** アイコンつきの特徴(所在地・種類・店のタグ。2〜4 個) */
  feats: Array<{ key: string; label: string; kind: "pin" | "type" | "tag" }>;
  /** 写真の object-position(縦 %) */
  focusY: number;
};

/** 店名の()の中(読みがな・別名)を落とした名前。落とすと空になるなら、そのまま */
function shortName(name: string): string {
  const x = name.replace(/[（(][^）)]*[）)]/g, "").trim();
  return x || name;
}

/** 1 つ目の「、」「。」までの短い句に */
function clip(t: string, max: number): string {
  const x = t.trim();
  if (x.length <= max) return x;
  const cut = x.slice(0, max);
  const i = Math.max(cut.lastIndexOf("、"), cut.lastIndexOf("。"));
  return i > 8 ? cut.slice(0, i + 1) : `${cut}…`;
}

/** 1 つの店のカードの文言。記事の事実から自動で作る(点検に通ったものだけ) */
export function cardCopyOf(cfg: VkConfig, s: LiveShop): CardCopy {
  // 種類の名前が長い(「車・修理・クリーニング・買取」など)ときは、業種の呼び名(体験・施設・場所)にする
  const kindShort = s.kindName && s.kindName.length <= 9 ? s.kindName : cfg.noun;
  const l1 = `${s.prefName || s.area}の${kindShort}、`;
  const l2 = shortName(s.name);
  const text = clip(vkLine(s.article?.headline) || s.article?.lede || "", 64);
  const feats: CardCopy["feats"] = [
    ...(s.area ? [{ key: "area", label: s.area, kind: "pin" as const }] : []),
    ...(s.kindName ? [{ key: "kind", label: s.kindName, kind: "type" as const }] : []),
    ...s.tags.filter((t) => vkLineOk(t)).slice(0, 2).map((t) => ({ key: `t-${t}`, label: t, kind: "tag" as const })),
  ];
  return { l1: vkLineOk(l1) ? l1 : `${cfg.noun}、`, l2, text, feats, focusY: 40 };
}

/** キーワード検索の対象にする、カードに出る文言(見出し・文・特徴) */
export function cardCopyText(cfg: VkConfig, s: LiveShop): string {
  const c = cardCopyOf(cfg, s);
  return [c.l1, c.l2, c.text, ...c.feats.map((f) => f.label)].join(" ");
}
