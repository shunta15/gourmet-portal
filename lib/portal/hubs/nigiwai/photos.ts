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
import { getPlaces, type Place } from "@/lib/places";
import { isUsableImage } from "@/lib/portal/photoRules";

/**
 * 輪に並べる 16 枚（時計まわり。隣どうしの色・料理が重ならない順）。
 * 第 2 段階の選び直し（2026-10-07）: 「実際の店で撮られたと分かる写真だけ」にした。
 *   机・盆・皿・卓上の小物・店の窓など、場の手がかりが写っているものだけを残し、
 *   無地・白・単色の背景で切り抜いたように見える写真（スタジオ撮影・素材写真風）は外した。
 *   和（そば・刺身・焼き鳥・お好み焼き・天ぷら・唐揚げ）／洋（オムライス・ナポリタン・カツサンド・ステーキ・パエリア）／
 *   中（小籠包・餃子セット）／麺（そば・ラーメン・ナポリタン）／甘いもの（プリン・カフェのスイーツ）が偏らないように並べた。
 */
export const RING_IDS = [
  "r58", // オムライス（紺の皿・木の卓）
  "r227", // ざるそば（朱の盆）
  "r209", // 小籠包（蒸籠・ランチョンマット）
  "r81", // 刺身（木の台・大葉）
  "r159", // 味噌ラーメン（店名入りの丼）
  "r63", // 焼き鳥（金の文様の皿）
  "r240", // プリン（カフェ）
  "r41", // ナポリタン（黒い皿・木の卓）
  "r154", // カツサンド（藍の絵付けの皿）
  "r104", // 餃子セット（箸・卓上）
  "r198", // ステーキ（藍の染付の皿）
  "r91", // お好み焼き（鉄板）
  "r464", // 海老のパエリア（パエリア鍋）
  "r142", // 天ぷら（染付の鉢・木の卓）
  "r115", // 唐揚げ（青い縁の皿）
  "r371", // カフェのプリンとドリンク（店内）
] as const;

/**
 * スマホの輪は 13 枚（輪の全体が画面に入る大きさにするため）。16 枚のうち r154（カツサンド）・r104（餃子セット）・r115（唐揚げ）を使わない
 * （components/portal/hubs/nigiwai/Nigiwai.tsx の SKIP_M）。
 *
 * 外した写真と理由（第 1 段階で使っていたもの）。
 *   r32 … 無地のオレンジ色の背景に皿とフォークを真上から撮った写真（素材写真風）
 *   r74 … 真上から撮ったピザのアップで、場の手がかりがない（スタジオ撮影風）
 *   r184 … 白い鏡面の上のまぐろの握り（商品写真風）
 *   r201 … 白い背景のパスタ（メニュー写真風）
 *   r134 … 白い背景に白い皿のサラダ
 *   r05 … 白い背景のカキフライ
 *   r39 … 無地の桃色の面に置いたうどん（背景が単色）
 *   r132・r505・r55 … 場の手がかりが少ない／整いすぎて見えるので、より店の空気が写る写真に差し替え
 */

/** 丸く切るときの、中心にしたい位置（object-position）。指定の無い写真は中央 */
const FOCUS: Record<string, string> = {
  r58: "58% 50%",
  r240: "50% 42%",
  r371: "50% 62%",
};

/** 下のブロックの「声」のそばに置く 2 枚 */
export const SIDE_IDS = ["r208", "r398"] as const; // カニフライの洋食（店の窓が写る）／だし巻き玉子（卓上）

export interface DishPhoto {
  src: string;
  srcSet: string;
  /** 縦横比（幅÷高さ） */
  r: number;
  /** 丸く切るときの中心（object-position） */
  pos: string;
}

const toDish = (it: WallItem, max = 800): DishPhoto => {
  const ws = it.ws.filter((w) => w <= max);
  const use = ws.length ? ws : [it.ws[0]];
  return { src: photoSrc(it.h, use[use.length - 1]), srcSet: use.map((w) => `${photoSrc(it.h, w)} ${w}w`).join(", "), r: it.r, pos: FOCUS[it.id] ?? "50% 50%" };
};

export async function getNigiwaiPhotos(): Promise<{ ring: DishPhoto[]; side: DishPhoto[] }> {
  const wall = await loadWall();
  const by = new Map(wall.items.map((x) => [x.id, x]));
  const pick = (ids: readonly string[], max = 800) => ids.map((id) => by.get(id)).filter((x): x is WallItem => !!x).map((x) => toDish(x, max));
  // 場面 1 の大きい写真（最大 340px 径。2 倍の画面で 680px）は、1200 まで読ませる
  return { ring: pick(RING_IDS), side: pick(SIDE_IDS, 1200) };
}

/**
 * ビューティー・ボディケアの写真の輪（2026-10-09 オーナー指示）。その業種の店データ（lib/places/generated/*.json）の image（1 枚め）から作る。
 *  - 枚数は、グルメの輪と同じ RING_SIZE（16）。写真のある店（使ってよい写真）が 16 に満たない業種は、輪にしない（空の輪＝[]。今までどおり業種の色の空の丸）。
 *    8〜15 枚の小さい輪は作らない（輪の大きさ・並びがスマホと PC で枚数ごとに変わるため）。同じ写真を繰り返して数合わせもしない。
 *  - どの店を使うかは、データだけで決まる（無作為にしない。同じデータなら必ず同じ輪）。種類・都道府県がばらけるように、貪欲に選ぶ:
 *    1 枚ずつ、直近 5 枚と同じ県・同じ種類を避け（隣どうしが重ならない）、それが同点なら、ここまでに多く選んだ県・種類を避け、それでも同点なら店 ID の順。
 */
export const RING_SIZE = RING_IDS.length;

export interface VerticalRingPhoto {
  /** サイト内の画像のパス（/_portal/vshops/…） */
  src: string;
  /** 店名 */
  alt: string;
  /** 丸く切るときの中心（object-position） */
  pos: string;
}

/** 写真のある店から、種類・都道府県がばらけるように size 枚を決まった順に選ぶ。足りなければ []（数合わせはしない） */
export function pickRing(places: Place[], size = RING_SIZE): Place[] {
  const pool = places.filter((p) => isUsableImage(p.image)).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (pool.length < size) return [];
  const chosen: Place[] = [];
  const used = { pref: new Map<string, number>(), cat: new Map<string, number>() };
  const count = (m: Map<string, number>, k: string) => m.get(k) ?? 0;
  while (chosen.length < size) {
    const recent = chosen.slice(-5);
    let best: Place | null = null;
    let bestScore: number[] = [];
    for (const p of pool) {
      if (chosen.includes(p)) continue;
      const score = [
        recent.filter((r) => r.pref === p.pref).length + recent.filter((r) => r.category === p.category).length,
        count(used.pref, p.pref),
        count(used.cat, p.category),
      ];
      const better = !best || score.some((v, i) => (score[i] !== bestScore[i] ? v < bestScore[i] : false) && score.slice(0, i).every((x, j) => x === bestScore[j]));
      if (better) {
        best = p;
        bestScore = score;
      }
    }
    if (!best) break;
    chosen.push(best);
    used.pref.set(best.pref, count(used.pref, best.pref) + 1);
    used.cat.set(best.category, count(used.cat, best.category) + 1);
  }
  return chosen;
}

export async function getVerticalRings(): Promise<{ beauty: VerticalRingPhoto[]; bodycare: VerticalRingPhoto[] }> {
  const toRing = (ps: Place[]): VerticalRingPhoto[] => pickRing(ps).map((p) => ({ src: p.image as string, alt: p.name, pos: "50% 50%" }));
  const [b, o] = await Promise.all([getPlaces("beauty"), getPlaces("bodycare")]);
  return { beauty: toRing(b), bodycare: toRing(o) };
}
