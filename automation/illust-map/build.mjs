// 国土地理院ベクトルタイル（experimental_bvmap）から、地域ごとの手描き風の地図（SVG）を描き起こす。Node だけで動く（新しい npm パッケージは使わない）。
//   使い方: node automation/illust-map/build.mjs [地域キー…]   （キーを省くと 41 地域すべてと japan.svg）
//   出力: public/_portal/illust-map/<地域キー>.svg・japan.svg、lib/portal/noren/illustMaps.generated.ts（範囲の表）
//   タイルは automation/illust-map/cache/ に置く（コミットしない。同じタイルを二度取らない）。
// 描き方: 地は淡い生成り、水は水色（岸に波の印）、道は白い帯、鉄道は点線、そこへ手描き風の木と家の小さな絵を、道・水・店の位置を避けて散らす。
//   座標はウェブメルカトル（タイルの座標そのまま）なので、SVG を leaflet の imageOverlay で実際の範囲に敷けば、店のピンは本当の位置に落ちる。
//   線は座標だけで決まる滑らかなずれで揺らす（交差点はそろったまま。重い SVG フィルターは使わない）。
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { decodeTile } from "./mvt.mjs";
import { getTile, tileToLonLat } from "./fetch.mjs";
import { symbolDefs, TREE_IDS, HOUSE_IDS, BOAT_IDS } from "./art.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT_DIR = path.join(ROOT, "public/_portal/illust-map");
const TABLE = path.join(ROOT, "lib/portal/noren/illustMaps.generated.ts");

// ---- 店と地域のデータ（lib/data.ts・lib/geo.ts を TypeScript のまま読む）----
const require = createRequire(import.meta.url);
const ts = require(path.join(ROOT, "node_modules/typescript"));
const Module = require("module");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith("@/")) request = path.join(ROOT, request.slice(2));
  if (request === "server-only") request = path.join(ROOT, "node_modules/next/dist/compiled/server-only/empty.js");
  return origResolve.call(this, request, parent, ...rest);
};
require.extensions[".ts"] = function (module, filename) {
  const out = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true }, fileName: filename });
  module._compile(out.outputText, filename);
};
const { RESTAURANTS, REGIONS } = require(path.join(ROOT, "lib/data.ts"));
const { GEO } = require(path.join(ROOT, "lib/geo.ts"));
const { quantFit } = require(path.join(ROOT, "lib/portal/noren/mapFit.ts")); // 画面（ShopMap.tsx）と同じ「初期表示で寄せる範囲」の決め方（a と同じ。外れ値を除いた中央の約 88%）

// 位置のある店が 1 軒も無い地域の、地図の中心（県庁所在地のおおよその位置。店のピンは出ない）
const FALLBACK_CENTER = { wakayama: [34.2261, 135.1675] };

// 描き方: e 手描き風（既定）/ f 古地図 / g 夜の灯り / h 見下ろす（平らな色面。画面側で倒す）。 --style=f のように指定する
const STYLE = (process.argv.find((a) => a.startsWith("--style=")) ?? "--style=e").slice(8);
const GROUND = { e: "#f4eedc", f: "#e7d9b3", g: "#1a1612", h: "#e8e1cc" }[STYLE];

// ---- 小さな道具 ----
function seeded(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
const worldX = (lon, z) => ((lon + 180) / 360) * 256 * 2 ** z;
const worldY = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 256 * 2 ** z;
};
const r1 = (n) => Math.round(n * 10) / 10;
const rInt = (n) => Math.round(n);
const quant = (a, t) => {
  const v = [...a].sort((x, y) => x - y);
  const i = (v.length - 1) * t;
  return v[Math.floor(i)] + (v[Math.ceil(i)] - v[Math.floor(i)]) * (i - Math.floor(i));
};

/** 座標だけで決まる滑らかなずれ（手描きの揺れ。同じ位置は同じ量だけずれるので、交差点・タイルのつなぎ目はそろう） */
function makeDisp(amp) {
  return (x, y) => [
    amp * (Math.sin(y * 0.052 + 1.7 * Math.sin(x * 0.031)) + 0.5 * Math.sin(x * 0.11 + y * 0.07)),
    amp * (Math.sin(x * 0.047 + 1.3 * Math.sin(y * 0.036)) + 0.5 * Math.sin(y * 0.13 - x * 0.05)),
  ];
}

/** Douglas–Peucker（点の間引き） */
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

/** 点列 → 滑らかな path（中点どうしを結ぶ二次曲線。両端は元の点）。closed なら輪 */
function smoothPath(pts, closed = false, rd = r1) {
  const r1 = rd;
  if (pts.length < 2) return "";
  if (pts.length === 2 || (closed && pts.length < 4)) return `M${r1(pts[0][0])} ${r1(pts[0][1])}` + pts.slice(1).map((p) => `L${r1(p[0])} ${r1(p[1])}`).join("") + (closed ? "Z" : "");
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d;
  if (closed) {
    const n = pts.length;
    const m0 = mid(pts[n - 1], pts[0]);
    d = `M${r1(m0[0])} ${r1(m0[1])}`;
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      d += `Q${r1(pts[i][0])} ${r1(pts[i][1])} ${r1(m[0])} ${r1(m[1])}`;
    }
    return d + "Z";
  }
  d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  const m1 = mid(pts[0], pts[1]);
  d += `L${r1(m1[0])} ${r1(m1[1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const m = mid(pts[i], pts[i + 1]);
    d += `Q${r1(pts[i][0])} ${r1(pts[i][1])} ${r1(m[0])} ${r1(m[1])}`;
  }
  d += `L${r1(pts[pts.length - 1][0])} ${r1(pts[pts.length - 1][1])}`;
  return d;
}

// ---- 道の格 ----
const roadWOf = (rank) => (rank >= 5 ? 8.2 : rank >= 4 ? 6.4 : rank >= 3 ? 4.8 : 3.4);
function roadRank(p) {
  let base;
  if (p.rnkWidth !== undefined && p.rnkWidth !== null) base = p.rnkWidth === 0 ? 1.4 : p.rnkWidth;
  else base = 3; // 低いズームのタイルは、幅の情報が無い（主な道だけが残っている）
  if (p.motorway === 1) base += 1.3;
  if (p.rdCtg === 0) base += 0.7;
  else if (p.rdCtg === 1) base += 0.5;
  if (p.ftCode === 2711 || p.ftCode === 2721) base -= 0.2;
  return base;
}


// ---- 計画: 地域ごとの範囲・ズーム ----
const VIEW_W = 820, VIEW_H = 460, FIT_W = 692, FIT_H = 298; // 画面の地図の箱と、札の余白を引いた寄せる範囲（ShopMap.tsx と同じ考え方）
function planLayers(key, pts) {
  const sane = (b) => {
    const cLat = (b.minLat + b.maxLat) / 2, cLng = (b.minLng + b.maxLng) / 2;
    const hLat = Math.max((b.maxLat - b.minLat) / 2, 0.012), hLng = Math.max((b.maxLng - b.minLng) / 2, 0.016);
    return { minLat: cLat - hLat, maxLat: cLat + hLat, minLng: cLng - hLng, maxLng: cLng + hLng };
  };
  let A, I;
  if (pts.length === 0) {
    const [la, ln] = FALLBACK_CENTER[key] ?? [35, 135];
    A = I = sane({ minLat: la, maxLat: la, minLng: ln, maxLng: ln });
  } else {
    const lats = pts.map((p) => p.lat), lngs = pts.map((p) => p.lng);
    A = sane({ minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) });
    I = pts.length > 12 ? sane(quantFit(pts)) : A;
  }
  // 初期表示のズーム Zi（寄せる範囲 I を箱に収めたとき。0.25 刻みで切り下げ。店が 1 軒なら 13）
  const fitW0 = worldX(I.maxLng, 0) - worldX(I.minLng, 0), fitH0 = worldY(I.minLat, 0) - worldY(I.maxLat, 0);
  let Zi = pts.length <= 1 ? 13 : Math.log2(Math.min(FIT_W / fitW0, FIT_H / fitH0));
  Zi = Math.min(14, Math.floor(Zi * 4) / 4);
  const range = (z, box, pad, limit, withView) => {
    const k = 2 ** (Zi - z);
    const cx = (worldX(I.minLng, z) + worldX(I.maxLng, z)) / 2, cy = (worldY(I.minLat, z) + worldY(I.maxLat, z)) / 2;
    let fx0 = worldX(box.minLng - pad.lng, z), fx1 = worldX(box.maxLng + pad.lng, z), fy0 = worldY(box.maxLat + pad.lat, z), fy1 = worldY(box.minLat - pad.lat, z);
    if (withView) { fx0 = Math.min(fx0, cx - (VIEW_W / 2 / k) * 1.12); fx1 = Math.max(fx1, cx + (VIEW_W / 2 / k) * 1.12); fy0 = Math.min(fy0, cy - (VIEW_H / 2 / k) * 1.12); fy1 = Math.max(fy1, cy + (VIEW_H / 2 / k) * 1.12); }
    let x0 = Math.floor(fx0 / 256), x1 = Math.floor(fx1 / 256), y0 = Math.floor(fy0 / 256), y1 = Math.floor(fy1 / 256);
    // 上限を超えるときは、中心のまわりの limit 枚に切る（外側は粗い層に任せる）
    if (x1 - x0 + 1 > limit) { const c = Math.floor(cx / 256); x0 = c - Math.floor((limit - 1) / 2); x1 = x0 + limit - 1; }
    if (y1 - y0 + 1 > limit) { const c = Math.floor(cy / 256); y0 = c - Math.floor((limit - 1) / 2); y1 = y0 + limit - 1; }
    return { z, x0, x1, y0, y1, over: false };
  };
  const spanOk = (r, box, pad) => worldX(box.minLng - pad.lng, r.z) >= r.x0 * 256 - 1 && worldX(box.maxLng + pad.lng, r.z) <= (r.x1 + 1) * 256 + 1 && worldY(box.maxLat + pad.lat, r.z) >= r.y0 * 256 - 1 && worldY(box.minLat - pad.lat, r.z) <= (r.y1 + 1) * 256 + 1;
  const hLatA = (A.maxLat - A.minLat) / 2, hLngA = (A.maxLng - A.minLng) / 2;
  const padK = STYLE === "h" ? 1.5 : 0.3; // h（見下ろす）は面を倒して奥が長く見えるので、すべての店のまわりを広めに覆う
  const padA = { lat: Math.max(hLatA * padK, 0.015), lng: Math.max(hLngA * padK, 0.02) };
  // 粗い層（overview）: すべての店 + 余白、と初期表示の範囲の両方を覆う。横縦とも 7 枚以内で最も細かいズーム（13 まで）
  let ov = null;
  for (let z = 13; z >= 7; z--) {
    const r = range(z, A, padA, 99, true);
    if (r.x1 - r.x0 + 1 <= 7 && r.y1 - r.y0 + 1 <= 7) { ov = r; break; }
  }
  ov = ov ?? { z: 7, ...range(7, A, padA, 7, true) };
  // 細かい層（core）: 初期表示の範囲のまわりを z13 で（横縦 8 枚まで）。店が 13 軒以上で、粗い層が z12 以下のときだけ
  let core = null;
  if (pts.length > 12 && Zi >= 10.5) {
    const padI = { lat: Math.max(((I.maxLat - I.minLat) / 2) * 0.35, 0.01), lng: Math.max(((I.maxLng - I.minLng) / 2) * 0.35, 0.012) };
    // z13 → z12 の順に、初期表示の箱（+12%）まで覆える（横縦 8 枚以内）ものを探す。覆えないと、箱の両脇に粗い層が見えてしまう
    for (const zc of [13, 12]) {
      if (zc <= ov.z) continue;
      const r = range(zc, I, padI, 8, true);
      const k = 2 ** (Zi - zc);
      const cx = (worldX(I.minLng, zc) + worldX(I.maxLng, zc)) / 2, cy = (worldY(I.minLat, zc) + worldY(I.maxLat, zc)) / 2;
      const coversView = cx - VIEW_W / 2 / k >= r.x0 * 256 - 1 && cx + VIEW_W / 2 / k <= (r.x1 + 1) * 256 + 1 && cy - VIEW_H / 2 / k >= r.y0 * 256 - 1 && cy + VIEW_H / 2 / k <= (r.y1 + 1) * 256 + 1;
      if (spanOk(r, I, { lat: 0, lng: 0 }) && coversView) { core = r; break; }
    }
  }
  const fit = core ? I : I;
  return { key, Zi, A, I, fit, ov: { ...ov, Zdes: core ? Math.max(8, Zi - 1.5) : Zi + 0.5, kind: "overview" }, core: core ? { ...core, Zdes: Zi, kind: "core" } : null };
}

// ---- 描く ----
async function buildRegion(key, pts, layer, pl, lod = 1) {
  const { z, x0, x1, y0, y1 } = layer;
  const f = 2 ** (layer.Zdes - z); // 設計の画面の px / 単位（この倍率で見たときに、道・木・家がちょうどよい大きさになるよう描く）
  const W = (x1 - x0 + 1) * 256, H = (y1 - y0 + 1) * 256;
  const toU = (tx, ty, vx, vy, ext) => [(tx - x0) * 256 + (vx * 256) / ext, (ty - y0) * 256 + (vy * 256) / ext];
  const ptU = (lat, lng) => [worldX(lng, z) - x0 * 256, worldY(lat, z) - y0 * 256];
  const px = (n) => n / f; // 画面の px（初期表示）→ 単位
  const R = f <= 1.2 ? rInt : r1; // 1 単位が画面の 1px より大きいうちは、整数の座標で足りる（ファイルが小さくなる）
  const disp = makeDisp(px(1.3));
  const dp = ([x, y]) => { const [dx, dy] = disp(x, y); return [x + dx, y + dy]; };

  // 店の位置（単位）
  const storeU = pts.map((p) => ({ id: p.id, u: ptU(p.lat, p.lng) }));

  // 寄せる範囲（単位）と、画面の箱が見る範囲
  const fitMinU = ptU(pl.fit.maxLat, pl.fit.minLng), fitMaxU = ptU(pl.fit.minLat, pl.fit.maxLng);
  const cU = [(fitMinU[0] + fitMaxU[0]) / 2, (fitMinU[1] + fitMaxU[1]) / 2];
  const kv = 2 ** (pl.Zi - z); // 初期表示の画面の px / 単位
  const view = { x0: cU[0] - VIEW_W / kv / 2, x1: cU[0] + VIEW_W / kv / 2, y0: cU[1] - VIEW_H / kv / 2, y1: cU[1] + VIEW_H / kv / 2 };
  const inView = (x, y) => x >= view.x0 && x <= view.x1 && y >= view.y0 && y <= view.y1;

  // タイルを取る
  const tiles = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const buf = await getTile(z, tx, ty);
    tiles.push({ tx, ty, L: buf.length ? decodeTile(buf) : {} });
  }

  // 道: 格を付け、画面で手本くらいの街区の大きさになる量だけ採る
  const roads = [];
  for (const t of tiles) for (const ft of t.L.road?.features ?? []) {
    if (ft.type !== 2) continue;
    const rank = roadRank(ft.props);
    if (rank < 1) continue;
    const ext = t.L.road.extent;
    for (const line of ft.rings) if (line.length >= 2) roads.push({ rank, pts: line.map(([vx, vy]) => toU(t.tx, t.ty, vx, vy, ext)) });
  }
  // 手本くらいの街区の大きさ（画面で 70〜90px）に見えるよう、画面の小さな区画（CELL_PX 四方）ごとに道の量の上限を決め、格の高い道から順に採る
  // （中心が網の目になる・端がスカスカになる、のを防ぐ）。格の下限は、初期表示の倍率 f が小さいほど（広い範囲ほど）高くする。
  const hasCore = !!pl.core;
  void hasCore;
  const BLOCK_PX = Number(process.env.BLOCK_PX || (layer.kind === 'core' ? 46 : hasCore ? 120 : 84)) * lod;
  const CELL_PX = 96;
  const cellU = px(CELL_PX);
  const capLen = (2 * px(CELL_PX) * px(CELL_PX)) / px(BLOCK_PX);
  const minRank = z <= 12 ? 0 : layer.kind === 'core' ? 0.9 : 2.4; // 低いズームのタイルは、地理院が主な道だけを残している。z13 は細い道を除く
  const used = new Map();
  const lenOf = (pts2) => { let l = 0; for (let i = 1; i < pts2.length; i++) l += Math.hypot(pts2[i][0] - pts2[i - 1][0], pts2[i][1] - pts2[i - 1][1]); return l; };
  const cellsOf = (pts2) => {
    const m = new Map();
    for (let i = 1; i < pts2.length; i++) {
      const [ax, ay] = pts2[i - 1], [bx, by] = pts2[i];
      const l = Math.hypot(bx - ax, by - ay);
      const k = `${Math.floor((ax + bx) / 2 / cellU)},${Math.floor((ay + by) / 2 / cellU)}`;
      m.set(k, (m.get(k) ?? 0) + l);
    }
    return m;
  };
  roads.sort((a, b2) => b2.rank - a.rank);
  const picked = [];
  let thr = 9;
  for (const r of roads) {
    if (r.rank < minRank) continue;
    const L = lenOf(r.pts);
    if (L < px(r.rank >= 4.5 ? 4 : 9)) continue;
    const cs = cellsOf(r.pts);
    let ok = true;
    if (r.rank < 5) { const mid = r.pts[Math.floor(r.pts.length / 2)]; const mk = `${Math.floor(mid[0] / cellU)},${Math.floor(mid[1] / cellU)}`; if ((used.get(mk) ?? 0) > capLen) ok = false; }
    if (!ok) continue;
    for (const [k, l] of cs) used.set(k, (used.get(k) ?? 0) + l);
    picked.push(r);
    thr = Math.min(thr, r.rank);
  }

  // 水・川・鉄道
  const waterTiles = [];
  const rivers = [];
  const rails = [];
  for (const t of tiles) {
    const wa = t.L.waterarea;
    if (wa) {
      const rings = [];
      for (const ft of wa.features) {
        if (ft.type !== 3) continue;
        for (const ring of ft.rings) {
          if (ring.length < 4) continue;
          // 岸の線: タイルの縁に沿った辺は除く
          const rim = [];
          let cur = [];
          const onEdge = (a, b) => (a[0] <= 1 && b[0] <= 1) || (a[0] >= wa.extent - 1 && b[0] >= wa.extent - 1) || (a[1] <= 1 && b[1] <= 1) || (a[1] >= wa.extent - 1 && b[1] >= wa.extent - 1);
          for (let i = 0; i < ring.length - 1; i++) {
            if (onEdge(ring[i], ring[i + 1])) { if (cur.length > 1) rim.push(cur); cur = []; continue; }
            if (!cur.length) cur.push(toU(t.tx, t.ty, ring[i][0], ring[i][1], wa.extent));
            cur.push(toU(t.tx, t.ty, ring[i + 1][0], ring[i + 1][1], wa.extent));
          }
          if (cur.length > 1) rim.push(cur);
          rings.push({ pts: ring.map(([vx, vy]) => toU(t.tx, t.ty, vx, vy, wa.extent)), rim, touchesEdge: ring.length - 1 > rim.reduce((a, l) => a + l.length - 1, 0) });
        }
      }
      if (rings.length) waterTiles.push({ rings });
    }
    for (const ft of t.L.river?.features ?? []) if (ft.type === 2) for (const line of ft.rings) if (line.length > 1) rivers.push(line.map(([vx, vy]) => toU(t.tx, t.ty, vx, vy, t.L.river.extent)));
    for (const ft of t.L.railway?.features ?? []) if (ft.type === 2 && (ft.props.railState === undefined || ft.props.railState === 0 || ft.props.railState === 1 || ft.props.railState === 3)) for (const line of ft.rings) if (line.length > 1) rails.push(line.map(([vx, vy]) => toU(t.tx, t.ty, vx, vy, t.L.railway.extent)));
  }

  // ---- 占有の格子（木・家を、道・水・店の位置から離すため）----
  const CELL = 2.5;
  const GW = Math.ceil(W / CELL), GH = Math.ceil(H / CELL);
  const grid = new Uint8Array(GW * GH); // 1 = 道, 2 = 水, 4 = 店, 8 = 鉄道・川
  const mark = (x, y, rad, bit) => {
    const gx0 = Math.max(0, Math.floor((x - rad) / CELL)), gx1 = Math.min(GW - 1, Math.floor((x + rad) / CELL));
    const gy0 = Math.max(0, Math.floor((y - rad) / CELL)), gy1 = Math.min(GH - 1, Math.floor((y + rad) / CELL));
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const cx = (gx + 0.5) * CELL - x, cy = (gy + 0.5) * CELL - y;
      if (cx * cx + cy * cy <= rad * rad) grid[gy * GW + gx] |= bit;
    }
  };
  const markLine = (pts2, rad, bit) => {
    for (let i = 1; i < pts2.length; i++) {
      const [ax, ay] = pts2[i - 1], [bx, by] = pts2[i];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / (CELL * 0.8)));
      for (let k = 0; k <= n; k++) mark(ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n, rad, bit);
    }
  };
  for (const wt of waterTiles) {
    // 偶奇の走査線塗り
    const edges = [];
    for (const rg of wt.rings) for (let i = 0; i < rg.pts.length - 1; i++) edges.push([rg.pts[i], rg.pts[i + 1]]);
    for (let gy = 0; gy < GH; gy++) {
      const y = (gy + 0.5) * CELL;
      const xs = [];
      for (const [a, b] of edges) {
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const g0 = Math.max(0, Math.floor(xs[i] / CELL)), g1 = Math.min(GW - 1, Math.floor(xs[i + 1] / CELL));
        for (let gx = g0; gx <= g1; gx++) grid[gy * GW + gx] |= 2;
      }
    }
  }
  // 水の面に入ってしまう店（粗いタイルの水の輪郭が岸にかかる）: 数えて、足もとに小さな陸（埋め立て地）を描いて救う
  const waterStores = storeU.filter((s0) => { const gx = Math.floor(s0.u[0] / CELL), gy = Math.floor(s0.u[1] / CELL); return gx >= 0 && gy >= 0 && gx < GW && gy < GH && (grid[gy * GW + gx] & 2); });
  for (const r of picked) markLine(r.pts, px(roadWOf(r.rank)) / 2 + 1.2, 1);
  for (const l of rivers) markLine(l, px(2.5), 8);
  for (const l of rails) markLine(l, px(2), 8);
  for (const s of storeU) mark(s.u[0], s.u[1], px(26), 4);
  const cellAt = (x, y) => { const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL); return gx < 0 || gy < 0 || gx >= GW || gy >= GH ? 15 : grid[gy * GW + gx]; };
  const freeAt = (x, y, rad, mask = 15) => {
    for (const [dx, dy] of [[0, 0], [rad, 0], [-rad, 0], [0, rad], [0, -rad], [rad * 0.7, rad * 0.7], [-rad * 0.7, -rad * 0.7]]) if (cellAt(x + dx, y + dy) & mask) return false;
    return true;
  };

  // ---- 描き起こし ----
  const rnd = seeded(key);
  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="${GROUND}"/>`);
  if (STYLE === "e") parts.push(`<rect width="${W}" height="${H}" fill="url(#hatch)"/>`);
  if (STYLE === "f") parts.push(`<rect width="${W}" height="${H}" filter="url(#paper)"/>`);

  // 地のにじみ（淡い緑・黄みの生成り）。水の上は後で水が覆う
  const blots = [];
  for (let i = 0; i < (STYLE === "h" ? 0 : STYLE === "e" ? 26 : 18); i++) {
    const bx = rnd() * W, by = rnd() * H, rx = px(60 + rnd() * 120), ry = rx * (0.5 + rnd() * 0.5);
    const c = i % 3 === 0 ? "url(#gA)" : i % 3 === 1 ? "url(#gB)" : "url(#gC)";
    blots.push(`<ellipse cx="${r1(bx)}" cy="${r1(by)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${c}" transform="rotate(${r1(rnd() * 180)} ${r1(bx)} ${r1(by)})"/>`);
  }
  parts.push(`<g>${blots.join("")}</g>`);
  const parkWashIdx = parts.length;
  parts.push("");

  // 水（タイルごとの path。岸のつなぎ目が見えないよう同色の細い縁を付ける）
  const waterD = [];
  const rimD = [];
  const dpr = px(1.7 * lod); // 水の輪郭は、画面で 1.3px 程度の細かさに間引く（手描きなので正確さは要らない）
  const ringArea = (ring) => { let a = 0; for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]; return Math.abs(a) / 2; };
  const minArea = px(30 * lod) * px(30 * lod);
  for (const wt of waterTiles) {
    let d = "";
    for (const rg of wt.rings) {
      if (!rg.touchesEdge && ringArea(rg.pts) < minArea) continue; // 小さな水たまりは描かない
      d += smoothPath(simplify(rg.pts.map(dp), dpr), true, rInt);
      for (const line of rg.rim) {
        if (lenOf(line) < px(34)) continue;
        const s2 = simplify(line.map(dp), px(2.4 * lod));
        if (s2.length > 1) rimD.push(smoothPath(s2, false, rInt));
      }
    }
    if (d) waterD.push(d);
  }
  const WFILL = { e: "#bfe0f0", f: "#a9bdd6", g: "#0e1a33", h: "#9ccbe8" }[STYLE];
  parts.push(`<g fill="${WFILL}" stroke="${WFILL}" stroke-width="${r1(px(1.4))}" stroke-linejoin="round" fill-rule="evenodd">${waterD.map((d) => `<path d="${d}"/>`).join("")}</g>`);
  // 水の深み（ところどころの濃い水色）と波の印
  const deep = [], waves = [];
  let tries = 0;
  while (STYLE !== "h" && (deep.length < 16 || waves.length < 70) && tries++ < 6000) {
    const x = rnd() * W, y = rnd() * H;
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    if (gx < 4 || gy < 4 || gx >= GW - 4 || gy >= GH - 4) continue;
    const inWater = (grid[gy * GW + gx] & 2) && (grid[gy * GW + gx + 4] & 2) && (grid[gy * GW + gx - 4] & 2) && (grid[(gy + 4) * GW + gx] & 2) && (grid[(gy - 4) * GW + gx] & 2);
    if (!inWater) continue;
    if (deep.length < 16 && rnd() < 0.25) deep.push(`<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(px(40 + rnd() * 70))}" ry="${r1(px(14 + rnd() * 26))}" transform="rotate(${r1(rnd() * 40 - 20)} ${r1(x)} ${r1(y)})"/>`);
    else if (waves.length < 70) {
      const s = px(0.9 + rnd() * 0.9);
      waves.push(`<path d="M${r1(x)} ${r1(y)}q${r1(3 * s)} ${r1(-3 * s)} ${r1(6 * s)} 0t${r1(6 * s)} 0${rnd() < 0.5 ? `t${r1(6 * s)} 0` : ""}"/>`);
    }
  }
  // 小さな舟（広い水面のところどころ。位置は座標から決まる）
  const boats = [];
  for (let t2 = 0; t2 < 4000 && boats.length < (STYLE === "e" ? 5 : 0); t2++) {
    const x = rnd() * W, y = rnd() * H;
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    const R = Math.ceil(px(34) / CELL);
    if (gx < R || gy < R || gx >= GW - R || gy >= GH - R) continue;
    let all = true;
    for (const [dx, dy] of [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R], [R, R], [-R, -R], [R, -R], [-R, R]]) if (!(grid[(gy + dy) * GW + gx + dx] & 2)) { all = false; break; }
    if (!all) continue;
    if (boats.some((b) => Math.hypot(b.x - x, b.y - y) < px(160))) continue;
    boats.push({ x, y, id: BOAT_IDS[boats.length % BOAT_IDS.length], sc: px(1) * (1.2 + rnd() * 0.5) });
  }
  if (STYLE === "e") {
    parts.push(`<g fill="#7fbfe4" opacity=".35">${deep.join("")}</g>`);
    parts.push(`<g fill="none" stroke="#ffffff" stroke-width="${r1(px(1))}" stroke-linecap="round" opacity=".9">${waves.join("")}</g>`);
    parts.push(`<g>${boats.map((b) => `<use href="#${b.id}" transform="translate(${r1(b.x)} ${r1(b.y)}) scale(${r1(b.sc * 100) / 100})"/>`).join("")}</g>`);
  } else if (STYLE === "f") {
    // 古地図: 海の波の線（藍の墨）
    parts.push(`<g fill="none" stroke="#3a5a90" stroke-width="${r1(px(1.15))}" stroke-linecap="round" opacity=".62">${waves.join("")}</g>`);
  } else if (STYLE === "g") {
    parts.push(`<g fill="#070f22" opacity=".55">${deep.join("")}</g>`);
    parts.push(`<g fill="none" stroke="#35568d" stroke-width="${r1(px(0.9))}" stroke-linecap="round" opacity=".38">${waves.join("")}</g>`);
  }
  // 岸: 白いにじみ + 細い濃い水色の線
  if (rimD.length) {
    if (STYLE === "e") parts.push(`<g fill="none" stroke-linejoin="round" stroke-linecap="round"><use href="#rim" stroke="#ffffff" stroke-width="${r1(px(4.2))}" opacity=".65"/><use href="#rim" stroke="#6fb2d8" stroke-width="${r1(px(1.1))}" opacity=".9"/></g>`);
    // 古地図: 岸が濃く、沖へ薄い藍のぼかし（水の面の中だけ）+ 墨の細い岸線
    if (STYLE === "f") parts.push(`<g clip-path="url(#wclip)"><use href="#rim" fill="none" stroke="#2a4b88" stroke-width="${r1(px(22))}" stroke-linejoin="round" stroke-linecap="round" opacity=".62" filter="url(#blurW)"/></g><use href="#rim" fill="none" stroke="#2a2d44" stroke-width="${r1(px(1.3))}" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>`);
    if (STYLE === "g") parts.push(`<g fill="none" stroke-linejoin="round" stroke-linecap="round"><use href="#rim" stroke="#1d3770" stroke-width="${r1(px(8))}" opacity=".4" filter="url(#blurG)"/><use href="#rim" stroke="#2f5088" stroke-width="${r1(px(1.0))}" opacity=".55"/></g>`);
    if (STYLE === "h") parts.push(`<g fill="none" stroke-linejoin="round" stroke-linecap="round"><use href="#rim" stroke="#7fb6d8" stroke-width="${r1(px(1.8))}" opacity=".95"/></g>`);
  }
  // 川
  if (rivers.length) {
    const rd = rivers.filter((l) => lenOf(l) > px(110)).map((l) => smoothPath(simplify(l.map(dp), px(1.6)), false, rInt)).filter(Boolean).join("");
    const RC = { e: ["#b9dcee", 2], f: ["#4a6ca6", 1.5], g: ["#15284f", 1.8], h: ["#9ccbe8", 2.6] }[STYLE];
    parts.push(`<path d="${rd}" fill="none" stroke="${RC[0]}" stroke-width="${r1(px(RC[1]))}" stroke-linecap="round" stroke-linejoin="round"${STYLE === "f" ? ' opacity=".8"' : ""}/>`);
  }

  if (waterStores.length) {
    parts.push(`<g fill="${GROUND}" stroke="${STYLE === "e" ? "#ffffff" : "none"}" stroke-width="${r1(px(2.2))}">${waterStores.map((w) => `<ellipse cx="${r1(w.u[0])}" cy="${r1(w.u[1])}" rx="${r1(px(20))}" ry="${r1(px(14))}"/>`).join("")}</g>`);
    for (const w of waterStores) mark(w.u[0], w.u[1], px(24), 4);
  }

  // 道（太さの格ごとにまとめ、縁取り + 白）。太さは、採った道の中での順位で決める（上位 18% が太く、次の 32% が中、残りが細い）
  const byWidth = new Map();
  const tolR = px(0.9 * lod);
  const ranks = picked.map((r) => r.rank).sort((a, b) => b - a);
  const q1 = ranks[Math.floor(ranks.length * 0.18)] ?? 0, q2 = ranks[Math.floor(ranks.length * 0.5)] ?? 0;
  const roadW = (r) => (r.rank >= 5 ? 8.2 : r.rank >= q1 && r.rank > q2 ? 6.4 : r.rank >= q2 && ranks.length > 8 && r.rank > (ranks.at(-1) ?? 0) ? 4.8 : 3.4);
  for (const r of picked) {
    const w = roadW(r);
    const s = simplify(r.pts.map(dp), tolR);
    if (s.length < 2) continue;
    byWidth.set(w, (byWidth.get(w) ?? "") + smoothPath(s, false, R));
  }
  const widths = [...byWidth.keys()].sort((a, b) => a - b);
  const defs2 = widths.map((w, i) => `<path id="r${i}" d="${byWidth.get(w)}"/>`).join("");
  let roadSvg = "";
  const tier = (w) => (w >= 8 ? 3 : w >= 6 ? 2 : w >= 4.5 ? 1 : 0);
  if (STYLE === "e") {
    widths.forEach((w, i) => (roadSvg += `<use href="#r${i}" stroke="#e2d8bb" stroke-width="${r1(px(w + 2.2))}"/>`));
    widths.forEach((w, i) => (roadSvg += `<use href="#r${i}" stroke="#fffefa" stroke-width="${r1(px(w))}"/>`));
  } else if (STYLE === "f") {
    // 墨の筆の線: 太い道ほど濃く太い
    const W2 = [1.1, 1.8, 2.5, 3.2], C2 = ["#645c4d", "#4e4638", "#372f26", "#221e18"], O2 = [0.82, 0.9, 0.95, 1];
    widths.forEach((w, i) => (roadSvg += `<use href="#r${i}" stroke="${C2[tier(w)]}" stroke-width="${r1(px(W2[tier(w)]))}" opacity="${O2[tier(w)]}"/>`));
  } else if (STYLE === "g") {
    const W2 = [0.9, 1.3, 2.0, 2.9], C2 = ["#76694f", "#a09070", "#dcc89c", "#ffe6ae"], O2 = [0.6, 0.75, 0.9, 1];
    widths.forEach((w, i) => { if (tier(w) >= 2) roadSvg += `<use href="#r${i}" stroke="#ffbf5e" stroke-width="${r1(px(W2[tier(w)] + 5.5))}" opacity="${tier(w) === 3 ? 0.3 : 0.2}" filter="url(#blurG)"/>`; });
    widths.forEach((w, i) => (roadSvg += `<use href="#r${i}" stroke="${C2[tier(w)]}" stroke-width="${r1(px(W2[tier(w)]))}" opacity="${O2[tier(w)]}"/>`));
  } else {
    widths.forEach((w, i) => (roadSvg += `<use href="#r${i}" stroke="#cbc2a6" stroke-width="${r1(px(w * 0.72 + 1.6))}"/>`));
    widths.forEach((w, i) => (roadSvg += `<use href="#r${i}" stroke="#ffffff" stroke-width="${r1(px(w * 0.72))}"/>`));
  }
  // 鉄道: 細い点線
  const railD = rails.filter((l) => lenOf(l) > px(30)).map((l) => smoothPath(simplify(l.map(dp), px(1.4)), false, rInt)).filter(Boolean).join("");
  const RL = { e: ["#cbc4b0", "#fffdf6"], f: ["#4a4234", "#e7d9b3"], g: ["#5a5240", "#2a241c"], h: ["#c5bfae", "#ffffff"] }[STYLE];
  const railSvg = railD ? `<use href="#rail" fill="none" stroke="${RL[0]}" stroke-width="${r1(px(STYLE === "f" ? 1.0 : 2.2))}" stroke-linecap="butt" opacity="${STYLE === "f" ? 0.6 : 0.8}"/>${STYLE === "f" ? "" : `<use href="#rail" fill="none" stroke="${RL[1]}" stroke-width="${r1(px(1.2))}" stroke-dasharray="${r1(px(6))} ${r1(px(5))}"/>`}` : "";
  parts.push(`<g fill="none" stroke-linecap="round" stroke-linejoin="round"${STYLE === "f" ? ' filter="url(#brush)"' : ""}>${roadSvg}</g>`);
  if (railSvg) parts.push(`<g>${railSvg}</g>`);

  // ---- 木と家 ----
  const decor = [];
  const treeScale = (heightPx) => px(heightPx) / 38;
  const inFit = (x, y) => x >= fitMinU[0] - px(120) && x <= fitMaxU[0] + px(120) && y >= fitMinU[1] - px(120) && y <= fitMaxU[1] + px(120);
  const areaPx = (W * H) * f * f;
  const STYLED = STYLE !== "e";
  // 木: かたまり（公園・林）と、ぽつぽつ
  const decorK = (layer.kind === 'overview' && hasCore ? 0.45 : 1) / lod;
  const nTrees = Math.min(170, Math.round(((areaPx / 377000) * 26 + 46) * decorK));
  const clusters = [];
  for (let i = 0; i < 18; i++) clusters.push([rnd() * W, rnd() * H, px(28 + rnd() * 48)]);
  parts[parkWashIdx] = `<g>${clusters.slice(0, 12).map((c) => `<ellipse cx="${r1(c[0])}" cy="${r1(c[1])}" rx="${r1(c[2] * 1.5)}" ry="${r1(c[2] * 1.1)}" fill="url(#gA)" opacity=".9"/>`).join("")}</g>`;
  let placedTrees = 0, guard = 0;
  while (!STYLED && placedTrees < nTrees && guard++ < nTrees * 40) {
    let x, y;
    if (rnd() < 0.4) {
      const c = clusters[Math.floor(rnd() * clusters.length)];
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * c[2];
      x = c[0] + Math.cos(a) * rr; y = c[1] + Math.sin(a) * rr * 0.75;
    } else { x = rnd() * W; y = rnd() * H; }
    if (x < 6 || y < 6 || x > W - 6 || y > H - 6) continue;
    if (!inFit(x, y) && rnd() < 0.55) continue;
    const hpx = 34 + rnd() * 24;
    const sc = treeScale(hpx);
    if (!freeAt(x, y - px(hpx * 0.3), px(hpx * 0.3), 15)) continue;
    const id = TREE_IDS[Math.floor(rnd() * TREE_IDS.length)];
    const flip = rnd() < 0.5 ? -1 : 1;
    decor.push({ y, svg: `<use href="#${id}" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1((rnd() - 0.5) * 8)}) scale(${r1(sc * flip * 100) / 100} ${r1(sc * 100) / 100})"/>` });
    mark(x, y - px(hpx * 0.3), px(hpx * 0.28), 8);
    placedTrees++;
  }
  // 家・店・建物: 道に沿って、数軒ずつ並べる（道を一定の間隔の点にして、そこから選ぶ）
  const nHouseGroups = Math.min(40, Math.round(((areaPx / 377000) * 8 + 14) * decorK));
  const samples = [];
  for (const r of picked) {
    let acc = 0;
    for (let i = 1; i < r.pts.length; i++) {
      const [ax, ay] = r.pts[i - 1], [bx, by] = r.pts[i];
      const l = Math.hypot(bx - ax, by - ay);
      if (l === 0) continue;
      for (let d = (px(16) - acc) % px(16); d < l; d += px(16)) samples.push({ x: ax + ((bx - ax) * d) / l, y: ay + ((by - ay) * d) / l, ux: (bx - ax) / l, uy: (by - ay) / l, w: roadWOf(r.rank) });
      acc = (acc + l) % px(16);
    }
  }
  let placedH = 0; guard = 0;
  while (!STYLED && placedH < nHouseGroups * 3 && guard++ < nHouseGroups * 80 && samples.length) {
    const sm = samples[Math.floor(rnd() * samples.length)];
    const side = rnd() < 0.5 ? 1 : -1;
    const nx = -sm.uy, ny = sm.ux;
    const count = 1 + Math.floor(rnd() * 3);
    const hh = 28 + rnd() * 12;
    for (let k = 0; k < count; k++) {
      const off = px(sm.w / 2 + 2.5 + 4);
      const along = (k - (count - 1) / 2) * px(hh * 0.95) * (1 + 0.2 * rnd());
      const x = sm.x + nx * side * off + sm.ux * along;
      const y = sm.y + ny * side * off + sm.uy * along + px(4);
      if (x < 6 || y < 8 || x > W - 6 || y > H - 6) continue;
      if (!inFit(x, y) && rnd() < 0.5) continue;
      if (!freeAt(x, y - px(hh * 0.3), px(hh * 0.32), 15)) continue;
      const id = HOUSE_IDS[Math.floor(rnd() * HOUSE_IDS.length)];
      const sc = treeScale(hh * (0.9 + rnd() * 0.25)) * 0.95;
      const flip = rnd() < 0.5 ? -1 : 1;
      decor.push({ y, svg: `<use href="#${id}" transform="translate(${r1(x)} ${r1(y)}) scale(${r1(sc * flip * 100) / 100} ${r1(sc * 100) / 100})"/>` });
      mark(x, y - px(hh * 0.3), px(hh * 0.3), 8);
      placedH++;
    }
  }
  decor.sort((a, b) => a.y - b.y);
  parts.push(`<g>${decor.map((d) => d.svg).join("")}</g>`);
  const topLayer = layer.kind === "core" || !pl.core;
  if (STYLE === "f" && topLayer) {
    // 古地図の方位の印（初期表示の左下）
    const cx = view.x0 + px(64), cy = view.y1 - px(78);
    parts.push(`<g transform="translate(${r1(cx)} ${r1(cy)}) scale(${r1(px(1) * 100) / 100})" stroke="#2a251d" fill="none" stroke-width="1.1" opacity=".88"><circle r="27"/><circle r="22.5" stroke-width=".55"/><path d="M0 -42L6.5 -6.5L0 0L-6.5 -6.5Z" fill="#2a251d"/><path d="M0 42L5.5 6L0 0L-5.5 6Z"/><path d="M-42 0L-6.5 -5.5L0 0L-6.5 5.5Z"/><path d="M42 0L6.5 -5.5L0 0L6.5 5.5Z"/><text y="-48" text-anchor="middle" font-size="15" font-family="Hiragino Mincho ProN, Yu Mincho, serif" fill="#2a251d" stroke="none">北</text></g>`);
  }
  if (STYLE === "g") {
    // 夜: 幹線に沿った街灯の小さな灯り
    const lamps = [];
    for (const r of picked) {
      if (r.rank < 4.4) continue;
      let acc = 0;
      for (let i = 1; i < r.pts.length; i++) {
        const [ax, ay] = r.pts[i - 1], [bx, by] = r.pts[i];
        const l = Math.hypot(bx - ax, by - ay);
        if (l === 0) continue;
        for (let d = (px(15) - acc) % px(15); d < l; d += px(15)) if (rnd() < 0.72) lamps.push(`<circle cx="${r1(ax + ((bx - ax) * d) / l)}" cy="${r1(ay + ((by - ay) * d) / l)}" r="${r1(px(0.85 + rnd() * 0.5))}"/>`);
        acc = (acc + l) % px(15);
      }
    }
    parts.push(`<g fill="#ffe3a0" opacity=".85">${lamps.slice(0, 1800).join("")}</g>`);
  }
  if (STYLE === "h") {
    // 見下ろす: 公園・街区の淡い色の面と、道に沿った建物の四角
    const patch = [];
    for (let i = 0; i < 16; i++) {
      const cx = rnd() * W, cy = rnd() * H, rr = px(40 + rnd() * 90);
      patch.push(`<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rr * 1.5)}" ry="${r1(rr)}" transform="rotate(${r1(rnd() * 180)} ${r1(cx)} ${r1(cy)})" fill="${["#c5ddb0", "#c5ddb0", "#ecd9b0", "#d3dce6", "#efe2c6"][i % 5]}" opacity=".85"/>`);
    }
    parts.splice(parkWashIdx, 1, `<g>${patch.join("")}</g>`);
    const bl = [];
    for (const r of picked) {
      let acc = 0;
      for (let i = 1; i < r.pts.length; i++) {
        const [ax, ay] = r.pts[i - 1], [bx, by] = r.pts[i];
        const l = Math.hypot(bx - ax, by - ay);
        if (l === 0) continue;
        const ux = (bx - ax) / l, uy = (by - ay) / l, ang = (Math.atan2(uy, ux) * 180) / Math.PI;
        for (let d = (px(13) - acc) % px(13); d < l; d += px(13)) {
          if (rnd() < 0.35) continue;
          const side = rnd() < 0.5 ? 1 : -1;
          const bw = px(7 + rnd() * 6), bh = px(5 + rnd() * 5);
          const off = px(roadWOf(r.rank) / 2 + 3 + 3) + bh / 2;
          const x = ax + ux * d - uy * side * off, y = ay + uy * d + ux * side * off;
          if (!freeAt(x, y, px(4), 3)) continue;
          bl.push(`<rect x="${r1(-bw / 2)}" y="${r1(-bh / 2)}" width="${r1(bw)}" height="${r1(bh)}" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(ang)})" fill="${["#d3cab0", "#dbd2b9", "#cdc3a8", "#e0d7be"][Math.floor(rnd() * 4)]}"/>`);
        }
        acc = (acc + l) % px(13);
      }
    }
    parts.push(`<g>${bl.slice(0, 2600).join("")}</g>`);
  }

  // 紙のにじみ: ごく薄い大きなしみ
  const stains = [];
  for (let i = 0; i < 7; i++) stains.push(`<ellipse cx="${r1(rnd() * W)}" cy="${r1(rnd() * H)}" rx="${r1(px(120 + rnd() * 200))}" ry="${r1(px(70 + rnd() * 120))}" fill="url(#gD)"/>`);
  if (STYLE === "e") parts.push(`<g opacity=".5">${stains.join("")}</g>`);

  const body0 = parts.join("");
  const usedIds = new Set();
  for (const m of body0.matchAll(/href="#([a-z]\d)"/g)) usedIds.add(m[1]);
  const GR = {
    e: [["#c8deb2", ".42"], ["#ece3b8", ".4"], ["#d6e6ca", ".4"], ["#d9cfae", ".18"]],
    f: [["#bda56c", ".30"], ["#f3e8c6", ".55"], ["#b09a62", ".24"], ["#9a7c48", ".16"]],
    g: [["#3a2b1a", ".55"], ["#1a2438", ".55"], ["#2c2117", ".5"], ["#000000", ".25"]],
    h: [["#ffffff", "0"], ["#ffffff", "0"], ["#ffffff", "0"], ["#ffffff", "0"]],
  }[STYLE];
  const gradDefs = ["gA", "gB", "gC", "gD"].map((id, i) => `<radialGradient id="${id}"><stop offset="0" stop-color="${GR[i][0]}" stop-opacity="${GR[i][1]}"/><stop offset="1" stop-color="${GR[i][0]}" stop-opacity="0"/></radialGradient>`).join("\n");
  const styleDefs = STYLE === "f"
    ? `<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${r1(f / 2.2 * 100) / 100}" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .52  0 0 0 0 .40  0 0 0 0 .22  0 0 0 .5 -.16"/></filter>
<filter id="brush" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${r1(f / 1.3 * 100) / 100}" numOctaves="2" seed="9" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="${r1(px(1.6))}" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="${r1(f / 3.2 * 100) / 100}" numOctaves="2" seed="21" result="t2"/><feColorMatrix in="t2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 5 -0.9" result="a"/><feComposite in="d" in2="a" operator="in"/></filter>
<filter id="blurW" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${r1(px(11))}"/></filter>
<clipPath id="wclip">${waterD.map((d) => `<path d="${d}" clip-rule="evenodd"/>`).join("")}</clipPath>`
    : STYLE === "g" ? `<filter id="blurG" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${r1(px(2.6))}"/></filter>` : "";
  const defs = `<defs>
${gradDefs}
${styleDefs}
<pattern id="hatch" width="22" height="18" patternUnits="userSpaceOnUse" patternTransform="scale(${r1(1 / f)})"><path d="M2 4h7M13 9h6M5 14h8" stroke="#cdbf9c" stroke-width=".5" stroke-linecap="round" opacity=".35" fill="none"/></pattern>
${symbolDefs(new Set([...usedIds]))}
${defs2}${rimD.length ? `<path id="rim" d="${rimD.join("")}"/>` : ""}${railD ? `<path id="rail" d="${railD}"/>` : ""}
</defs>`;
  const sizes = { parts: parts.map((p) => p.length).join('/'), defs: defs.length, water: waterD.join('').length, rim: rimD.join('').length, rivers: rivers.length, roads: [...byWidth.values()].join('').length, rail: railD.length, decor: decor.length };
  let body = parts.join("");
  let defsAll = defs;
  // 細かい層（core）の縁のぼかしは、SVG の mask ではなく、画面の CSS（.vMp-ill--core の mask-image。scenesearch.css）で行う（SVG の mask は描くのに 1 秒以上かかった）
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none">${defsAll}${body}</svg>`;

  const inWaterStores = waterStores.map((w) => w.id);
  // 範囲（緯度経度）
  const [lonW, latN] = tileToLonLat(x0, y0, z);
  const [lonE, latS] = tileToLonLat(x1 + 1, y1 + 1, z);
  return { svg, plan: pl, layer, W, H, bounds: [[latS, lonW], [latN, lonE]], size: Buffer.byteLength(svg), inWaterStores, stats: { sizes, roadsAll: roads.length, roadsPicked: picked.length, thr, trees: placedTrees, houses: placedH, tiles: tiles.length } };
}

// ---- 全国（japan.svg）: 低いズームのタイルから、海と海岸線・主な川だけを同じ描き方で ----
async function buildJapan() {
  const z = 6;
  const bb = { minLat: 21.0, maxLat: 47.6, minLng: 116.0, maxLng: 162.0 };
  const x0 = Math.floor(worldX(bb.minLng, z) / 256), x1 = Math.floor(worldX(bb.maxLng, z) / 256);
  const y0 = Math.floor(worldY(bb.maxLat, z) / 256), y1 = Math.floor(worldY(bb.minLat, z) / 256);
  const W = (x1 - x0 + 1) * 256, H = (y1 - y0 + 1) * 256;
  const f = 0.5; // 全国の初期表示は z5 前後
  const px = (n) => n / f;
  const disp = makeDisp(px(0.9));
  const dp = ([x, y]) => { const [dx, dy] = disp(x, y); return [x + dx, y + dy]; };
  // 海岸線（線）: タイルの外側の余白（バッファ）の部分は切り落とし、隣のタイルとの二重線を避ける
  const lines = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const buf = await getTile(z, tx, ty);
    if (!buf.length) continue;
    const L = decodeTile(buf);
    const e0 = L.coastline?.extent ?? 16384;
    for (const ft of L.coastline?.features ?? []) for (const line of ft.rings) {
      if (line.length < 2) continue;
      const inside = line.map(([vx, vy]) => vx >= 0 && vx <= e0 && vy >= 0 && vy <= e0);
      let cur = [];
      for (let i = 0; i < line.length; i++) {
        const near = inside[i] || inside[i - 1] || inside[i + 1]; // 内側の点と、その外側の隣の点（つなぎ目まで）
        if (near) cur.push(line[i]); else { if (cur.length > 1) lines.push(cur.map(([vx, vy]) => [(tx - x0) * 256 + (vx * 256) / e0, (ty - y0) * 256 + (vy * 256) / e0])); cur = []; }
      }
      if (cur.length > 1) lines.push(cur.map(([vx, vy]) => [(tx - x0) * 256 + (vx * 256) / e0, (ty - y0) * 256 + (vy * 256) / e0]));
    }
  }
  // 陸の面: 海岸線を格子に刻み、角の海から塗りつぶして海を求める。海でないところが陸（岸の格子も陸に含め、岸の白い縁で隠す）
  const CJ = 4;
  const GWj = Math.ceil(W / CJ), GHj = Math.ceil(H / CJ);
  const gj = new Uint8Array(GWj * GHj);
  for (const l of lines) for (let i = 1; i < l.length; i++) {
    const [ax, ay] = l[i - 1], [bx, by] = l[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / (CJ * 0.6)));
    for (let k = 0; k <= n; k++) {
      const cx = Math.floor((ax + ((bx - ax) * k) / n) / CJ), cy = Math.floor((ay + ((by - ay) * k) / n) / CJ);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = cx + dx, Y = cy + dy; if (X >= 0 && Y >= 0 && X < GWj && Y < GHj) gj[Y * GWj + X] = 1; }
    }
  }
  const stack = [];
  const push = (X, Y) => { if (X >= 0 && Y >= 0 && X < GWj && Y < GHj && gj[Y * GWj + X] === 0) { gj[Y * GWj + X] = 2; stack.push(Y * GWj + X); } };
  for (let X = 0; X < GWj; X++) { push(X, 0); push(X, GHj - 1); }
  for (let Y = 0; Y < GHj; Y++) { push(0, Y); push(GWj - 1, Y); }
  while (stack.length) { const c = stack.pop(); const X = c % GWj, Y = (c / GWj) | 0; push(X + 1, Y); push(X - 1, Y); push(X, Y + 1); push(X, Y - 1); }
  // 陸の行ごとの区間を、同じ区間が縦に続くかぎり 1 つの矩形にまとめる
  let landD = "";
  const open = new Map(); // "x0,x1" → 開始行
  const flush = (Y) => { for (const [k, y0r] of open) { const [a0, a1] = k.split(",").map(Number); landD += `M${a0 * CJ} ${y0r * CJ}h${(a1 - a0 + 1) * CJ}v${(Y - y0r) * CJ}h${-(a1 - a0 + 1) * CJ}z`; } open.clear(); };
  let prev = new Set();
  const curRuns = [];
  for (let Y = 0; Y <= GHj; Y++) {
    const runs = new Set();
    if (Y < GHj) { let X = 0; while (X < GWj) { if (gj[Y * GWj + X] !== 2) { const s0 = X; while (X < GWj && gj[Y * GWj + X] !== 2) X++; runs.add(`${s0},${X - 1}`); } else X++; } }
    for (const [k, y0r] of [...open]) if (!runs.has(k)) { const [a0, a1] = k.split(",").map(Number); landD += `M${a0 * CJ} ${y0r * CJ}h${(a1 - a0 + 1) * CJ}v${(Y - y0r) * CJ}h${-(a1 - a0 + 1) * CJ}z`; open.delete(k); }
    for (const k of runs) if (!open.has(k)) open.set(k, Y);
    void prev; void curRuns;
  }
  flush(GHj);
  const tol = px(1.3);
  const coastD = lines.map((l) => smoothPath(simplify(l.map(dp), tol), false, rInt)).join("");
  const rnd = seeded("japan");
  const blots = [];
  for (let i = 0; i < 90; i++) {
    const bx = rnd() * W, by = rnd() * H, rx = px(40 + rnd() * 90);
    blots.push(`<ellipse cx="${r1(bx)}" cy="${r1(by)}" rx="${r1(rx)}" ry="${r1(rx * (0.5 + rnd() * 0.5))}" fill="url(#${i % 2 ? "gA" : "gB"})" transform="rotate(${r1(rnd() * 180)} ${r1(bx)} ${r1(by)})"/>`);
  }
  const waves = [];
  for (let i = 0; i < 260; i++) { const x = rnd() * W, y = rnd() * H, s0 = px(1 + rnd()); waves.push(`<path d="M${r1(x)} ${r1(y)}q${r1(3 * s0)} ${r1(-3 * s0)} ${r1(6 * s0)} 0t${r1(6 * s0)} 0"/>`); }
  const deep = [];
  for (let i = 0; i < 14; i++) deep.push(`<ellipse cx="${r1(rnd() * W)}" cy="${r1(rnd() * H)}" rx="${r1(px(60 + rnd() * 100))}" ry="${r1(px(20 + rnd() * 40))}"/>`);
  const JP = {
    e: { sea: "#bfe0f0", deep: "#7fbfe4", deepOp: 0.3, wave: "#ffffff", waveOp: 0.9, land: "#f1ead6", coast: "#6fb2d8" },
    f: { sea: "#a9bdd6", deep: "#7f9cc4", deepOp: 0.25, wave: "#3a5a90", waveOp: 0.55, land: "#e7d9b3", coast: "#2a2d44" },
    g: { sea: "#0e1a33", deep: "#070f22", deepOp: 0.5, wave: "#35568d", waveOp: 0.35, land: "#1f1a15", coast: "#4a74b4" },
    h: { sea: "#9ccbe8", deep: "#9ccbe8", deepOp: 0, wave: "#9ccbe8", waveOp: 0, land: "#e8e1cc", coast: "#7fb6d8" },
  }[STYLE];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none"><defs>
<filter id="blurJ" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${r1(px(5))}"/></filter>
<radialGradient id="gA"><stop offset="0" stop-color="#c8deb2" stop-opacity=".45"/><stop offset="1" stop-color="#bfd9a8" stop-opacity="0"/></radialGradient>
<radialGradient id="gB"><stop offset="0" stop-color="#ece3b8" stop-opacity=".4"/><stop offset="1" stop-color="#e6dca8" stop-opacity="0"/></radialGradient>
<path id="land" d="${landD}"/><path id="coast" d="${coastD}"/>
<clipPath id="lc"><use href="#land" clip-rule="evenodd"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="${JP.sea}"/>
${STYLE === "f" ? `<use href="#coast" fill="none" stroke="#27457f" stroke-width="${r1(px(16))}" opacity=".5" stroke-linejoin="round" filter="url(#blurJ)"/>` : ""}${STYLE === "g" ? `<use href="#coast" fill="none" stroke="#1d3770" stroke-width="${r1(px(10))}" opacity=".6" stroke-linejoin="round" filter="url(#blurJ)"/>` : ""}
<g fill="${JP.deep}" opacity="${JP.deepOp}">${deep.join("")}</g>
<g fill="none" stroke="${JP.wave}" stroke-width="${r1(px(1))}" stroke-linecap="round" opacity="${JP.waveOp}">${waves.join("")}</g>
<use href="#land" fill="${JP.land}" fill-rule="evenodd"/>
<g clip-path="url(#lc)">${STYLE === "e" ? blots.join("") : ""}</g>
${STYLE === "e" ? `<use href="#coast" fill="none" stroke="#ffffff" stroke-width="${r1(px(4))}" opacity=".7" stroke-linejoin="round" stroke-linecap="round"/>` : ""}
<use href="#coast" fill="none" stroke="${JP.coast}" stroke-width="${r1(px(STYLE === "f" ? 1.4 : 1.1))}" stroke-linejoin="round" stroke-linecap="round"${STYLE === "g" ? ' opacity=".9"' : ""}/>
</svg>`;
  const [lonW, latN] = tileToLonLat(x0, y0, z);
  const [lonE, latS] = tileToLonLat(x1 + 1, y1 + 1, z);
  return { svg, bounds: [[latS, lonW], [latN, lonE]], z };
}

function writeTable(table, japan) {
  const rows = Object.entries(table).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `  ${JSON.stringify(k)}: { z: ${v.z}, zi: ${v.zi}, bounds: ${JSON.stringify(v.bounds)}, kb: ${v.kb}${v.core ? `, core: { z: ${v.core.z}, bounds: ${JSON.stringify(v.core.bounds)}, kb: ${v.core.kb} }` : ""} },`).join("\n");
  fs.writeFileSync(TABLE, `/**
 * 「さがす」の地図 e（手描き風の地図）の、地域ごとの SVG の範囲の表。automation/illust-map/build.mjs が書き出す（手で編集しない）。
 * SVG は public/_portal/illust-map/<地域キー>.svg（粗い層。すべての店の範囲）と、あれば <地域キー>-core.svg（細かい層。初期表示のまわり。縁をぼかして粗い層の上に重ねる）。\n * bounds は [[南, 西], [北, 東]]（緯度経度）。この範囲に imageOverlay で敷く。z は描き起こしに使ったタイルのズーム、zi は初期表示のズーム、kb は SVG の大きさ。
 * 出典: 地図は国土地理院ベクトルタイルをもとに作成。
 */
export const ILLUST_MAPS: Record<string, { z: number; zi: number; bounds: [[number, number], [number, number]]; kb: number; core?: { z: number; bounds: [[number, number], [number, number]]; kb: number } }> = {
${rows}
};

/** 全国の地図（public/_portal/illust-map/japan.svg）の範囲 */
export const ILLUST_JAPAN: { bounds: [[number, number], [number, number]]; kb: number } = { bounds: ${JSON.stringify(japan.bounds)}, kb: ${japan.kb} };
`);
}

// ---- 実行 ----
// 使い方: node build.mjs --style=e|f|g|h [地域キー…|japan]  → automation/illust-map/svg/<style>/<キー>[-core].svg と meta.json（画像にするのは raster.mjs）
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const byRegion = {};
for (const r of RESTAURANTS) {
  const g = GEO[r.id];
  (byRegion[r.region] = byRegion[r.region] || []);
  if (g) byRegion[r.region].push({ id: r.id, lat: g.lat, lng: g.lng });
}
const SVG_DIR = path.join(HERE, "svg", STYLE);
fs.mkdirSync(SVG_DIR, { recursive: true });
const META = path.join(HERE, "meta.json");
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, "utf8")) : {};
const keys = Object.keys(REGIONS).filter((k) => only.includes(k) || (!only.length));
for (const key of only.includes("japan") && only.length === 1 ? [] : keys) {
  const t0 = Date.now();
  const pl0 = planLayers(key, byRegion[key] ?? []);
  // h（見下ろす）は 1 枚（すべての店と初期表示を覆う。縁のぼかしなし）。ほかは粗い層 + 細かい層
  const pl = STYLE === "h" ? { ...pl0, core: null } : pl0;
  const layers = STYLE === "h" ? [{ ...pl0.ov, Zdes: pl0.Zi }] : [pl0.ov, pl0.core].filter(Boolean);
  const logs = [];
  for (const layer of layers) {
    const res = await buildRegion(key, byRegion[key] ?? [], layer, pl, 1);
    const file = `${key}${layer.kind === "core" ? "-core" : ""}.svg`;
    fs.writeFileSync(path.join(SVG_DIR, file), res.svg);
    meta[`${STYLE}/${key}/${layer.kind}`] = { style: STYLE, key, kind: layer.kind, file: `svg/${STYLE}/${file}`, z: layer.z, zi: pl0.Zi, W: res.W, H: res.H, bounds: res.bounds.map((p) => p.map((n) => Math.round(n * 1e5) / 1e5)), svgKB: Math.round(res.size / 1024), waterRaw: res.inWaterStores };
    logs.push(`${layer.kind} z${layer.z} svg ${Math.round(res.size / 1024)}KB 道 ${res.stats.roadsPicked}/${res.stats.roadsAll} 水上の店 ${res.inWaterStores.length}`);
  }
  fs.writeFileSync(META, JSON.stringify(meta, null, 1));
  console.log(`${STYLE} ${key.padEnd(10)} Zi=${pl0.Zi} | ${logs.join(" | ")} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
if (only.includes("japan")) {
  const jp = await buildJapan();
  fs.writeFileSync(path.join(SVG_DIR, "japan.svg"), jp.svg);
  meta[`${STYLE}/japan/overview`] = { style: STYLE, key: "japan", kind: "overview", file: `svg/${STYLE}/japan.svg`, z: jp.z, zi: 5.5, W: 0, H: 0, bounds: jp.bounds.map((p) => p.map((n) => Math.round(n * 1e5) / 1e5)), svgKB: Math.round(Buffer.byteLength(jp.svg) / 1024) };
  fs.writeFileSync(META, JSON.stringify(meta, null, 1));
  console.log(`${STYLE} japan z${jp.z} ${Math.round(Buffer.byteLength(jp.svg) / 1024)}KB`);
}
