/**
 * 最初のページの「種類を、選ぶ。」の札に使う写真の表(種類のキー → 写真)。表はここ 1 か所。
 * 種類と合う写真だけを置く(合わない写真は出さない)。無い種類は、色面と大きな字だけの札になる。
 * オーナーが種類ごとの画像を用意したら、この表にファイル名を足す(同じファイル名で差し替えるだけでも使える)。
 * w・h は比率の目安(画面の大きさは CSS が決める。固定のピクセル数には縛られない)。
 */
export type KindImage = { src: string; w: number; h: number; pos?: string }; // pos: 札の中で写真のどこを見せるか(object-position。省略時は CSS の 50% 22%)

export const KIND_IMAGES: Record<string, KindImage | undefined> = {
  hair: { src: "/_portal/bproto/colorplay/hair-panel.jpg", w: 802, h: 820 }, // 2026-10-14 オーナー提供の画像に差し替え(元 1600×1636 を縮小)
  // 2026-10-14 オーナー提供の画像(元 1456〜1680px を札用に縮小)
  nail: { src: "/_portal/bproto/colorplay/kind-nail.jpg", w: 820, h: 608, pos: "50% 50%" },
  esthetic: { src: "/_portal/bproto/colorplay/kind-esthetic.jpg", w: 820, h: 546 },
  "hair-removal": { src: "/_portal/bproto/colorplay/kind-hair-removal.jpg", w: 656, h: 820 },
  eyelash: { src: "/_portal/bproto/colorplay/kind-eyelash.jpg", w: 820, h: 781, pos: "62% 55%" },
};
