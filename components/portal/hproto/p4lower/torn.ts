/** 紙の破れた縁を clip-path: polygon(...) で近づける。乱数は種から決まる(サーバーとブラウザで同じ形になる)。 */
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export type Pt = [number, number];
/** 箱(見本の座標 x,y,w,h)の中の多角形。verts は見本の座標(絶対)。辺ごとの揺れ amps(px)で縁を細かく崩す。返すのは % の polygon(...)。 */
export function torn(box: [number, number, number, number], verts: Pt[], seed = 1, amps: number | number[] = 1, step = 13): string {
  const [bx, by, bw, bh] = box;
  const r = rng(seed);
  const out: Pt[] = [];
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const amp = Array.isArray(amps) ? amps[i] ?? 0 : amps;
    out.push(a);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = amp > 0 ? Math.floor(len / step) : 0;
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      out.push([a[0] + (b[0] - a[0]) * t + (r() - 0.5) * 2 * amp, a[1] + (b[1] - a[1]) * t + (r() - 0.5) * 2 * amp]);
    }
  }
  const f = (n: number) => n.toFixed(2);
  return `polygon(${out.map(([x, y]) => `${f(((x - bx) / bw) * 100)}% ${f(((y - by) / bh) * 100)}%`).join(",")})`;
}

/** 揺れなしの多角形(写真の切り抜き)。 */
export function poly(box: [number, number, number, number], verts: Pt[]): string {
  return torn(box, verts, 1, 0);
}
