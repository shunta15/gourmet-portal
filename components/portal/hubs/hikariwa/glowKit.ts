/**
 * 光の輪の描画に使う小さな部品（にじむ光の点の絵・乱数・色の混ぜ）。最初の画面の輪と、下のブロックの大きな輪が共有する。
 */
import type { RGB } from "@/lib/portal/hubs/hikariwa/colors";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ───────────── 乱数（毎回同じ配置にする） ───────────── */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const WHITE: RGB = [255, 250, 244];
export const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a < 0 ? 0 : a > 1 ? 1 : a.toFixed(3)})`;

/** にじむ光の点の絵（中心が白く、色が外へ溶ける） */
export function makeSprite(rgb: RGB, size = 64): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const h = size / 2;
  const grd = g.createRadialGradient(h, h, 0, h, h, h);
  const hot = mix(rgb, WHITE, 0.88);
  const mid = mix(rgb, WHITE, 0.45);
  grd.addColorStop(0, rgba(hot, 1));
  grd.addColorStop(0.14, rgba(hot, 0.9));
  grd.addColorStop(0.3, rgba(mid, 0.5));
  grd.addColorStop(0.58, rgba(rgb, 0.16));
  grd.addColorStop(1, rgba(rgb, 0));
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

/** 色だけの、やわらかい光のかたまり（にじみ用。中心に白を足さない） */
export function makeBlob(rgb: RGB, size = 64): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const h = size / 2;
  const grd = g.createRadialGradient(h, h, 0, h, h, h);
  grd.addColorStop(0, rgba(rgb, 1));
  grd.addColorStop(0.25, rgba(rgb, 0.55));
  grd.addColorStop(0.55, rgba(rgb, 0.16));
  grd.addColorStop(0.8, rgba(rgb, 0.03));
  grd.addColorStop(1, rgba(rgb, 0));
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

