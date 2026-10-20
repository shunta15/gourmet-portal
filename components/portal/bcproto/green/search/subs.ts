/**
 * 探すのカードの右の小さな写真(店ごとに 0〜3 枚)。GreenShop には main の 1 枚しか無いので、本番の loadShops の subs(main と重ならない写真)を ID で引く。
 * サーバー専用。写真は店のデータにある実在の写真だけ(飾り・AI 画像は使わない)。
 */
import "server-only";
import { cache } from "react";
import { loadShops } from "@/lib/portal/colorplay/data";
import { BODYCARE_SITE } from "@/lib/portal/vert/bodysearch/site";

export type SubPhoto = { src: string; w: number; h: number };

export const loadSubPhotos = cache(async (): Promise<Map<string, SubPhoto[]>> => {
  const shops = await loadShops(BODYCARE_SITE);
  return new Map(shops.map((s) => [s.id, s.subs.slice(0, 3).map((p) => ({ src: p.src, w: p.w ?? 1200, h: p.h ?? 800 }))]));
});
