/**
 * 山が崩れて手前の壁に寄ったあと、スクロールで「種類の番号順に横一列」へ移る姿勢(描画用)。
 * 物理の姿勢(z, y, 角度)を、スロットの姿勢へ混ぜる。ポールどうしが重ならず、床から浮く時間が短くなるよう決める。
 * KOF: ポール → 種類の番号(0〜5)。番号 0 が奥(画面の上)、5 が手前の壁側。
 */
export type PoleIn = { z: number; y: number; a: number; r: number };
export type PoleOut = { z: number; y: number; a: number };

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const sm = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export const LINE_P0 = 0.5;
export const LINE_P1 = 0.76;

export function slotZ(zMax: number, kind: number) {
  return zMax - 0.5 - 0.015 - (5 - kind) * 1.03;
}

export function linePoses(src: PoleIn[], kof: number[], zMax: number, p: number): PoleOut[] {
  const t = clamp((p - LINE_P0) / (LINE_P1 - LINE_P0), 0, 1);
  const zt = sm(0, 1, t);
  const n = src.length;
  const zs = src.map((b, i) => b.z + (slotZ(zMax, kof[i]) - b.z) * zt);
  // 高さ: 下の段から順に「下にあるポールの上に載る(円どうしが触れる高さ)」で決める。
  // 支えが外れると自然に降り、並びが入れ替わるポールは、隣の上を転がり越える。床から浮く瞬間も、重なりも出ない。
  const order = src.map((b, i) => i).sort((u, v) => src[u].y - src[v].y || u - v);
  const sup = (zi: number, done: number[], ys: number[]) => {
    let y = 0.5;
    for (const j of done) {
      const dz = Math.abs(zi - zs[j]);
      if (dz < 1.0) y = Math.max(y, ys[j] + Math.sqrt(1 - dz * dz));
    }
    return y;
  };
  const ys: number[] = new Array(n);
  const ys0: number[] = new Array(n);
  const done: number[] = [];
  for (const i of order) {
    // 物理の姿勢との差(混ぜはじめの食い違い)は、すぐに消す
    const ysup0 = (() => {
      let y = 0.5;
      for (const j of done) {
        const dz = Math.abs(src[i].z - src[j].z);
        if (dz < 1.0) y = Math.max(y, ys0[j] + Math.sqrt(1 - dz * dz));
      }
      return y;
    })();
    ys0[i] = ysup0;
    const d = src[i].y - ysup0;
    ys[i] = sup(zs[i], done, ys) + d * (1 - sm(0, 0.2, t));
    done.push(i);
  }
  return src.map((b, i) => ({ z: zs[i], y: ys[i], a: b.a - (zs[i] - b.z) / b.r }));
}

/** 評価用: 重なりの最大(pen)と、床にも他のポールにも支えられず浮いている時間の割合(float) */
export function evalLineup(src: PoleIn[], kof: number[], zMax: number, fn: typeof linePoses = linePoses) {
  let pen = 0;
  let floating = 0;
  let steps = 0;
  for (let p = LINE_P0; p <= LINE_P1 + 1e-9; p += 0.004) {
    const o = fn(src, kof, zMax, p);
    steps++;
    let any = false;
    o.forEach((a, i) => {
      o.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.hypot(a.z - b.z, a.y - b.y);
        pen = Math.max(pen, 1 - d);
      });
      if (a.y > 0.62) {
        const supported = o.some((b, j) => j !== i && b.y < a.y - 0.4 && Math.hypot(a.z - b.z, a.y - b.y) < 1.12);
        if (!supported) any = true;
      }
    });
    if (any) floating++;
  }
  return { pen: +pen.toFixed(2), floatFrac: +(floating / steps).toFixed(2) };
}
