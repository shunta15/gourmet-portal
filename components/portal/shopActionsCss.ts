/**
 * 店ページの行動ボタン（ShopActions。見た目は「玉」の 1 種類）の CSS。固有の接頭辞 `.sa-`（玉は `.sa-tama-`、ボタンの下の脇役リンクと共有の枠は `.sa-s-`）。
 *
 * なぜ .css ファイルではなく TS の文字列か:
 *   React.lazy の先で import した .css は、サーバーが出す HTML の <link> に入らず（実測）、
 *   読み込み直後に装飾の無いボタンが一瞬出る（崩れ・レイアウトのずれ）。
 *   ここを React 19 の <style href precedence> で出せば、公開スイッチ ON のときだけ HTML の head に入り、
 *   OFF のときは何も読み込まれない。app/globals.css は変更しない。
 * 色・書体は app/globals.css の変数（--ink --paper --accent --line --serif --body --mono）を使う。新しい書体は足さない。
 */

/** hover（マウスのあるときだけ）と focus-visible のどちらでも同じ見た目にするための書き出し */
const st = (pre: string, post: string, body: string) =>
  `${pre}:focus-visible${post}{${body}}\n@media (hover:hover){${pre}:hover${post}{${body}}}\n`;

export const CSS_BASE = String.raw`
.sa{
  --sa-ease:cubic-bezier(.22,1,.36,1);
  --sa-spring:cubic-bezier(.34,1.56,.64,1);
  --sa-ink:var(--ink,#14110d);
  --sa-soft:var(--ink-soft,#3a342b);
  --sa-line:var(--line,#d9d1bf);
  --sa-paper:var(--paper,#fffdf7);
  --sa-red:var(--accent,#c7472a);
  --sa-green:var(--accent-2,#0a5c3e);
  --sa-rule:rgba(20,17,13,.52);
}
/* 上の「店舗、詳細。」の表から続く紙面に座らせる細い罫 */
.sa{position:relative;margin-top:48px;padding-top:30px;border-top:1px solid var(--sa-line);color:var(--sa-ink);font-family:var(--body);text-align:left}
@media (max-width:768px){.sa{margin-top:40px}}
.sa a,.sa button{-webkit-tap-highlight-color:transparent}
:where(.sa) button{appearance:none;font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:none}
@media (hover:none),(pointer:coarse){:where(.sa) button{cursor:pointer}}
:where(.sa) ul{list-style:none;margin:0;padding:0}
.sa-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
.sa-share-msg{min-height:1.7em;margin:10px 0 0;font:400 13px/1.7 var(--body);color:var(--sa-soft)}
.sa-share-url{width:100%;max-width:560px;margin-top:12px;padding:12px 14px;border:1px solid var(--sa-ink);background:transparent;color:var(--sa-ink);font:400 13px/1.4 var(--body)}
:where(.sa) :focus-visible{outline:3px solid var(--sa-ink);outline-offset:3px}
@media (prefers-reduced-motion:reduce){
  .sa *,.sa *::before,.sa *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important}
}
`;

/** ボタンの下の脇役リンクと、共有の枠（玉の CSS と同じ <style> で出す） */
const CSS_SUB = String.raw`
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

/* ============================== 玉 TAMA ============================== */
const CSS_TAMA_ONLY = String.raw`
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

export const CSS_TAMA = CSS_SUB + CSS_TAMA_ONLY;
