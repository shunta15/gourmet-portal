/**
 * 「さがす」の地図の見た目 f・g・h が、その地域の画像を持っているか（持たない地域は e の絵を出す。画面の注記にも使う）。軽い関数（fs を使わない）。
 */
import { ILLUST, ILLUST_JAPAN } from "./illustMaps.generated";

export type IllustMode = "a" | "e" | "f" | "g" | "h";

/** f・g・h で、地域の画像が無く e の絵を出すとき true（regionKey が空 = 全国） */
export function usesEPicture(mode: string, regionKey: string): boolean {
  if (mode !== "f" && mode !== "g" && mode !== "h") return false;
  if (!regionKey) return !ILLUST_JAPAN[mode];
  return !ILLUST[mode][regionKey];
}
