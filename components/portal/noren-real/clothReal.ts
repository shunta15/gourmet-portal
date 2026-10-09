/**
 * 暖簾（リアル版）の布を素の WebGL で描く。1 枚のフルスクリーン・フラグメントシェーダー。
 *
 * - 布は 1 枚。上の帯（竿に乳で通した部分）はつながり、その下に切れ目（割れ）が入って n 枚の垂れになる。
 * - 面の傾き（法線）は「大きなひだ（正弦の和）」「折り皺（尾根ノイズ）」「乳から広がる縦のしぼり」「押された窪み」の和。
 *   そこに、平織りの糸（1 本ごとの太さのむら・節）の凹凸を足して光を当てる。つや消し。
 * - 字は染め抜き。布の一部として織り目・ひだの陰影・揺れを受ける（字の縁は糸の目に沿ってにじむ）。
 * - 裏（店の中）からの灯りが、糸の隙間・薄い所から透ける。
 * - 竿は木の丸棒。乳（布の輪）が竿に掛かる。
 * 隙間・開いた後の空間は alpha 0 で、後ろの DOM（店の写真）がそのまま見える。
 */

/** 布の色 5 種類（藍・濃紺・墨・柿渋・臙脂）。"cha" は柿渋の別名（以前の URL 用） */
export type DyeKind = "ai" | "kon" | "sumi" | "kakishibu" | "enji";
export const DYE_LIST: { key: DyeKind; label: string; swatch: string }[] = [
  { key: "ai", label: "藍", swatch: "#1d2c48" },
  { key: "kon", label: "濃紺", swatch: "#0e1626" },
  { key: "sumi", label: "墨", swatch: "#241d19" },
  { key: "kakishibu", label: "柿渋", swatch: "#6b3a22" },
  { key: "enji", label: "臙脂", swatch: "#5e1a26" },
];
/** 色を切り替える口。window に CustomEvent(DYE_EVENT, { detail: DyeKind }) を送ると、読み込み直しなしで布の色が替わる（見本の操作盤用） */
export const DYE_EVENT = "noren-real:dye";
/** ?dye= の文字列を色に直す（"cha" は柿渋）。合わなければ null */
export function parseDye(q: string | null | undefined): DyeKind | null {
  if (!q) return null;
  if (q === "cha" || q === "kaki") return "kakishibu";
  return DYE_LIST.some((d) => d.key === q) ? (q as DyeKind) : null;
}

export type RealState = {
  time: number;
  open: number; // 0..1 暖簾が上がる量
  gust: number; // 風の強さ
  mouse: number; // -1..1
  lamp: number; // 0..1 灯りの強さ
  /** 手（ポインター）の位置 css px（ステージ内）と、触れている垂れの番号・強さ */
  px: number;
  py: number;
  hover: number;
  hoverAmt: number;
  /** 押された垂れの番号と上がり量 0..1 */
  sel: number;
  selAmt: number;
};

export type RealLayout = {
  cssW: number;
  cssH: number;
  dpr: number;
  rodY: number; // css px（竿の中心）
  hemY: number; // css px（垂れの裾）
  rodR: number; // css px（竿の半径）
  bandH: number; // css px（竿の中心から、切れ目の上端まで）
};

export type ClothReal = {
  render: (s: RealState) => void;
  resize: (l: RealLayout) => void;
  setGlyphs: (chars: string[], family: string, scale?: number) => void;
  setDye: (k: DyeKind) => void;
  /** 布の細かいしわの強さ 0〜1（既定は弱く 0.2。大きなひだ・畳みじわは変わらない） */
  setWrinkle: (w: number) => void;
  destroy: () => void;
};

const VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uOpen, uGust, uLamp, uMouse, uN, uS;
uniform vec4 uLay;   // rodY, hemY, rodR, bandH(device px)
uniform vec4 uPt;    // pointer x, y (device px), hoverIdx, hoverAmt
uniform vec2 uSel;   // selIdx, selAmt
uniform vec3 uDye, uDyeHi, uInk, uTint, uGrade; // uGrade: 彩度, 灯りの暖かさ, 暗部の落とし(ガンマ)
uniform float uWr;
uniform sampler2D uAtlas;

const float PI = 3.14159265;
const float TAU = 6.2831853;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// 値ノイズ + 傾き
vec3 vnd(vec2 x){
  vec2 i = floor(x), f = fract(x);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  float k = a - b - c + d;
  return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y, du * (vec2(b - a, c - a) + k * u.yx));
}
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s / 0.875; }

// 平織りの高さ（0..1）。糸 1 本ごとに太さがわずかに違う
float weaveH(vec2 m, float p){
  vec2 q = m / p;
  vec2 c = floor(q);
  vec2 f = fract(q);
  float par = mod(c.x + c.y, 2.0);
  float rx = hash(vec2(c.x, 17.0));
  float ry = hash(vec2(5.0, c.y));
  float bx = pow(sin(PI * f.x), 0.7) * (0.50 + 0.95 * rx);
  float by = pow(sin(PI * f.y), 0.7) * (0.50 + 0.95 * ry);
  float wp = bx * (0.62 + 0.38 * by);
  float wf = by * (0.62 + 0.38 * bx);
  return mix(wf, wp, 1.0 - par);
}

// 切れ目の半幅（device px）。上端は髪の毛ほど、下へ向かって開き、風で開閉する
float slitH(float qy, float i){
  float w = (0.7 + 1.9 * smoothstep(0.0, 0.3, qy)) * smoothstep(0.0, 0.025, qy);
  w += (0.5 + 0.5 * sin(uTime * 0.37 + i * 2.3 + qy * 1.8)) * (0.5 + 5.0 * uGust) * qy;
  return w * uS * clamp(uRes.x / uN / uS / 260.0, 0.45, 1.0);
}

// 垂れ k の横ゆれ（device px）。上は動かず、裾ほど大きい。垂れごとに位相が違う
float swing(float k, float qy){
  float ph = uTime * 0.5 + k * 2.17;
  float wv = sin(ph + qy * 1.4) * 0.6 + sin(ph * 1.83 + k * 3.1 + qy * 2.3) * 0.4;
  // 風は一定でなく、ゆるむ時と強まる時が不規則に来る（垂れごとに少しずれる）
  float lull = 0.5 + 0.5 * sin(uTime * 0.31 + 1.0) * sin(uTime * 0.17 + k * 0.45 + 2.0);
  float amp = (3.0 + 14.0 * uGust) * (0.62 + 0.9 * lull) * uS;
  float hv = (abs(uPt.z - k) < 0.5) ? uPt.w : 0.0;
  return (amp * wv + uMouse * 14.0 * uS + hv * 5.0 * uS * sin(uTime * 2.1 + k)) * pow(qy, 1.4);
}

// 開いたときの垂れの横の範囲（本番と同じ：中央は 46% に細り、左右は端へ 34% 幅に寄って重なる）
void targetX(float k, out float xtl, out float xtr){
  float pw0 = uRes.x / uN;
  float mid = (uN - 1.0) * 0.5;
  float ac = abs(k - mid);
  float wg = pw0 * 0.34;
  float stepG = wg * 0.72;
  float rk = mid - ac;
  if (ac < 0.01) { float wc = pw0 * 0.46; xtl = k * pw0 + (pw0 - wc) * 0.5; xtr = xtl + wc; }
  else if (k < mid) { xtl = -pw0 * 0.16 + rk * stepG; xtr = xtl + wg; }
  else { xtr = uRes.x + pw0 * 0.16 - rk * stepG; xtl = xtr - wg; }
}

// 垂れ k が開く量 0..1（本番と同じ：中央に近い垂れから順に）
float eOf(float k){
  float mid = (uN - 1.0) * 0.5;
  float d = abs(k - mid) * 0.075;
  return smoothstep(d, d + 0.60, uOpen);
}

// l, r: 布のある範囲（両端の垂れは閉じている間、画面の外まで伸ばす）／ ln, rn: 垂れの本来の左右（ひだ・字の位置の基準）
// q: 竿から裾まで 0..1（下側が先に動く＝手で押し分ける）／ qy: 帯の下から裾まで 0..1
void panelEdges(float k, float y, float q, float qy, out float l, out float r, out float ln, out float rn, out float ey, out float e){
  float pw0 = uRes.x / uN;
  float sw = swing(k, qy);
  float en = (vn(vec2(y / (7.0 * uS), k * 3.0)) - 0.5) * 1.1 * uS;
  float en2 = (vn(vec2(y / (7.0 * uS), k * 3.0 + 9.0)) - 0.5) * 1.1 * uS;
  float ln0 = (k < 0.5) ? 0.0 : k * pw0 + slitH(qy, k);
  float rn0 = (k > uN - 1.5) ? uRes.x : (k + 1.0) * pw0 - slitH(qy, k + 1.0);
  e = eOf(k);
  ey = clamp(e + 0.20 * sin(e * PI) * q, 0.0, 1.0);
  float xtl, xtr;
  targetX(k, xtl, xtr);
  ln = mix(ln0, xtl, ey) + sw + en;
  rn = mix(rn0, xtr, ey) + sw + en2;
  float ext = 300.0 * uS * (1.0 - ey);
  l = (k < 0.5) ? ln - ext : ln;
  r = (k > uN - 1.5) ? rn + ext : rn;
}

// 垂れ k が上がっている量 0..1（中央の垂れはスクロールで本番どおり持ち上がる。押されたものは押した垂れから）
float liftOf(float k){
  float mid = (uN - 1.0) * 0.5;
  float c = (abs(k - mid) < 0.01) ? smoothstep(0.0, 0.72, uOpen) : 0.0;
  float sel = (abs(uSel.x - k) < 0.5) ? uSel.y : 0.0;
  return max(c, sel);
}

float hemOf(float k, float u, float e, float sw){
  float rodY = uLay.x, hemY = uLay.y;
  float H = hemY - rodY;
  float isC = (abs(k - (uN - 1.0) * 0.5) < 0.01) ? 1.0 : 0.0;
  float hv = (abs(uPt.z - k) < 0.5) ? uPt.w : 0.0;
  float selA = (abs(uSel.x - k) < 0.5) ? uSel.y : 0.0;
  float c = isC * smoothstep(0.0, 0.72, uOpen);
  // 本番と同じ：左右の垂れは裾がわずかに上がるだけ、中央の垂れは手で持ち上げるように裾が竿の近くまで上がる
  float h = hemY - H * 0.055 * e;
  h = mix(h, rodY + H * (1.0 - 0.94 * c), isC);
  h = mix(h, rodY + H * (1.0 - 0.90 * selA), step(0.001, selA));
  float lift = max(c, selA);
  h -= hv * 15.0 * uS * (1.0 - lift);
  h += (sin(u * TAU * 1.35 + k * 2.1 + uTime * 0.35) * 3.4 + sin(u * TAU * 3.1 + k * 5.0 - uTime * 0.23) * 1.3) * uS * (1.0 - lift * 0.85);
  h -= abs(sw) * 0.10;
  return max(h, rodY + 8.0 * uS);
}

float aa(float d){ return clamp(d / (1.3 * uS) + 0.5, 0.0, 1.0); }

void main(){
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float x = fc.x, y = fc.y;
  float s = uS;
  float rodY = uLay.x, hemY = uLay.y, rodR = uLay.z, bandH = uLay.w;
  float yb = rodY + bandH;
  float n = uN;
  float pw0 = uRes.x / n;
  float loopTop = rodY - rodR * 1.16;

  vec4 outc = vec4(0.0);
  if (y < loopTop - 2.0 * s) { gl_FragColor = outc; return; }
  float lpp = (pw0 / s > 150.0) ? 3.0 : 1.0;

  // ---------- どの垂れか（本番と同じ並び：外側の垂れから先に置き、中に近い垂れが手前に重なる）----------
  float k = 0.0, l = 0.0, r = 0.0, ln = 0.0, rn = pw0, hem = hemY, cov = 0.0, ey = 0.0, e = 0.0;
  float winK = -1.0;
  float shadowD = 1e5;
  float sWin = 0.0;
  float qq = clamp((y - rodY) / (hemY - rodY), 0.0, 1.0);
  float qyB = clamp((y - yb) / (hemY - yb), 0.0, 1.0);
  for (int zi = 0; zi < 5; zi++) {
    if (float(zi) >= n) break;
    float kk = (mod(float(zi), 2.0) < 0.5) ? floor(float(zi) * 0.5) : (n - 1.0 - floor(float(zi) * 0.5));
    float xtl, xtr;
    targetX(kk, xtl, xtr);
    float lo = min(kk * pw0, xtl) - 70.0 * s, hi = max((kk + 1.0) * pw0, xtr) + 70.0 * s;
    if (x < lo || x > hi) continue;
    float la, ra, lna, rna, eya, ea;
    panelEdges(kk, y, qq, qyB, la, ra, lna, rna, eya, ea);
    float ua = (x - lna) / (rna - lna);
    float ha = hemOf(kk, ua, ea, swing(kk, qyB));
    float ca = aa(x - la) * aa(ra - x) * aa(ha - y);
    float oa = max(max(la - x, x - ra), y - ha);
    shadowD = min(shadowD, oa);
    if (ca > 0.5 || (ca > 0.02 && winK < 0.0)) {
      winK = kk; k = kk; l = la; r = ra; ln = lna; rn = rna; hem = ha; cov = ca; ey = eya; e = ea; sWin = 0.0;
    } else {
      sWin = max(sWin, 0.55 * exp(-max(oa, 0.0) / (13.0 * s)));
    }
  }
  if (winK < 0.0) k = clamp(floor(x / pw0), 0.0, n - 1.0);

  float u = (x - ln) / (rn - ln);
  float panelPw = (rn - ln) / s;
  float lk = liftOf(k);
  float yq = clamp((y - yb) / (hemY - yb), 0.0, 1.0);
  float ramp = smoothstep(0.0, 0.40, yq);
  float amp = 0.18 + 0.82 * ramp;
  vec2 mC = vec2((k + u) * pw0 / s, (y - rodY) / s);

  // ---------- 面の傾き ----------
  // 大きなひだ（垂れごとに位相が違う。帯の中ではつながる）
  float pb = smoothstep(yb - 10.0 * s, yb + 70.0 * s, y);
  float fq = mix(1.0, 2.2, ey);
  float sqz = clamp((rn - ln) / pw0, 0.3, 1.0);
  float foldA = panelPw * 0.19 * amp * (1.0 + 0.5 * uGust) / sqrt(fq) * (1.0 - 0.6 * lk);
  float f1p = mix(0.0, hash(vec2(k + 1.0, 2.0)) * TAU, pb);
  float f2p = mix(1.7, hash(vec2(k + 1.0, 3.0)) * TAU + 1.0, pb);
  float f3p = mix(3.4, hash(vec2(k + 1.0, 4.0)) * TAU + 2.0, pb);
  float wob = sin(yq * 3.0 + k * 1.9 + uTime * 0.21);
  float ph1 = TAU * 1.15 * fq * u + f1p + 0.5 * wob;
  float ph2 = TAU * 2.35 * fq * u + f2p + 0.5 * sin(yq * 4.1 + k * 0.7 + uTime * 0.31);
  float ph3 = TAU * 4.3 * fq * u + f3p + 0.5 * sin(yq * 5.3 + k * 2.7 + uTime * 0.17);
  float fh = sin(ph1) + 0.42 * sin(ph2) + 0.10 * sin(ph3);
  float fs = (cos(ph1) * TAU * 1.15 + 0.42 * cos(ph2) * TAU * 2.35 + 0.10 * cos(ph3) * TAU * 4.3) * fq;
  float gx = foldA * fs / panelPw;
  float Hn = foldA * fh;

  // 折り皺（尾根ノイズ。縦に長い）
  mat2 R1 = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  mat2 R2 = mat2(0.6216, -0.7833, 0.7833, 0.6216);
  vec2 wr = vec2(vn(mC / vec2(41.0, 63.0) + 1.3), vn(mC / vec2(41.0, 63.0) + 7.7)) - 0.5;
  vec2 mW = mC + wr * vec2(26.0, 40.0);
  vec3 c1 = vnd(R1 * (mW / vec2(52.0, 84.0)) + vec2(3.1, 1.7));
  vec3 c2 = vnd(R2 * (mW / vec2(21.0, 34.0)) + vec2(8.3, 4.2));
  float a1 = 2.0 * c1.x - 1.0, a2 = 2.0 * c2.x - 1.0;
  float q1 = sqrt(a1 * a1 + 0.035), q2 = sqrt(a2 * a2 + 0.035);
  float r1 = 1.0 - q1;
  float r2 = 1.0 - q2;
  mat2 R3 = mat2(0.2675, 0.9636, -0.9636, 0.2675);
  vec3 c3 = vnd(R3 * (mW / vec2(11.0, 17.0)) + vec2(2.9, 6.1));
  float a3 = 2.0 * c3.x - 1.0;
  float q3 = sqrt(a3 * a3 + 0.05);
  float r3 = 1.0 - q3;
  vec2 d3 = -(a3 / q3) * 2.0 * (c3.yz * R3) / vec2(11.0, 17.0);
  vec2 d1 = -(a1 / q1) * 2.0 * (c1.yz * R1) / vec2(52.0, 84.0);
  vec2 d2 = -(a2 / q2) * 2.0 * (c2.yz * R2) / vec2(21.0, 34.0);
  float crA = 12.0 * (0.35 + 0.65 * amp) * uWr;
  vec2 gc = crA * (d1 * 0.46 + d2 * 0.34 + d3 * 0.13);
  Hn += crA * (r1 * 0.46 + r2 * 0.34 + r3 * 0.13) - crA * 0.5;

  // 乳から広がる縦のしぼり（竿の近く）
  float dgap = pw0 / lpp / s;
  float gt = exp(-(y - rodY) / (170.0 * s));
  float gph = TAU * mC.x / dgap;
  float gxg = -15.0 * gt * sin(gph) * TAU / dgap;
  Hn += 15.0 * gt * cos(gph);

  // 畳みじわの名残（まっすぐな線が、横に 1 本・縦に 0〜1 本。布が上がると一緒に上がる）
  float upD = (lk * 0.88 * (hemY - yb)) / s;
  float cdy = (y - (yb + (hemY - yb) * (0.47 + 0.02 * sin(mC.x / 90.0)))) / s + upD;
  float cs = exp(-cdy * cdy / 5.0);
  float crvA = 2.4 * (0.6 + 0.8 * uWr) * smoothstep(0.0, 18.0, (y - yb) / s);
  Hn -= crvA * cs;
  float crSlope = crvA * 2.0 * cdy / 5.0 * cs;
  float cdx = (u - (0.30 + 0.40 * hash(vec2(k, 8.3)))) * panelPw;
  float cvs = exp(-cdx * cdx / 5.0);
  float cvA = 2.0 * (0.6 + 0.8 * uWr) * step(0.5, hash(vec2(k, 5.5))) * smoothstep(0.08, 0.3, yq) * (1.0 - smoothstep(0.8, 1.0, yq));
  Hn -= cvA * cvs;
  float cvSlope = cvA * 2.0 * cdx / 5.0 * cvs;

  // 押された窪み
  float hv = (abs(uPt.z - k) < 0.5) ? uPt.w : 0.0;
  vec2 pc = (fc - uPt.xy) / s;
  float bs = 64.0;
  vec2 bq = pc / vec2(bs, bs * 1.35);
  float G = exp(-dot(bq, bq));
  vec2 gb = 26.0 * hv * G * 2.0 * pc / vec2(bs * bs, bs * bs * 1.82);
  Hn -= 26.0 * hv * G;

  // 上がった垂れは、裾が畳まれて横ひだになる
  float vv = clamp((y - rodY) / max(hem - rodY, 1.0), 0.0, 1.0);
  float plA = lk * (0.30 + 0.70 * vv) * 1.15;
  float plPh = TAU * 3.0 * vv + k * 1.3;
  float plSlope = plA * 0.9 * cos(plPh);
  Hn -= plA * 0.9 * (max(hem - rodY, 1.0) / s) / (TAU * 3.0) * sin(plPh);
  float edL = (x - ln) / s, edR = (rn - x) / s;
  float curl = 0.42 * (exp(-max(edL, 0.0) / 20.0) - exp(-max(edR, 0.0) / 20.0)) * smoothstep(0.0, 0.25, yq) * (1.0 - lk);
  vec2 g = vec2(gx + gxg + gc.x + gb.x + curl + cvSlope, gc.y + gb.y + plSlope + crSlope);
  vec3 N = normalize(vec3(-g.x, -g.y, 1.0));

  // ---------- 糸 ----------
  float p = 1.8;
  float fadeW = smoothstep(2.0, 5.0, p * s * sqz);
  vec2 jo = vec2(0.0);
  vec2 mT = mC + (vec2(vn(mC / vec2(7.0, 11.0)), vn(mC / vec2(7.0, 11.0) + 5.0)) - 0.5) * vec2(2.4, 2.8);
  float h0 = weaveH(mT, p);
  float h1 = weaveH(mT + vec2(-0.30, -0.65), p);
  float wb = h0 - h1;
  float wg = 1.0 - h0;
  vec2 th = floor(mC / p);
  float colr = hash(vec2(th.x, 3.7));
  float rowr = hash(vec2(8.1, th.y));
  float lenW = vn(vec2(th.x * 1.7, mC.y / 28.0));
  float lenF = vn(vec2(mC.x / 60.0 + 4.0, th.y * 1.3));
  float slubK = mix(0.38, 1.0, fadeW) * mix(0.25, 1.0, smoothstep(0.5, 0.9, sqz));
  float slub = ((colr * 0.55 + lenW * 0.45 - 0.5) * 0.42 + (rowr * 0.40 + lenF * 0.60 - 0.5) * 0.18) * slubK;
  float nep = step(0.9988, hash(floor(mC / 1.1) + 3.3));

  // 染めのむら
  float mot = fbm(R2 * (mC / vec2(64.0, 100.0)) + 11.0);
  float streak = vn(vec2(mC.x / 15.0, mC.y / 150.0));
  float dens = 0.84 * mot + 0.16 * streak;
  vec3 alb = mix(uDye, uDyeHi, clamp(0.55 * (1.0 - smoothstep(0.30, 0.70, dens)) + 0.42 * wg * fadeW + 0.18 * (1.0 - yq) * (1.0 - ramp), 0.0, 1.0));

  // 藍のぼかし：竿に近い上のほうは染めが浅く、下へ向かって深くなる（藍染めの暖簾によくある染め方）
  float topK = 1.0 - smoothstep(0.0, 0.55, (y - rodY) / (hemY - rodY));
  alb = mix(alb, uDyeHi * 1.18 + vec3(0.03, 0.035, 0.04), 0.46 * topK * topK);

  // ---------- 染め抜きの字 ----------
  // 布が上がると、字は布と一緒に上へ動き、帯の下へ抜ける（縮めない）
  float gyc = yb + (hemY - yb) * 0.40 - (lk * 0.88 * (hemY - yb) + hv * 15.0 * s * (1.0 - lk));
  float narrow = (pw0 / s < 150.0) ? 1.0 : 0.0;
  float Sg = mix(0.90, 0.95, narrow) * pw0 / s;
  float jk = mix(1.0, 0.40, narrow);
  vec2 cl = vec2((u - 0.5) * pw0 / s, (y - gyc) / s);
  vec2 qd = (floor(cl / p) + 0.5) * p;
  vec2 clj = mix(cl, qd, 0.14 * jk) + (vec2(vn(mC * 0.55), vn(mC * 0.55 + 7.0)) - 0.5) * 0.8 * jk;
  vec2 auv = vec2((k + 0.5 + clj.x / Sg) / n, 0.5 + clj.y / Sg);
  float inBox = step(abs(clj.x), Sg * 0.5) * step(abs(clj.y), Sg * 0.5);
  float tapR = 2.6 / Sg;
  float mask = texture2D(uAtlas, auv).r;
  float mblur = (texture2D(uAtlas, auv + vec2(tapR / n, 0.0)).r + texture2D(uAtlas, auv - vec2(tapR / n, 0.0)).r + texture2D(uAtlas, auv + vec2(0.0, tapR)).r + texture2D(uAtlas, auv - vec2(0.0, tapR)).r) * 0.25;
  mask = mix(mask, mblur, 0.5);
  float edgeN = ((vn(mC * 0.8) - 0.5) * 0.09 + (hash(floor(mC / 1.2)) - 0.5) * 0.05) * jk;
  float ink = smoothstep(0.40, 0.60, mask + edgeN) * inBox * smoothstep(yb, yb + 4.0 * s, y);
  // 中央の垂れは、上がるにつれて字を薄くして消す（本番の暖簾と同じ。畳まれた布に字の残りが明るい点として出ない）
  float cfade = (abs(k - (uN - 1.0) * 0.5) < 0.01) ? 1.0 - smoothstep(0.05, 0.42, uOpen) : 1.0;
  cfade = min(cfade, (abs(uSel.x - k) < 0.5) ? 1.0 - smoothstep(0.15, 0.6, uSel.y) : 1.0);
  ink *= cfade;
  float fleck = smoothstep(0.80, 0.96, vn(mC / 2.6 + 9.1));
  ink *= (1.0 - 0.07 * fleck) * (0.96 + 0.04 * vn(mC / 7.0 + 3.0));
  float halo = smoothstep(0.03, 0.55, mblur) * (1.0 - ink) * inBox * smoothstep(yb, yb + 4.0 * s, y) * cfade;
  alb = mix(alb, uDyeHi * 1.25, halo * 0.30);

  vec3 inkCol = uInk * 0.79 * (0.95 + 0.10 * (colr - 0.5));
  float bleed = (1.0 - smoothstep(0.62, 0.98, mask)) * ink;
  inkCol = mix(inkCol, alb * 2.6 + 0.07, bleed * 0.55);
  vec3 baseCol = mix(alb, inkCol, ink);
  baseCol *= 1.0 + slub * 0.55;
  baseCol += nep * 0.05;

  // ---------- 光 ----------
  vec3 L1 = normalize(vec3(-0.52, -0.46, 0.72));
  vec3 L2 = normalize(vec3(0.62, 0.22, 0.75));
  float d1v = max(dot(N, L1), 0.0) / L1.z;
  float d2v = max(dot(N, L2), 0.0) / L2.z;
  float tl = mix(1.30, 0.72, smoothstep(0.0, 1.0, (y - rodY) / (hemY - rodY)));
  // 戸口の上の灯り：上の真ん中が明るく暖かく、左右と下へ向かって落ちる（夜の店先）
  vec2 lp = vec2(x / uRes.x - 0.5, (y - rodY) / (hemY - rodY) - 0.10);
  float spot = exp(-dot(lp * vec2(1.25, 1.0), lp * vec2(1.25, 1.0)) * 4.2);
  float lampF = 1.0 + 0.035 * sin(uTime * 1.9) * sin(uTime * 0.47 + 1.3);
  vec3 lightKey = lampF * mix(vec3(1.0, 0.955, 0.89), vec3(1.0, 0.88, 0.70), spot) * (0.50 + 0.78 * uLamp) * (0.90 + 0.26 * spot);
  vec3 diffuse = lightKey * (d1v * tl) + vec3(1.0, 0.78, 0.56) * 0.18 * d2v + vec3(0.66, 0.74, 1.0) * 0.17;
  float hmax = foldA * 1.8 + crA * 0.7 + 2.0;
  float ao = 0.72 + 0.28 * clamp(0.5 + 0.55 * Hn / hmax, 0.0, 1.0);
  float weaveMul = 1.0 + fadeW * (0.12 * wb - 0.06 * wg + 0.02) * (0.6 + 0.8 * colr);
  float vig = 1.0 - 0.34 * smoothstep(0.30, 1.0, abs(x / uRes.x - 0.5) * 2.0);
  vec3 col = baseCol * diffuse * ao * weaveMul * vig;
  col += baseCol * vec3(1.0, 0.8, 0.6) * pow(1.0 - N.z, 2.0) * 0.5;

  // 裏からの灯り（糸の隙間・薄い所から透ける）
  vec2 sp = fc / uRes;
  float glowR = length((sp - vec2(0.5, 0.58)) * vec2(1.0, uRes.y / uRes.x * 1.35));
  float back = exp(-glowR * glowR * 5.0);
  float thin = (0.35 + 0.65 * wg * fadeW + 0.65 * (1.0 - fadeW) * 0.5) * (1.0 - 0.7 * slub);
  vec3 trCol = mix(alb * vec3(2.2, 1.9, 1.6) + uTint, inkCol * 0.95, ink);
  vec2 ld = (fc - vec2(uRes.x * 0.5, rodY + (hemY - rodY) * 0.34)) / (s * 175.0);
  float disc = exp(-dot(ld, ld) * 1.3);
  float T = (back * (0.06 + 0.34 * uLamp) + disc * 0.08 * uLamp) * thin * (1.0 + 1.1 * uOpen);
  col += trCol * vec3(1.0, 0.82, 0.58) * T * mix(0.6, 1.25, ink);
  // 色の整え：彩度を落とし、暗部は墨に寄せ、灯りの当たる所だけわずかに暖かく
  float gl = dot(col, vec3(0.30, 0.59, 0.11));
  col = mix(vec3(gl), col, uGrade.x);
  col *= mix(vec3(1.0), vec3(1.07, 1.0, 0.89), uGrade.y * smoothstep(0.10, 0.45, gl) * (0.35 + 0.65 * spot));
  col = pow(max(col, vec3(0.0)), vec3(uGrade.z));

  // ---------- 縫い・裾・耳 ----------
  float dE = min(x - ln, rn - x) / s;
  float dH = (hem - y) / s;
  float below = smoothstep(0.0, 6.0, (y - yb) / s);
  float dashY = step(0.38, fract(y / (4.2 * s)));
  float sl1 = (1.0 - smoothstep(0.30, 0.85, abs(dE - 6.5))) * dashY * below;
  col *= 1.0 - 0.34 * sl1 * (1.0 - lk);
  col *= mix(1.0, 0.93, (1.0 - smoothstep(0.0, 6.5, dE)) * below);
  col += 0.045 * baseCol * exp(-max(dE, 0.0) / 0.9) * below * 6.0;
  col += vec3(1.0, 0.72, 0.42) * 0.10 * uLamp * exp(-max(dE, 0.0) / 2.4) * below * (1.0 - lk);
  float dashX = step(0.38, fract(x / (4.2 * s)));
  float hl1 = (1.0 - smoothstep(0.30, 0.85, abs(dH - 29.0))) * dashX;
  float hl2 = (1.0 - smoothstep(0.30, 0.85, abs(dH - 32.2))) * dashX;
  col *= 1.0 - 0.34 * max(hl1, hl2) * step(0.0, dH) * (1.0 - lk);
  col *= mix(1.0, 0.90, (1.0 - smoothstep(26.0, 29.5, dH)) * step(0.0, dH));
  col += 0.05 * baseCol * exp(-max(dH, 0.0) / 1.1) * 6.0;
  col *= 0.86 + 0.14 * smoothstep(0.0, 3.0, dH);
  col += vec3(1.0, 0.70, 0.40) * 0.12 * uLamp * exp(-max(dH, 0.0) / 2.6) * (1.0 - lk) * below;
  // 切れ目の止め縫い
  float sx = dE;
  float tack = step(sx, 5.0) * ((x - ln < rn - x) ? step(0.5, k) : step(k, n - 1.5)) * step(abs((y - yb) / s - 1.5), 5.5);
  col *= 1.0 - 0.38 * tack * step(0.5, fract(x / (1.7 * s) + 0.25)) * (1.0 - lk);
  // 竿の影（竿の下の布）
  col *= 1.0 - 0.72 * exp(-max(y - (rodY + rodR), 0.0) / (21.0 * s)) * step(rodY, y);

  col *= 1.0 - sWin * step(rodY, y) * 0.9;
  // 布の色
  vec3 clothCol = col;
  vec4 c = vec4(clothCol * cov, cov);
  if (y > rodY) {
    float sh = (0.62 + 0.25 * lk) * exp(-max(shadowD, 0.0) / ((10.0 + 12.0 * lk) * s)) * (1.0 - cov);
    c = c + vec4(0.0, 0.0, 0.0, sh) * (1.0 - c.a);
  }

  // ---------- 竿と乳 ----------
  float t = (y - rodY) / rodR;
  float lj0 = clamp(floor(u * lpp), 0.0, lpp - 1.0);
  float lj = lj0 + k * 3.0;
  // 乳は 1 つずつ、位置・幅・長さがわずかに違う（手で縫った物）。垂れと一緒に竿の上を寄る
  float ldx = x - (ln + (lj0 + 0.5) / lpp * (rn - ln)) - (hash(vec2(lj, 3.1)) - 0.5) * 7.0 * s;
  float lw = (7.9 + 1.5 * hash(vec2(lj, 7.7))) * s;
  float nx = clamp(ldx / lw, -1.0, 1.0);
  float rr = 5.5 * s;
  float lwy = lw - rr + sqrt(max(0.0, rr * rr - pow(max(0.0, loopTop + rr - y), 2.0)));
  float inLoopX = aa(lwy - abs(ldx));
  float loopBot = rodY + rodR + (10.0 + 6.0 * hash(vec2(lj, 11.3))) * s;
  float inLoop = inLoopX * aa(y - loopTop) * aa(loopBot - y) * step(0.0, winK) * step(0.0, u) * step(u, 1.0);
  // 乳の見え方（筒状の陰影・上へ折り返す所・下の縫い止め）
  float lsh = 0.40 + 0.60 * sqrt(max(0.0, 1.0 - nx * nx));
  float topTurn = smoothstep(loopTop, loopTop + 7.0 * s, y);
  float arch = smoothstep(loopTop + 5.0 * s, loopTop, y);
  vec3 loopCol = clothCol * lsh * (0.78 + 0.42 * topTurn) * 1.08 + vec3(0.05, 0.07, 0.11) * arch * 1.4;
  float stL = (1.0 - smoothstep(0.25, 0.8, abs(abs(ldx) / s - 6.2))) * step(0.45, fract(y / (3.6 * s)));
  loopCol *= (1.0 - 0.30 * stL) * (0.90 + 0.20 * hash(vec2(lj, 2.2)));
  loopCol *= 1.0 - 0.32 * (1.0 - smoothstep(0.5, 1.0, abs(nx))) * 0.0;
  float tackL = (1.0 - smoothstep(0.35, 0.9, abs((y - loopBot) / s + 1.5))) * step(0.5, fract(x / (1.7 * s)));
  loopCol *= 1.0 - 0.38 * tackL;

  float rodA = clamp((1.0 - abs(t)) * rodR / (1.3 * s) + 0.5, 0.0, 1.0);
  float tt = clamp(t, -1.0, 1.0);
  vec3 nr = vec3(0.0, tt, sqrt(max(0.0, 1.0 - tt * tt)));
  vec3 LR = normalize(vec3(-0.15, -0.62, 0.77));
  float rd = max(dot(nr, LR), 0.0) / LR.z;
  float gr = vn(vec2(x / (80.0 * s), y / (1.5 * s))) * 0.6 + vn(vec2(x / (17.0 * s), y / (0.8 * s))) * 0.4;
  float ringN = smoothstep(0.0, 1.0, abs(sin(x / (330.0 * s) * PI)));
  vec3 wood = mix(vec3(0.070, 0.048, 0.034), vec3(0.235, 0.168, 0.112), gr);
  // 竹の節：細い暗い輪と、その両側のわずかに明るい帯
  float nodeD = abs(fract(x / (410.0 * s) + 0.31) - 0.5) * 410.0;
  wood *= 1.0 - 0.45 * smoothstep(2.6, 0.0, nodeD) + 0.10 * smoothstep(9.0, 3.0, nodeD) * smoothstep(0.0, 3.0, nodeD);
  wood *= 1.0 - 0.22 * (1.0 - ringN) * (1.0 - ringN);
  vec3 spec = vec3(1.0, 0.92, 0.80) * pow(max(dot(reflect(-LR, nr), vec3(0.0, 0.0, 1.0)), 0.0), 20.0) * 0.12;
  vec3 rodCol = wood * (0.09 + 1.30 * pow(rd, 1.25) * (0.55 + 0.6 * uLamp)) * (0.50 + 0.50 * nr.z) * (1.0 - 0.42 * smoothstep(0.15, 1.0, tt)) + spec * (0.55 + 0.6 * uLamp);
  float lsd = smoothstep(lw + 6.0 * s, lw, abs(ldx));
  rodCol *= 1.0 - 0.55 * lsd;

  // 重ね順：布（奥）→ 竿 → 乳（手前）
  vec4 res = c;
  res.a = c.a * step(rodY - 0.5 * s, y);        // 竿より上に布は出さない（乳だけ出る）
  res.rgb = c.rgb * step(rodY - 0.5 * s, y);
  res = vec4(rodCol * rodA, rodA) + res * (1.0 - rodA);
  res = vec4(loopCol * inLoop, inLoop) + res * (1.0 - inLoop);
  gl_FragColor = res;
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("shader: " + log);
  }
  return sh;
}

const DYES: Record<DyeKind, { dye: number[]; hi: number[]; ink: number[]; tint: number[]; grade: number[] }> = {
  // 本藍（落ち着いた深い藍。褪せた渋さ）
  ai: { dye: [0.046, 0.075, 0.130], hi: [0.105, 0.150, 0.235], ink: [0.87, 0.85, 0.80], tint: [0.0, 0.02, 0.05], grade: [0.92, 1.0, 1.06] },
  // 濃紺（ほぼ墨に近い紺）
  kon: { dye: [0.026, 0.038, 0.066], hi: [0.050, 0.068, 0.108], ink: [0.86, 0.84, 0.79], tint: [0.0, 0.01, 0.03], grade: [0.86, 0.9, 1.10] },
  // 墨（本番の墨茶に近い、わずかに温かい黒）
  sumi: { dye: [0.040, 0.034, 0.030], hi: [0.085, 0.070, 0.058], ink: [0.88, 0.85, 0.78], tint: [0.04, 0.02, 0.0], grade: [0.82, 0.9, 1.06] },
  // 柿渋（赤みのある深い茶）
  kakishibu: { dye: [0.072, 0.034, 0.019], hi: [0.128, 0.064, 0.038], ink: [0.90, 0.85, 0.74], tint: [0.03, 0.01, 0.0], grade: [0.78, 0.96, 1.08] },
  // 臙脂（深いえんじ）
  enji: { dye: [0.066, 0.011, 0.019], hi: [0.118, 0.022, 0.036], ink: [0.90, 0.86, 0.79], tint: [0.025, 0.0, 0.005], grade: [0.78, 0.94, 1.08] },
};

export function createClothReal(canvas: HTMLCanvasElement): ClothReal | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" }) as WebGLRenderingContext | null;
  if (!gl) return null;
  let prog: WebGLProgram;
  try {
    const pr = gl.createProgram()!;
    gl.attachShader(pr, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error("link: " + gl.getProgramInfoLog(pr));
    prog = pr;
  } catch (err) {
    console.warn("[noren-real] WebGL init failed", err);
    return null;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uTime = U("uTime"), uOpen = U("uOpen"), uGust = U("uGust"), uLamp = U("uLamp"), uMouse = U("uMouse"),
    uN = U("uN"), uS = U("uS"), uLay = U("uLay"), uPt = U("uPt"), uSel = U("uSel"),
    uDye = U("uDye"), uDyeHi = U("uDyeHi"), uInk = U("uInk"), uTint = U("uTint"), uGrade = U("uGrade"), uWr = U("uWr"), uAtlas = U("uAtlas");

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.uniform1i(uAtlas, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let n = 5;
  let layout: RealLayout | null = null;
  let dye = DYES.ai;
  let wrinkle = 0.2;

  /** 字のアトラス: 1 枚の布につき 512 角の 1 区画。R が字（染め抜き＝白）。区画の中心が字の中心 */
  const setGlyphs = (chars: string[], family: string, scale = 1) => {
    n = chars.length;
    const cell = 512;
    const c = document.createElement("canvas");
    c.width = cell * n;
    c.height = cell;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.font = `${Math.round(cell * 0.84 * scale)}px ${family}`;
    for (let i = 0; i < n; i++) g.fillText(chars[i], i * cell + cell / 2, cell * 0.53);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  };

  const setDye = (k: DyeKind) => {
    dye = DYES[k];
  };
  const setWrinkle = (w: number) => {
    wrinkle = Math.min(1, Math.max(0, w));
  };

  const resize = (l: RealLayout) => {
    layout = l;
    const w = Math.round(l.cssW * l.dpr), h = Math.round(l.cssH * l.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  };

  const render = (s: RealState) => {
    if (!layout) return;
    const l = layout;
    const d = l.dpr;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, s.time);
    gl.uniform1f(uOpen, s.open);
    gl.uniform1f(uGust, s.gust);
    gl.uniform1f(uLamp, s.lamp);
    gl.uniform1f(uMouse, s.mouse);
    gl.uniform1f(uN, n);
    gl.uniform1f(uS, d);
    gl.uniform4f(uLay, l.rodY * d, l.hemY * d, l.rodR * d, l.bandH * d);
    gl.uniform4f(uPt, s.px * d, s.py * d, s.hover, s.hoverAmt);
    gl.uniform2f(uSel, s.sel, s.selAmt);
    gl.uniform3fv(uDye, dye.dye);
    gl.uniform3fv(uDyeHi, dye.hi);
    gl.uniform3fv(uInk, dye.ink);
    gl.uniform3fv(uTint, dye.tint);
    gl.uniform3fv(uGrade, dye.grade);
    gl.uniform1f(uWr, wrinkle);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const destroy = () => {
    gl.deleteTexture(tex);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    setTimeout(() => {
      if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
    }, 0);
  };

  return { render, resize, setGlyphs, setDye, setWrinkle, destroy };
}
