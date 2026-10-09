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

export type DyeKind = "ai" | "cha";

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
uniform vec3 uDye, uDyeHi, uInk, uTint;
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
  float bx = pow(sin(PI * f.x), 0.7) * (0.78 + 0.44 * rx);
  float by = pow(sin(PI * f.y), 0.7) * (0.78 + 0.44 * ry);
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
  return (amp * wv + uMouse * 4.5 * uS + hv * 5.0 * uS * sin(uTime * 2.1 + k)) * pow(qy, 1.4);
}

// l, r: 布のある範囲（両端の垂れは画面の外まで伸ばす）／ ln, rn: 垂れの本来の左右（ひだ・字の位置の基準）
void panelEdges(float k, float y, float qy, out float l, out float r, out float ln, out float rn){
  float pw0 = uRes.x / uN;
  float sw = swing(k, qy);
  float en = (vn(vec2(y / (7.0 * uS), k * 3.0)) - 0.5) * 1.1 * uS;
  float en2 = (vn(vec2(y / (7.0 * uS), k * 3.0 + 9.0)) - 0.5) * 1.1 * uS;
  ln = (k < 0.5) ? sw + en : k * pw0 + slitH(qy, k) + sw + en;
  rn = (k > uN - 1.5) ? uRes.x + sw + en2 : (k + 1.0) * pw0 - slitH(qy, k + 1.0) + sw + en2;
  l = (k < 0.5) ? -300.0 * uS : ln;
  r = (k > uN - 1.5) ? uRes.x + 300.0 * uS : rn;
}

// 垂れ k が上がっている量 0..1（スクロールは中央の垂れから、押されたものは押した垂れから）
float liftOf(float k){
  float mid = (uN - 1.0) * 0.5;
  float dk = abs(k - mid) * 0.10;
  float e = smoothstep(dk, dk + 0.55, uOpen);
  float sel = (abs(uSel.x - k) < 0.5) ? uSel.y : 0.0;
  return max(e, sel);
}

float hemOf(float k, float u, float yb, float sw){
  float hv = (abs(uPt.z - k) < 0.5) ? uPt.w : 0.0;
  float lift = liftOf(k);
  float h = yb + (uLay.y - yb) * (1.0 - 0.925 * lift);
  h -= hv * 15.0 * uS * (1.0 - lift);
  h += (sin(u * TAU * 1.35 + k * 2.1 + uTime * 0.35) * 3.4 + sin(u * TAU * 3.1 + k * 5.0 - uTime * 0.23) * 1.3) * uS * (1.0 - lift * 0.85);
  h -= abs(sw) * 0.10;
  return h;
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

  // ---------- どの垂れか ----------
  float k, l, r, ln, rn, hem, cov;
  float shadowD = 1e5;
  if (y <= yb) {
    k = clamp(floor(x / pw0), 0.0, n - 1.0);
    l = k * pw0; r = l + pw0; ln = l; rn = r; hem = hemY; cov = 1.0;
  } else {
    float qy = clamp((y - yb) / (hemY - yb), 0.0, 1.0);
    float k0 = clamp(floor(x / pw0), 0.0, n - 1.0);
    float fx = x / pw0 - k0;
    float ka = clamp(fx < 0.5 ? k0 - 1.0 : k0, 0.0, n - 1.0);
    float kb = clamp(fx < 0.5 ? k0 : k0 + 1.0, 0.0, n - 1.0);
    float la, ra, lb, rb, lna, rna, lnb, rnb;
    panelEdges(ka, y, qy, la, ra, lna, rna);
    panelEdges(kb, y, qy, lb, rb, lnb, rnb);
    float ua = (x - lna) / (rna - lna), ub = (x - lnb) / (rnb - lnb);
    float ha = hemOf(ka, ua, yb, swing(ka, qy));
    float hb = hemOf(kb, ub, yb, swing(kb, qy));
    float ca = aa(x - la) * aa(ra - x) * aa(ha - y);
    float cb = aa(x - lb) * aa(rb - x) * aa(hb - y);
    float oa = max(max(la - x, x - ra), y - ha);
    float ob = max(max(lb - x, x - rb), y - hb);
    shadowD = min(oa, ob);
    if (ca >= cb) { k = ka; l = la; r = ra; ln = lna; rn = rna; hem = ha; cov = ca; } else { k = kb; l = lb; r = rb; ln = lnb; rn = rnb; hem = hb; cov = cb; }
    cov = max(cov, aa(yb - y));
  }

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
  float foldA = panelPw * 0.115 * amp * (1.0 + 0.5 * uGust);
  float f1p = mix(0.0, hash(vec2(k + 1.0, 2.0)) * TAU, pb);
  float f2p = mix(1.7, hash(vec2(k + 1.0, 3.0)) * TAU + 1.0, pb);
  float f3p = mix(3.4, hash(vec2(k + 1.0, 4.0)) * TAU + 2.0, pb);
  float wob = sin(yq * 3.0 + k * 1.9 + uTime * 0.21);
  float ph1 = TAU * 1.15 * u + f1p + 0.5 * wob;
  float ph2 = TAU * 2.35 * u + f2p + 0.5 * sin(yq * 4.1 + k * 0.7 + uTime * 0.31);
  float ph3 = TAU * 4.3 * u + f3p + 0.5 * sin(yq * 5.3 + k * 2.7 + uTime * 0.17);
  float fh = sin(ph1) + 0.5 * sin(ph2) + 0.22 * sin(ph3);
  float fs = cos(ph1) * TAU * 1.15 + 0.5 * cos(ph2) * TAU * 2.35 + 0.22 * cos(ph3) * TAU * 4.3;
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
  float crA = 12.0 * (0.35 + 0.65 * amp);
  vec2 gc = crA * (d1 * 0.46 + d2 * 0.34 + d3 * 0.13);
  Hn += crA * (r1 * 0.46 + r2 * 0.34 + r3 * 0.13) - crA * 0.5;

  // 乳から広がる縦のしぼり（竿の近く）
  float lpp = (pw0 / s > 150.0) ? 3.0 : 1.0;
  float dgap = pw0 / lpp / s;
  float gt = exp(-(y - rodY) / (86.0 * s));
  float gph = TAU * mC.x / dgap;
  float gxg = -10.0 * gt * sin(gph) * TAU / dgap;
  Hn += 10.0 * gt * cos(gph);

  // 押された窪み
  float hv = (abs(uPt.z - k) < 0.5) ? uPt.w : 0.0;
  vec2 pc = (fc - uPt.xy) / s;
  float bs = 64.0;
  vec2 bq = pc / vec2(bs, bs * 1.35);
  float G = exp(-dot(bq, bq));
  vec2 gb = 26.0 * hv * G * 2.0 * pc / vec2(bs * bs, bs * bs * 1.82);
  Hn -= 26.0 * hv * G;

  // 上がった垂れは、裾が畳まれて横ひだになる
  float vv = clamp((y - yb) / max(hem - yb, 1.0), 0.0, 1.0);
  float plA = lk * (0.30 + 0.70 * vv);
  float plPh = TAU * 3.0 * vv + k * 1.3;
  float plSlope = plA * 0.9 * cos(plPh);
  Hn -= plA * 0.9 * (max(hem - yb, 1.0) / s) / (TAU * 3.0) * sin(plPh);
  float edL = (x - ln) / s, edR = (rn - x) / s;
  float curl = 0.42 * (exp(-max(edL, 0.0) / 20.0) - exp(-max(edR, 0.0) / 20.0)) * smoothstep(0.0, 0.25, yq) * (1.0 - lk);
  vec2 g = vec2(gx + gxg + gc.x + gb.x + curl, gc.y + gb.y + plSlope);
  vec3 N = normalize(vec3(-g.x, -g.y, 1.0));

  // ---------- 糸 ----------
  float p = 2.2;
  float fadeW = smoothstep(2.2, 5.6, p * s);
  vec2 jo = vec2(0.0);
  vec2 mT = mC + (vec2(vn(mC / vec2(7.0, 11.0)), vn(mC / vec2(7.0, 11.0) + 5.0)) - 0.5) * vec2(1.5, 1.7);
  float h0 = weaveH(mT, p);
  float h1 = weaveH(mT + vec2(-0.30, -0.65), p);
  float wb = h0 - h1;
  float wg = 1.0 - h0;
  vec2 th = floor(mC / p);
  float colr = hash(vec2(th.x, 3.7));
  float rowr = hash(vec2(8.1, th.y));
  float lenW = vn(vec2(th.x * 1.7, mC.y / 28.0));
  float lenF = vn(vec2(mC.x / 60.0 + 4.0, th.y * 1.3));
  float slubK = mix(0.38, 1.0, fadeW);
  float slub = ((colr * 0.55 + lenW * 0.45 - 0.5) * 0.55 + (rowr * 0.40 + lenF * 0.60 - 0.5) * 0.20) * slubK;
  float nep = step(0.9988, hash(floor(mC / 1.1) + 3.3));

  // 染めのむら
  float mot = fbm(R2 * (mC / vec2(64.0, 100.0)) + 11.0);
  float streak = vn(vec2(mC.x / 15.0, mC.y / 150.0));
  float dens = 0.82 * mot + 0.18 * streak;
  vec3 alb = mix(uDye, uDyeHi, clamp(0.75 * (1.0 - smoothstep(0.30, 0.70, dens)) + 0.42 * wg * fadeW + 0.18 * (1.0 - yq) * (1.0 - ramp), 0.0, 1.0));

  // 藍のぼかし：竿に近い上のほうは染めが浅く、下へ向かって深くなる（藍染めの暖簾によくある染め方）
  float topK = 1.0 - smoothstep(0.0, 0.55, (y - rodY) / (hemY - rodY));
  alb = mix(alb, uDyeHi * 1.38 + vec3(0.03, 0.04, 0.05), 0.40 * topK * topK);

  // ---------- 染め抜きの字 ----------
  float sq = clamp((hem - yb) / (hemY - yb), 0.07, 1.0);
  float gyc = yb + (hem - yb) * 0.40;
  float narrow = (pw0 / s < 150.0) ? 1.0 : 0.0;
  float Sg = mix(0.90, 0.95, narrow) * pw0 / s;
  float jk = mix(1.0, 0.40, narrow);
  vec2 cl = vec2((u - 0.5) * panelPw, (y - gyc) / (s * sq));
  vec2 qd = (floor(cl / p) + 0.5) * p;
  vec2 clj = mix(cl, qd, 0.30 * jk) + (vec2(vn(mC * 0.55), vn(mC * 0.55 + 7.0)) - 0.5) * 1.6 * jk;
  vec2 auv = vec2((k + 0.5 + clj.x / Sg) / n, 0.5 + clj.y / Sg);
  float inBox = step(abs(clj.x), Sg * 0.5) * step(abs(clj.y), Sg * 0.5);
  float tapR = 2.6 / Sg;
  float mask = texture2D(uAtlas, auv).r;
  float mblur = (texture2D(uAtlas, auv + vec2(tapR / n, 0.0)).r + texture2D(uAtlas, auv - vec2(tapR / n, 0.0)).r + texture2D(uAtlas, auv + vec2(0.0, tapR)).r + texture2D(uAtlas, auv - vec2(0.0, tapR)).r) * 0.25;
  float edgeN = ((vn(mC * 0.8) - 0.5) * 0.20 + (hash(floor(mC / 1.2)) - 0.5) * 0.12) * jk;
  float ink = smoothstep(0.34, 0.70, mask + edgeN) * inBox * (1.0 - 0.92 * smoothstep(0.20, 0.70, lk));
  float fleck = smoothstep(0.80, 0.96, vn(mC / 2.6 + 9.1));
  ink *= (1.0 - 0.26 * fleck) * (0.94 + 0.06 * vn(mC / 7.0 + 3.0));
  float halo = smoothstep(0.03, 0.55, mblur) * (1.0 - ink) * inBox;
  alb = mix(alb, uDyeHi * 1.25, halo * 0.30);

  vec3 inkCol = uInk * (0.94 + 0.10 * (colr - 0.5));
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
  vec3 lightKey = lampF * mix(vec3(1.0, 0.94, 0.84), vec3(1.0, 0.86, 0.66), spot) * (0.48 + 0.78 * uLamp) * (0.84 + 0.46 * spot);
  vec3 diffuse = lightKey * (d1v * tl) + vec3(1.0, 0.78, 0.56) * 0.18 * d2v + vec3(0.66, 0.74, 1.0) * 0.17;
  float hmax = foldA * 1.8 + crA * 0.7 + 2.0;
  float ao = 0.72 + 0.28 * clamp(0.5 + 0.55 * Hn / hmax, 0.0, 1.0);
  float weaveMul = 1.0 + fadeW * (0.21 * wb - 0.10 * wg + 0.03) * (0.75 + 0.5 * colr);
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
  float T = (back * (0.06 + 0.34 * uLamp) + disc * 0.16 * uLamp) * thin * (1.0 + 1.1 * uOpen);
  col += trCol * vec3(1.0, 0.82, 0.58) * T * mix(0.6, 1.25, ink);
  col += inkCol * vec3(1.0, 0.80, 0.55) * back * uLamp * 0.07 * ink;

  // ---------- 縫い・裾・耳 ----------
  float dE = min(x - ln, rn - x) / s;
  float dH = (hem - y) / s;
  float below = smoothstep(0.0, 6.0, (y - yb) / s);
  float dashY = step(0.38, fract(y / (4.2 * s)));
  float sl1 = (1.0 - smoothstep(0.30, 0.85, abs(dE - 6.5))) * dashY * below;
  col *= 1.0 - 0.34 * sl1;
  col *= mix(1.0, 0.93, (1.0 - smoothstep(0.0, 6.5, dE)) * below);
  col += 0.045 * baseCol * exp(-max(dE, 0.0) / 0.9) * below * 6.0;
  col += vec3(1.0, 0.72, 0.42) * 0.10 * uLamp * exp(-max(dE, 0.0) / 2.4) * below * (1.0 - lk);
  float dashX = step(0.38, fract(x / (4.2 * s)));
  float hl1 = (1.0 - smoothstep(0.30, 0.85, abs(dH - 29.0))) * dashX;
  float hl2 = (1.0 - smoothstep(0.30, 0.85, abs(dH - 32.2))) * dashX;
  col *= 1.0 - 0.34 * max(hl1, hl2) * step(0.0, dH);
  col *= mix(1.0, 0.90, (1.0 - smoothstep(26.0, 29.5, dH)) * step(0.0, dH));
  col += 0.05 * baseCol * exp(-max(dH, 0.0) / 1.1) * 6.0;
  col *= 0.86 + 0.14 * smoothstep(0.0, 3.0, dH);
  col += vec3(1.0, 0.70, 0.40) * 0.12 * uLamp * exp(-max(dH, 0.0) / 2.6) * (1.0 - lk) * below;
  // 切れ目の止め縫い
  float si = floor(x / pw0 + 0.5);
  float sx = abs(x - si * pw0) / s;
  float tack = step(sx, 5.0) * step(1.0, si) * step(si, n - 1.0) * step(abs((y - yb) / s - 1.5), 5.5);
  col *= 1.0 - 0.38 * tack * step(0.5, fract(x / (1.7 * s) + 0.25));
  // 竿の影（竿の下の布）
  col *= 1.0 - 0.60 * exp(-max(y - (rodY + rodR), 0.0) / (13.0 * s)) * step(rodY, y);

  // 布の色
  vec3 clothCol = col;
  vec4 c = vec4(clothCol * cov, cov);
  if (y > yb) {
    float sh = 0.62 * exp(-max(shadowD, 0.0) / (10.0 * s)) * (1.0 - cov);
    c = c + vec4(0.0, 0.0, 0.0, sh) * (1.0 - c.a);
  }

  // ---------- 竿と乳 ----------
  float t = (y - rodY) / rodR;
  float dgPx = pw0 / lpp / 1.0 * 1.0;
  float lj = floor(x / dgPx);
  // 乳は 1 つずつ、位置・幅・長さがわずかに違う（手で縫った物）
  float ldx = x - (lj + 0.5) * dgPx - (hash(vec2(lj, 3.1)) - 0.5) * 7.0 * s;
  float lw = (7.9 + 1.5 * hash(vec2(lj, 7.7))) * s;
  float nx = clamp(ldx / lw, -1.0, 1.0);
  float rr = 5.5 * s;
  float lwy = lw - rr + sqrt(max(0.0, rr * rr - pow(max(0.0, loopTop + rr - y), 2.0)));
  float inLoopX = aa(lwy - abs(ldx));
  float loopBot = rodY + rodR + (10.0 + 6.0 * hash(vec2(lj, 11.3))) * s;
  float inLoop = inLoopX * aa(y - loopTop) * aa(loopBot - y);
  // 乳の見え方（筒状の陰影・上へ折り返す所・下の縫い止め）
  float lsh = 0.50 + 0.50 * sqrt(max(0.0, 1.0 - nx * nx));
  float topTurn = smoothstep(loopTop, loopTop + 7.0 * s, y);
  float arch = smoothstep(loopTop + 5.0 * s, loopTop, y);
  vec3 loopCol = clothCol * lsh * (0.78 + 0.42 * topTurn) * 1.08 + vec3(0.05, 0.07, 0.11) * arch * 1.4;
  float stL = (1.0 - smoothstep(0.25, 0.8, abs(abs(ldx) / s - 6.2))) * step(0.45, fract(y / (3.6 * s)));
  loopCol *= 1.0 - 0.30 * stL;
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
  vec3 rodCol = wood * (0.20 + 1.00 * rd * (0.55 + 0.6 * uLamp)) * (0.62 + 0.38 * nr.z) + spec * (0.55 + 0.6 * uLamp);
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

const DYES: Record<DyeKind, { dye: number[]; hi: number[]; ink: number[]; tint: number[] }> = {
  // 藍染め（深い藍）
  ai: { dye: [0.050, 0.094, 0.190], hi: [0.116, 0.200, 0.352], ink: [0.88, 0.85, 0.77], tint: [0.0, 0.03, 0.09] },
  // 柿渋・茶（暗い茶）
  cha: { dye: [0.150, 0.082, 0.050], hi: [0.260, 0.150, 0.095], ink: [0.90, 0.84, 0.72], tint: [0.06, 0.02, 0.0] },
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
    uDye = U("uDye"), uDyeHi = U("uDyeHi"), uInk = U("uInk"), uTint = U("uTint"), uAtlas = U("uAtlas");

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

  return { render, resize, setGlyphs, setDye, destroy };
}
