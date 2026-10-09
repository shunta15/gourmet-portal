/**
 * 転がしのカメラ。描く側(シェーダー)と、画面の位置を出す側(リンクの重ね・ポインター)が同じ式を使う。
 * 世界: x = ポールの軸(右)、y = 上、z = 手前。
 */

export type Cam = {
  pos: [number, number, number];
  f: [number, number, number];
  r: [number, number, number];
  u: [number, number, number];
  tan: number; // tan(縦の画角 / 2)
  sx: number; // レンズのずらし(-1..1。+ で、狙いが画面の右へ)
  aspect: number;
};

export type CamParams = {
  tx: number;
  ty: number;
  tz: number;
  yaw: number;
  el: number;
  dist: number;
  fovDeg: number;
  sx: number;
  sy: number;
};

const norm = (v: number[]): [number, number, number] => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: number[], b: number[]): [number, number, number] => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function makeCam(p: CamParams, aspect: number): Cam & { sy: number } {
  const ce = Math.cos(p.el);
  const pos: [number, number, number] = [p.tx + p.dist * Math.sin(p.yaw) * ce, p.ty + p.dist * Math.sin(p.el), p.tz + p.dist * Math.cos(p.yaw) * ce];
  const f = norm([p.tx - pos[0], p.ty - pos[1], p.tz - pos[2]]);
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  return { pos, f, r, u, tan: Math.tan((p.fovDeg * Math.PI) / 360), sx: p.sx, sy: p.sy, aspect };
}

/** 世界の点 → 画面の css px(0..w, 0..h) */
export function project(c: Cam & { sy?: number }, x: number, y: number, z: number, w: number, h: number): { x: number; y: number; d: number; s: number } {
  const dx = x - c.pos[0];
  const dy = y - c.pos[1];
  const dz = z - c.pos[2];
  const zc = dx * c.f[0] + dy * c.f[1] + dz * c.f[2];
  const xc = dx * c.r[0] + dy * c.r[1] + dz * c.r[2];
  const yc = dx * c.u[0] + dy * c.u[1] + dz * c.u[2];
  const nx = xc / (zc * c.tan * c.aspect) + c.sx;
  const ny = yc / (zc * c.tan) + (c.sy ?? 0);
  return { x: ((nx + 1) / 2) * w, y: ((1 - ny) / 2) * h, d: zc, s: h / (2 * zc * c.tan) };
}

/** 画面の点 css px → 視線(原点と向き) */
export function ray(c: Cam & { sy?: number }, px: number, py: number, w: number, h: number): { o: [number, number, number]; d: [number, number, number] } {
  const nx = (px / w) * 2 - 1 - c.sx;
  const ny = 1 - (py / h) * 2 - (c.sy ?? 0);
  const d = norm([
    c.f[0] + nx * c.aspect * c.tan * c.r[0] + ny * c.tan * c.u[0],
    c.f[1] + nx * c.aspect * c.tan * c.r[1] + ny * c.tan * c.u[1],
    c.f[2] + nx * c.aspect * c.tan * c.r[2] + ny * c.tan * c.u[2],
  ]);
  return { o: c.pos, d };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * スクロール 0..1 のカメラ。
 * 0: 山を斜め上から(軸の端の断面が見える)。 1: 6 本が並んだ列を高い所から。
 * mobile: 縦長の画面は、画角と距離を変える。
 */
export function camAt(s: number, aspect: number, mobile: boolean, drift: { x: number; y: number }): CamParams {
  const e = s * s * (3 - 2 * s);
  if (mobile) {
    const a: CamParams = { tx: 0.1, ty: 1.2, tz: 0.15, yaw: 0.74, el: 0.44, dist: 18.5, fovDeg: 30, sx: 0, sy: -0.5 };
    const b: CamParams = { tx: 0.1, ty: 0.4, tz: 0.55, yaw: 0.2, el: 0.9, dist: 26.5, fovDeg: 30, sx: 0, sy: -0.27 };
    return {
      tx: lerp(a.tx, b.tx, e) + drift.x * 0.02,
      ty: lerp(a.ty, b.ty, e),
      tz: lerp(a.tz, b.tz, e),
      yaw: lerp(a.yaw, b.yaw, e) + drift.x * 0.02,
      el: lerp(a.el, b.el, e) + drift.y * 0.012,
      dist: lerp(a.dist, b.dist, e),
      fovDeg: a.fovDeg,
      sx: 0,
      sy: lerp(a.sy, b.sy, e),
    };
  }
  const a: CamParams = { tx: 0.0, ty: 1.0, tz: 0.0, yaw: 0.6, el: 0.42, dist: 15.5, fovDeg: 22, sx: 0.34, sy: 0.04 };
  const b: CamParams = { tx: 0.0, ty: 0.3, tz: 0.35, yaw: 0.16, el: 0.9, dist: 17.0, fovDeg: 22, sx: 0.2, sy: 0.0 };
  void aspect;
  return {
    tx: lerp(a.tx, b.tx, e) + drift.x * 0.04,
    ty: lerp(a.ty, b.ty, e),
    tz: lerp(a.tz, b.tz, e),
    yaw: lerp(a.yaw, b.yaw, e) + drift.x * 0.018,
    el: lerp(a.el, b.el, e) + drift.y * 0.01,
    dist: lerp(a.dist, b.dist, e),
    fovDeg: a.fovDeg,
    sx: lerp(a.sx, b.sx, e),
    sy: lerp(a.sy, b.sy, e),
  };
}
