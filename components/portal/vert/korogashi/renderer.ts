/**
 * 転がし(KOROGASHI)の絵。素の WebGL のフラグメントシェーダー 1 枚で、
 * ストレッチポール 6 本・ゴムの球 3 個・木の指圧棒・青竹踏み・オークの床・白い壁を、距離関数のレイマーチングで描く。
 * 物体の位置・回転は、JS の物理(lib/portal/vert/korogashi/physics.ts)から毎コマ渡される。
 */
import type { Cam } from "@/lib/portal/vert/korogashi/camera";

export const N_OBJ = 11;

export type Frame = {
  time: number;
  cam: Cam & { sy: number };
  /** [z, y, 角度, 半径] × N_OBJ */
  a: Float32Array;
  /** [x, 軸の半分の長さ, ホバー, 予備] × N_OBJ */
  b: Float32Array;
  march: [number, number];
  exposure: number;
  /** 物体全体を囲む箱: [zMin, zMax, yMax](x は ±3.15)。外れた視線・影・遮蔽は、行進を省く */
  box: [number, number, number];
  /** ピントの合う距離(カメラから山まで) */
  focus: number;
};

export type KRenderer = {
  render: (f: Frame) => void;
  resize: (cssW: number, cssH: number, dpr: number) => void;
  setAtlas: (c: HTMLCanvasElement) => void;
  setColors: (cols: [number, number, number][]) => void;
  destroy: () => void;
  lost: () => boolean;
};

const VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCamPos, uCamF, uCamR, uCamU;
uniform vec4 uCam;
uniform vec2 uMarch;
uniform vec3 uBox;
uniform vec4 uA[11];
uniform vec4 uB[11];
uniform vec3 uCol[6];
uniform float uExp;
uniform float uFocus;
uniform sampler2D uAtlas;

const float PI = 3.14159265;
const float HL = 2.8;
const float BW = 1.15;
const float WALLZ = -3.55;
float gId;

float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

vec3 toLocal(vec3 q, float a){ float c = cos(a), s = sin(a); return vec3(q.x, -s * q.z + c * q.y, c * q.z + s * q.y); }
vec3 toWorld(vec3 l, float a){ float c = cos(a), s = sin(a); return vec3(l.x, s * l.z + c * l.y, c * l.z - s * l.y); }

float rc(vec2 d, float c){ return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - c; }

float dPole(vec3 p, vec4 a, vec4 b){
  vec3 q = vec3(p.x - b.x, p.y - a.y, p.z - a.x);
  float rr = length(q.yz);
  float db = max(rr - a.w - 0.03, abs(q.x) - b.y - 0.03);
  if (db > 0.4) return db * 0.95;
  float band = smoothstep(BW + 0.012, BW, abs(q.x));
  float R = a.w + 0.011 * band;
  float c = 0.05;
  return rc(vec2(rr - (R - c), abs(q.x) - (b.y - c)), c);
}
float dStick(vec3 p, vec4 a, vec4 b){
  vec3 q = vec3(p.x - b.x, p.y - a.y, p.z - a.x);
  float rr = length(q.yz);
  float db = max(rr - a.w - 0.03, abs(q.x) - b.y - 0.03);
  if (db > 0.3) return db * 0.95;
  float c = a.w * 0.85;
  float hl = b.y;
  // 片方の先は丸く細く
  float tip = smoothstep(hl - 0.5, hl, q.x) * 0.45;
  return rc(vec2(rr - (a.w - c) + tip * a.w, abs(q.x) - (hl - c)), c);
}
float dBamboo(vec3 p, vec4 a, vec4 b){
  vec3 q = vec3(p.x - b.x, p.y - a.y, p.z - a.x);
  float rr = length(q.yz);
  float db = max(rr - a.w - 0.05, abs(q.x) - b.y - 0.03);
  if (db > 0.3) return db * 0.95;
  float node = exp(-pow((q.x + 0.6) * 11.0, 2.0)) + exp(-pow((q.x - 0.5) * 11.0, 2.0));
  float R = a.w + 0.018 * node;
  float d = rc(vec2(rr - (R - 0.03), abs(q.x) - (b.y - 0.03)), 0.03);
  return max(d, -q.y - 0.0);
}

float map(vec3 p){
  float d = 1e5; float id = -1.0;
  for (int i = 0; i < 6; i++){ float s = dPole(p, uA[i], uB[i]); if (s < d){ d = s; id = float(i); } }
  for (int i = 6; i < 9; i++){ float s = length(p - vec3(uB[i].x, uA[i].y, uA[i].x)) - uA[i].w; if (s < d){ d = s; id = float(i); } }
  { float s = dStick(p, uA[9], uB[9]); if (s < d){ d = s; id = 9.0; } }
  { float s = dBamboo(p, uA[10], uB[10]); if (s < d){ d = s; id = 10.0; } }
  gId = id;
  return d;
}

bool boxHit(vec3 ro, vec3 rd, float pad, out float tn, out float tf){
  vec3 bmin = vec3(-3.15 - pad, -0.1, uBox.x - pad);
  vec3 bmax = vec3(3.15 + pad, uBox.z + pad, uBox.y + pad);
  vec3 inv = 1.0 / (rd + vec3(1e-7));
  vec3 t0 = (bmin - ro) * inv; vec3 t1 = (bmax - ro) * inv;
  vec3 a = min(t0, t1), b = max(t0, t1);
  tn = max(max(a.x, a.y), a.z); tf = min(min(b.x, b.y), b.z);
  return tf > max(tn, 0.0);
}

vec3 calcN(vec3 p, float t){
  float h = 0.0007 * max(t * 0.35, 1.0);
  vec2 e = vec2(1.0, -1.0) * h;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

vec3 LDIR;
// 左の高い窓から入る光: 窓の枠(縦と横の桟)の影が、床と壁にやわらかく落ちる
float winMask(vec3 p){
  float t = (p.x + 9.0) / max(0.05, -LDIR.x);
  if (t < 0.0) return 1.0;
  float hy = p.y + LDIR.y * t;
  float hz = p.z + LDIR.z * t;
  float s = 0.3 + 0.045 * t;
  float inside = smoothstep(2.5 - s, 2.5 + s, hy) * (1.0 - smoothstep(26.0 - s, 26.0 + s, hy)) * smoothstep(-8.0 - s, -8.0 + s, hz) * (1.0 - smoothstep(20.0 - s, 20.0 + s, hz));
  float barH = 1.0 - smoothstep(0.2, 0.2 + s, abs(hy - 5.6));
  float barV = 1.0 - smoothstep(0.22, 0.22 + s, abs(hz - 4.6));
  float m = inside * (1.0 - 0.7 * max(barH, barV));
  return mix(0.5, 1.0, m);
}
float softShadow0(vec3 ro, vec3 rd, float tmax){
  float tn, tf;
  if (!boxHit(ro, rd, 0.45, tn, tf)) return 1.0;
  float res = 1.0; float t = max(0.02, tn - 0.05); float ph = 1e5;
  tmax = min(tmax, tf + 0.1);
  for (int i = 0; i < 30; i++){
    float h = map(ro + rd * t);
    float y = h * h / (2.0 * ph);
    float d = sqrt(max(h * h - y * y, 0.0));
    res = min(res, 9.0 * d / max(0.0001, t - y));
    ph = h;
    t += clamp(h, 0.025, 0.5);
    if (res < 0.003 || t > tmax) break;
  }
  res = clamp(res, 0.0, 1.0);
  return res * res * (3.0 - 2.0 * res);
}
float softShadow(vec3 ro, vec3 rd, float tmax){ return softShadow0(ro, rd, tmax) * winMask(ro); }
float calcAO(vec3 p, vec3 n){
  vec3 bmin = vec3(-3.15, -0.1, uBox.x); vec3 bmax = vec3(3.15, uBox.z, uBox.y);
  if (length(max(max(bmin - p, p - bmax), vec3(0.0))) > 0.75) return 1.0;
  float occ = 0.0; float sca = 1.0;
  for (int i = 0; i < 5; i++){
    float h = 0.015 + 0.13 * float(i);
    float d = map(p + n * h);
    occ += (h - d) * sca; sca *= 0.82;
  }
  return clamp(1.0 - 2.4 * occ, 0.0, 1.0);
}

// 発泡材(EVA)の気泡の高さ。fw: 画素の大きさ(世界)。細かい層は、画素より小さくなったら消す
vec3 rotA(vec3 p){ return vec3(0.80 * p.x + 0.60 * p.y, -0.60 * p.x + 0.80 * p.y, p.z); }
vec3 rotB(vec3 p){ return vec3(p.x, 0.64 * p.y + 0.77 * p.z, -0.77 * p.y + 0.64 * p.z); }
float foamH(vec3 l, float fw){
  float a = n3(rotA(l) * 52.0);
  float wb = smoothstep(1.2, 3.0, 0.0083 / fw);
  float wc = smoothstep(1.2, 3.0, 0.0033 / fw);
  float b = n3(rotB(l) * 120.0 + 7.0);
  float c = n3(rotA(rotB(l)) * 300.0 + 3.0);
  return a * 0.55 + wb * b * 0.3 + wc * c * 0.18;
}
vec3 foamBump(vec3 n, vec3 l, float ang, float amt, float fw){
  float e = max(0.0035, fw * 0.8);
  float h0 = foamH(l, fw);
  vec3 g = vec3(foamH(l + vec3(e, 0, 0), fw) - h0, foamH(l + vec3(0, e, 0), fw) - h0, foamH(l + vec3(0, 0, e), fw) - h0) / e;
  g = toWorld(g, ang);
  g -= n * dot(g, n);
  return normalize(n - g * amt);
}

vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

// 光: 左前の高い窓の光(暖かい)。空の回り込み(白い壁・天井)。床の照り返し(暖かい)
vec3 lighting(vec3 p, vec3 n, vec3 rd, vec3 alb, float spec, float shin, float wrap, float ao, float sh){
  float nl = dot(n, LDIR);
  float dif = clamp((nl + wrap) / (1.0 + wrap), 0.0, 1.0);
  vec3 key = vec3(1.0, 0.91, 0.78) * 2.05 * dif * sh;
  float up = n.y * 0.5 + 0.5;
  vec3 sky = mix(vec3(0.34, 0.28, 0.22), vec3(0.56, 0.62, 0.72), up) * 0.40;
  float wallf = clamp(0.5 + 0.5 * n.z, 0.0, 1.0);
  sky += vec3(0.30, 0.30, 0.30) * wallf * 0.25;
  vec3 col = alb * (key + sky * ao);
  vec3 h = normalize(LDIR - rd);
  float sp = pow(max(dot(n, h), 0.0), shin) * spec * sh * (0.4 + 0.6 * dif);
  col += vec3(1.0, 0.95, 0.88) * sp * 2.0;
  float fr = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
  col += vec3(0.55, 0.6, 0.68) * fr * spec * 0.9 * ao;
  return col;
}

vec3 floorCol(vec3 p, vec3 rd, float t){
  // 床板は奥行き(z)の向きに走る。幅 0.72
  float bw = 0.72;
  float bi = floor(p.x / bw + 0.5);
  float xl = p.x / bw - bi;
  float seg = floor((p.z + bi * 3.7) / 4.6);
  float id = bi * 13.0 + seg * 5.0;
  float tone = h21(vec2(bi, seg));
  vec3 base = mix(vec3(0.60, 0.43, 0.26), vec3(0.70, 0.52, 0.33), tone);
  float fw = t * 0.0011;
  float warp = n3(vec3(xl * 2.5, p.z * 0.25, id));
  float ring = sin((xl + warp * 0.5) * 38.0 + n3(vec3(p.z * 0.5, id, 3.0)) * 6.0) * 0.5 + 0.5;
  float fine = n3(vec3(p.x * 55.0, p.z * 2.4, id * 0.3));
  float fine2 = n3(vec3(p.x * 160.0, p.z * 9.0, id * 0.7));
  vec3 c = base * (0.88 + 0.16 * ring * smoothstep(0.0, 0.01, 0.01 - fw * 0.0) + 0.10 * fine - 0.04);
  c *= 0.93 + 0.10 * fine2;
  // 導管(細い濃い筋)
  c *= 1.0 - 0.10 * smoothstep(0.62, 0.9, n3(vec3(p.x * 90.0, p.z * 3.0, id)));
  // 板のすき間・木口
  float gap = smoothstep(0.495, 0.5, abs(xl));
  float zl = fract((p.z + bi * 3.7) / 4.6);
  float gapZ = smoothstep(0.004, 0.0, min(zl, 1.0 - zl) * 4.6 - 0.002);
  c *= 1.0 - 0.55 * max(gap, gapZ);
  return c;
}

vec3 wallCol(vec3 p){
  vec3 c = vec3(0.80, 0.785, 0.75);
  float n = n3(p * 7.0) * 0.5 + n3(p * 34.0) * 0.5;
  c *= 0.97 + 0.05 * n;
  // 窓の光のむら(左が明るく、右と上へ落ちる)
  c *= 0.62 + 0.52 * smoothstep(7.0, -8.0, p.x + p.y * 0.55) * smoothstep(9.0, 1.0, p.y + 0.0 * p.x) + 0.0;
  // 幅木(白い板)
  float sk = smoothstep(0.52, 0.5, p.y);
  c = mix(c, c * 0.97 + 0.01, sk);
  c *= 1.0 - 0.35 * smoothstep(0.012, 0.0, abs(p.y - 0.5));
  return c;
}

vec3 shadePole(vec3 p, vec3 n, vec3 rd, float id, float t){
  vec4 a, b;
  for (int i = 0; i < 6; i++){ if (float(i) == id){ a = uA[i]; b = uB[i]; } }
  vec3 pc = vec3(0.7);
  for (int i = 0; i < 6; i++){ if (float(i) == id){ pc = uCol[i]; } }
  pc = mix(vec3(dot(pc, vec3(0.3, 0.55, 0.15))), pc, 0.82);
  vec3 q = vec3(p.x - b.x, p.y - a.y, p.z - a.x);
  vec3 lp = toLocal(q, a.z);
  float fw = t * 0.0011;
  float capness = smoothstep(0.55, 0.85, abs(n.x));
  float inBand = step(abs(q.x), BW) * (1.0 - capness);
  vec3 nn = n;
  // 発泡材の肌(帯の上は紙なので弱める)
  float amt = mix(0.022, 0.01, inBand);
  vec3 ln = lp;
  nn = foamBump(n, ln, a.z, amt * 1.0, fw);
  float h = foamH(ln, fw);
  vec3 alb = pc * (0.86 + 0.26 * h);
  // 気泡の黒い点
  float pit = smoothstep(0.62, 0.78, n3(ln * 44.0 + 11.0));
  alb *= 1.0 - 0.10 * pit;
  // 端の断面: 少し明るく、気泡が大きい
  float pores = smoothstep(0.6, 0.72, n3(vec3(lp.y, lp.z, lp.x * 0.0) * 40.0 + 5.0));
  vec3 cutc = mix(pc, vec3(0.88, 0.85, 0.78), 0.28) * (0.96 - 0.08 * pores + 0.05 * n3(vec3(lp.yz * 120.0, 2.0)));
  alb = mix(alb, cutc, capness);
  float spec = 0.07; float shin = 10.0; float wrap = 0.35;
  if (inBand > 0.5){
    float R = a.w;
    float psi = atan(lp.y, lp.z) - PI * 0.5;
    psi = mod(psi + PI, 2.0 * PI) - PI;
    float s = psi * R;
    float u = 0.5 + q.x / (2.0 * BW);
    float v = 0.5 + s / 0.77;
    vec3 paper = vec3(0.74, 0.715, 0.65);
    float fib = n3(vec3(lp.x * 70.0, lp.y * 8.0, lp.z * 8.0));
    paper *= 0.96 + 0.06 * fib;
    if (u > 0.0 && u < 1.0 && v > 0.0 && v < 1.0){
      float col = mod(id, 2.0); float row = floor(id / 2.0);
      vec3 tx = texture2D(uAtlas, vec2((col + u) / 2.0, (row + v) / 3.0)).rgb;
      paper = mix(paper, pc * 0.78, tx.g);
      paper = mix(paper, vec3(0.05, 0.05, 0.055), tx.r);
    }
    // 帯の縁と、紙のつなぎ目の細い影
    // 帯の縁の刷り(ぐるりと一周する細い線)
    float ed = abs(abs(q.x) - (BW - 0.075));
    paper = mix(paper, pc * 0.72, smoothstep(0.016, 0.010, ed) * 0.9);
    paper = mix(paper, pc * 0.72, smoothstep(0.006, 0.003, abs(abs(q.x) - (BW - 0.115))) * 0.8);
    paper *= 1.0 - 0.22 * smoothstep(0.05, 0.0, BW - abs(q.x));
    alb = paper;
    nn = normalize(mix(nn, n, 0.85));
    spec = 0.16; shin = 22.0; wrap = 0.2;
  }
  float ao = calcAO(p, n);
  float sh = softShadow(p + n * 0.012, LDIR, 9.0);
  vec3 col = lighting(p, nn, rd, alb, spec, shin, wrap, ao, sh);
  // ホバー: 紙がほのかに明るく
  col += alb * b.z * 0.18 * inBand;
  return col;
}

vec3 shadeBall(vec3 p, vec3 n, vec3 rd, float id, float t){
  vec4 a, b;
  for (int i = 6; i < 9; i++){ if (float(i) == id){ a = uA[i]; b = uB[i]; } }
  vec3 q = p - vec3(b.x, a.y, a.x);
  vec3 lp = toLocal(q, a.z);
  float fw = t * 0.0011;
  vec3 base = id < 6.5 ? vec3(0.60, 0.33, 0.24) : (id < 7.5 ? vec3(0.50, 0.57, 0.46) : vec3(0.66, 0.58, 0.42));
  float e = 0.004;
  float h0 = n3(lp * 70.0) * 0.6 + n3(lp * 160.0) * 0.4 * smoothstep(1.2, 3.0, 0.0062 / fw);
  float hx = n3((lp + vec3(e,0,0)) * 70.0) * 0.6 + n3((lp + vec3(e,0,0)) * 160.0) * 0.4 * smoothstep(1.2, 3.0, 0.0062 / fw);
  float hy = n3((lp + vec3(0,e,0)) * 70.0) * 0.6 + n3((lp + vec3(0,e,0)) * 160.0) * 0.4 * smoothstep(1.2, 3.0, 0.0062 / fw);
  float hz = n3((lp + vec3(0,0,e)) * 70.0) * 0.6 + n3((lp + vec3(0,0,e)) * 160.0) * 0.4 * smoothstep(1.2, 3.0, 0.0062 / fw);
  vec3 g = toWorld(vec3(hx - h0, hy - h0, hz - h0) / e, a.z);
  g -= n * dot(g, n);
  vec3 nn = normalize(n - g * 0.05);
  vec3 alb = base * (0.84 + 0.30 * h0);
  // 成形の継ぎ目(球を一周する細い溝)
  vec3 ul = normalize(lp);
  float seam = smoothstep(0.03, 0.0, abs(dot(ul, normalize(vec3(0.35, 0.55, 0.76)))));
  alb *= 1.0 - 0.45 * seam;
  float ao = calcAO(p, n);
  float sh = softShadow(p + n * 0.01, LDIR, 9.0);
  return lighting(p, nn, rd, alb, 0.05, 8.0, 0.4, ao, sh) + alb * b.z * 0.1;
}

vec3 shadeStick(vec3 p, vec3 n, vec3 rd, float t){
  vec4 a = uA[9]; vec4 b = uB[9];
  vec3 q = vec3(p.x - b.x, p.y - a.y, p.z - a.x);
  vec3 lp = toLocal(q, a.z);
  // 木目: 軸に沿った細い筋と、年輪のにじみ
  float g1 = n3(vec3(lp.x * 2.5, lp.y * 90.0, lp.z * 90.0));
  float g2 = n3(vec3(lp.x * 14.0, lp.y * 170.0, lp.z * 170.0));
  float ring = sin(atan(lp.y, lp.z) * 5.0 + n3(vec3(lp.x * 1.5, 3.0, 3.0)) * 6.0) * 0.5 + 0.5;
  vec3 alb = mix(vec3(0.60, 0.42, 0.23), vec3(0.38, 0.24, 0.12), smoothstep(0.25, 0.75, g1 * 0.6 + ring * 0.4)) * (0.85 + 0.3 * g2);
  // 焼き印の輪と、先の木口
  alb *= 1.0 - 0.5 * smoothstep(0.016, 0.0, abs(q.x - 0.3) - 0.01);
  alb *= 1.0 - 0.5 * smoothstep(0.016, 0.0, abs(q.x - 0.36) - 0.004);
  float tip = smoothstep(b.y - 0.1, b.y, q.x);
  alb = mix(alb, vec3(0.62, 0.45, 0.28), tip * 0.7);
  float ao = calcAO(p, n);
  float sh = softShadow(p + n * 0.01, LDIR, 9.0);
  return lighting(p, n, rd, alb, 0.2, 24.0, 0.25, ao, sh);
}

vec3 shadeBamboo(vec3 p, vec3 n, vec3 rd, float t){
  vec4 a = uA[10]; vec4 b = uB[10];
  vec3 q = vec3(p.x - b.x, p.y - a.y, p.z - a.x);
  // 繊維: 軸(x)に沿って長く伸びた細い筋、太いむら、節
  float f1 = n3(vec3(q.x * 0.8, q.y * 150.0, q.z * 150.0));
  float f2 = n3(vec3(q.x * 3.2, q.y * 64.0, q.z * 64.0));
  float f3 = n3(vec3(q.x * 0.3, q.y * 14.0, q.z * 14.0));
  vec3 green = vec3(0.13, 0.20, 0.05);
  vec3 straw = vec3(0.36, 0.34, 0.12);
  vec3 alb = mix(green, straw, smoothstep(0.32, 0.78, f3));
  alb *= 0.74 + 0.5 * f1;
  alb *= 1.0 - 0.28 * smoothstep(0.66, 0.9, f2);
  float nodeD = min(abs(q.x + 0.6), abs(q.x - 0.5));
  alb = mix(alb, vec3(0.46, 0.42, 0.17), smoothstep(0.075, 0.0, nodeD) * 0.65);
  alb *= 1.0 - 0.5 * smoothstep(0.02, 0.0, abs(nodeD - 0.085));
  // 乾いて入った縦の割れ
  float ang = atan(q.y, q.z);
  float crack = smoothstep(0.016, 0.0, abs(ang - 0.95 - 0.12 * sin(q.x * 3.0))) * smoothstep(0.35, 0.6, f2);
  alb *= 1.0 - 0.6 * crack;
  // 切り口(髄と繊維の淡い色)
  float cap = smoothstep(0.55, 0.85, abs(n.x));
  vec3 cut = vec3(0.58, 0.50, 0.30) * (0.78 + 0.34 * n3(vec3(q.y * 100.0, q.z * 100.0, 1.0)));
  alb = mix(alb, cut, cap);
  float ao = calcAO(p, n);
  float sh = softShadow(p + n * 0.01, LDIR, 9.0);
  return lighting(p, n, rd, alb * 0.9, 0.11, 13.0, 0.3, ao, sh);
}

void main(){
  LDIR = normalize(vec3(-0.58, 0.78, 0.42));
  vec2 uv = gl_FragCoord.xy / uRes;
  float nx = uv.x * 2.0 - 1.0 - uCam.z;
  float ny = uv.y * 2.0 - 1.0 - uCam.w;
  vec3 rd = normalize(uCamF + nx * uCam.y * uCam.x * uCamR + ny * uCam.x * uCamU);
  vec3 ro = uCamPos;
  float tF = rd.y < -1e-4 ? -ro.y / rd.y : 1e5;
  float tW = rd.z < -1e-4 ? (WALLZ - ro.z) / rd.z : 1e5;
  float tE = min(tF, tW);
  float tn, tf;
  float hit = 0.0;
  float id = -1.0;
  float t = 0.0;
  if (boxHit(ro, rd, 0.1, tn, tf)){
    t = max(tn - 0.02, uMarch.x);
    float tEnd = min(min(tf + 0.05, tE), uMarch.y);
    for (int i = 0; i < 90; i++){
      vec3 p = ro + rd * t;
      float d = map(p);
      if (d < 0.0005 * t){ hit = 1.0; id = gId; break; }
      t += d * 0.92;
      if (t > tEnd) break;
    }
  }
  vec3 col;
  float depthT = tE;
  if (hit > 0.5 && t < tE){
    depthT = t;
    vec3 p = ro + rd * t;
    vec3 n = calcN(p, t);
    if (id < 5.5) col = shadePole(p, n, rd, id, t);
    else if (id < 8.5) col = shadeBall(p, n, rd, id, t);
    else if (id < 9.5) col = shadeStick(p, n, rd, t);
    else col = shadeBamboo(p, n, rd, t);
  } else {
    vec3 p = ro + rd * tE;
    if (tE > 5e4){
      col = vec3(0.86, 0.86, 0.84);
    } else if (tF < tW){
      vec3 n = vec3(0, 1, 0);
      vec3 alb = floorCol(p, rd, tE);
      float ao = calcAO(p + n * 0.001, n);
      float sh = softShadow(p + n * 0.01, LDIR, 9.0);
      col = lighting(p, n, rd, alb, 0.16, 20.0, 0.15, ao, sh);
      // 床の艶: 壁と窓のぼんやりした映り込み
      vec3 rr = reflect(rd, n);
      float gl = smoothstep(0.1, 0.9, rr.z * -0.5 + 0.5) * 0.10;
      col += vec3(0.9, 0.88, 0.82) * gl * pow(1.0 - max(dot(-rd, n), 0.0), 3.0) * ao;
    } else {
      vec3 n = vec3(0, 0, 1);
      vec3 alb = wallCol(p);
      float ao = calcAO(p + n * 0.001, n);
      float sh = softShadow(p + n * 0.01, LDIR, 9.0);
      col = lighting(p, n, rd, alb, 0.0, 8.0, 0.25, ao, sh);
    }
  }
  col *= uExp;
  col = aces(col * 0.82);
  col = pow(col, vec3(1.0 / 2.2));
  // 周辺をわずかに落とす + 粒子(帯のにじみ防止)
  vec2 vq = uv - 0.5;
  col *= 1.0 - 0.42 * dot(vq, vq) * 1.6;
  col += (h21(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  float da = tE > 5e4 && hit < 0.5 ? 1.0 : clamp(0.5 + (depthT - uFocus) / 16.0, 0.0, 1.0);
  gl_FragColor = vec4(col, da);
}
`;

// 被写界深度: 手前の床・玉はぼけ、奥の壁はわずかにぼける。ピントは山
const FS2 = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uBlur;
float cocOf(float a){ float d = (a - 0.5) * 2.0; return d < 0.0 ? -d : d * 0.5; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec4 c0 = texture2D(uTex, uv);
  float rad = max(0.0, cocOf(c0.a) - 0.04) * uBlur;
  if (rad < 0.7){ gl_FragColor = vec4(c0.rgb, 1.0); return; }
  vec3 sum = c0.rgb; float wsum = 1.0;
  for (int i = 0; i < 24; i++){
    float r = sqrt((float(i) + 0.5) / 24.0) * rad;
    float th = float(i) * 2.39996;
    vec2 o = vec2(cos(th), sin(th)) * r;
    vec4 c = texture2D(uTex, uv + o / uRes);
    float coc2 = cocOf(c.a) * uBlur;
    float w = 1.0;
    if (c.a < c0.a - 0.02 && coc2 < r * 0.8) w = 0.0;
    sum += c.rgb * w; wsum += w;
  }
  gl_FragColor = vec4(sum / wsum, 1.0);
}
`;

export function createRenderer(canvas: HTMLCanvasElement): KRenderer | null {
  const gl = (canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false }) ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("korogashi shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const mkProg = (fsSrc: string) => {
    const vs = sh(gl.VERTEX_SHADER, VS);
    const fs = sh(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const pr = gl.createProgram()!;
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.bindAttribLocation(pr, 0, "aPos");
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      console.warn("korogashi link:", gl.getProgramInfoLog(pr));
      return null;
    }
    return pr;
  };
  const prog = mkProg(FS);
  if (!prog) return null;
  const prog2 = mkProg(FS2);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    res: U("uRes"),
    time: U("uTime"),
    camPos: U("uCamPos"),
    camF: U("uCamF"),
    camR: U("uCamR"),
    camU: U("uCamU"),
    cam: U("uCam"),
    march: U("uMarch"),
    box: U("uBox"),
    a: U("uA[0]"),
    b: U("uB[0]"),
    col: U("uCol[0]"),
    exp: U("uExp"),
    focus: U("uFocus"),
    atlas: U("uAtlas"),
  };
  const u2 = prog2
    ? { tex: gl.getUniformLocation(prog2, "uTex"), res: gl.getUniformLocation(prog2, "uRes"), blur: gl.getUniformLocation(prog2, "uBlur") }
    : null;
  const tex = gl.createTexture();
  // 被写界深度の 1 パス目の描き先
  const fboTex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  let dof = !!prog2 && new URLSearchParams(location.search).get("dof") !== "0";
  let lostFlag = false;
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lostFlag = true;
  });
  let W = 1;
  let H = 1;
  return {
    lost: () => lostFlag || gl.isContextLost(),
    resize(cssW, cssH, dpr) {
      W = Math.max(2, Math.round(cssW * dpr));
      H = Math.max(2, Math.round(cssH * dpr));
      canvas.width = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
      if (dof) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) dof = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE0);
      }
    },
    setAtlas(c) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    },
    setColors(cols) {
      const arr = new Float32Array(18);
      cols.forEach((c, i) => {
        arr[i * 3] = c[0];
        arr[i * 3 + 1] = c[1];
        arr[i * 3 + 2] = c[2];
      });
      gl.useProgram(prog);
      gl.uniform3fv(u.col, arr);
    },
    render(f) {
      gl.useProgram(prog);
      if (dof) gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, W, H);
      gl.uniform2f(u.res, W, H);
      gl.uniform1f(u.time, f.time % 100);
      gl.uniform3fv(u.camPos, f.cam.pos);
      gl.uniform3fv(u.camF, f.cam.f);
      gl.uniform3fv(u.camR, f.cam.r);
      gl.uniform3fv(u.camU, f.cam.u);
      gl.uniform4f(u.cam, f.cam.tan, f.cam.aspect, f.cam.sx, f.cam.sy);
      gl.uniform2f(u.march, f.march[0], f.march[1]);
      gl.uniform3f(u.box, f.box[0], f.box[1], f.box[2]);
      gl.uniform4fv(u.a, f.a);
      gl.uniform4fv(u.b, f.b);
      gl.uniform1f(u.exp, f.exposure);
      gl.uniform1f(u.focus, f.focus);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(u.atlas, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (dof && prog2 && u2) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(prog2);
        gl.viewport(0, 0, W, H);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.uniform1i(u2.tex, 1);
        gl.uniform2f(u2.res, W, H);
        gl.uniform1f(u2.blur, Math.max(3, H * 0.0105));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.activeTexture(gl.TEXTURE0);
      }
    },
    destroy() {
      // 開発時の StrictMode は同じ canvas で 2 度つくり直す。コンテキストを手放すと 2 度目が使えないので、何もしない(canvas ごと破棄される)
    },
  };
}
