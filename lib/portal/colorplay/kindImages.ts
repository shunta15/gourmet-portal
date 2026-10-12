/**
 * 最初のページの「種類を、選ぶ。」の札に使う写真の表(種類のキー → 写真)。表はここ 1 か所。
 * 種類と合う写真だけを置く(合わない写真は出さない)。無い種類は、色面と大きな字だけの札になる。
 * オーナーが種類ごとの画像を用意したら、この表にファイル名を足す(同じファイル名で差し替えるだけでも使える)。
 * w・h は比率の目安(画面の大きさは CSS が決める。固定のピクセル数には縛られない)。
 */
export type KindImage = { src: string; w: number; h: number };

export const KIND_IMAGES: Record<string, KindImage | undefined> = {
  hair: { src: "/_portal/bproto/colorplay/ref-hair.jpg", w: 296, h: 264 },
  nail: { src: "/_portal/bproto/colorplay/own-nails.jpg", w: 380, h: 282 },
  // esthetic・hair-removal・eyelash: 合う写真がまだ無い(色面と大きな字だけ)
};
