/**
 * スポーツ(見本2)の最初のページ・探すページの「描いた飾り」。
 * 以前は画像(webp)だったが、小さくて粗かったので SVG / 文字に描き直した(見た目・位置・大きさは同じ)。
 *  CatScript = 「Category から探す」の手書き文字 / IcDumbbell・IcGloves・IcGolf = 探すページのカテゴリ札のアイコン / FindMap = 結果一覧の上の地図の帯
 */

/** 「Category」+「から探す」。筆記体の Web フォント + 少し斜めの小さなゴシック。viewBox は元の画像(100x62)と同じ */
export function CatScript({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 62" role="img" aria-label="Category から探す" xmlns="http://www.w3.org/2000/svg">
      <text className="s2-art-script" x="9" y="33" fontSize="31" textLength="86" transform="skewX(-5) translate(2.6 0)" lengthAdjust="spacingAndGlyphs" fill="#1c1c1c">
        Category
      </text>
      <text className="s2-art-kana" x="27" y="56" fontSize="9.5" textLength="44" lengthAdjust="spacingAndGlyphs" fill="#2a2a2a" transform="rotate(-8 49 52)">
        から探す
      </text>
    </svg>
  );
}

const SLATE = "#4f5f6f";

/** ダンベル(元の画像 54x34) */
export function IcDumbbell() {
  return (
    <svg viewBox="0 0 54 34" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <g fill={SLATE}>
        <g id="s2-db-half">
          <rect x="0.8" y="11" width="3.2" height="12" rx="1.2" />
          <rect x="5.2" y="1.2" width="8.2" height="31.6" rx="2.6" />
          <rect x="14.4" y="7" width="3.6" height="20" rx="1.2" />
          <rect x="17" y="14" width="10.5" height="6" />
        </g>
        <use href="#s2-db-half" transform="translate(54 0) scale(-1 1)" />
      </g>
    </svg>
  );
}

/** ぶら下げた 2 つのボクシンググローブ(元の画像 52x44) */
export function IcGloves() {
  const BG = "#fbd7c5"; // 札の色(.s2-kinds-martial-arts)。親指の切れ目の線を札の色で抜く
  return (
    <svg viewBox="0 0 52 44" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <g fill={SLATE}>
        <g id="s2-gl-half">
          <path d="M13.2 11.4 C6.6 11.4 2.2 16.6 2 24.4 C1.8 31 4.4 36.4 7.6 39 L8.2 43 L23.4 43 C24.9 37.6 25.6 31.6 25.4 24.4 C25.2 16.4 21.2 11.4 15.6 11.4 Z" />
          <path d="M15 11.6 L21.4 0.8" fill="none" stroke={SLATE} strokeWidth="1.1" strokeLinecap="round" />
          <path d="M12.4 19.4 C9 19.2 7.2 21.4 7.4 24.6 C7.6 27.4 9.2 28.8 11.4 28.4" fill="none" stroke={BG} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8.4 36.8 L24.4 36.8" fill="none" stroke={BG} strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <use href="#s2-gl-half" transform="translate(52 0) scale(-1 1)" />
      </g>
    </svg>
  );
}

/** ティーに載ったゴルフボール(元の画像 40x44) */
export function IcGolf() {
  const INK = "#202124";
  const dots: Array<[number, number]> = [[22.4, 15.2], [26.2, 14.2], [24.6, 18.4], [28.4, 18.2], [20.2, 19.4], [26.6, 22.2], [22.6, 22.8], [17.4, 22.6]];
  return (
    <svg viewBox="0 0 40 44" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="14.4" r="12.2" fill="none" stroke={INK} strokeWidth="2.6" />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="none" stroke={INK} strokeWidth="0.9" />
      ))}
      <path d="M13 28.2 H27 C27 30 24.6 31.2 21.6 31.6 L21.2 41.6 C21.2 42.6 18.8 42.6 18.8 41.6 L18.4 31.6 C15.4 31.2 13 30 13 28.2 Z" fill={INK} />
    </svg>
  );
}

/* ---------- 地図(西日本あたり。経度・緯度の海岸線を簡略に引いた) ---------- */
type LL = [number, number];
const W = 648;
const H = 170;
const px = ([lon, lat]: LL): LL => [(lon - 129.5) * 32, 68 + (34.7 - lat) * 38.7];

/** 点の列を、角を丸めたなめらかな閉じた線にする(各点を制御点・隣との中点を通る) */
function smooth(pts: LL[]): string {
  const p = pts.map(px);
  const n = p.length;
  const mid = (a: LL, b: LL): LL => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const f = (v: number) => v.toFixed(1);
  const s0 = mid(p[n - 1], p[0]);
  let d = `M${f(s0[0])} ${f(s0[1])}`;
  for (let i = 0; i < n; i++) {
    const m = mid(p[i], p[(i + 1) % n]);
    d += `Q${f(p[i][0])} ${f(p[i][1])} ${f(m[0])} ${f(m[1])}`;
  }
  return d + "Z";
}

// 本州(北の海岸 → 東の端 → 南の瀬戸内海・紀伊・伊勢湾・駿河湾)。東の端は薄くぼかして消す
const HONSHU: LL[] = [
  [130.9, 33.97], [130.95, 34.25], [131.2, 34.42], [131.55, 34.5], [131.9, 34.7], [132.1, 34.95], [132.5, 35.2], [132.65, 35.43], [133.0, 35.55], [133.3, 35.58], [133.5, 35.52], [134.0, 35.55], [134.5, 35.62], [134.85, 35.7], [135.2, 35.78], [135.3, 35.6], [135.5, 35.5], [135.85, 35.5], [136.0, 35.65], [136.1, 35.9], [136.15, 36.2], [136.3, 36.4], [136.7, 37.0], [137.0, 37.4], [137.2, 36.75], [137.8, 36.9], [138.5, 37.3], [139.3, 37.8], [139.6, 35.4], [139.0, 34.95], [138.85, 34.62], [138.55, 34.95], [138.2, 34.6], [137.7, 34.65], [137.3, 34.65], [137.0, 34.62], [137.1, 34.8], [136.9, 35.0], [136.7, 34.85], [136.55, 34.5], [136.9, 34.3], [136.4, 34.1], [136.2, 34.05], [136.0, 33.7], [135.75, 33.45], [135.35, 33.6], [135.1, 33.85], [135.1, 34.2], [135.3, 34.4], [135.42, 34.62], [135.2, 34.68], [134.7, 34.72], [134.3, 34.7], [133.95, 34.6], [133.7, 34.5], [133.2, 34.38], [132.9, 34.3], [132.45, 34.35], [132.2, 34.2], [131.9, 33.95], [131.55, 34.0], [131.25, 33.95], [130.95, 33.93],
];
const SHIKOKU: LL[] = [
  [134.05, 34.35], [134.4, 34.25], [134.65, 34.15], [134.6, 33.85], [134.2, 33.3], [133.9, 33.4], [133.55, 33.5], [133.3, 33.38], [133.0, 32.9], [133.02, 32.72], [132.7, 32.93], [132.5, 33.2], [132.0, 33.35], [132.4, 33.45], [132.7, 33.85], [133.0, 34.1], [133.3, 33.97], [133.65, 34.1], [133.85, 34.3],
];
const KYUSHU: LL[] = [
  [130.9, 33.95], [131.2, 33.6], [131.7, 33.68], [131.55, 33.4], [132.0, 33.25], [131.85, 32.9], [131.65, 32.4], [131.5, 31.9], [131.3, 31.3], [130.5, 31.3], [130.2, 32.0], [129.8, 32.6], [129.7, 33.2], [130.0, 33.45], [130.4, 33.62], [130.75, 33.92],
];
const AWAJI: LL[] = [[134.95, 34.6], [135.0, 34.45], [134.85, 34.2], [134.65, 34.25], [134.7, 34.5]];

const D_HONSHU = smooth(HONSHU);
const D_LAND = [D_HONSHU, smooth(SHIKOKU), smooth(KYUSHU), smooth(AWAJI)];

const PIN = "M0 0 C-3 -7 -13 -14 -13 -24 a13 13 0 1 1 26 0 C13 -14 3 -7 0 0Z";
const PINS: Array<[number, number, string]> = [
  [198, 68, "#5d9b4d"],
  [144, 118, "#2e66a6"],
  [183, 146, "#f0a083"],
];

/** 「Find in Your Area.」の地図の帯。元の画像(324x85)の 2 倍の座標で描き、枠いっぱいに(cover)広げる */
export function FindMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="s2-fm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#edf2f3" />
          <stop offset="1" stopColor="#e7edef" />
        </linearGradient>
        <linearGradient id="s2-fm-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.46" stopColor="#fff" />
          <stop offset="0.57" stopColor="#000" />
        </linearGradient>
        <mask id="s2-fm-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="url(#s2-fm-fade)" />
        </mask>
      </defs>
      <rect width={W} height={H} fill="url(#s2-fm-bg)" />
      <g mask="url(#s2-fm-mask)">
        {D_LAND.map((d, i) => (
          <path key={i} d={d} fill="#d5dce1" stroke="#f4f7f8" strokeWidth="1.6" strokeLinejoin="round" />
        ))}
      </g>
      {PINS.map(([x, y, c]) => (
        <g key={c} transform={`translate(${x} ${y})`}>
          <path d={PIN} fill={c} />
          <circle cx="0" cy="-24" r="4.6" fill="#fff" fillOpacity="0.92" />
        </g>
      ))}
      <g className="s2-art-script" fill="#4b4c57" fontSize="21">
        <text x="312" y="86" transform="rotate(-9 312 86)">Find</text>
        <text x="290" y="116" transform="rotate(-9 290 116)">in Your Area.</text>
      </g>
    </svg>
  );
}
