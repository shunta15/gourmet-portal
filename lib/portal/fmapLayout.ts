/**
 * 巡り図の配置の計算（純関数。描画は components/portal/FeatureMap.tsx）。
 * 点の位置は lib/portal/fmap.ts の fit()（緯度経度から計算した相対位置）。ここでは、
 *  - 近すぎる点どうしが重ならないよう、描く円だけを少しずらす（本当の位置は小さな点で残し、細い線でつなぐ）
 *  - 店名・駅名・直線距離の文字を、互いに重ならない場所に置く（置けないものは出さない。店名は一覧と札に必ずある）
 *  - 格子・縮尺・北の印の位置
 * を決める。
 */
import {
  clip,
  distM,
  fit,
  fmtDist,
  fmtUnit,
  hit,
  niceStep,
  textW,
  type Box,
  type FmapMode,
  type FmapOrder,
  type FmapStation,
  type FmapStop,
} from "./fmap";

export const DISC_R = 14;

export interface LabelPos {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  text: string;
  /** 詰めていない全文（選んだとき・指を載せたときに出す） */
  full?: string;
}

export interface LayoutOut {
  mpp: number;
  /** 格子の一目（m）と px */
  step: number;
  stepPx: number;
  gridX: number[];
  gridY: number[];
  unitLabel: string;
  /** 店の本当の位置 */
  anchor: Record<string, { x: number; y: number }>;
  /** 円を描く位置（近すぎる点どうしを離したもの） */
  disc: Record<string, { x: number; y: number }>;
  label: Record<string, LabelPos | null>;
  legs: {
    k: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    mx: number;
    my: number;
    ang: number;
    px: number;
    label: LabelPos | null;
  }[];
  rings: { r: number; label: LabelPos | null }[];
  stations: { name: string; x: number; y: number; label: LabelPos | null }[];
  north: { x: number; y: number };
  scale: { x: number; y: number };
  /** 「出発」の旗（箱の左上は x-17, y。幅 34・高さ 17） */
  flag: { x: number; y: number } | null;
}

/** 近すぎる円を離す。本当の位置から最大 maxMove px まで */
function dodge(pts: { x: number; y: number }[], minD: number, maxMove: number): { x: number; y: number }[] {
  const p = pts.map((q) => ({ ...q }));
  for (let it = 0; it < 24; it++) {
    let moved = false;
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        let dx = p[j].x - p[i].x;
        let dy = p[j].y - p[i].y;
        let d = Math.hypot(dx, dy);
        if (d >= minD) continue;
        if (d < 0.01) {
          const a = (i * 2.399963 + 0.7) % (Math.PI * 2);
          dx = Math.cos(a);
          dy = Math.sin(a);
          d = 1;
        }
        const push = (minD - d) / 2 + 0.2;
        const ux = dx / d;
        const uy = dy / d;
        p[i].x -= ux * push;
        p[i].y -= uy * push;
        p[j].x += ux * push;
        p[j].y += uy * push;
        moved = true;
      }
    }
    for (let i = 0; i < p.length; i++) {
      const ox = p[i].x - pts[i].x;
      const oy = p[i].y - pts[i].y;
      const m = Math.hypot(ox, oy);
      if (m > maxMove) {
        p[i].x = pts[i].x + (ox / m) * maxMove;
        p[i].y = pts[i].y + (oy / m) * maxMove;
      }
    }
    if (!moved) break;
  }
  return p;
}


/** 円が、ボタン・札・北の印・縮尺と重ならないよう、いちばん近い辺の外へ押し出す（本当の位置から最大 maxMove px） */
function avoid(
  pts: { x: number; y: number }[],
  origin: { x: number; y: number }[],
  rects: Box[],
  r: number,
  maxMove: number,
): void {
  for (let i = 0; i < pts.length; i++) {
    for (const k of rects) {
      const L = k.x - r - 2;
      const R = k.x + k.w + r + 2;
      const T = k.y - r - 2;
      const B = k.y + k.h + r + 2;
      const p = pts[i];
      if (p.x <= L || p.x >= R || p.y <= T || p.y >= B) continue;
      const opts = [
        { d: p.x - L, x: L, y: p.y },
        { d: R - p.x, x: R, y: p.y },
        { d: p.y - T, x: p.x, y: T },
        { d: B - p.y, x: p.x, y: B },
      ].sort((a, b) => a.d - b.d);
      p.x = opts[0].x;
      p.y = opts[0].y;
    }
    const ox = pts[i].x - origin[i].x;
    const oy = pts[i].y - origin[i].y;
    const m = Math.hypot(ox, oy);
    if (m > maxMove) {
      pts[i].x = origin[i].x + (ox / m) * maxMove;
      pts[i].y = origin[i].y + (oy / m) * maxMove;
    }
  }
}

/** 全文が avail px に収まるところまで（収まらなければ末尾を … にする） */
function fitFull(name: string, size: number, avail: number): string {
  if (textW(name, size) <= avail) return name;
  const a = Array.from(name);
  while (a.length > 3 && textW(a.join("") + "…", size) > avail) a.pop();
  return a.join("") + "…";
}

export function layoutFmap(args: {
  stops: FmapStop[];
  order: FmapOrder;
  mode: FmapMode;
  stations: FmapStation[];
  w: number;
  h: number;
}): LayoutOut {
  const { stops, order, mode, stations, w, h } = args;
  const mobile = w < 560;
  const pad = mobile ? { l: 46, r: 46, t: 84, b: 58 } : { l: 92, r: 92, t: 86, b: 62 };
  const proj = fit(stops, w, h, pad);
  const mpp = proj.mpp;
  const fs = mobile ? 12 : 13;
  const nameMax = mobile ? 8 : 12;

  const anchor: LayoutOut["anchor"] = {};
  for (const s of stops) anchor[s.id] = proj.xy(s.lat, s.lng);
  const ids = order.stops.map((s) => s.id);
  // 円を置いてはいけない場所（北の印・「もう一度」ボタン・右下の札・縮尺）
  const north = { x: w - 30, y: 26 };
  const scale = { x: 20, y: h - 28 };
  const keepOut: Box[] = [
    { x: north.x - 22, y: 8, w: 44, h: 58 },
    { x: 8, y: 8, w: mobile ? 168 : 178, h: 56 },
    { x: w - (mobile ? 58 : 66), y: h - (mobile ? 112 : 128), w: mobile ? 52 : 58, h: mobile ? 106 : 122 },
  ];
  const origin = ids.map((id) => anchor[id]);
  let moved = origin.map((q) => ({ ...q }));
  for (let it = 0; it < 4; it++) {
    moved = dodge(moved, DISC_R * 2 + 4, DISC_R * 3);
    avoid(moved, origin, keepOut, DISC_R, DISC_R * 3);
  }
  const disc: LayoutOut["disc"] = {};
  ids.forEach((id, i) => (disc[id] = moved[i]));

  // 格子（図の中心を通る線から、一目ごと）
  const step = niceStep(mpp, mobile ? 72 : 92);
  const stepPx = step / mpp;
  const gridX: number[] = [];
  const gridY: number[] = [];
  for (let x = w / 2 - Math.floor(w / 2 / stepPx) * stepPx; x < w; x += stepPx) gridX.push(x);
  for (let y = h / 2 - Math.floor(h / 2 / stepPx) * stepPx; y < h; y += stepPx) gridY.push(y);


  // 文字の置き場所。先に置いたものが優先
  const taken: Box[] = [];
  const inside = (b: Box) => b.x >= 8 && b.y >= 8 && b.x + b.w <= w - 8 && b.y + b.h <= h - 8;
  const free = (b: Box) => inside(b) && !taken.some((t) => hit(t, b));
  for (const k of keepOut) taken.push({ ...k, h: k.h + (k.x === 8 ? 10 : 0) });
  taken.push({ x: scale.x - 6, y: scale.y - 22, w: Math.max(stepPx, 40) + 90, h: 40 });
  for (const id of ids) taken.push({ x: disc[id].x - DISC_R - 3, y: disc[id].y - DISC_R - 3, w: DISC_R * 2 + 6, h: DISC_R * 2 + 6 });
  // 出発の円に添える「出発」の旗（上。ほかの点・ボタンにかかるときは下）
  const startId = ids[0];
  let flag: { x: number; y: number } | null = null;
  if (startId) {
    const d = disc[startId];
    const up: Box = { x: d.x - 19, y: d.y - DISC_R - 28, w: 38, h: 20 };
    const down: Box = { x: d.x - 19, y: d.y + DISC_R + 8, w: 38, h: 20 };
    // 自分の円は taken に入っているので、旗の箱が自分の円に触れない位置（上・下とも円の外）で判定する
    const others = taken.filter((t) => !(t.x === d.x - DISC_R - 3 && t.y === d.y - DISC_R - 3));
    const fits = (b: Box) => inside(b) && !others.some((t) => hit(t, b));
    const pick = fits(up) ? up : fits(down) ? down : null;
    if (pick) {
      taken.push(pick);
      flag = { x: d.x, y: pick.y + 1.5 };
    }
  }

  // 駅の印（先に場所だけ取る）
  const stationPts = stations
    .map((st) => ({ st, ...proj.xy(st.lat, st.lng) }))
    .filter((q) => q.x > 14 && q.x < w - 14 && q.y > 14 && q.y < h - 14);
  for (const q of stationPts) taken.push({ x: q.x - 6, y: q.y - 6, w: 12, h: 12 });

  // 店名
  const label: LayoutOut["label"] = {};
  for (const s of order.stops) {
    const d = disc[s.id];
    const text = clip(s.name, nameMax);
    const full = s.name;
    const tw = textW(text, fs) + 4;
    const th = fs * 1.35;
    const off = DISC_R + 10;
    const cands: { box: Box; pos: LabelPos }[] = [
      { box: { x: d.x + off, y: d.y - th / 2, w: tw, h: th }, pos: { x: d.x + off + 2, y: d.y + fs * 0.35, anchor: "start", text, full } },
      { box: { x: d.x - off - tw, y: d.y - th / 2, w: tw, h: th }, pos: { x: d.x - off - 2, y: d.y + fs * 0.35, anchor: "end", text, full } },
      { box: { x: d.x - tw / 2, y: d.y - off - th + 2, w: tw, h: th }, pos: { x: d.x, y: d.y - off - 2, anchor: "middle", text, full } },
      { box: { x: d.x - tw / 2, y: d.y + off - 2, w: tw, h: th }, pos: { x: d.x, y: d.y + off + fs * 0.9, anchor: "middle", text, full } },
      { box: { x: d.x + off - 4, y: d.y - off - th + 4, w: tw, h: th }, pos: { x: d.x + off - 2, y: d.y - off + 1, anchor: "start", text, full } },
      { box: { x: d.x - off + 4 - tw, y: d.y - off - th + 4, w: tw, h: th }, pos: { x: d.x - off + 2, y: d.y - off + 1, anchor: "end", text, full } },
      { box: { x: d.x + off - 4, y: d.y + off - 4, w: tw, h: th }, pos: { x: d.x + off - 2, y: d.y + off + fs * 0.8, anchor: "start", text, full } },
      { box: { x: d.x - off + 4 - tw, y: d.y + off - 4, w: tw, h: th }, pos: { x: d.x - off + 2, y: d.y + off + fs * 0.8, anchor: "end", text, full } },
    ];
    const ok = cands.find((c) => free(c.box));
    if (ok) {
      taken.push(ok.box);
      const p = ok.pos;
      // 選んだとき・指を載せたときに出す全文は、図の端からはみ出さない長さまで
      const avail = p.anchor === "start" ? w - 10 - p.x : p.anchor === "end" ? p.x - 10 : 2 * Math.min(p.x - 10, w - 10 - p.x);
      p.full = fitFull(s.name, fs, avail);
      label[s.id] = p;
    } else label[s.id] = null;
  }

  // 店と店の間（hop は前の店から次の店へ。wide は出発の店から各店へ）の線に添える、直線距離の文字
  const legs: LayoutOut["legs"] = [];
  for (let k = 1; k < ids.length; k++) {
    const a = anchor[mode === "hop" ? ids[k - 1] : ids[0]];
    const b = anchor[ids[k]];
    const px = Math.hypot(b.x - a.x, b.y - a.y);
    const at = mode === "hop" ? 0.5 : 0.6;
    const mx = a.x + (b.x - a.x) * at;
    const my = a.y + (b.y - a.y) * at;
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    let lab: LabelPos | null = null;
    const text = `直線 ${fmtDist(order.d[k])}`;
    const tw = textW(text, 12) + 12;
    if (px > tw + DISC_R * 2 + 22) {
      const nx = -(b.y - a.y) / (px || 1);
      const ny = (b.x - a.x) / (px || 1);
      // 文字の箱が線にかからないよう、線の法線方向に、箱の半分の張り出しぶん離す
      const off = Math.abs(nx) * (tw / 2) + Math.abs(ny) * 9 + 8;
      outer: for (const extra of [0, 8]) {
        for (const sgn of [1, -1]) {
          const cx = mx + nx * (off + extra) * sgn;
          const cy = my + ny * (off + extra) * sgn;
          const box: Box = { x: cx - tw / 2, y: cy - 9, w: tw, h: 18 };
          if (free(box)) {
            taken.push(box);
            lab = { x: cx, y: cy + 4, anchor: "middle", text };
            break outer;
          }
        }
      }
    }
    legs.push({ k, x1: a.x, y1: a.y, x2: b.x, y2: b.y, mx, my, ang, px, label: lab });
  }

  // 輪（wide）: 出発の店から格子の目ごとの同心円
  const rings: LayoutOut["rings"] = [];
  if (mode === "wide" && startId) {
    const a = anchor[startId];
    const farM = Math.max(...order.stops.map((s) => distM(order.stops[0], s)));
    const rs = niceStep(mpp, mobile ? 90 : 120);
    for (let m = rs; m < farM + rs * 0.6 && rings.length < 6; m += rs) {
      const r = m / mpp;
      let lab: LabelPos | null = null;
      const text = fmtUnit(m);
      const tw = textW(text, 12) + 6;
      for (const deg of [-38, 218, 38, 142]) {
        const rd = (deg * Math.PI) / 180;
        const cx = a.x + r * Math.cos(rd);
        const cy = a.y - r * Math.sin(rd);
        const box: Box = { x: cx - tw / 2, y: cy - 8, w: tw, h: 16 };
        if (free(box)) {
          taken.push(box);
          lab = { x: cx, y: cy + 4, anchor: "middle", text };
          break;
        }
      }
      rings.push({ r, label: lab });
    }
  }

  // 駅の名前
  const stOut: LayoutOut["stations"] = stationPts.map((q) => {
    const text = q.st.name;
    const tw = textW(text, 12) + 4;
    const th = 16;
    const cands: { box: Box; pos: LabelPos }[] = [
      { box: { x: q.x + 9, y: q.y - th / 2, w: tw, h: th }, pos: { x: q.x + 11, y: q.y + 4, anchor: "start", text } },
      { box: { x: q.x - 9 - tw, y: q.y - th / 2, w: tw, h: th }, pos: { x: q.x - 11, y: q.y + 4, anchor: "end", text } },
      { box: { x: q.x - tw / 2, y: q.y + 8, w: tw, h: th }, pos: { x: q.x, y: q.y + 21, anchor: "middle", text } },
      { box: { x: q.x - tw / 2, y: q.y - 8 - th, w: tw, h: th }, pos: { x: q.x, y: q.y - 12, anchor: "middle", text } },
    ];
    const ok = cands.find((c) => free(c.box));
    if (ok) taken.push(ok.box);
    return { name: q.st.name, x: q.x, y: q.y, label: ok ? ok.pos : null };
  });

  return {
    mpp,
    step,
    stepPx,
    gridX,
    gridY,
    unitLabel: fmtUnit(step),
    anchor,
    disc,
    label,
    legs,
    rings,
    stations: stOut,
    north,
    scale,
    flag,
  };
}
