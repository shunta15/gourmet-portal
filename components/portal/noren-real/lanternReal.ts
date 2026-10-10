/**
 * 赤提灯（リアル版）を素の WebGL で描く。1 枚のフルスクリーン・フラグメントシェーダーで、左右 2 つの提灯を描く。
 * 背景は透明（alpha 0）。写真と布の間に置く canvas として使い、灯りのにじみは加算（alpha 0 のまま色だけ足す）で重ねる。
 *
 * - 胴: 楕円体のふくらみ（回転体）の法線で陰影。横に走る竹ひご（筋の所で紙が少しへこむ）、和紙の繊維のむら。
 * - 中の灯り: 中心が明るく（クリーム〜橙）、縁へ向かって赤が深くなる。上下の口の近くは暗い。強さは uLamp（本番の --lamp）。
 * - 上下の黒い輪（重化）・吊り紐・小さな房。墨の字（灯・酒）は胴のふくらみに沿って曲がる（円周上の長さで貼る）。
 * - 揺れは、紐の上の一点を支点にした、ごくゆっくりした振り子（左右で周期をずらす）。
 */

export type LanternLayout = {
  cssW: number;
  cssH: number;
  dpr: number;
  /** 提灯ごとの中心 x・上端 y（css px）・大きさ F（css px。1em） */
  lans: { cx: number; top: number; F: number }[];
  /** 紐の支点 y（css px） */
  pivotY: number;
};

export type LanternReal = {
  /** idxA・idxB: 字のアトラスでの番号。swing: 1 で揺れる（0 は静止。CSS 側で揺らすとき）。cord: 0 で紐を描かない。lans[1].F が 0 なら 2 つ目は描かない */
  render: (s: { time: number; lamp: number; idxA?: number; idxB?: number; swing?: number; cord?: number }) => void;
  resize: (l: LanternLayout) => void;
  setGlyphs: (chars: string[], family: string) => void;
  destroy: () => void;
};

const VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uS, uTime, uLamp, uPivot, uCells, uIdxA, uIdxB, uSwing, uCord;
uniform vec4 uA, uB; // cx, top, F, phase
uniform sampler2D uAtlas;

const float PI = 3.14159265;
const float TAU = 6.2831853;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float rbox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
vec4 over(vec4 top, vec4 bot){ return top + bot * (1.0 - top.a); }

vec3 ramp(float E){
  vec3 deep = vec3(0.26, 0.025, 0.018);
  vec3 red = vec3(0.80, 0.115, 0.05);
  vec3 orange = vec3(1.0, 0.43, 0.13);
  vec3 core = vec3(1.0, 0.80, 0.50);
  vec3 c = mix(deep, red, smoothstep(0.0, 0.46, E));
  c = mix(c, orange, smoothstep(0.38, 0.82, E));
  c = mix(c, core, 0.85 * smoothstep(0.80, 1.35, E));
  return c;
}

vec4 lantern(vec2 fc, vec4 L, float idx, float period){
  float s = uS;
  float F = L.z;
  vec2 p = fc / s;
  if (L.z <= 0.0) return vec4(0.0);
  float th = uSwing * 0.0155 * sin(uTime * TAU / period + L.w);
  vec2 P = vec2(L.x, uPivot);
  vec2 d = p - P;
  float cs = cos(th), sn = sin(th);
  vec2 q = vec2(cs * d.x + sn * d.y, -sn * d.x + cs * d.y);
  float lx = q.x / F;
  float ly = (q.y + P.y - L.y) / F;
  if (abs(lx) > 9.0 || ly > 13.0) return vec4(0.0);
  float aaE = 1.15 / F;
  vec3 Lout = normalize(vec3(-0.35, -0.55, 0.75));
  float day = 1.0 - uLamp;

  // ---------- 灯りのにじみ（加算）----------
  vec2 gq = vec2(lx / 3.3, (ly - 3.2) / 3.7);
  float gd = dot(gq, gq);
  float halo = exp(-gd * 1.7) * (0.015 + 0.36 * uLamp * uLamp) + exp(-gd * 0.42) * 0.07 * uLamp * uLamp;
  vec3 haloCol = vec3(1.0, 0.47, 0.18) * halo;

  vec4 res = vec4(0.0);

  // ---------- 吊り紐 ----------
  float hw = 0.62 / F;
  float cordA = clamp(0.5 - (abs(lx) - hw) / aaE, 0.0, 1.0) * step(ly, -0.2) * uCord;
  float twist = 0.82 + 0.18 * sin(ly * F * 1.1 + lx * F * 4.0);
  vec3 cordCol = vec3(0.50, 0.38, 0.28) * (0.34 + 0.40 * uLamp) * twist;
  cordCol += vec3(1.0, 0.5, 0.2) * 0.10 * uLamp * exp(-max(-ly, 0.0) * 0.5);
  res = over(vec4(cordCol * cordA * 0.95, cordA * 0.95), res);

  // ---------- 房（下の小さな飾り）----------
  {
    float sway = 0.07 * (ly - 6.9) * sin(uTime * 0.7 + L.w * 1.7);
    float tx = lx - sway;
    float hwT = 0.09 + 0.17 * smoothstep(6.8, 8.1, ly);
    float strand = 0.5 + 0.5 * sin(tx * F * 2.4 + hash(vec2(floor(tx * 9.0), 1.0)) * 6.0);
    float tA = clamp(0.5 - (abs(tx) - hwT) / aaE, 0.0, 1.0) * step(6.85, ly) * (1.0 - smoothstep(7.7, 8.15, ly + 0.25 * (1.0 - strand)));
    float knot = clamp(0.5 - (length(vec2(tx, ly - 6.74)) - 0.19) / aaE, 0.0, 1.0);
    float glow = uLamp * exp(-(ly - 6.55) * 0.9);
    vec3 tc = vec3(0.30, 0.035, 0.025) * (0.55 + 0.45 * strand) * (0.45 + 0.9 * uLamp) + vec3(1.0, 0.45, 0.15) * 0.14 * glow;
    float a = max(tA, knot);
    res = over(vec4(tc * a, a), res);
  }

  // ---------- 胴 ----------
  {
    float v = (ly - 3.2) / 2.9;
    float av = abs(v);
    float vq = max(1.0 - v * v, 0.02);
    float prof = pow(vq, 0.55);
    float w = 1.5 + 1.0 * prof;
    float dw = clamp(1.0 * 0.55 * pow(vq, -0.45) * (-2.0 * v) / 2.9, -3.0, 3.0);
    float sphi = clamp(lx / w, -1.0, 1.0);
    float cphi = sqrt(max(1.0 - sphi * sphi, 0.0));
    float phi = asin(sphi);
    float arc = phi * w;
    float bodyA = clamp(0.5 - (abs(lx) - w) / aaE, 0.0, 1.0) * (1.0 - smoothstep(0.96, 1.0, av));

    if (bodyA > 0.0) {
      // 竹ひご（15 本。上から見上げた形で、中ほどがわずかに上がる弧）
      float yr = (ly + 0.12 * cphi - 0.3) / 5.8 * 15.0;
      float fr = fract(yr);
      float dI = min(fr, 1.0 - fr) * (5.8 / 15.0); // em
      float lineW = max(0.04, 0.8 / F);
      float rib = 1.0 - smoothstep(lineW * 0.45, lineW * 1.5, dI);
      float ribSoft = 1.0 - smoothstep(0.0, 0.17, dI);
      // 筋の所で紙がわずかにへこむ（ふくらみ＝筋と筋のあいだ）
      float nyR = -0.20 * sin(TAU * yr);
      vec3 n = normalize(vec3(sphi, -dw + nyR, cphi));

      // 紙の繊維・むら（表面の長さに貼る）
      vec2 sp = vec2(arc, ly) * F;
      float mot = vn(sp / vec2(26.0, 20.0) + idx * 7.0) * 0.6 + vn(sp / vec2(9.0, 7.0) + 3.0) * 0.4;
      float f1 = smoothstep(0.66, 0.92, vn(vec2(sp.x * 0.52 + sp.y * 0.18, sp.y * 0.07) + 11.0));
      float f2 = smoothstep(0.66, 0.92, vn(vec2(sp.x * 0.10 - sp.y * 0.46, sp.x * 0.05) + 4.0));
      float fib = max(f1, f2 * 0.8);
      float grain = hash(floor(sp * 1.3)) - 0.5;

      // 中の灯り
      float rad = sphi * sphi * 0.9 + v * v * 0.55;
      float core = exp(-rad * 2.6);
      float edgeF = pow(cphi, 0.7);
      float mouth = 1.0 - 0.60 * pow(av, 2.6);
      float I = (0.25 + 0.95 * core) * (0.45 + 0.55 * edgeF) * mouth;
      float Lm = 0.30 + 0.95 * uLamp;
      float E = I * Lm * (0.90 + 0.22 * mot) * (1.0 + 0.10 * fib) * (1.0 + 0.04 * grain);
      E *= 1.0 - 0.20 * ribSoft;
      vec3 col = ramp(E);

      // 外からの光（昼ほど効く。紙の赤を明るく見せる）
      float ext = max(dot(n, Lout), 0.0);
      col += vec3(0.62, 0.09, 0.04) * ext * (0.10 + 0.30 * day) * (0.8 + 0.4 * mot);
      // 竹ひごの影・筋
      col *= 1.0 - 0.40 * rib;
      col *= 1.0 - 0.10 * (1.0 - smoothstep(0.0, 0.05, dI)) * 0.0;
      // 縁は紙が重なって見えて少し暗く
      col *= 0.78 + 0.22 * smoothstep(0.0, 0.22, cphi);

      // 墨の字（胴のふくらみに沿って曲がる）
      float Sg = 3.3;
      vec2 gp = vec2(arc / Sg, (ly - 3.2 + 0.05) / Sg);
      vec2 auv = vec2((idx + 0.5 + gp.x) / uCells, 0.5 + gp.y);
      float inBox = step(abs(gp.x), 0.5) * step(abs(gp.y), 0.5);
      float tap = 0.012;
      float mask = texture2D(uAtlas, auv).r;
      float mb = (texture2D(uAtlas, auv + vec2(tap * 0.5, 0.0)).r + texture2D(uAtlas, auv - vec2(tap * 0.5, 0.0)).r + texture2D(uAtlas, auv + vec2(0.0, tap)).r + texture2D(uAtlas, auv - vec2(0.0, tap)).r) * 0.25;
      mask = mix(mask, mb, 0.5);
      float edgeN = (vn(sp * 0.7) - 0.5) * 0.12 + grain * 0.06;
      float ink = smoothstep(0.38, 0.58, mask + edgeN) * inBox;
      ink *= 0.90 + 0.10 * vn(sp / 3.0 + 5.0);
      vec3 inkCol = vec3(0.040, 0.010, 0.007) + col * 0.10;
      col = mix(col, inkCol, ink * 0.95);
      // 墨の縁に、かすかに灯りがにじむ
      col += vec3(1.0, 0.4, 0.12) * 0.05 * smoothstep(0.1, 0.4, mb) * (1.0 - ink) * uLamp * inBox;

      res = over(vec4(col * bodyA, bodyA), res);
    }
  }

  // ---------- 上下の輪（重化）----------
  {
    // 上
    vec2 pc = vec2(lx, ly - 0.2);
    float dC = rbox(pc, vec2(1.5, 0.35), 0.15);
    float dL = rbox(vec2(lx, ly + 0.30), vec2(0.46, 0.15), 0.09);
    float capA = clamp(0.5 - dC / aaE, 0.0, 1.0);
    float lipA = clamp(0.5 - dL / aaE, 0.0, 1.0);
    float sc = clamp(lx / 1.5, -1.0, 1.0);
    float cc = sqrt(max(1.0 - sc * sc, 0.0));
    vec3 lac = vec3(0.034, 0.027, 0.025);
    float spec = pow(max(1.0 - abs(sc + 0.42) * 3.2, 0.0), 2.0) * 0.30 + pow(max(1.0 - abs(sc - 0.55) * 6.0, 0.0), 2.0) * 0.06;
    float band = smoothstep(0.10, -0.12, abs(ly - 0.00) - 0.05) * 0.10;
    float groove = (1.0 - smoothstep(0.0, 0.05, abs(ly - 0.41))) * 0.6;
    vec3 cc3 = lac * (0.8 + 0.8 * cc) + vec3(0.9, 0.82, 0.7) * (spec * (0.35 + 0.65 * day) + band * cc) * cc;
    cc3 += vec3(1.0, 0.40, 0.12) * smoothstep(0.56, 0.44, ly) * (0.05 + 0.20 * uLamp) * (0.5 + 0.5 * cc);
    cc3 *= 1.0 - groove;
    res = over(vec4(cc3 * capA, capA), res);
    vec3 lc = vec3(0.07, 0.06, 0.055) * (0.6 + 0.8 * cc) + vec3(0.8, 0.7, 0.55) * 0.12 * pow(max(1.0 - abs(lx / 0.46 + 0.35) * 2.0, 0.0), 2.0);
    res = over(vec4(lc * lipA, lipA), res);

    // 下
    vec2 pb = vec2(lx, ly - 6.2);
    float dB = rbox(pb, vec2(1.5, 0.35), 0.15);
    float botA = clamp(0.5 - dB / aaE, 0.0, 1.0);
    vec3 bc = lac * (0.8 + 0.8 * cc) + vec3(0.9, 0.82, 0.7) * (spec * (0.35 + 0.65 * day)) * cc * 0.8;
    bc += vec3(1.0, 0.42, 0.14) * smoothstep(5.95, 6.28, ly) * (0.0 + 0.0) ;
    bc += vec3(1.0, 0.40, 0.12) * smoothstep(6.0, 5.88, ly) * (0.05 + 0.20 * uLamp) * (0.5 + 0.5 * cc);
    bc *= 1.0 - (1.0 - smoothstep(0.0, 0.05, abs(ly - 6.0))) * 0.6;
    res = over(vec4(bc * botA, botA), res);
  }

  // にじみ（アルファ 0 のまま加算）
  res.rgb += haloCol * (1.0 - res.a);
  return res;
}

void main(){
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec4 a = lantern(fc, uA, uIdxA, 7.0);
  vec4 b = lantern(fc, uB, uIdxB, 8.6);
  vec4 c = a + b * (1.0 - a.a);
  c.rgb += (hash(fc * 0.37 + uTime * 0.0) - 0.5) / 255.0 * step(0.001, c.a + c.r + c.g + c.b);
  gl_FragColor = clamp(c, 0.0, 1.0);
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

export function createLanternReal(canvas: HTMLCanvasElement): LanternReal | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) as WebGLRenderingContext | null;
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
    console.warn("[noren-real] lantern WebGL init failed", err);
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
  const uCells = U("uCells"), uIdxA = U("uIdxA"), uIdxB = U("uIdxB"), uSwing = U("uSwing"), uCord = U("uCord");
  const uRes = U("uRes"), uS = U("uS"), uTime = U("uTime"), uLamp = U("uLamp"), uPivot = U("uPivot"), uA = U("uA"), uB = U("uB"), uAtlas = U("uAtlas");

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.uniform1i(uAtlas, 0);
  gl.clearColor(0, 0, 0, 0);

  let layout: LanternLayout | null = null;
  let cells = 2;

  const setGlyphs = (chars: string[], family: string) => {
    const cell = 512;
    const n = chars.length;
    cells = n;
    const c = document.createElement("canvas");
    c.width = cell * n;
    c.height = cell;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.font = `${Math.round(cell * 0.80)}px ${family}`;
    for (let i = 0; i < n; i++) g.fillText(chars[i], i * cell + cell / 2, cell * 0.53);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  };

  const resize = (l: LanternLayout) => {
    layout = l;
    const w = Math.round(l.cssW * l.dpr), h = Math.round(l.cssH * l.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  };

  const render = (s: { time: number; lamp: number; idxA?: number; idxB?: number; swing?: number; cord?: number }) => {
    if (!layout) return;
    const l = layout;
    const d = l.dpr;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uS, d);
    gl.uniform1f(uTime, s.time);
    gl.uniform1f(uLamp, s.lamp);
    gl.uniform1f(uPivot, l.pivotY);
    gl.uniform1f(uCells, cells);
    gl.uniform1f(uIdxA, s.idxA ?? 0);
    gl.uniform1f(uIdxB, s.idxB ?? 1);
    gl.uniform1f(uSwing, s.swing ?? 1);
    gl.uniform1f(uCord, s.cord ?? 1);
    const a = l.lans[0], b = l.lans[1] ?? { cx: 0, top: 0, F: 0 };
    gl.uniform4f(uA, a.cx, a.top, a.F, 0.0);
    gl.uniform4f(uB, b.cx, b.top, b.F, 2.1);
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

  return { render, resize, setGlyphs, destroy };
}
