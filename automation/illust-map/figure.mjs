// 「さがす」の入口の、小さな日本の図（地方ごとに色分けした手描き風）を、国土地理院ベクトルタイル（z6。海岸線 coastline と 都府県界 boundary 51212）から作る。Node だけで動く（新しい npm パッケージは使わない）。
//   使い方: node automation/illust-map/figure.mjs        出力: lib/portal/noren/areaFigure.generated.ts（地方ごとの輪郭の path と、海岸線の path）
// 作り方: 海岸線を格子に刻み、角の海から塗りつぶして海を求める（陸 = 海でないところ）。都府県界を壁にして、47 都道府県の県庁所在地から同時に塗り広げ（幅優先）、
//   各県を地方（lib/portal/noren/areaGroups.ts の AREA_DEFS と同じ区分。県の対応は下の PREF_AREA）に分ける。島は、いちばん近い陸の地方に入れる。
//   各地方の輪郭は、格子の境目をたどって輪にし、座標だけで決まる滑らかなずれ（手描きの揺れ）をつけて、間引いて滑らかな曲線にする。
// タイルは automation/illust-map/cache/ から読む（無ければ fetch.mjs が礼儀正しい間隔で取る）。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { decodeTile } from "./mvt.mjs";
import { getTile } from "./fetch.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(ROOT, "lib/portal/noren/areaFigure.generated.ts");

const Z = 6;
const BB = { south: 24.0, north: 45.65, west: 122.6, east: 146.0 }; // 図の範囲（北方領土は入れない）
const CJ = Number(process.env.CJ || 2); // 格子 1 マス = z6 の CJ px（細いほど、瀬戸内海のような狭い海峡も海として残る）
const S = 4 / CJ; // 4px のときの大きさを 1 とした倍率（間引き・揺れ・小さな島の閾値をそろえる）
const worldX = (lon) => ((lon + 180) / 360) * 256 * 2 ** Z;
const worldY = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 256 * 2 ** Z;
};
const X0 = Math.floor(worldX(BB.west)), X1 = Math.ceil(worldX(BB.east));
const Y0 = Math.floor(worldY(BB.north)), Y1 = Math.ceil(worldY(BB.south));
const W = X1 - X0, H = Y1 - Y0;
const GW = Math.ceil(W / CJ), GH = Math.ceil(H / CJ);

// ---- 47 都道府県の県庁所在地（おおよその位置）→ 地方 ----
const AREAS = ["hokkaido-tohoku", "kanto", "chubu", "kinki", "chugoku-shikoku", "kyushu-okinawa"];
const PREF_AREA = {
  hokkaido: [0, 43.0642, 141.3469], aomori: [0, 40.8244, 140.74], iwate: [0, 39.7036, 141.1527], miyagi: [0, 38.2688, 140.8721], akita: [0, 39.7186, 140.1024], yamagata: [0, 38.2405, 140.3633], fukushima: [0, 37.7503, 140.4676],
  ibaraki: [1, 36.3418, 140.4468], tochigi: [1, 36.5658, 139.8836], gunma: [1, 36.3912, 139.0608], saitama: [1, 35.8569, 139.6489], chiba: [1, 35.6047, 140.1233], tokyo: [1, 35.6895, 139.6917], kanagawa: [1, 35.4478, 139.6425],
  izuoshima: [1, 34.74, 139.37], hachijo: [1, 33.11, 139.8],
  niigata: [2, 37.9026, 139.0236], toyama: [2, 36.6953, 137.2113], ishikawa: [2, 36.5613, 136.6562], fukui: [2, 36.0652, 136.2216], yamanashi: [2, 35.6636, 138.5684], nagano: [2, 36.6513, 138.181], gifu: [2, 35.3912, 136.7223], shizuoka: [2, 34.9769, 138.3831], aichi: [2, 35.1815, 136.9066],
  mie: [3, 34.7303, 136.5086], shiga: [3, 35.0045, 135.8686], kyoto: [3, 35.0116, 135.7681], osaka: [3, 34.6937, 135.5023], hyogo: [3, 34.6913, 135.183], nara: [3, 34.6851, 135.8049], wakayama: [3, 34.226, 135.1675],
  tottori: [4, 35.5039, 134.2383], shimane: [4, 35.4723, 133.0505], okayama: [4, 34.6617, 133.935], hiroshima: [4, 34.3853, 132.4553], yamaguchi: [4, 34.1861, 131.4705], tokushima: [4, 34.0658, 134.5593], kagawa: [4, 34.3401, 134.0434], ehime: [4, 33.8416, 132.7657], kochi: [4, 33.5597, 133.5311],
  fukuoka: [5, 33.6064, 130.4181], saga: [5, 33.2494, 130.2988], nagasaki: [5, 32.7503, 129.8777], kumamoto: [5, 32.7898, 130.7417], oita: [5, 33.2382, 131.6126], miyazaki: [5, 31.9111, 131.4239], kagoshima: [5, 31.5602, 130.5581], okinawa: [5, 26.2124, 127.6809],
};

// ---- タイルから海岸線と都府県界を集める ----
const tx0 = Math.floor(X0 / 256), tx1 = Math.floor((X1 - 1) / 256), ty0 = Math.floor(Y0 / 256), ty1 = Math.floor((Y1 - 1) / 256);
const coast = []; // 線ごとの [[格子x, 格子y],…]（小数）
const border = [];
const toCell = (tx, ty, vx, vy, ext) => [((tx - 0) * 256 + (vx * 256) / ext - X0) / CJ, ((ty - 0) * 256 + (vy * 256) / ext - Y0) / CJ];
for (let ty = ty0; ty <= ty1; ty++)
  for (let tx = tx0; tx <= tx1; tx++) {
    const buf = await getTile(Z, tx, ty);
    if (!buf.length) continue;
    const L = decodeTile(buf);
    const e0 = L.coastline?.extent ?? 16384;
    for (const ft of L.coastline?.features ?? [])
      for (const line of ft.rings) {
        if (line.length < 2) continue;
        // タイルの外側の余白（バッファ）の部分は切り落とし、隣のタイルとの二重線を避ける
        const inside = line.map(([vx, vy]) => vx >= 0 && vx <= e0 && vy >= 0 && vy <= e0);
        let cur = [];
        for (let i = 0; i < line.length; i++) {
          const near = inside[i] || inside[i - 1] || inside[i + 1];
          if (near) cur.push(toCell(tx, ty, line[i][0], line[i][1], e0));
          else {
            if (cur.length > 1) coast.push(cur);
            cur = [];
          }
        }
        if (cur.length > 1) coast.push(cur);
      }
    const eb = L.boundary?.extent ?? 16384;
    for (const ft of L.boundary?.features ?? []) {
      if (ft.props.ftCode !== 51212) continue; // 都府県界
      for (const line of ft.rings) if (line.length > 1) border.push(line.map(([vx, vy]) => toCell(tx, ty, vx, vy, eb)));
    }
  }

// ---- 格子: 1 = 海岸線の格子、2 = 海、4 = 都府県界の壁 ----
const g = new Uint8Array(GW * GH);
const markLine = (l, bit, rad) => {
  for (let i = 1; i < l.length; i++) {
    const [ax, ay] = l[i - 1], [bx, by] = l[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.5));
    for (let k = 0; k <= n; k++) {
      const cx = Math.floor(ax + ((bx - ax) * k) / n), cy = Math.floor(ay + ((by - ay) * k) / n);
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        const X = cx + dx, Y = cy + dy;
        if (X >= 0 && Y >= 0 && X < GW && Y < GH) g[Y * GW + X] |= bit;
      }
    }
  }
};
for (const l of coast) markLine(l, 1, 0);
for (const l of border) markLine(l, 4, 1);
// 海: 角から、海岸線の格子（1）に当たるまで塗りつぶす（壁は海の邪魔をしない = 壁の格子も通れる。壁は陸の中にしか無い）
const sea = new Uint8Array(GW * GH);
{
  const stack = [];
  const push = (X, Y) => { if (X >= 0 && Y >= 0 && X < GW && Y < GH && !sea[Y * GW + X] && !(g[Y * GW + X] & 1)) { sea[Y * GW + X] = 1; stack.push(Y * GW + X); } };
  for (let X = 0; X < GW; X++) { push(X, 0); push(X, GH - 1); }
  for (let Y = 0; Y < GH; Y++) { push(0, Y); push(GW - 1, Y); }
  while (stack.length) { const c = stack.pop(); const X = c % GW, Y = (c / GW) | 0; push(X + 1, Y); push(X - 1, Y); push(X, Y + 1); push(X, Y - 1); }
}
const land = (i) => !sea[i];

// ---- 県庁所在地から同時に塗り広げて、地方に分ける（壁は越えない）----
const label = new Int8Array(GW * GH).fill(-1);
let queue = [];
const cellOf = (lat, lng) => [Math.floor((worldX(lng) - X0) / CJ), Math.floor((worldY(lat) - Y0) / CJ)];
for (const [name, [a, lat, lng]] of Object.entries(PREF_AREA)) {
  const [X, Y] = cellOf(lat, lng);
  const i = Y * GW + X;
  if (X < 0 || Y < 0 || X >= GW || Y >= GH || !land(i)) { console.warn("seed not on land:", name, X, Y); continue; }
  if (label[i] === -1) { label[i] = a; queue.push(i); }
}
for (let h = 0; h < queue.length; h++) {
  const c = queue[h];
  const X = c % GW, Y = (c / GW) | 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = X + dx, ny = Y + dy;
    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
    const ni = ny * GW + nx;
    if (label[ni] !== -1 || !land(ni) || (g[ni] & 4)) continue;
    label[ni] = label[c];
    queue.push(ni);
  }
}
// 壁の格子と、壁に囲まれて届かなかった陸（島・入り組んだ所）: 近くの塗られた格子の地方を借りる（繰り返し、少しずつ広げる）
for (let pass = 0; pass < 400; pass++) {
  const add = [];
  for (let Y = 0; Y < GH; Y++) for (let X = 0; X < GW; X++) {
    const i = Y * GW + X;
    if (label[i] !== -1 || !land(i)) continue;
    const votes = {};
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = X + dx, ny = Y + dy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const l = label[ny * GW + nx];
      if (l !== -1) votes[l] = (votes[l] ?? 0) + 1;
    }
    const best = Object.entries(votes).sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
    if (best) add.push([i, Number(best[0])]);
  }
  if (!add.length) break;
  for (const [i, l] of add) label[i] = l;
}
// 島（陸でつながっていない）: 海をまたいで、いちばん近い塗られた格子の地方（幅優先。遠さに上限）
{
  const dist = new Int16Array(GW * GH).fill(-1);
  const lab = new Int8Array(GW * GH).fill(-1);
  const q = [];
  for (let i = 0; i < GW * GH; i++) if (label[i] !== -1) { dist[i] = 0; lab[i] = label[i]; q.push(i); }
  for (let h = 0; h < q.length; h++) {
    const c = q[h];
    if (dist[c] >= 60) continue;
    const X = c % GW, Y = (c / GW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = X + dx, ny = Y + dy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const ni = ny * GW + nx;
      if (dist[ni] !== -1) continue;
      dist[ni] = dist[c] + 1;
      lab[ni] = lab[c];
      q.push(ni);
    }
  }
  for (let i = 0; i < GW * GH; i++) if (label[i] === -1 && land(i)) label[i] = lab[i];
}

// ---- 手描きの揺れと、path の作り方 ----
const makeDisp = (amp) => (x, y) => {
  x /= S; y /= S; // 周期は、格子の細かさによらず同じ（z6 の px で決める）
  return [
    amp * (Math.sin(y * 0.21 + 1.7 * Math.sin(x * 0.13)) + 0.5 * Math.sin(x * 0.44 + y * 0.28)),
    amp * (Math.sin(x * 0.19 + 1.3 * Math.sin(y * 0.15)) + 0.5 * Math.sin(y * 0.52 - x * 0.2)),
  ];
};
const disp = makeDisp(0.28 * S);
const dp = ([x, y]) => { const [dx, dy] = disp(x, y); return [x + dx, y + dy]; };
const r1 = (n) => Math.round((n / S) * 10) / 10; // 出力は「4px = 1 単位」
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  const t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      let d2;
      if (len2 === 0) d2 = (pts[i][0] - ax) ** 2 + (pts[i][1] - ay) ** 2;
      else {
        const t = Math.max(0, Math.min(1, ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / len2));
        d2 = (pts[i][0] - ax - t * dx) ** 2 + (pts[i][1] - ay - t * dy) ** 2;
      }
      if (d2 > md) { md = d2; mi = i; }
    }
    if (md > t2 && mi > 0) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const smoothPath = (pts, closed) => {
  if (pts.length < 2) return "";
  if (pts.length < 4) return `M${r1(pts[0][0])} ${r1(pts[0][1])}` + pts.slice(1).map((p) => `L${r1(p[0])} ${r1(p[1])}`).join("") + (closed ? "Z" : "");
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d;
  if (closed) {
    const n = pts.length;
    const m0 = mid(pts[n - 1], pts[0]);
    d = `M${r1(m0[0])} ${r1(m0[1])}`;
    for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); d += `Q${r1(pts[i][0])} ${r1(pts[i][1])} ${r1(m[0])} ${r1(m[1])}`; }
    return d + "Z";
  }
  d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) { const m = mid(pts[i], pts[i + 1]); d += `Q${r1(pts[i][0])} ${r1(pts[i][1])} ${r1(m[0])} ${r1(m[1])}`; }
  return d + `L${r1(pts.at(-1)[0])} ${r1(pts.at(-1)[1])}`;
};

/** 格子の境目をたどって輪（頂点の列）にする。mask(i) が真のマスの外周。内側が右手に来る向き */
function loopsOf(mask) {
  const next = new Map(); // 頂点キー → [終点キー…]
  const key = (x, y) => y * (GW + 1) + x;
  const add = (x0, y0, x1, y1) => { const k = key(x0, y0); (next.get(k) ?? next.set(k, []).get(k)).push(key(x1, y1)); };
  for (let Y = 0; Y < GH; Y++) for (let X = 0; X < GW; X++) {
    if (!mask(Y * GW + X)) continue;
    if (Y === 0 || !mask((Y - 1) * GW + X)) add(X, Y, X + 1, Y);
    if (X === GW - 1 || !mask(Y * GW + X + 1)) add(X + 1, Y, X + 1, Y + 1);
    if (Y === GH - 1 || !mask((Y + 1) * GW + X)) add(X + 1, Y + 1, X, Y + 1);
    if (X === 0 || !mask(Y * GW + X - 1)) add(X, Y + 1, X, Y);
  }
  const loops = [];
  for (const [start, outs] of next) {
    while (outs.length) {
      const loop = [];
      let cur = start;
      let to = outs.pop();
      for (;;) {
        loop.push([cur % (GW + 1), Math.floor(cur / (GW + 1))]);
        cur = to;
        if (cur === start) break;
        const o = next.get(cur);
        if (!o || !o.length) break;
        to = o.pop();
      }
      if (loop.length > 3) loops.push(loop);
    }
  }
  return loops;
}
const loopArea = (l) => { let a = 0; for (let i = 0; i < l.length; i++) { const [x0, y0] = l[i], [x1, y1] = l[(i + 1) % l.length]; a += x0 * y1 - x1 * y0; } return a / 2; };

const areas = {};
let bytes = 0;
AREAS.forEach((key, a) => {
  const loops = loopsOf((i) => label[i] === a && land(i));
  const ds = [];
  for (const lp of loops) {
    if (Math.abs(loopArea(lp)) < 2.5 * S * S) continue; // ごく小さな島は描かない
    const s = simplify(lp.map(dp), 0.8 * S);
    if (s.length < 3) continue;
    ds.push(smoothPath(s, true));
  }
  areas[key] = ds.join("");
  bytes += areas[key].length;
});
// 海岸線（地理院の線そのもの。手描きの揺れをつけて間引く）。ごく短い線は描かない
const coastD = coast
  .filter((l) => l.length > 3)
  .map((l) => smoothPath(simplify(l.map(dp), 0.9 * S), false))
  .filter(Boolean)
  .join("");

// 出力の座標は、格子の細かさによらず「4px = 1 マス」の単位（viewBox の大きさを同じにする）
const outW = Math.round(GW / S), outH = Math.round(GH / S);
const fmt = (o) => JSON.stringify(o);
fs.writeFileSync(
  OUT,
  `/**
 * 「さがす」の入口の小さな日本の図（地方ごとに色分けした手描き風）の輪郭。automation/illust-map/figure.mjs が書き出す（手で編集しない）。
 * 座標は w×h の箱の中（viewBox 0 0 w h。1 単位 = ウェブメルカトル z6 の 4px。緯度経度 → 箱の中の位置は proj: x = (worldX(経度) - x0) / unit、y = (worldY(緯度) - y0) / unit。worldX・worldY は z6 の世界の px）。areas = 地方のキー（lib/portal/noren/areaGroups.ts）→ その地方の陸の輪郭の path（塗りつぶし用）、coast = 海岸線の path。
 * 出典: 地図は国土地理院ベクトルタイルをもとに作成。
 */
export const AREA_FIGURE: { w: number; h: number; proj: { z: number; x0: number; y0: number; unit: number }; areas: Record<string, string>; coast: string } = ${fmt({ w: outW, h: outH, proj: { z: Z, x0: X0, y0: Y0, unit: 4 }, areas, coast: coastD })};
`,
);
console.log(`figure ${outW}x${outH} cells; area paths ${Math.round(bytes / 1024)}KB, coast ${Math.round(coastD.length / 1024)}KB; labelled land cells per area:`, AREAS.map((k, a) => `${k}=${label.reduce((n, l, i) => n + (l === a && land(i) ? 1 : 0), 0)}`).join(" "));
