/**
 * 行動ボタン案4〜6（玉・駒・帯）の CSS。接頭辞は案ごとに `.sa-tama-` `.sa-koma-` `.sa-obi-`、共有部分は `.sa-s-`。
 * 出し方は案1〜3と同じ（shopActionsCss.ts の冒頭を参照）: React 19 の <style href precedence> で、公開スイッチ ON のときだけ head に入る。
 * app/globals.css は変更しない。色・書体は globals.css の変数（--ink --paper --accent --line --serif --body --mono）。新しい書体は足さない。
 */

/** hover（マウスのあるときだけ）と focus-visible のどちらでも同じ見た目にするための書き出し */
const st = (pre: string, post: string, body: string) =>
  `${pre}:focus-visible${post}{${body}}\n@media (hover:hover){${pre}:hover${post}{${body}}}\n`;

/* ============================== 共通（案4〜6） ============================== */
export const CSS_SLIM = String.raw`
.sa{--sa-spring:cubic-bezier(.34,1.56,.64,1)}
/* 上の「店舗、詳細。」の表から続く紙面に座らせる細い罫（案1の罫と同じ線） */
.sa-v4,.sa-v5,.sa-v6{padding-top:30px;border-top:1px solid var(--sa-line)}
.sa-s-sub{display:flex;flex-wrap:wrap;gap:0 28px;margin-top:20px}
.sa-s-sublink{
  display:inline-flex;align-items:center;gap:8px;min-height:48px;font:400 14px/1.5 var(--body);letter-spacing:.02em;color:var(--sa-ink);
  text-decoration:underline;text-decoration-color:rgba(20,17,13,.3);text-decoration-thickness:1px;text-underline-offset:6px;
  transition:color .25s ease,text-decoration-color .25s ease;
}
.sa-s-sublink svg{width:15px;height:15px;flex:none;transform:rotate(-45deg);transition:transform .45s var(--sa-ease)}
.sa-s-sublink.is-in svg{transform:none}
@media (hover:hover){
  .sa-s-sublink:hover{color:var(--sa-red);text-decoration-color:var(--sa-red)}
  .sa-s-sublink:hover svg{transform:translateX(3px)}
}
.sa-s-sublink:active{color:var(--sa-red)}
.sa-s-share{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;margin-top:20px;padding-top:22px;border-top:1px solid var(--sa-line)}
.sa-s-cap{margin:0;font:500 12px/1 var(--mono);letter-spacing:.2em;color:var(--sa-soft)}
.sa-s-share .sa-share-msg,.sa-s-share .sa-share-url{flex:1 0 100%;margin-top:0}
.sa-s-share .sa-share-msg{min-height:1.2em}
.sa[data-enter="pre"] .sa-s-sub,.sa[data-enter="pre"] .sa-s-share{opacity:0;transform:translateY(14px)}
.sa[data-enter="in"] .sa-s-sub,.sa[data-enter="in"] .sa-s-share{transition:opacity .7s var(--sa-ease) calc(var(--i,0)*60ms),transform .9s var(--sa-ease) calc(var(--i,0)*60ms)}
@media (max-width:768px){
  .sa-s-share{gap:12px 16px}
}
@media (prefers-reduced-motion:reduce){
  .sa[data-enter="pre"] .sa-s-sub,.sa[data-enter="pre"] .sa-s-share{opacity:1;transform:none}
}
`;

/* ============================== 案4 玉 TAMA ============================== */
export const CSS_TAMA = String.raw`
.sa-tama-list{display:flex;flex-wrap:wrap;gap:14px}
.sa-tama-li{display:flex;min-width:0}
.sa-tama-pill{
  position:relative;display:inline-flex;align-items:center;gap:14px;min-height:56px;padding:8px 32px 8px 8px;border-radius:999px;
  color:var(--sa-ink);text-decoration:none;white-space:nowrap;isolation:isolate;overflow:hidden;background:var(--sa-paper);
  box-shadow:inset 0 0 0 1px var(--sa-rule);
  transition:transform .6s var(--sa-spring),box-shadow .3s ease;
}
.sa-tama-pill.is-hero{background:var(--sa-red);color:var(--sa-paper);box-shadow:none;padding-right:38px}
.sa-tama-pill.is-hero .sa-tama-lbl{font-size:18px}
.sa-tama-fill{
  position:absolute;inset:0;z-index:0;pointer-events:none;background:var(--sa-ink);
  transform:translateY(calc(100% + 14px));transition:transform .85s var(--sa-ease);
}
.sa-tama-fill::before{
  content:"";position:absolute;left:0;bottom:calc(100% - 1px);width:calc(100% + 96px);height:12px;background:var(--sa-ink);
  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 12' preserveAspectRatio='none'%3E%3Cpath d='M0 12V6Q24-2 48 6T96 6V12Z'/%3E%3C/svg%3E") repeat-x 0 100%/96px 12px;
  mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 12' preserveAspectRatio='none'%3E%3Cpath d='M0 12V6Q24-2 48 6T96 6V12Z'/%3E%3C/svg%3E") repeat-x 0 100%/96px 12px;
  animation:sa-tama-wave 1.15s linear infinite paused;
}
.sa-tama-bead{
  position:relative;z-index:1;flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;
  background:radial-gradient(circle at 32% 26%,rgba(255,255,255,.26),rgba(255,255,255,0) 58%),var(--sa-ink);color:var(--sa-paper);
  transition:background-color .4s ease .1s,color .4s ease .1s;
}
.sa-tama-bead svg{display:block;width:22px;height:22px}
.sa-tama-pill.is-hero .sa-tama-bead{background:var(--sa-paper);color:var(--sa-red)}
/* 行き先の矢印。スマホで 1 列ぶち抜き（主役・最後の 1 つ）のときだけ右端に出す */
.sa-tama-go{display:none;position:relative;z-index:1;flex:none;margin:0 4px 0 auto;width:20px;height:20px;transition:color .3s ease .12s}
.sa-tama-go svg{display:block;width:20px;height:20px;transform:rotate(-45deg)}
.sa-tama-pill[data-dir="down"] .sa-tama-go svg{transform:rotate(90deg)}
${st(".sa-tama-pill:not(.is-hero)", " .sa-tama-go", "color:var(--sa-paper)")}
.sa-tama-pill:not(.is-hero):active .sa-tama-go{color:var(--sa-paper)}
.sa-tama-vis{position:absolute;right:-3px;bottom:-3px;display:grid;place-items:center;width:15px;height:15px;border-radius:50%;background-color:transparent}
.sa-tama-vis svg{width:10px;height:10px;stroke:transparent}
a:visited .sa-tama-vis{background-color:#0a5c3e}
a:visited .sa-tama-vis svg{stroke:#fffdf7}
.sa-tama-lbl{position:relative;z-index:1;display:inline-flex;height:1.5em;overflow:hidden;font:500 17px/1.5 var(--serif);letter-spacing:.05em}
.sa-tama-ch{position:relative;display:block;height:1.5em;transition:transform .62s var(--sa-ease) calc(var(--c)*20ms + 50ms)}
.sa-tama-ch::after{content:attr(data-c);position:absolute;left:0;top:100%;color:var(--sa-paper)}
${st(".sa-tama-pill", " .sa-tama-fill", "transform:none")}
${st(".sa-tama-pill", " .sa-tama-fill::before", "animation-play-state:running")}
${st(".sa-tama-pill", " .sa-tama-ch", "transform:translateY(-100%)")}
${st(".sa-tama-pill", "", "box-shadow:inset 0 0 0 1px var(--sa-ink)")}
${st(".sa-tama-pill:not(.is-hero)", " .sa-tama-bead", "background:var(--sa-paper);color:var(--sa-ink)")}
${st(".sa-tama-pill.is-hero", " .sa-tama-bead", "color:var(--sa-ink)")}
${st(".sa-tama-pill", " .sa-tama-bead", "animation:sa-tama-hop .8s var(--sa-ease) both")}
.sa-tama-pill:not(.is-hero):active .sa-tama-bead{background:var(--sa-paper);color:var(--sa-ink)}
.sa-tama-pill.is-hero:active .sa-tama-bead{color:var(--sa-ink)}
.sa-tama-pill:focus-visible{outline:3px solid var(--sa-ink);outline-offset:4px}
.sa-tama-pill:active{transform:scale(1.05,.86);transition-duration:.07s,.3s}
.sa-tama-pill:active .sa-tama-fill{transform:none;transition-duration:.2s}
.sa-tama-pill:active .sa-tama-ch{transform:translateY(-100%);transition-duration:.12s;transition-delay:0s}
.sa-tama-pill.is-done{color:var(--sa-green);box-shadow:inset 0 0 0 1.5px var(--sa-green)}
.sa-tama-pill.is-done .sa-tama-bead{background:var(--sa-green)}
.sa-tama-pill.is-sm{min-height:48px;gap:10px;padding:6px 22px 6px 6px}
.sa-tama-pill.is-sm .sa-tama-bead{width:34px;height:34px;background:transparent;color:var(--sa-ink);box-shadow:inset 0 0 0 1px var(--sa-rule)}
.sa-tama-pill.is-sm .sa-tama-bead svg{width:18px;height:18px}
.sa-tama-pill.is-sm.is-done .sa-tama-bead{background:var(--sa-green);color:var(--sa-paper);box-shadow:none}
.sa-tama-pill.is-sm .sa-tama-lbl{font:500 14px/1.5 var(--body);letter-spacing:.04em}
.sa-tama-pill.is-sm .sa-tama-vis{display:none}
.sa-tama-shares{display:flex;flex-wrap:wrap;gap:10px}
.sa[data-enter="pre"] .sa-tama-li{opacity:0;transform:translateY(14px) scale(.88)}
.sa[data-enter="in"] .sa-tama-li{transition:opacity .6s ease calc(var(--i,0)*60ms),transform .95s var(--sa-spring) calc(var(--i,0)*60ms)}
@keyframes sa-tama-wave{to{transform:translateX(-96px)}}
@keyframes sa-tama-hop{
  0%{transform:none}
  26%{transform:translateY(-7px) scale(.92,1.1)}
  52%{transform:translateY(0) scale(1.14,.86)}
  72%{transform:translateY(-2px) scale(.98,1.03)}
  100%{transform:none}
}
@media (max-width:768px){
  .sa-tama-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .sa-tama-li.is-hero,.sa-tama-li.is-wide{grid-column:span 2}
  .sa-tama-li.is-hero .sa-tama-go,.sa-tama-li.is-wide .sa-tama-go{display:block}
  .sa-tama-pill,.sa-tama-pill.is-hero{width:100%;gap:11px;padding-right:16px}
  .sa-tama-lbl,.sa-tama-pill.is-hero .sa-tama-lbl{font-size:16px}
  .sa-tama-shares{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:100%}
  .sa-tama-shares .sa-tama-pill{width:100%}
}
@media (max-width:370px){
  .sa-tama-list{gap:10px}
  .sa-tama-pill{gap:8px;padding:8px 10px 8px 8px}
  .sa-tama-lbl{font-size:14.5px;letter-spacing:.02em}
  .sa-tama-pill.is-sm .sa-tama-lbl{font-size:13.5px}
}
@media (max-width:359px){
  .sa-tama-pill{gap:6px;padding:11px 6px 11px 11px}
  .sa-tama-bead{width:32px;height:32px}
  .sa-tama-bead svg{width:18px;height:18px}
  .sa-tama-lbl{font-size:13.5px;letter-spacing:0}
  .sa-tama-pill.is-sm{padding:7px 8px 7px 7px}
  .sa-tama-pill.is-sm .sa-tama-lbl{font-size:13px}
}
@media (prefers-reduced-motion:reduce){
  .sa[data-enter="pre"] .sa-tama-li{opacity:1;transform:none}
  .sa-tama-fill::before{animation:none}
  .sa-tama-pill:active{transform:none}
}
`;

/* ============================== 案5 駒 KOMA ============================== */
export const CSS_KOMA = String.raw`
.sa-koma-list{display:flex;flex-wrap:wrap;gap:34px 26px}
.sa-koma-li{width:100px;min-width:0}
.sa-koma-cell{
  display:flex;flex-direction:column;align-items:center;gap:15px;width:100%;color:var(--sa-ink);text-decoration:none;outline:none;
  -webkit-tap-highlight-color:transparent;
}
.sa-koma-key{position:relative;display:block;flex:none;width:84px;height:84px;margin-right:5px;border-radius:13px}
.sa-koma-sh{
  position:absolute;inset:0;border-radius:13px;border:1.5px solid var(--sa-ink);
  background:repeating-linear-gradient(135deg,var(--sa-ink) 0 1.5px,transparent 1.5px 3.5px);
  transform:translate(5px,5px);transition:transform .4s var(--sa-ease);
}
.sa-koma-face{
  position:absolute;inset:0;display:grid;place-items:center;border-radius:13px;border:1.5px solid var(--sa-ink);
  background:var(--sa-paper);color:var(--sa-ink);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.9),inset 0 -4px 0 rgba(20,17,13,.07);
  transition:transform .45s var(--sa-spring),color .3s ease,border-color .3s ease;
}
.sa-koma-cell.is-hero .sa-koma-face{background:var(--sa-red);color:var(--sa-paper);box-shadow:inset 0 2px 0 rgba(255,255,255,.24),inset 0 -4px 0 rgba(0,0,0,.14)}
.sa-koma-face::before{content:"";position:absolute;inset:5px;border-radius:9px;border:1px solid rgba(20,17,13,.11);pointer-events:none}
.sa-koma-cell.is-hero .sa-koma-face::before{border-color:rgba(255,255,255,.3)}
.sa-koma-cell.is-sm .sa-koma-face::before{inset:4px;border-radius:6px}
.sa-koma-ico{position:relative;display:grid;place-items:center;transform-origin:50% 55%}
.sa-koma-ico svg{display:block;width:34px;height:34px;overflow:visible}
.sa-koma-vis{position:absolute;right:6px;bottom:6px;display:grid;place-items:center;width:15px;height:15px;border-radius:50%;background-color:transparent}
.sa-koma-vis svg{width:10px;height:10px;stroke:transparent}
a:visited .sa-koma-vis{background-color:#0a5c3e}
a:visited .sa-koma-vis svg{stroke:#fffdf7}
.sa-koma-lbl{
  display:block;width:fit-content;max-width:100%;padding-bottom:3px;font:500 13px/1.4 var(--body);letter-spacing:.04em;text-align:center;text-wrap:balance;
  background:linear-gradient(currentColor,currentColor) 50% 100%/0 1px no-repeat;transition:background-size .5s var(--sa-ease);
}
${st(".sa-koma-cell", " .sa-koma-face", "transform:translate(-3px,-3px)")}
${st(".sa-koma-cell", " .sa-koma-sh", "transform:translate(7px,7px)")}
${st(".sa-koma-cell", " .sa-koma-lbl", "background-size:100% 1px")}
.sa-koma-cell:focus-visible .sa-koma-key{outline:3px solid var(--sa-ink);outline-offset:9px}
.sa-koma-cell:active .sa-koma-face{transform:translate(5px,5px);transition-duration:.06s}
.sa-koma-cell:active .sa-koma-sh{transform:translate(5px,5px);transition-duration:.06s}
.sa-koma-cell.is-done .sa-koma-face{color:var(--sa-green);border-color:var(--sa-green)}
/* アイコンはその種類らしく小さく動く */
${st(".sa-koma-cell", " .sa-koma-ico", "animation:sa-koma-tilt .75s var(--sa-ease) both")}
${st('.sa-koma-cell[data-sa-id="phone"]', " .sa-koma-ico", "animation:sa-koma-ring .85s ease-in-out both")}
${st('.sa-koma-cell[data-sa-id="gmap"]', " .sa-koma-ico", "animation:sa-koma-drop .85s var(--sa-ease) both")}
${st('.sa-koma-cell[data-sa-id="map"]', " .sa-koma-ico", "animation:sa-koma-unfold .8s var(--sa-ease) both")}
${st('.sa-koma-cell[data-sa-id="reserve"]', " .sa-koma-ico", "animation:sa-koma-flip .8s var(--sa-ease) both")}
${st('.sa-koma-cell[data-sa-id="reserve"]', " .sa-koma-ico path:last-of-type", "animation:sa-koma-draw .45s ease-out .38s both")}
${st('.sa-koma-cell[data-sa-id="x"]', " .sa-koma-ico", "animation:sa-koma-turn .7s var(--sa-ease) both")}
${st('.sa-koma-cell[data-sa-id="line"]', " .sa-koma-ico", "animation:sa-koma-pop .7s var(--sa-spring) both")}
${st('.sa-koma-cell[data-sa-id="tiktok"]', " .sa-koma-ico", "animation:sa-koma-bob .75s var(--sa-ease) both")}
${st('.sa-koma-cell[data-sa-id="copy"]', " .sa-koma-ico", "animation:sa-koma-pop .7s var(--sa-spring) both")}
@keyframes sa-koma-tilt{0%{transform:none}30%{transform:rotate(-15deg) scale(1.1)}62%{transform:rotate(7deg) scale(1.05)}100%{transform:none}}
@keyframes sa-koma-ring{0%,100%{transform:none}12%{transform:rotate(-17deg)}24%{transform:rotate(15deg)}36%{transform:rotate(-12deg)}48%{transform:rotate(10deg)}60%{transform:rotate(-6deg)}72%{transform:rotate(3deg)}}
@keyframes sa-koma-drop{0%{transform:translateY(-12px) scale(.94,1.06);opacity:.2}38%{transform:translateY(0) scale(1.14,.84);opacity:1}58%{transform:translateY(-5px) scale(.97,1.04)}78%{transform:translateY(0) scale(1.05,.95)}100%{transform:none}}
@keyframes sa-koma-unfold{0%{transform:perspective(170px) rotateY(0)}42%{transform:perspective(170px) rotateY(-34deg) scale(1.06)}100%{transform:perspective(170px) rotateY(0)}}
@keyframes sa-koma-flip{0%{transform:perspective(150px) rotateX(0)}34%{transform:perspective(150px) rotateX(-84deg)}52%{transform:perspective(150px) rotateX(-84deg)}100%{transform:perspective(150px) rotateX(0)}}
@keyframes sa-koma-draw{from{stroke-dasharray:10;stroke-dashoffset:10}to{stroke-dasharray:10;stroke-dashoffset:0}}
@keyframes sa-koma-turn{0%{transform:none}100%{transform:rotate(90deg)}}
@keyframes sa-koma-pop{0%{transform:none}40%{transform:scale(1.2) rotate(-7deg)}100%{transform:none}}
@keyframes sa-koma-bob{0%{transform:none}30%{transform:translateY(-6px) rotate(9deg)}60%{transform:translateY(1px) rotate(-3deg)}100%{transform:none}}
/* 共有（同じキーの小さい版） */
.sa-koma-shares{display:flex;flex-wrap:wrap;gap:16px 18px}
.sa-koma-cell.is-sm{width:auto}
.sa-koma-cell.is-sm .sa-koma-key{width:48px;height:48px;margin-right:4px;border-radius:10px}
.sa-koma-cell.is-sm .sa-koma-sh{border-radius:10px;transform:translate(4px,4px)}
.sa-koma-cell.is-sm .sa-koma-face{border-radius:10px}
.sa-koma-cell.is-sm .sa-koma-ico svg{width:22px;height:22px}
${st(".sa-koma-cell.is-sm", " .sa-koma-face", "transform:translate(-2px,-2px)")}
${st(".sa-koma-cell.is-sm", " .sa-koma-sh", "transform:translate(6px,6px)")}
.sa-koma-cell.is-sm:focus-visible .sa-koma-key{outline-offset:7px}
.sa-koma-cell.is-sm:active .sa-koma-face{transform:translate(4px,4px)}
.sa-koma-cell.is-sm:active .sa-koma-sh{transform:translate(4px,4px)}
.sa[data-enter="pre"] .sa-koma-li{opacity:0}
.sa[data-enter="pre"] .sa-koma-face{transform:translate(-10px,-10px)}
.sa[data-enter="in"] .sa-koma-li{transition:opacity .5s ease calc(var(--i,0)*55ms)}
/* 現れるときの「ぽん」は animation で（transition にすると、あとの hover・押す動きが遅れて効く） */
.sa[data-enter="in"] .sa-koma-face{animation:sa-koma-in .9s var(--sa-spring) backwards;animation-delay:calc(var(--i,0)*55ms)}
@keyframes sa-koma-in{from{transform:translate(-10px,-10px)}to{transform:translate(0,0)}}
@media (max-width:768px){
  .sa-koma-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 8px}
  .sa-koma-li{width:auto}
  .sa-koma-key{width:72px;height:72px;border-radius:12px}
  .sa-koma-sh,.sa-koma-face{border-radius:12px}
  .sa-koma-ico svg{width:30px;height:30px}
  .sa-koma-lbl{font-size:12px}
  .sa-koma-vis{right:5px;bottom:5px}
}
@media (max-width:359px){
  .sa-koma-list{gap:26px 4px}
  .sa-koma-key{width:64px;height:64px}
  .sa-koma-ico svg{width:27px;height:27px}
}
@media (prefers-reduced-motion:reduce){
  .sa[data-enter="pre"] .sa-koma-li{opacity:1}
  .sa[data-enter="pre"] .sa-koma-face{transform:none}
  .sa-koma-ico{animation:none!important}
  .sa-koma-ico path{animation:none!important}
}
`;

/* ============================== 案6 帯 OBI ============================== */
export const CSS_OBI = String.raw`
.sa-obi-band{
  --ix:0px;--ir:0px;--iy:0px;--ih:72px;--ox:50%;
  position:relative;isolation:isolate;max-width:calc(var(--n,4)*340px);border:1px solid var(--sa-rule);background:var(--sa-paper);
  outline:1px solid var(--sa-line);outline-offset:3px; /* 二重罫 */
}
.sa-obi-row{display:flex;height:72px}
.sa-obi-row + .sa-obi-row{border-top:1px solid var(--sa-line)}
.sa-obi-li{display:flex;flex:var(--g,1) 1 0%;min-width:0;transition:flex-grow .6s var(--sa-ease)}
.sa-obi-li:not(:last-child){box-shadow:inset -1px 0 0 var(--sa-line)}
.sa-obi-band[data-grow="1"] .sa-obi-li[data-on]{flex-grow:calc(var(--g,1)*1.5)}
.sa-obi-sec{
  position:relative;display:flex;align-items:center;flex:1 1 auto;min-width:0;height:100%;overflow:hidden;
  color:var(--sa-ink);text-decoration:none;text-align:left;transition:color .2s ease .12s;-webkit-tap-highlight-color:transparent;
}
.sa-obi-bg{position:absolute;inset:0;z-index:0;pointer-events:none}
.sa-obi-li.is-hero .sa-obi-bg{background:var(--sa-red)}
.sa-obi-li.is-hero .sa-obi-sec{color:var(--sa-paper)}
.sa-obi-li[data-on] .sa-obi-sec{color:var(--sa-paper)}
.sa-obi-press{position:absolute;inset:0;z-index:1;display:none;pointer-events:none;background:var(--sa-ink);opacity:0;transition:opacity .16s ease}
.sa-obi-ink{
  position:absolute;left:var(--ix);right:var(--ir);top:var(--iy);height:var(--ih);z-index:1;pointer-events:none;
  transition:left .6s var(--sa-ease),right .6s var(--sa-ease),top .5s var(--sa-ease),height .5s var(--sa-ease);
}
.sa-obi-band[data-go="r"] .sa-obi-ink{transition-duration:.68s,.4s,.5s,.5s}
.sa-obi-band[data-go="l"] .sa-obi-ink{transition-duration:.4s,.68s,.5s,.5s}
.sa-obi-band.is-jump .sa-obi-ink{transition:none}
.sa-obi-inkb{position:absolute;inset:0;background:var(--sa-ink);transform:scaleX(0);transform-origin:var(--ox) 50%;transition:transform .5s var(--sa-ease)}
.sa-obi-band[data-ink="1"] .sa-obi-inkb{transform:none}
.sa-obi-in{position:relative;z-index:2;display:flex;align-items:center;gap:12px;width:100%;min-width:0;padding:0 22px}
.sa-obi-ico{position:relative;flex:none;display:grid;place-items:center;transition:transform .55s var(--sa-spring)}
.sa-obi-ico svg{display:block;width:24px;height:24px}
.sa-obi-li[data-on] .sa-obi-ico{transform:scale(1.14)}
.sa-obi-lbl{transition:transform .6s var(--sa-ease)}
.sa-obi-li[data-on] .sa-obi-lbl{transform:translateX(4px)}
.sa-obi-vis{position:absolute;right:-5px;bottom:-5px;display:grid;place-items:center;width:13px;height:13px;border-radius:50%;background-color:transparent}
.sa-obi-vis svg{width:9px;height:9px;stroke:transparent}
a:visited .sa-obi-vis{background-color:#0a5c3e}
a:visited .sa-obi-vis svg{stroke:#fffdf7}
.sa-obi-lbl{min-width:0;overflow:hidden;font:500 17px/1.3 var(--serif);letter-spacing:.04em;white-space:nowrap}
.sa-obi-go{position:absolute;right:20px;top:50%;margin-top:-12px;display:grid;place-items:center;width:24px;height:24px;opacity:0;transform:translateX(-14px);transition:opacity .25s ease,transform .6s var(--sa-ease)}
.sa-obi-go svg{width:22px;height:22px;transform:rotate(-45deg);transition:transform .55s var(--sa-ease)}
.sa-obi-sec[data-dir="down"] .sa-obi-go svg{transform:rotate(90deg)}
.sa-obi-li[data-on] .sa-obi-go{opacity:1;transform:none;transition-delay:.1s}
.sa-obi-li[data-on] .sa-obi-go svg{transform:rotate(0)}
.sa-obi-li[data-on] .sa-obi-sec[data-dir="down"] .sa-obi-go svg{transform:rotate(90deg)}
.sa-obi-sec:focus-visible{outline:none}
.sa-obi-sec:focus-visible::after{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;box-shadow:inset 0 0 0 3px var(--sa-red),inset 0 0 0 5px var(--sa-paper)}
.sa-obi-sec.is-done .sa-obi-ico{color:var(--sa-green)}
.sa-obi-li[data-on] .sa-obi-sec.is-done .sa-obi-ico{color:var(--sa-paper)}
/* 共有（同じ意匠の小さい帯） */
.sa-obi-band.is-sm{display:inline-block;max-width:none;--ih:52px}
.sa-obi-band.is-sm .sa-obi-row{height:52px}
.sa-obi-band.is-sm .sa-obi-li{flex:0 0 auto}
.sa-obi-band.is-sm .sa-obi-in{width:auto;gap:9px;padding:0 20px}
.sa-obi-band.is-sm .sa-obi-ico svg{width:19px;height:19px}
.sa-obi-band.is-sm .sa-obi-lbl{font:500 14px/1 var(--body);letter-spacing:.04em}
.sa-obi-band.is-sm .sa-obi-vis{display:none}
.sa[data-enter="pre"] .sa-obi-band{clip-path:inset(0 100% 0 0)}
.sa[data-enter="in"] .sa-obi-band{clip-path:inset(-14px);transition:clip-path 1.05s var(--sa-ease)}
@media (min-width:960px) and (max-width:1199px){
  .sa-obi-in{gap:10px;padding:0 16px}
  .sa-obi-lbl{font-size:16px;letter-spacing:.03em}
}
/* 幅 960px 未満（スマホ・タブレット）: 2 列の格子の帯。広がる動きは無く、押した区画が墨に反転する */
@media (max-width:959px){
  .sa-obi-band{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;max-width:none;background:var(--sa-line)}
  .sa-obi-row{display:contents}
  .sa-obi-li{height:62px;background:var(--sa-paper);box-shadow:none!important}
  .sa-obi-li.is-wide{grid-column:span 2}
  .sa-obi-ink,.sa-obi-go{display:none}
  .sa-obi-press{display:block}
  .sa-obi-in{padding:0 18px}
  .sa-obi-lbl{font-size:16px}
  .sa-obi-sec:active,.sa-obi-sec:focus-visible{color:var(--sa-paper)}
  .sa-obi-sec:active .sa-obi-press,.sa-obi-sec:focus-visible .sa-obi-press{opacity:1}
  .sa-obi-sec:active .sa-obi-press{transition-duration:.06s}
  .sa-obi-sec:active .sa-obi-ico{transform:scale(.9)}
  .sa-obi-sec.is-done .sa-obi-ico{color:var(--sa-green)}
  .sa-obi-band.is-sm{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));width:100%}
  .sa-obi-band.is-sm .sa-obi-li{height:64px}
  .sa-obi-band.is-sm .sa-obi-in{flex-direction:column;justify-content:center;gap:5px;padding:0 4px}
  .sa-obi-band.is-sm .sa-obi-lbl{font-size:12px}
}
@media (hover:hover) and (max-width:959px){
  .sa-obi-sec:hover{color:var(--sa-paper)}
  .sa-obi-sec:hover .sa-obi-press{opacity:1}
}
@media (max-width:359px){
  .sa-obi-in{gap:8px;padding:0 12px}
  .sa-obi-lbl{font-size:15px;letter-spacing:.02em}
}
@media (prefers-reduced-motion:reduce){
  .sa-obi-band[data-grow="1"] .sa-obi-li[data-on]{flex-grow:var(--g,1)}
  .sa[data-enter="pre"] .sa-obi-band{clip-path:none}
  .sa-obi-li[data-on] .sa-obi-ico,.sa-obi-li[data-on] .sa-obi-lbl{transform:none}
}
`;
