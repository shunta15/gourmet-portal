/**
 * 暖簾の布を素の WebGL で描く。
 * 1枚のフルスクリーン・フラグメントシェーダーが、垂れ下がる N 枚の布（織り目・ひだ・風・裏からの灯り）を描く。
 * 布と布の隙間・開いた後の空間は alpha 0 で、後ろの DOM（店の写真と灯り）がそのまま見える。
 */

export type ClothState = {
  time: number; // 秒
  open: number; // 0..1 暖簾が開く量
  gust: number; // 0..1 風の強さ
  mouse: number; // -1..1
  lamp: number; // 0..1 灯りの強さ
};

export type ClothLayout = {
  cssW: number;
  cssH: number;
  dpr: number;
  rodY: number; // css px
  hemY: number; // css px
  gap: number; // css px
  /** 左右の余白（css px）。布をこの内側の「戸口」にだけ掛ける。省略は 0（画面いっぱい） */
  margin?: number;
};

export type Cloth = {
  render: (s: ClothState) => void;
  resize: (l: ClothLayout) => void;
  setChars: (chars: string[], family: string, aspect?: number) => void;
  /** 店の屋号用。布1枚ごとに 1〜2 個の字（欧文の語は横組み）を縦に並べる。番号は付けない */
  setPanels: (panels: string[][], family: string, aspect?: number) => void;
  destroy: () => void;
};

const VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uOpen, uGust, uLamp, uMouse, uN, uScale;
uniform vec4 uLayout; // margin, gap, rodY, hemY (device px)
uniform sampler2D uAtlas;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }

const vec3 SHU = vec3(0.784, 0.212, 0.114);
const vec3 KINARI = vec3(0.937, 0.902, 0.839);

void main(){
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float s = uScale;
  float W = uRes.x;
  float margin = uLayout.x, gap = uLayout.y, rodY = uLayout.z, hemY = uLayout.w;
  float H = hemY - rodY;
  float n = uN;
  float pw = (W - 2.0 * margin - (n - 1.0) * gap) / n;
  float mid = (n - 1.0) * 0.5;
  vec4 col = vec4(0.0);

  vec2 sp = frag / uRes;
  float glowR = length((sp - vec2(0.5, 0.60)) * vec2(1.0, uRes.y / uRes.x * 1.25));
  float back = exp(-glowR * glowR * 6.5);
  vec3 lightCol = mix(vec3(1.0, 0.82, 0.58), SHU, 0.5);

  for (int k = 0; k < 5; k++) {
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

    float x0 = margin + idx * (pw + gap);
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
    float amp = (5.0 + 44.0 * uGust) * s;
    float wv = sin(ph + q * 1.7) * 0.62 + sin(ph * 1.93 + idx * 3.1 + q * 2.6) * 0.38;
    float dx = (amp * wv + uMouse * 14.0 * s) * pow(q, 1.55);
    float bil = amp * 0.32 * sin(ph * 1.31 + q * 4.2 + idx) * q;
    xl += dx - bil * 0.5;
    xr += dx + bil * 0.5;

    // 中央の布は、手で持ち上げるように裾が上がる
    float hem = hemY - H * 0.055 * e;
    if (center) hem = rodY + H * (1.0 - 0.94 * smoothstep(0.0, 0.72, uOpen));

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

    // ひだ：開くほど深く、細かく
    float F = mix(2.0, 5.4, ey);
    float amF = mix(0.40, 1.0, ey);
    float phase = u * F + v * 0.32 * sin(idx * 1.9 + 1.0 + uTime * 0.35) + (noise(vec2(v * 2.2, idx * 7.0)) - 0.5) * 0.55 + wv * 0.05;
    float hh = (sin(phase * 6.2831 + idx * 1.3) + 0.22 * sin(phase * 13.7 + idx * 4.0)) * amF;
    float sl = (cos(phase * 6.2831 + idx * 1.3) + 0.55 * cos(phase * 13.7 + idx * 4.0)) * amF;

    // 中央の布は横ひだ（持ち上がって畳まれる）
    float hf = 0.0;
    if (center) {
      float ce = smoothstep(0.0, 0.72, uOpen);
      hf = sin(v * 22.0 + 1.3) * 0.5 * ce;
      hh += hf; sl += cos(v * 22.0) * 0.6 * ce;
    }

    float sway = 0.07 * sin(uTime * 1.25 + v * 3.0 + u * 2.0 + idx) * (0.35 + uGust);
    float L = clamp(0.30 + 0.30 * sl + 0.20 * hh + sway, 0.0, 1.0);
    L *= 0.62 + 0.38 * smoothstep(0.0, 0.10, v);

    // 織り目と節（スラブ）
    float cx = u * wpx / s;
    float cy = v * (hem - rodY) / s;
    float pitch = 2.5;
    float tw = sin(cx / pitch * 6.2831) * 0.5 + 0.5;
    float tf = sin(cy / pitch * 6.2831 + tw * 1.6) * 0.5 + 0.5;
    float thread = 0.5 + 0.5 * mix(tw, tf, 0.5);
    float slub = fbm(vec2(cx * 0.38, cy * 0.028 + idx * 3.0));
    float wvv = (0.86 + 0.14 * thread) * (0.86 + 0.28 * slub);

    vec3 dye = vec3(0.058, 0.050, 0.046);
    vec3 hi = vec3(0.255, 0.215, 0.19);
    vec3 base = dye + (hi - dye) * (L * L * 1.05);
    base *= wvv;

    // 字と印（アトラス：R=字, G=印）
    vec2 au = vec2((idx + clamp(u + sl * 0.004, 0.0, 1.0)) / n, clamp(v, 0.0, 1.0));
    vec4 tx = texture2D(uAtlas, au);
    float rough = (fbm(vec2(cx, cy) * 0.22) - 0.5) * 0.30 + (hash(floor(vec2(cx, cy) / 1.6)) - 0.5) * 0.10;
    float ink = smoothstep(0.42, 0.60, tx.r + rough);
    float seal = smoothstep(0.42, 0.60, tx.g + rough * 0.6);
    if (center) { float cf = 1.0 - smoothstep(0.05, 0.42, uOpen); ink *= cf; seal *= cf; }
    vec3 inkCol = KINARI * (0.66 + 0.55 * L) * (0.92 + 0.08 * thread);
    base = mix(base, inkCol, ink * 0.94);
    vec3 shuCol = SHU * (0.50 + 0.70 * L) * (0.9 + 0.1 * thread);
    base = mix(base, shuCol, seal * 0.95);

    // 裏からの灯り：布が薄いところ（織りの隙間）から透ける
    float transm = back * (0.02 + 0.13 * uLamp) * (0.35 + 0.65 * (1.0 - thread)) * (1.0 + 0.9 * uOpen);
    base += lightCol * transm * (1.0 - ink * 0.7);
    // 隙間・裾ににじむ光
    float rimD = edge / s;
    base += lightCol * exp(-rimD / 5.5) * (0.10 + 0.34 * uLamp) * (0.5 + 0.5 * q);
    float hemD = (hemN - frag.y) / s;
    base += lightCol * exp(-hemD / 7.0) * (0.06 + 0.22 * uLamp);
    // 裾の縫い目
    float st1 = smoothstep(1.2 * s, 0.0, abs((hemN - frag.y) - 13.0 * s));
    float st2 = smoothstep(1.0 * s, 0.0, abs((hemN - frag.y) - 17.0 * s));
    base += KINARI * (st1 * 0.10 + st2 * 0.06) * (0.4 + L);

    vec4 c = vec4(base * cov, cov);
    col = c + col * (1.0 - c.a);
  }

  // 竿
  float ry = rodY - 3.0 * s;
  float t = (frag.y - ry) / (7.0 * s);
  if (abs(t) < 1.0) {
    float sh = sqrt(1.0 - t * t);
    float hl = pow(max(0.0, 1.0 - abs(t + 0.42) * 2.6), 2.0);
    float grain = 0.85 + 0.15 * noise(vec2(frag.x / (30.0 * s), frag.y / (2.0 * s)));
    vec3 rod = (vec3(0.085, 0.066, 0.055) + vec3(0.20, 0.155, 0.12) * pow(sh, 2.2)) * grain + KINARI * hl * 0.22;
    float aa = clamp((1.0 - abs(t)) * 7.0 * s / (1.4 * s), 0.0, 1.0);
    col = vec4(rod * aa, aa) + col * (1.0 - aa);
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

const NUM: Record<string, string> = { 麺: "一", 鮨: "二", 肉: "三", 酒: "四", 蕎: "五" };

export function createCloth(canvas: HTMLCanvasElement): Cloth | null {
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
    console.warn("[noren] WebGL init failed", err);
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
  const uRes = U("uRes"), uTime = U("uTime"), uOpen = U("uOpen"), uGust = U("uGust"), uLamp = U("uLamp"),
    uMouse = U("uMouse"), uN = U("uN"), uScale = U("uScale"), uLayout = U("uLayout"), uAtlas = U("uAtlas");

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
    gl.uniform1f(uMouse, s.mouse);
    gl.uniform1f(uN, n);
    gl.uniform1f(uScale, l.dpr);
    gl.uniform4f(uLayout, (l.margin ?? 0) * l.dpr, l.gap * l.dpr, l.rodY * l.dpr, l.hemY * l.dpr);
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

  return { render, resize, setChars, setPanels, destroy };
}
