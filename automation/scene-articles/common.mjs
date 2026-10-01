/** build-candidates.mjs と emit.mjs が共有する小さな関数（店の事実の取り扱いを一か所に） */
import { existsSync } from "node:fs";
import path from "node:path";
import { ROOT } from "../lib/load-data.mjs";

/** 「—」「—（訪問前に公式確認）」は取れなかった値の印 */
export const isUnknown = (v) => !v || !String(v).trim() || /^[—-]/.test(String(v).trim());
export const known = (v) => (isUnknown(v) ? null : String(v).trim());

/** 店の画像が実写か（プレースホルダでなく、ファイルが実在する） */
export function isRealImage(img) {
  if (!img || img.includes("/restaurants/_placeholder/")) return false;
  if (img.startsWith("/")) return existsSync(path.join(ROOT, "public", decodeURIComponent(img)));
  return true;
}
export const hasRealImage = (r) => isRealImage(r.image);

/** 店がそのシーンに当たるか（/scene/<slug> ページの判定と同じ: tags が matchTags のどれかに一致） */
export const matchesScene = (r, scene) => scene.matchTags.some((t) => (r.tags || []).includes(t));
