/**
 * 光の輪（HIKARIWA）の「光の色」。純関数（サーバーでもクライアントでも動く）。
 * 業種の色（verticals の accent.color）を、夜の地の上で発光して見える明るさに上げる。
 * 色相は変えない（HSL の H はそのまま。S と L だけ上げる）。
 */

export type RGB = [number, number, number];

const hex = (s: string): RGB => {
  const h = s.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};

function toHsl([r, g, b]: RGB): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const mx = Math.max(R, G, B);
  const mn = Math.min(R, G, B);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  let h = 0;
  let s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (mx === R) h = ((G - B) / d) % 6;
    else if (mx === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function fromHsl(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** 業種色 → 光の色（色相そのまま・明るく）。青〜紫は輝度が低いので、すこし明るめに上げる */
export function glowRgb(color: string): RGB {
  const [h, s, l] = toHsl(hex(color));
  const blue = h >= 195 && h <= 285;
  return fromHsl(h, Math.max(s, 0.62), Math.max(l, blue ? 0.7 : 0.62));
}

export const rgbCss = ([r, g, b]: RGB, a = 1) => (a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`);
