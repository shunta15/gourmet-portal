/**
 * 「にぎわいの輪」案に並べる料理写真。サーバー専用（写真の対応表が大きいので、クライアントから import しない）。
 *
 * 総合サイトの既存の仕組み（lib/portal/photoWall.ts の loadWall）が返す写真だけを使う。
 * その中で、`isUsableImage`（食べログ系・検閲済み・プレースホルダを除く）を通り、掲載中の店で、事前生成の WebP がある写真だけが来る。
 * どの店を並べるかは、候補 220 枚を丸く切ったコンタクトシートで 1 枚ずつ目視して決めた（2026-10-07）。
 * 基準: 明るい・料理が主役・丸く切っても何の料理か分かる・色が重ならない。粗い・暗い・人の顔が主役・料理でないものは外した。
 * 店の名前・評価は画面に出さない（写真は alt なしの飾り）。ここに店IDを持つのは、どの写真かを人が追えるようにするため。
 */
import "server-only";
import { loadWall } from "@/lib/portal/photoWall";
import { photoSrc, type WallItem } from "@/lib/portal/photoWallShared";

/** 輪に並べる 16 枚（時計まわり。隣どうしの色・料理が重ならない順） */
export const RING_IDS = [
  "r74", // マルゲリータ（赤・白）
  "r39", // うどん（白）
  "r58", // オムライス（黄）
  "r134", // サラダ（緑）
  "r184", // まぐろの握り（赤）
  "r209", // 小籠包（蒸籠）
  "r464", // 海老のパエリア（橙・緑）
  "r142", // 天ぷら（青い皿）
  "r201", // ナスのパスタ（赤橙）
  "r505", // 寿司盛り合わせ
  "r240", // プリン（淡い黄）
  "r05", // カキフライ（金）
  "r55", // 鴨と南瓜（藍の皿）
  "r91", // お好み焼き（黄・緑）
  "r132", // 焼き鳥（茶）
  "r32", // 皿のサラダ（橙の地に白い皿）
] as const;

/** 下のブロックの「声」のそばに置く 2 枚 */
export const SIDE_IDS = ["r208", "r398"] as const; // カニ／だし巻き玉子

export interface DishPhoto {
  src: string;
  srcSet: string;
  /** 縦横比（幅÷高さ） */
  r: number;
}

const toDish = (it: WallItem): DishPhoto => {
  const ws = it.ws.filter((w) => w <= 800);
  const use = ws.length ? ws : [it.ws[0]];
  return { src: photoSrc(it.h, use[use.length - 1]), srcSet: use.map((w) => `${photoSrc(it.h, w)} ${w}w`).join(", "), r: it.r };
};

export async function getNigiwaiPhotos(): Promise<{ ring: DishPhoto[]; side: DishPhoto[] }> {
  const wall = await loadWall();
  const by = new Map(wall.items.map((x) => [x.id, x]));
  const pick = (ids: readonly string[]) => ids.map((id) => by.get(id)).filter((x): x is WallItem => !!x).map(toDish);
  return { ring: pick(RING_IDS), side: pick(SIDE_IDS) };
}
