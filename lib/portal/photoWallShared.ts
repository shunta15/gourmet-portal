/**
 * 「写真から探す」（/photos）の壁の、サーバーとクライアントで共有する型と純関数。
 * データ（店・写真の対応表）は読まない。クライアント部品（components/portal/photos/*）から import してよい。
 *
 * 壁の組み方（CSS Grid。位置はここで先に決めておき、ブラウザでは測らない）:
 *   1列の高さを GRID_Q 段に割った細い行（--unit）を敷き、写真ごとに「何列ぶん・何段ぶん」と置き場所を決める（packWall）。
 *   段数は縦横比から決める（rows ≈ GRID_Q × 列数 ÷ 縦横比）ので、写真は元の縦横比に近いまま並ぶ。
 *   置き方は masonry（いちばん低い列へ積む）。特に良い写真（f=1）は、間を空けて 2 列ぶんの大きな枠にして並びにリズムをつける。
 *   大きな枠の左右の列の高さがずれる所は、その列の直前の数枚を数%だけ縦に伸ばして揃える（隙間を作らない）。
 *   最後も、各列の末尾の数枚を伸ばして下端を揃える。列数は幅で変わる（2・3・4・5）ので、列数ごとに置き場所を作る。
 *   幅と高さは写真が読み込まれる前から決まっているので、読み込みで位置はずれない（CLS 0）。
 */

/** 壁に出す1枚（サーバーが作り、クライアントに渡す。項目名は転送量を抑えるため短くしてある） */
export interface WallItem {
  /** 店ID（/restaurant/{id}） */
  id: string;
  /** 店名 */
  n: string;
  /** 街（店データの area。無ければ空） */
  a: string;
  /** ジャンル（店データの cuisine のまま） */
  c: string;
  /** 都道府県（WallData.prefs の番号。分からなければ -1） */
  p: number;
  /** 該当するジャンルの絞り込み（WallData.genres の番号。どれにも当たらなければ「その他」の番号） */
  g: number[];
  /** 事前生成した WebP の名前のハッシュ（photoSrc で URL にする） */
  h: string;
  /** 作ってある幅（小さい順。元画像が小さいと 400 / 800 / 1200 の全部は無い） */
  ws: number[];
  /** 縦横比（幅÷高さ） */
  r: number;
  /** 大きな枠にしてよいか（特に良い写真で、元画像が十分に大きく、縦横比が極端でない） */
  f: 0 | 1;
}

export interface WallFacet {
  /** URL（?genre= ?pref=）に出す識別子 */
  key: string;
  label: string;
}

export interface WallData {
  /** 並び順は決まった順（地域とジャンルが偏らないよう交互。lib/portal/photoWall.ts） */
  items: WallItem[];
  /** 全体の枚数が多い順 */
  genres: WallFacet[];
  prefs: WallFacet[];
}

export function photoSrc(hash: string, w: number): string {
  return `/_portal/photo-${hash}-${w}.webp`;
}

export function photoSrcSet(hash: string, ws: number[]): string {
  return ws.map((w) => `${photoSrc(hash, w)} ${w}w`).join(", ");
}

/** 壁の1枚の <img>（400 / 800）。大きい枠は 2 列ぶんなので、1200 まで選べるようにしてよい */
export function wallImg(it: WallItem, large: boolean): { src: string; srcSet: string } {
  const ws = large ? it.ws : it.ws.filter((w) => w <= 800);
  const use = ws.length ? ws : [it.ws[0]];
  return { src: photoSrc(it.h, use[0]), srcSet: photoSrcSet(it.h, use) };
}

/** 押して大きく見せるときの <img>（800 / 1200。小さい写真は作ってある幅だけ） */
export function bigImg(it: WallItem): { src: string; srcSet: string } {
  const big = it.ws.filter((w) => w >= 800);
  const use = big.length ? big : [it.ws[it.ws.length - 1]];
  return { src: photoSrc(it.h, use[0]), srcSet: photoSrcSet(it.h, use) };
}

/** 1列の高さを割る段数。大きいほど写真の縦横比に忠実（切り抜きが減る）。css の --q と同じ値 */
export const GRID_Q = 12;
/** 大きな枠にしてよい写真の、元画像の幅の下限（これ未満だと 2 列ぶんに引き伸ばすとぼける） */
export const FEATURE_MIN_WIDTH = 900;
/** 大きな枠にしてよい縦横比の範囲（極端な縦長・横長は大きくしない） */
export const FEATURE_RATIO: readonly [number, number] = [0.74, 1.9];
/** 壁の列数（css の @container の段と同じ。幅 〜559 / 560〜 / 800〜 / 1100〜） */
export const WALL_COLS = [2, 3, 4, 5] as const;
export type WallCols = (typeof WALL_COLS)[number];

/** 大きな枠どうしの間に、最低でもこれだけ普通の写真を挟む */
const FEATURE_GAP = 5;
/** 大きな枠の置き場所を決めるとき、左右の列の高さのずれ（段）がこれ以下なら、伸ばして揃えて置く */
const ALIGN_MAX = 3;
/** 1枚を伸ばしてよい段数の上限（大きな枠のそろえ）／下端のそろえ */
const STRETCH_PER_TILE = 2;
const STRETCH_END_PER_TILE = 3;
/** 大きな枠を置けなかったとき、後ろの普通の写真を先に置いて待つ最大枚数 */
const FEATURE_WAIT = 6;

export interface Placed {
  /** 左端の列（1 始まり） */
  col: number;
  /** 上端の段（1 始まり） */
  row: number;
  /** 占める列数（1 か 2） */
  cs: 1 | 2;
  /** 占める段数 */
  rs: number;
}

const clampR = (r: number) => Math.min(2, Math.max(0.55, r));
const naturalRows = (r: number, cs: number) => Math.max(GRID_Q / 2, Math.round((GRID_Q * cs) / clampR(r)));

/**
 * 列数 cols の壁での、各写真の置き場所（list と同じ並び・同じ長さ）。同じ入力なら同じ結果（決まった順）。
 * 大きな枠を置けない（左右の列がそろわない）ときは、後ろの普通の写真を先に置いて待ち、それでも置けなければ普通の枠にする。
 * そのため、見た目の並びは list の並びから少しだけ前後することがある（DOM の順は list のまま）。
 */
export function packWall(list: ReadonlyArray<Pick<WallItem, "r" | "f">>, cols: number): Placed[] {
  const n = list.length;
  const rs1 = list.map((it) => naturalRows(it.r, 1));
  const rs2 = list.map((it) => naturalRows(it.r, 2));
  const col = new Array<number>(n).fill(0);
  const cs = new Array<1 | 2>(n).fill(1);
  const rs = new Array<number>(n).fill(0);
  const placed = new Array<boolean>(n).fill(false);
  const order: number[] = []; // 置いた順
  const h = new Array<number>(cols).fill(0);
  // 各列に積んだ写真（大きな枠は左右の2列に入る）。あとから高さを足す対象は、末尾に連なる1列の写真だけ
  const stack: number[][] = Array.from({ length: cols }, () => []);

  const trailing = (c: number, max: number): number[] => {
    const out: number[] = [];
    for (let k = stack[c].length - 1; k >= 0 && out.length < max; k--) {
      const idx = stack[c][k];
      if (cs[idx] === 2) break;
      out.push(idx);
    }
    return out;
  };
  /** 列 c の末尾の写真を、合計 d 段ぶん伸ばす（1枚あたり cap 段まで）。伸ばしきれなければ伸ばせた分だけ。伸ばした段数を返す */
  const stretch = (c: number, d: number, cap: number, maxTiles: number): number => {
    const t = trailing(c, maxTiles).sort((a, b) => rs[b] - rs[a]); // 段数の多い（伸ばしても割合の小さい）写真から
    let left = d;
    while (left > 0 && t.length) {
      let progressed = false;
      for (const idx of t) {
        if (left === 0) break;
        if (rs[idx] - rs1[idx] < cap) {
          rs[idx]++;
          h[c]++;
          left--;
          progressed = true;
        }
      }
      if (!progressed) break;
    }
    return d - left;
  };
  /** 列 c の末尾の写真を、あと何段ぶん伸ばせるか */
  const room = (c: number, cap: number, maxTiles: number): number =>
    trailing(c, maxTiles).reduce((sum, idx) => sum + Math.max(0, cap - (rs[idx] - rs1[idx])), 0);
  const shortest = () => {
    let c = 0;
    for (let k = 1; k < cols; k++) if (h[k] < h[c]) c = k;
    return c;
  };
  const putNormal = (idx: number) => {
    const c = shortest();
    col[idx] = c;
    cs[idx] = 1;
    rs[idx] = rs1[idx];
    h[c] += rs[idx];
    stack[c].push(idx);
    placed[idx] = true;
    order.push(idx);
  };
  let larges = 0;
  /** 大きな枠を置ける場所（左の列）。ずれが最小のもの（同じなら低いほう、さらに同じなら左右交互）。無ければ -1 */
  const bestPair = (): number => {
    let best = -1;
    let bestD = Infinity;
    let bestTop = Infinity;
    for (let p = 0; p < cols - 1; p++) {
      const d = Math.abs(h[p] - h[p + 1]);
      if (d > ALIGN_MAX) continue;
      const low = h[p] <= h[p + 1] ? p : p + 1;
      if (d > 0 && room(low, STRETCH_PER_TILE, 3) < d) continue; // 伸ばしきれないのでそろえられない
      const top = Math.max(h[p], h[p + 1]);
      const better = d < bestD || (d === bestD && top < bestTop) || (d === bestD && top === bestTop && larges % 2 === 1);
      if (better) {
        best = p;
        bestD = d;
        bestTop = top;
      }
    }
    return best;
  };
  const putLarge = (idx: number, p: number) => {
    const low = h[p] <= h[p + 1] ? p : p + 1;
    const d = Math.abs(h[p] - h[p + 1]);
    if (d > 0) stretch(low, d, STRETCH_PER_TILE, 3);
    // 伸ばしきれなかったときは、ずれが残る（隙間になる）。bestPair が伸ばせる場合しか選ばないので、まず起きない
    const top = Math.max(h[p], h[p + 1]);
    col[idx] = p;
    cs[idx] = 2;
    rs[idx] = rs2[idx];
    h[p] = h[p + 1] = top + rs[idx];
    stack[p].push(idx);
    stack[p + 1].push(idx);
    placed[idx] = true;
    order.push(idx);
    larges++;
  };

  let since = FEATURE_GAP - 2; // 先頭の近くにも大きな1枚を出せるように
  let waited = 0;
  let head = 0;
  while (true) {
    while (head < n && placed[head]) head++;
    if (head >= n) break;
    const idx = head;
    if (cols >= 2 && list[idx].f === 1 && since >= FEATURE_GAP) {
      const p = bestPair();
      if (p >= 0) {
        putLarge(idx, p);
        since = 0;
        waited = 0;
        continue;
      }
      if (waited < FEATURE_WAIT) {
        let j = idx + 1;
        while (j < n && (placed[j] || list[j].f === 1)) j++;
        if (j < n) {
          putNormal(j);
          since++;
          waited++;
          continue;
        }
      }
    }
    putNormal(idx);
    since++;
    waited = 0;
  }

  // 下端をそろえる（各列の末尾の数枚を伸ばす）
  const top = Math.max(...h);
  for (let c = 0; c < cols; c++) if (h[c] < top) stretch(c, top - h[c], STRETCH_END_PER_TILE, 6);

  // 段の位置は、置いた順にもう一度積んで決める（伸ばした分が入った最終の段数で。大きな枠は左右の列のうち高いほうの端から始まる）
  const row = new Array<number>(n).fill(0);
  const cursor = new Array<number>(cols).fill(1);
  for (const idx of order) {
    const c = col[idx];
    if (cs[idx] === 2) {
      row[idx] = Math.max(cursor[c], cursor[c + 1]);
      cursor[c] = cursor[c + 1] = row[idx] + rs[idx];
    } else {
      row[idx] = cursor[c];
      cursor[c] += rs[idx];
    }
  }
  return list.map((_, i) => ({ col: col[i] + 1, row: row[i], cs: cs[i], rs: rs[i] }));
}

/** 全部の列数ぶんの置き場所 */
export function packAll(list: ReadonlyArray<Pick<WallItem, "r" | "f">>): Record<WallCols, Placed[]> {
  return { 2: packWall(list, 2), 3: packWall(list, 3), 4: packWall(list, 4), 5: packWall(list, 5) };
}

/** css の grid-area に入れる値（行の始まり / 列の始まり / 行の長さ / 列の長さ） */
export function gridArea(p: Placed): string {
  return `${p.row} / ${p.col} / span ${p.rs} / span ${p.cs}`;
}

/** 壁の <img sizes>（幅の目安。css の列数の段と同じ区切り。1列あたりの vw に占める列数を掛ける） */
export function wallSizes(at: Record<WallCols, Placed>): string {
  return `(min-width: 1100px) ${19 * at[5].cs}vw, (min-width: 800px) ${24 * at[4].cs}vw, (min-width: 560px) ${32 * at[3].cs}vw, ${48 * at[2].cs}vw`;
}
