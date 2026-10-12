/**
 * 地図の上の目印（ピン・丸 + 名前）を、重ならないように置く（軽い純関数。fs・process.cwd() を使わない。サーバー・クライアントのどちらからでも読める）。
 * 入口（/gourmet）の帯の日本地図の地方のピン（jpBand.ts）と、「さがす」の地方の地図の地域の丸（areaMap.ts）が使う。
 * 置き方: 件数の多い目印から順に、本当の位置（anchor）にいちばん近い「空いている場所」へ置く（候補は舞台を小さな格子に区切った点。毎回同じ結果。乱数を使わない）。
 * 本当の位置がそのまま空いていれば動かさない。ずらしたときは moved に動かした距離（px）を返すので、呼び出し側が点線でつなぐ。
 */
export type Rect = { x: number; y: number; w: number; h: number };

export type PlaceItem = {
  key: string;
  /** 目印の箱の大きさ（px。押す範囲 = この箱ぜんぶ） */
  w: number;
  h: number;
  /** 本当の位置（anchor）から箱の上辺までの距離（px）。ピンなら先から頭まで、丸なら丸の中心から上辺まで */
  up: number;
  /** 本当の位置（舞台の px。左上が 0,0）。舞台の外でもよい（縁に寄せて置く。outside = true） */
  ax: number;
  ay: number;
  /** 大きいほど先に置く（本当の位置から動かさない） */
  weight: number;
};

export type Placed = {
  key: string;
  /** 置いた位置（anchor が来る点。舞台の px） */
  cx: number;
  cy: number;
  /** 本当の位置を舞台の中に収めた点 */
  ax: number;
  ay: number;
  /** 本当の位置から動かした距離（px） */
  moved: number;
  /** 本当の位置が舞台の外だったか（縁に寄せて置いた） */
  outside: boolean;
};

const overlap = (a: Rect, b: Rect, gap: number) => a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

export function placeMarkers(
  items: readonly PlaceItem[],
  W: number,
  H: number,
  opt: { padX?: number; padY?: number; gap?: number; step?: number; keepOut?: readonly Rect[] } = {},
): Placed[] {
  const padX = opt.padX ?? 2;
  const padY = opt.padY ?? 2;
  const gap = opt.gap ?? 4;
  const step = opt.step ?? 4;
  const keepOut = opt.keepOut ?? [];
  const order = [...items].sort((a, b) => b.weight - a.weight || a.key.localeCompare(b.key));
  const boxes: Rect[] = [];
  const out = new Map<string, Placed>();
  for (const it of order) {
    // 箱が舞台に収まる anchor の範囲
    const minX = padX + it.w / 2;
    const maxX = W - padX - it.w / 2;
    const minY = padY + it.up;
    const maxY = H - padY - (it.h - it.up);
    const outside = it.ax < 0 || it.ax > W || it.ay < 0 || it.ay > H;
    const ax = Math.min(W, Math.max(0, it.ax));
    const ay = Math.min(H, Math.max(0, it.ay));
    const boxAt = (x: number, y: number): Rect => ({ x: x - it.w / 2, y: y - it.up, w: it.w, h: it.h });
    const free = (x: number, y: number) => {
      const b = boxAt(x, y);
      return !boxes.some((o) => overlap(b, o, gap)) && !keepOut.some((k) => overlap(b, k, 0));
    };
    const cx0 = Math.min(maxX, Math.max(minX, ax));
    const cy0 = Math.min(maxY, Math.max(minY, ay));
    let best: { x: number; y: number } | null = free(cx0, cy0) ? { x: cx0, y: cy0 } : null;
    if (!best && maxX >= minX && maxY >= minY) {
      // 本当の位置に近い順に、空いている格子の点を探す
      const cand: { x: number; y: number; d: number }[] = [];
      for (let y = minY; y <= maxY + 0.001; y += step) for (let x = minX; x <= maxX + 0.001; x += step) cand.push({ x, y, d: Math.hypot(x - ax, y - ay) });
      cand.sort((p, q) => p.d - q.d || p.y - q.y || p.x - q.x);
      best = cand.find((c) => free(c.x, c.y)) ?? null;
      if (!best) {
        // どこも空いていない（舞台が狭すぎる）: 重なりがいちばん少ない点（確かめ用に重なりが出る）
        let bo = Infinity;
        for (const c of cand) {
          const b = boxAt(c.x, c.y);
          let ov = 0;
          for (const o of boxes) if (overlap(b, o, 0)) ov += Math.max(0, Math.min(b.x + b.w, o.x + o.w) - Math.max(b.x, o.x)) * Math.max(0, Math.min(b.y + b.h, o.y + o.h) - Math.max(b.y, o.y));
          if (ov < bo) {
            bo = ov;
            best = { x: c.x, y: c.y };
          }
        }
      }
    }
    const p = best ?? { x: cx0, y: cy0 };
    boxes.push(boxAt(p.x, p.y));
    out.set(it.key, { key: it.key, cx: Math.round(p.x * 10) / 10, cy: Math.round(p.y * 10) / 10, ax: Math.round(ax * 10) / 10, ay: Math.round(ay * 10) / 10, moved: Math.round(Math.hypot(p.x - ax, p.y - ay) * 10) / 10, outside });
  }
  return items.map((i) => out.get(i.key)!);
}

/** 置いた目印の箱どうしの重なりの数（確かめ用。0 が正しい）。箱は items と同じ大きさ */
export function countBoxOverlaps(items: readonly PlaceItem[], placed: readonly Placed[]): number {
  const by = new Map(placed.map((p) => [p.key, p]));
  let n = 0;
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      const a = by.get(items[i].key)!;
      const b = by.get(items[j].key)!;
      const ra: Rect = { x: a.cx - items[i].w / 2, y: a.cy - items[i].up, w: items[i].w, h: items[i].h };
      const rb: Rect = { x: b.cx - items[j].w / 2, y: b.cy - items[j].up, w: items[j].w, h: items[j].h };
      if (overlap(ra, rb, 0)) n++;
    }
  return n;
}
