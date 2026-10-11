/**
 * 暖簾の布（リアル版の見た目）を素の WebGL で描く。店ページの屋号の暖簾・特集記事の巻頭の暖簾用。
 * 本番の cloth.ts（components/portal/noren/cloth.ts）と同じ口（Cloth 型）で、形・動き・位置・字の割り方・タイミングは本番と同じ。
 * 変えているのは布の見た目だけ：平織りの糸の太さのむら、ひだの陰影、折り皺、藍染めのむら、染め抜きの字のにじみ、
 * 木の竿、色の整え（選んだ色は lib/portal/noren/realTop.ts の NOREN_REAL_DYE）。入口（clothReal.ts）と同じ染め・同じ光。
 * 本番の暖簾のコードはこのファイルから import しない（型だけ）。cloth.ts は変えていない。
 */
import type { Cloth, ClothLayout, ClothState } from "../noren/cloth";
import { DYES, type DyeKind } from "./clothReal";
import { BRIGHT_MUL, NOREN_REAL_BRIGHT } from "@/lib/portal/noren/realTop";

/** 入口の布（clothReal.ts）と同じく、明るさの倍率を渡せる。既定は realTop.ts の NOREN_REAL_BRIGHT（店ページ・特集記事はここから届く） */
export type ClothInner = Cloth & { setBright: (m: number) => void };

/** 朱の印の色（染めの色ごと）。深い色の上でも読めるよう、臙脂・柿渋・墨では少し明るい朱にする */
const SEAL: Record<DyeKind, number[]> = {
  ai: [0.784, 0.212, 0.114],
  kon: [0.800, 0.225, 0.120],
  sumi: [0.820, 0.235, 0.125],
  kakishibu: [0.900, 0.300, 0.140],
  enji: [0.960, 0.360, 0.170],
};

const VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uOpen, uGust, uLamp, uMouse, uN, uScale;
uniform float uPw, uScroll, uSel, uSelAmt, uHover, uHoverAmt, uIntro;
uniform float uBright; // 明るさの倍率(1 = 今まで通り。lib/portal/noren/realTop.ts の NOREN_REAL_BRIGHT)
uniform vec4 uLayout; // margin, gap, rodY, hemY (device px)
uniform vec3 uDye, uDyeHi, uInk, uTint, uGrade, uSeal;
uniform sampler2D uAtlas;

const float PI = 3.14159265;
const float TAU = 6.2831853;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float noise(vec2 p){ return vn(p); }
vec3 vnd(vec2 x){
  vec2 i = floor(x), f = fract(x);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  float k = a - b - c + d;
  return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y, du * (vec2(b - a, c - a) + k * u.yx));
}
float fbm3(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s / 0.875; }
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

const vec3 SHU = vec3(0.784, 0.212, 0.114);

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float s = uScale;
  float W = uRes.x;
  float margin = uLayout.x, gap = uLayout.y, rodY = uLayout.z, hemY = uLayout.w;
  float H = hemY - rodY;
  float n = uN;
  float pw = uPw > 0.0 ? uPw : (W - 2.0 * margin - (n - 1.0) * gap) / n;
  float mid = (n - 1.0) * 0.5;
  vec4 col = vec4(0.0);

  vec2 sp = frag / uRes;
  float glowR = length((sp - vec2(0.5, 0.60)) * vec2(1.0, uRes.y / uRes.x * 1.25));
  float back = exp(-glowR * glowR * 6.5);
  vec3 lightCol = mix(vec3(1.0, 0.82, 0.58), SHU, 0.5);

  for (int k = 0; k < 16; k++) {
    if (float(k) >= n) break;
    float idx = (mod(float(k), 2.0) < 0.5) ? floor(float(k) * 0.5) : (n - 1.0 - floor(float(k) * 0.5));
    float ci = idx - mid;
    float ac = abs(ci);
    bool center = ac < 0.01;
    float sgn = ci < 0.0 ? -1.0 : 1.0;

    float q = clamp((frag.y - rodY) / H, 0.0, 1.0);

    // 開き方：中央に近い布から順に。下側が先に動く（手で押し分けるように）
    float d = ac * 0.075;
    float e = smoothstep(d, d + 0.60, uOpen);
    float ey = clamp(e + 0.20 * sin(e * 3.14159) * q, 0.0, 1.0);

    float x0 = margin + idx * (pw + gap) - uScroll;
    float wg = pw * 0.34;
    float rk = mid - ac; // 外側ほど小さい
    float stepG = wg * 0.72;
    float xtl, xtr;
    if (center) {
      float wc = pw * 0.46;
      xtl = x0 + (pw - wc) * 0.5; xtr = xtl + wc;
    } else if (sgn < 0.0) {
      xtl = -pw * 0.16 + rk * stepG; xtr = xtl + wg;
    } else {
      xtr = W + pw * 0.16 - rk * stepG; xtl = xtr - wg;
    }
    float xl = mix(x0, xtl, ey);
    float xr = mix(x0 + pw, xtr, ey);

    // 風：上（竿）は動かず、裾ほど大きく揺れる
    float ph = uTime * 0.82 + idx * 1.73;
    float amp = (7.5 + 48.0 * uGust) * s;
    float wv = sin(ph + q * 1.7) * 0.62 + sin(ph * 1.93 + idx * 3.1 + q * 2.6) * 0.38;
    float dx = (amp * wv + uMouse * 14.0 * s) * pow(q, 1.55);
    float bil = amp * 0.32 * sin(ph * 1.31 + q * 4.2 + idx) * q;
    xl += dx - bil * 0.5;
    xr += dx + bil * 0.5;

    // 布から遠く離れた所は、この布の計算を飛ばす（枚数が多くても重くしない。影は 60px 先ではほぼ消える）
    float dOut0 = max(xl - frag.x, frag.x - xr);
    if (dOut0 > 60.0 * s) continue;

    // 中央の布は、手で持ち上げるように裾が上がる
    float hem = hemY - H * 0.055 * e;
    if (center) hem = rodY + H * (1.0 - 0.94 * smoothstep(0.0, 0.72, uOpen));
    // 押された布は裾が竿へ上がる。触れている布は少し持ち上がる。掛かる動きは上から順に垂れ下がる
    float isSel = step(abs(idx - uSel), 0.5) * step(0.001, uSelAmt);
    hem = mix(hem, rodY + H * (1.0 - 0.9 * uSelAmt), isSel);
    float isHov = step(abs(idx - uHover), 0.5);
    hem -= H * 0.05 * uHoverAmt * isHov;
    float di = clamp(uIntro * (1.0 + uN * 0.11) - idx * 0.11, 0.0, 1.0);
    di = di * di * (3.0 - 2.0 * di);
    hem = rodY + (hem - rodY) * max(di, 0.001);

    float wpx = xr - xl;
    float u = (frag.x - xl) / wpx;
    float v = (frag.y - rodY) / (hem - rodY);

    float dl = frag.x - xl + (noise(vec2(frag.y / (9.0 * s), idx * 5.0)) - 0.5) * 1.6 * s;
    float dr = xr - frag.x + (noise(vec2(frag.y / (9.0 * s), idx * 5.0 + 9.0)) - 0.5) * 1.6 * s;
    float hemN = hem + (noise(vec2(u * wpx / (5.0 * s), idx * 3.0)) - 0.5) * 3.2 * s;

    // 手前の布が奥の布に落とす影
    float dOut = max(xl - frag.x, frag.x - xr);
    if (dOut > 0.0 && frag.y > rodY && frag.y < hemN) {
      col.rgb *= 1.0 - 0.55 * exp(-dOut / (13.0 * s)) * col.a;
    }

    float edge = min(dl, dr);
    float cov = clamp(edge / (1.4 * s), 0.0, 1.0) * clamp((hemN - frag.y) / (1.4 * s), 0.0, 1.0) * step(rodY - 1.0, frag.y);
    if (cov <= 0.0) continue;

    // ================= リアル版の布の見た目（形・動き・位置は上の本番のまま） =================
    float wpxs = wpx / s;
    float hps = max((hem - rodY) / s, 1.0);
    vec2 mC = vec2(idx * 173.0 + u * wpxs, v * hps);
    float vr = smoothstep(0.0, 0.40, v);
    float ampF = 0.30 + 0.70 * vr;

    // ひだ（位相・数は本番と同じ）
    float Fq = mix(2.0, 5.4, ey);
    float amF = mix(0.40, 1.0, ey);
    float phase = u * Fq + v * 0.32 * sin(idx * 1.9 + 1.0 + uTime * 0.35) + (noise(vec2(v * 2.2, idx * 7.0)) - 0.5) * 0.55 + wv * 0.05;
    float sl = (cos(phase * 6.2831 + idx * 1.3) + 0.55 * cos(phase * 13.7 + idx * 4.0)) * amF;
    float hh = (sin(phase * 6.2831 + idx * 1.3) + 0.22 * sin(phase * 13.7 + idx * 4.0)) * amF;
    float ce = center ? smoothstep(0.0, 0.72, uOpen) : 0.0;
    ce = max(ce, isSel * uSelAmt);
    hh += sin(v * 22.0 + 1.3) * 0.5 * ce;
    float slY = cos(v * 22.0) * 0.6 * ce;

    // 折り皺（尾根ノイズ）
    mat2 R1 = mat2(0.8776, 0.4794, -0.4794, 0.8776);
    mat2 R2 = mat2(0.6216, -0.7833, 0.7833, 0.6216);
    vec2 wr = vec2(vn(mC / vec2(41.0, 63.0) + 1.3), vn(mC / vec2(41.0, 63.0) + 7.7)) - 0.5;
    vec2 mW = mC + wr * vec2(26.0, 40.0);
    vec3 c1 = vnd(R1 * (mW / vec2(52.0, 84.0)) + vec2(3.1, 1.7));
    vec3 c2 = vnd(R2 * (mW / vec2(21.0, 34.0)) + vec2(8.3, 4.2));
    float a1 = 2.0 * c1.x - 1.0, a2 = 2.0 * c2.x - 1.0;
    float q1 = sqrt(a1 * a1 + 0.035), q2 = sqrt(a2 * a2 + 0.035);
    float r1 = 1.0 - q1, r2 = 1.0 - q2;
    vec2 d1 = -(a1 / q1) * 2.0 * (c1.yz * R1) / vec2(52.0, 84.0);
    vec2 d2 = -(a2 / q2) * 2.0 * (c2.yz * R2) / vec2(21.0, 34.0);
    float crA = 3.4 * (0.35 + 0.65 * ampF);
    vec2 gc = crA * (d1 * 0.46 + d2 * 0.34);
    float Hn = crA * (r1 * 0.46 + r2 * 0.34) - crA * 0.4 + 0.9 * hh;
    // 竿の近くの縦のしぼり（乳から広がる）
    float lpp = max(1.0, floor(wpxs / 70.0));
    float dgap = wpxs / lpp;
    float gt = exp(-(v * hps) / 46.0);
    float gph = 6.2831 * (u * wpxs) / dgap;
    float gxg = -5.0 * gt * sin(gph) * 6.2831 / dgap;
    Hn += 5.0 * gt * cos(gph);
    vec2 gN = vec2(0.80 * sl * (0.40 + 0.60 * ampF) + gc.x + gxg, gc.y + 0.5 * slY);
    vec3 N = normalize(vec3(-gN, 1.0));

    // 糸
    float pitch = 1.8;
    float fadeW = smoothstep(2.0, 5.0, pitch * s);
    vec2 mT = mC + (vec2(vn(mC / vec2(7.0, 11.0)), vn(mC / vec2(7.0, 11.0) + 5.0)) - 0.5) * vec2(2.4, 2.8);
    float h0 = weaveH(mT, pitch);
    float h1 = weaveH(mT + vec2(-0.30, -0.65), pitch);
    float wb = h0 - h1;
    float wgv = 1.0 - h0;
    vec2 th = floor(mC / pitch);
    float colr = hash(vec2(th.x, 3.7));
    float rowr = hash(vec2(8.1, th.y));
    float lenW = vn(vec2(th.x * 1.7, mC.y / 28.0));
    float lenF = vn(vec2(mC.x / 60.0 + 4.0, th.y * 1.3));
    float slubK = mix(0.38, 1.0, fadeW);
    float slub = ((colr * 0.55 + lenW * 0.45 - 0.5) * 0.42 + (rowr * 0.40 + lenF * 0.60 - 0.5) * 0.18) * slubK;
    float nep = step(0.9988, hash(floor(mC / 1.1) + 3.3));

    // 染めのむら・上が浅い染め
    float mot = fbm3(R2 * (mC / vec2(64.0, 100.0)) + 11.0);
    float streak = vn(vec2(mC.x / 15.0, mC.y / 150.0));
    float dens = 0.84 * mot + 0.16 * streak;
    vec3 alb = mix(uDye, uDyeHi, clamp(0.55 * (1.0 - smoothstep(0.30, 0.70, dens)) + 0.42 * wgv * fadeW + 0.18 * (1.0 - v) * (1.0 - vr), 0.0, 1.0));
    float topK = 1.0 - smoothstep(0.0, 0.55, v);
    alb = mix(alb, uDyeHi * 1.18 + vec3(0.03, 0.035, 0.04), 0.46 * topK * topK);

    // 染め抜きの字と印（アトラス：R=字, G=印）
    vec2 au = vec2((idx + clamp(u + sl * 0.004, 0.0, 1.0)) / n, clamp(v, 0.0, 1.0));
    vec2 tap = vec2(1.2 / wpxs / n, 1.2 / hps);
    vec4 tx = texture2D(uAtlas, au);
    float mR = (texture2D(uAtlas, au + vec2(tap.x, 0.0)).r + texture2D(uAtlas, au - vec2(tap.x, 0.0)).r + texture2D(uAtlas, au + vec2(0.0, tap.y)).r + texture2D(uAtlas, au - vec2(0.0, tap.y)).r) * 0.25;
    float mask = mix(tx.r, mR, 0.5);
    float rough = (fbm3(mC * 0.22) - 0.5) * 0.30 + (hash(floor(mC / 1.6)) - 0.5) * 0.10;
    float ink = smoothstep(0.42, 0.60, mask + rough);
    float seal = smoothstep(0.42, 0.60, tx.g + rough * 0.6);
    if (center) { float cf = 1.0 - smoothstep(0.05, 0.42, uOpen); ink *= cf; seal *= cf; }
    float halo = smoothstep(0.03, 0.55, mR) * (1.0 - ink);
    alb = mix(alb, uDyeHi * 1.25, halo * 0.30);
    vec3 inkCol = uInk * 0.93 * (0.95 + 0.10 * (colr - 0.5));
    float bleed = (1.0 - smoothstep(0.62, 0.98, mask)) * ink;
    inkCol = mix(inkCol, alb * 2.6 + 0.07, bleed * 0.55);
    vec3 baseCol = mix(alb, inkCol, ink);
    baseCol = mix(baseCol, uSeal * (0.92 + 0.08 * colr), seal * 0.95);
    baseCol *= 1.0 + slub * 0.55;
    baseCol += nep * 0.05;
    baseCol *= 1.0 + 0.2 * uHoverAmt * isHov;

    // 光
    vec3 L1 = normalize(vec3(-0.52, -0.46, 0.72));
    vec3 L2 = normalize(vec3(0.62, 0.22, 0.75));
    float d1v = max(dot(N, L1), 0.0) / L1.z;
    float d2v = max(dot(N, L2), 0.0) / L2.z;
    float tl = mix(1.30, 0.72, smoothstep(0.0, 1.0, v));
    vec2 lp = vec2(frag.x / W - 0.5, v - 0.10);
    float spot = exp(-dot(lp * vec2(1.25, 1.0), lp * vec2(1.25, 1.0)) * 4.2);
    float lampF = 1.0 + 0.035 * sin(uTime * 1.9) * sin(uTime * 0.47 + 1.3);
    vec3 lightKey = lampF * mix(vec3(1.0, 0.955, 0.89), vec3(1.0, 0.88, 0.70), spot) * (0.50 + 0.78 * uLamp) * (0.90 + 0.26 * spot);
    vec3 diffuse = lightKey * (d1v * tl) + vec3(1.0, 0.78, 0.56) * 0.18 * d2v + vec3(0.66, 0.74, 1.0) * 0.17;
    float ao = 0.74 + 0.26 * clamp(0.5 + 0.30 * Hn / (crA * 0.7 + 3.0), 0.0, 1.0);
    float weaveMul = 1.0 + fadeW * (0.12 * wb - 0.06 * wgv + 0.02) * (0.6 + 0.8 * colr);
    float vig = 1.0 - 0.22 * smoothstep(0.30, 1.0, abs(frag.x / W - 0.5) * 2.0);
    vec3 pc = baseCol * diffuse * ao * weaveMul * vig;
    // 染め抜きの字は、昼(灯りが弱い時刻)でも、端の垂れやひだの陰でも暗く沈まないよう、字の所だけ明るさの下限を持たせる(2026-10-11 オーナー指示「暖簾の中の字が暗い。全部明るく」)
    vec3 inkLit = uInk * (0.95 + 0.10 * (colr - 0.5)) * (0.84 + 0.16 * ao) * weaveMul * (0.95 + 0.05 * uLamp);
    pc = mix(pc, max(pc, inkLit), ink * 0.92);
    pc += baseCol * vec3(1.0, 0.8, 0.6) * pow(1.0 - N.z, 2.0) * 0.5;

    // 裏からの灯り（糸の隙間・薄い所から透ける）
    float thin = (0.35 + 0.65 * wgv * fadeW + 0.65 * (1.0 - fadeW) * 0.5) * (1.0 - 0.7 * slub);
    vec3 trCol = mix(alb * vec3(2.2, 1.9, 1.6) + uTint, inkCol * 0.95, ink);
    float Tt = back * (0.03 + 0.20 * uLamp) * thin * (1.0 + 0.9 * uOpen);
    pc += trCol * vec3(1.0, 0.82, 0.58) * Tt * mix(0.6, 1.25, ink);
    // 隙間・裾ににじむ光（本番と同じ）
    float rimD = edge / s;
    pc += lightCol * exp(-rimD / 5.5) * (0.08 + 0.28 * uLamp) * (0.5 + 0.5 * q);
    float hemD = (hemN - frag.y) / s;
    pc += lightCol * exp(-hemD / 7.0) * (0.05 + 0.18 * uLamp);
    // 明るさの段階(uBright)：布の色に掛ける。夜は元から明るいので上げ幅を 1/3 ほどに抑える。字(ink)は 1.1 倍まで（入口の布と同じ）
    float bE = mix(uBright, 1.0 + (uBright - 1.0) * 0.35, smoothstep(0.18, 1.0, uLamp));
    pc *= mix(bE, min(bE, 1.1), ink);
    // 色の整え
    float gl0 = dot(pc, vec3(0.30, 0.59, 0.11));
    pc = mix(vec3(gl0), pc, uGrade.x);
    pc *= mix(vec3(1.0), vec3(1.07, 1.0, 0.89), uGrade.y * smoothstep(0.10, 0.45, gl0) * (0.35 + 0.65 * spot));
    pc = pow(max(pc, vec3(0.0)), vec3(uGrade.z));
    // 縫い（裾の二重縫い・耳のかがり）と、竿の影
    float dashX = step(0.38, fract(frag.x / (4.2 * s)));
    float dashY = step(0.38, fract(frag.y / (4.2 * s)));
    float hl1 = (1.0 - smoothstep(0.30, 0.85, abs(hemD - 13.0))) * dashX;
    float hl2 = (1.0 - smoothstep(0.30, 0.85, abs(hemD - 16.2))) * dashX;
    pc *= 1.0 - 0.32 * max(hl1, hl2) * step(0.0, hemD);
    pc *= mix(1.0, 0.91, (1.0 - smoothstep(10.0, 14.0, hemD)) * step(0.0, hemD));
    float sl1 = (1.0 - smoothstep(0.30, 0.85, abs(rimD - 5.0))) * dashY;
    pc *= 1.0 - 0.28 * sl1;
    pc *= mix(1.0, 0.93, 1.0 - smoothstep(0.0, 5.0, rimD));
    pc *= 1.0 - 0.55 * exp(-max((frag.y - rodY) / s, 0.0) / 12.0);

    vec4 c = vec4(pc * cov, cov);
    col = c + col * (1.0 - c.a);
  }

  // 竿（木の丸棒。位置・太さは本番と同じ）
  float ry = rodY - 3.0 * s;
  float rt = (frag.y - ry) / (7.0 * s);
  if (abs(rt) < 1.0) {
    vec3 nr = vec3(0.0, rt, sqrt(max(0.0, 1.0 - rt * rt)));
    vec3 LR = normalize(vec3(-0.15, -0.62, 0.77));
    float rd = max(dot(nr, LR), 0.0) / LR.z;
    float gr = vn(vec2(frag.x / (80.0 * s), frag.y / (1.5 * s))) * 0.6 + vn(vec2(frag.x / (17.0 * s), frag.y / (0.8 * s))) * 0.4;
    vec3 wood = mix(vec3(0.070, 0.048, 0.034), vec3(0.235, 0.168, 0.112), gr);
    float nodeD = abs(fract(frag.x / (410.0 * s) + 0.31) - 0.5) * 410.0;
    wood *= 1.0 - 0.45 * smoothstep(2.6, 0.0, nodeD);
    vec3 spc = vec3(1.0, 0.92, 0.80) * pow(max(dot(reflect(-LR, nr), vec3(0.0, 0.0, 1.0)), 0.0), 20.0) * 0.12;
    vec3 rodCol = wood * (0.09 + 1.30 * pow(rd, 1.25) * (0.55 + 0.6 * uLamp)) * (0.50 + 0.50 * nr.z) * (1.0 - 0.42 * smoothstep(0.15, 1.0, rt)) + spc * (0.55 + 0.6 * uLamp);
    rodCol *= mix(uBright, 1.0 + (uBright - 1.0) * 0.35, smoothstep(0.18, 1.0, uLamp));
    float aaR = clamp((1.0 - abs(rt)) * 7.0 / 1.4, 0.0, 1.0);
    col = vec4(rodCol * aaR, aaR) + col * (1.0 - aaR);
  }

  gl_FragColor = col;
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

/** 縦書きの 1 字ぶん（回して描く字は、縦書きでは横向きになる長音・波ダッシュなどと、欧文・数字の語） */
type VTok = { t: string; rot: boolean; em: number };

function vTokens(g: CanvasRenderingContext2D, text: string): VTok[] {
  const out: VTok[] = [];
  const re = /[A-Za-z0-9&'.]+|[\s\S]/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const t = m[0];
    if (/^[\s・･·\-–—_/／|｜,，.。、!！?？♪★☆&＆「」『』"“”'’（）()]$/.test(t)) continue;
    if (/^[A-Za-z0-9&'.]+$/.test(t)) out.push({ t, rot: true, em: Math.max(0.6, t.length * 0.56) });
    else if (/^[ー〜～―]$/.test(t)) out.push({ t, rot: true, em: 1 });
    else out.push({ t, rot: false, em: 1 });
  }
  void g;
  return out;
}

/**
 * 区画 (x, y, w, h) に、縦書きで店名を入れる。列数（1〜4）ごとに「字数を列へ均等に割った」並びを作り、
 * 区画に収まる最大の字の大きさになる列数を選ぶ。右の列から左へ。
 */
function drawVertical(g: CanvasRenderingContext2D, text: string, family: string, x: number, y: number, w: number, h: number, maxSize: number) {
  const toks = vTokens(g, text);
  if (toks.length === 0) return;
  const GAP = 1.06; // 字送り（字の大きさの倍率）
  const COLW = 1.3; // 列の幅（字の大きさの倍率）
  const total = toks.reduce((a, t) => a + t.em, 0);
  const longest = Math.max(...toks.map((t) => t.em));
  let best: { size: number; columns: VTok[][] } | null = null;
  for (let cols = 1; cols <= 4; cols++) {
    const cap = Math.max(Math.ceil(total / cols - 1e-9), longest);
    const columns: VTok[][] = [[]];
    let used = 0;
    for (const t of toks) {
      if (used + t.em > cap + 1e-9 && columns[columns.length - 1].length > 0) {
        columns.push([]);
        used = 0;
      }
      columns[columns.length - 1].push(t);
      used += t.em;
    }
    const maxCol = Math.max(...columns.map((c) => c.reduce((a, t) => a + t.em, 0)));
    const size = Math.min(maxSize, h / (maxCol * GAP), w / (columns.length * COLW));
    if (!best || size > best.size + 0.5) best = { size, columns };
  }
  const { size: raw, columns } = best!;
  const size = Math.max(12, raw);
  g.fillStyle = "#f00";
  g.font = `${Math.round(size)}px ${family}`;
  const colW = size * COLW;
  const totalW = columns.length * colW;
  const right = x + w / 2 + totalW / 2;
  columns.forEach((col, ci) => {
    const cx = right - colW * (ci + 0.5);
    let cy = y;
    for (const t of col) {
      const len = t.em * size * GAP;
      if (t.rot) {
        g.save();
        g.translate(cx, cy + len / 2);
        g.rotate(Math.PI / 2);
        let sz = size * (/^[A-Za-z0-9&'.]+$/.test(t.t) ? 0.92 : 1);
        g.font = `${Math.round(sz)}px ${family}`;
        const mw = g.measureText(t.t).width;
        if (mw > len * 1.05) {
          sz = (sz * len * 1.05) / mw;
          g.font = `${Math.round(sz)}px ${family}`;
        }
        g.fillText(t.t, 0, 0);
        g.restore();
        g.font = `${Math.round(size)}px ${family}`;
      } else {
        g.fillText(t.t, cx, cy + len / 2);
      }
      cy += len;
    }
  });
}

const NUM: Record<string, string> = { 麺: "一", 鮨: "二", 肉: "三", 酒: "四", 蕎: "五" };

export function createClothInner(canvas: HTMLCanvasElement, dyeKey: DyeKind = "ai"): ClothInner | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" }) as WebGLRenderingContext | null;
  if (!gl) return null;
  let prog: WebGLProgram;
  try {
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link: " + gl.getProgramInfoLog(p));
    prog = p;
  } catch (err) {
    console.warn("[noren-real] inner cloth WebGL init failed", err);
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
  const uRes = U("uRes"), uTime = U("uTime"), uOpen = U("uOpen"), uGust = U("uGust"), uLamp = U("uLamp"), uBright = U("uBright"),
    uMouse = U("uMouse"), uN = U("uN"), uScale = U("uScale"), uLayout = U("uLayout"), uAtlas = U("uAtlas"),
    uPw = U("uPw"), uScroll = U("uScroll"), uSel = U("uSel"), uSelAmt = U("uSelAmt"), uHover = U("uHover"), uHoverAmt = U("uHoverAmt"), uIntro = U("uIntro"),
    uDye = U("uDye"), uDyeHi = U("uDyeHi"), uInk = U("uInk"), uTint = U("uTint"), uGrade = U("uGrade"), uSeal = U("uSeal");

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
  let layout: ClothLayout | null = null;
  const dye = DYES[dyeKey] ?? DYES.ai;
  const seal = SEAL[dyeKey] ?? SEAL.ai;
  let bright = BRIGHT_MUL[NOREN_REAL_BRIGHT];
  const setBright = (m: number) => {
    bright = Math.min(4, Math.max(0.3, m));
  };

  const setChars = (chars: string[], family: string, aspect = 3) => {
    n = chars.length;
    // 布1枚の縦横比に合わせたアトラスを作る（字が縦に伸びないように）
    const cw = 384, ch = Math.round(cw * Math.min(6.2, Math.max(1.6, aspect)));
    const c = document.createElement("canvas");
    c.width = cw * n;
    c.height = ch;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const cx = i * cw + cw / 2;
      g.fillStyle = "#f00";
      g.font = `${Math.round(cw * 0.70)}px ${family}`;
      g.fillText(chars[i], cx, ch * 0.36);
      // 印（朱）：円の中に「輪」を白抜き
      g.fillStyle = "#0f0";
      g.beginPath();
      g.arc(cx, ch * 0.815, cw * 0.125, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#000";
      g.font = `${Math.round(cw * 0.17)}px ${family}`;
      g.fillText("輪", cx, ch * 0.818);
      g.fillStyle = "#f00";
      g.font = `${Math.round(cw * 0.15)}px ${family}`;
      g.fillText(NUM[chars[i]] ?? "", cx, ch * 0.63);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  };

  const setPanels = (panels: string[][], family: string, aspect = 3) => {
    n = Math.max(1, Math.min(5, panels.length));
    const cw = 384, ch = Math.round(cw * Math.min(6.2, Math.max(1.6, aspect)));
    const c = document.createElement("canvas");
    c.width = cw * n;
    c.height = ch;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    const zoneTop = ch * 0.085, zoneBot = ch * 0.665;
    for (let i = 0; i < n; i++) {
      const cx = i * cw + cw / 2;
      const toks = panels[i] ?? [];
      const cell = (zoneBot - zoneTop) / Math.max(1, toks.length);
      toks.forEach((t, j) => {
        const cy = zoneTop + cell * (j + 0.5);
        let sz = Math.min(cw * 0.7, cell * 0.86);
        g.font = `${Math.round(sz)}px ${family}`;
        const w = g.measureText(t).width;
        if (w > cw * 0.82) sz = (sz * cw * 0.82) / w;
        g.fillStyle = "#f00";
        g.font = `${Math.round(sz)}px ${family}`;
        g.fillText(t, cx, cy);
      });
      g.fillStyle = "#0f0";
      g.beginPath();
      g.arc(cx, ch * 0.815, cw * 0.125, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#000";
      g.font = `${Math.round(cw * 0.17)}px ${family}`;
      g.fillText("輪", cx, ch * 0.818);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  };

  const setNames = (items: { num: string; name: string }[], family: string, aspect = 3) => {
    n = Math.max(1, Math.min(16, items.length));
    const cw = Math.max(128, Math.min(384, Math.floor(4096 / n)));
    const ch = Math.round(cw * Math.min(6.2, Math.max(1.4, aspect)));
    const c = document.createElement("canvas");
    c.width = cw * n;
    c.height = ch;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const cx = i * cw + cw / 2;
      const it = items[i];
      // 漢数字（上）。2 字以上（十一など）は縦に重ねる
      const nums = Array.from(it.num);
      const nzH = ch * 0.105;
      const nsz = Math.min(cw * 0.3, (nzH / nums.length) * 0.95);
      g.fillStyle = "#f00";
      g.font = `${Math.round(nsz)}px ${family}`;
      nums.forEach((t, j) => g.fillText(t, cx, ch * 0.062 + (nzH / nums.length) * (j + 0.5)));
      // 店名（縦書き）
      drawVertical(g, it.name, family, i * cw + cw * 0.07, ch * 0.185, cw * 0.86, ch * 0.57, cw * 0.4);
      // 印（朱）：円の中に「輪」を白抜き
      const rr = Math.min(cw * 0.125, ch * 0.06);
      g.fillStyle = "#0f0";
      g.beginPath();
      g.arc(cx, ch * 0.865, rr, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#000";
      g.font = `${Math.round(rr * 1.36)}px ${family}`;
      g.fillText("輪", cx, ch * 0.868);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  };

  const resize = (l: ClothLayout) => {
    layout = l;
    const w = Math.round(l.cssW * l.dpr), h = Math.round(l.cssH * l.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  };

  const render = (s: ClothState) => {
    if (!layout) return;
    const l = layout;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, s.time);
    gl.uniform1f(uOpen, s.open);
    gl.uniform1f(uGust, s.gust);
    gl.uniform1f(uLamp, s.lamp);
    gl.uniform1f(uBright, bright);
    gl.uniform1f(uMouse, s.mouse);
    gl.uniform1f(uN, n);
    gl.uniform1f(uScale, l.dpr);
    gl.uniform4f(uLayout, (l.margin ?? 0) * l.dpr, l.gap * l.dpr, l.rodY * l.dpr, l.hemY * l.dpr);
    gl.uniform1f(uPw, (l.panelW ?? 0) * l.dpr);
    gl.uniform1f(uScroll, (s.scroll ?? 0) * l.dpr);
    gl.uniform1f(uSel, s.sel ?? -1);
    gl.uniform1f(uSelAmt, s.selAmt ?? 0);
    gl.uniform1f(uHover, s.hover ?? -1);
    gl.uniform1f(uHoverAmt, s.hoverAmt ?? 0);
    gl.uniform1f(uIntro, s.intro ?? 1);
    gl.uniform3fv(uDye, dye.dye);
    gl.uniform3fv(uDyeHi, dye.hi);
    gl.uniform3fv(uInk, dye.ink);
    gl.uniform3fv(uTint, dye.tint);
    gl.uniform3fv(uGrade, dye.grade);
    gl.uniform3fv(uSeal, seal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const destroy = () => {
    gl.deleteTexture(tex);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    // ページを移るたびに WebGL のコンテキストが溜まらないよう、布の canvas が画面から外れたら手放す
    // （開発時の二重実行では canvas が残るので、そのときは手放さない）
    setTimeout(() => {
      if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
    }, 0);
  };

  return { render, resize, setChars, setPanels, setNames, setBright, destroy };
}

