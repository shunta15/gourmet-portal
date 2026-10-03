"use client";
import { useEffect, useRef } from "react";

/**
 * 総合トップのヒーロー背景「絹」シェーダ。外部ライブラリなしの素の WebGL。
 * 美容版プロトタイプの絹を土台に、6業種の色を地の上で溶かし合わせる。
 * - カーソルに向かって布がわずかに寄る
 * - focus（0〜5）の業種に触れている間、その色が布の上でふくらむ
 * - 画面外では描画を止める／reduced-motion では1フレームだけ描く
 * - WebGL が無い環境では CSS のグラデーション（.mp-silk-fallback）がそのまま見える
 */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res; uniform float u_t; uniform vec2 u_m; uniform float u_f; uniform float u_fi; uniform float u_sheen;
uniform vec3 g0;
uniform vec3 k0; uniform vec3 k1; uniform vec3 k2; uniform vec3 k3; uniform vec3 k4; uniform vec3 k5;
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float wd(float t,float i){float d=abs(t-i);return min(d,6.0-d);}
float wt(float t,float i){
  float w=max(0.0,1.0-wd(t,i)*0.85);
  return w*(1.0+u_f*step(abs(u_fi-i),0.5)*6.0);
}
vec3 pal(float t){
  float w0=wt(t,0.0),w1=wt(t,1.0),w2=wt(t,2.0),w3=wt(t,3.0),w4=wt(t,4.0),w5=wt(t,5.0);
  float s=w0+w1+w2+w3+w4+w5+0.0001;
  return (k0*w0+k1*w1+k2*w2+k3*w3+k4*w4+k5*w5)/s;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float ar=u_res.x/u_res.y;
  vec2 p=vec2(uv.x*ar,uv.y);
  vec2 m=vec2(u_m.x*ar,u_m.y);
  float t=u_t*0.045;
  float d=distance(p,m);
  vec2 pull=(m-p)*0.12*exp(-d*2.2);
  float n=snoise(p*0.9+vec2(t,-t*0.6)+pull);
  float n2=snoise(p*1.9-vec2(t*1.2,t*0.8)+n*0.55+pull*2.0);
  float fold=sin((p.y*1.3+p.x*0.35+n*0.42+n2*0.18)*7.5+t*5.0)*0.5+0.5;
  float hue=3.0+(n*0.65+n2*0.45)*2.4+(uv.x-0.5)*3.2+(uv.y-0.5)*1.2;
  vec3 tint=pal(mod(hue+u_t*0.02+12.0,6.0));
  float cover=smoothstep(-0.75,0.85,n*0.6+n2*0.5)*0.8+0.1;
  vec3 col=mix(g0,tint,cover);
  col=mix(col,tint*0.9+0.1,pow(fold,5.0)*0.22);
  col+=pow(fold,26.0)*u_sheen;
  col-=(1.0-fold)*0.03;
  float vig=smoothstep(1.25,0.35,distance(uv,vec2(0.5,0.55)));
  col=mix(col*0.94,col,vig);
  float g=fract(sin(dot(gl_FragCoord.xy+fract(u_t)*97.0,vec2(12.9898,78.233)))*43758.5453);
  col+=(g-0.5)*0.028;
  gl_FragColor=vec4(col,1.0);
}`;
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

const GROUND = hexToRgb("#f4efe6");

export default function PortalSilk({
  colors,
  focus,
  mix = 0.62,
  sheen = 0.09,
}: {
  /** 6業種のアクセント色（#hex）。順に 0〜5 */
  colors: string[];
  /** いま触れている業種の番号。無ければ -1 */
  focus: number;
  /** 地の色にどれだけ業種色を混ぜるか（0〜1） */
  mix?: number;
  sheen?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef(focus);
  focusRef.current = focus;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("u_res"), uT = U("u_t"), uM = U("u_m"), uF = U("u_f"), uFi = U("u_fi");
    gl.uniform3f(U("g0"), GROUND[0], GROUND[1], GROUND[2]);
    colors.slice(0, 6).forEach((hex, i) => {
      const c = hexToRgb(hex);
      gl.uniform3f(U(`k${i}`), GROUND[0] + (c[0] - GROUND[0]) * mix, GROUND[1] + (c[1] - GROUND[1]) * mix, GROUND[2] + (c[2] - GROUND[2]) * mix);
    });
    gl.uniform1f(U("u_sheen"), sheen);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = cv.clientWidth, h = cv.clientHeight;
      cv.width = Math.max(1, Math.floor(w * dpr * 0.75));
      cv.height = Math.max(1, Math.floor(h * dpr * 0.75));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0.7, y: 0.55 }, eased = { x: 0.7, y: 0.55 };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove);

    let visible = true, raf = 0, fCur = 0, fi = 0;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    const t0 = performance.now();
    function loop(now: number) {
      eased.x += (mouse.x - eased.x) * 0.04;
      eased.y += (mouse.y - eased.y) * 0.04;
      const want = focusRef.current;
      if (want >= 0) fi = want;
      fCur += ((want >= 0 ? 1 : 0) - fCur) * 0.07;
      gl!.uniform1f(uT, (now - t0) / 1000 + 40);
      gl!.uniform2f(uM, eased.x, eased.y);
      gl!.uniform1f(uF, fCur);
      gl!.uniform1f(uFi, fi);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      cv!.dataset.ready = "1";
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
    // 色は定数（業種設定）なので初回だけ読む
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className="mp-silk" aria-hidden="true" />;
}
