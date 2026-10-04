/**
 * 行動ボタン（ShopActions）の CSS。固有の接頭辞 `.sa-`（案1=.sa-k-、案2=.sa-i-、案3=.sa-h-）。
 *
 * なぜ .css ファイルではなく TS の文字列か:
 *   React.lazy の先で import した .css は、サーバーが出す HTML の <link> に入らず（実測）、
 *   読み込み直後に装飾の無いボタンが一瞬出る（崩れ・レイアウトのずれ）。
 *   ここを React 19 の <style href precedence> で出せば、公開スイッチ ON のときだけ HTML の head に入り、
 *   OFF のときは何も読み込まれない。app/globals.css は変更しない。
 * 色・書体は app/globals.css の変数（--ink --paper --accent --line --serif --body --mono）を使う。新しい書体は足さない。
 */

export const CSS_BASE = String.raw`
.sa,.sa-h-bar{
  --sa-ease:cubic-bezier(.22,1,.36,1);
  --sa-ease-io:cubic-bezier(.65,0,.35,1);
  --sa-ink:var(--ink,#14110d);
  --sa-soft:var(--ink-soft,#3a342b);
  --sa-line:var(--line,#d9d1bf);
  --sa-paper:var(--paper,#fffdf7);
  --sa-bg:var(--bg,#faf8f3);
  --sa-red:var(--accent,#c7472a);
  --sa-green:var(--accent-2,#0a5c3e);
  --sa-rule:rgba(20,17,13,.52);
}
.sa{position:relative;margin-top:48px;color:var(--sa-ink);font-family:var(--body);text-align:left}
.sa a,.sa button{-webkit-tap-highlight-color:transparent}
:where(.sa) button{appearance:none;font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:none}
@media (hover:none),(pointer:coarse){:where(.sa) button{cursor:pointer}}
:where(.sa) ul{list-style:none;margin:0;padding:0}
.sa-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
.sa-sample{cursor:default}
.sa-visit{flex:none;stroke:transparent}
/* :visited で変えられるのは色だけ。var() は使わず値を直に書く（--accent-2 と --paper と同じ値） */
a:visited .sa-visit{stroke:#0a5c3e}
.sa-share-msg{min-height:1.7em;margin:10px 0 0;font:400 13px/1.7 var(--body);color:var(--sa-soft)}
.sa-share-url{width:100%;max-width:560px;margin-top:12px;padding:12px 14px;border:1px solid var(--sa-ink);background:transparent;color:var(--sa-ink);font:400 13px/1.4 var(--body)}
:where(.sa) :focus-visible{outline:3px solid var(--sa-ink);outline-offset:3px}
.sa-pv{position:fixed;right:12px;bottom:12px;z-index:80;display:flex;align-items:center;gap:6px;padding:6px 6px 6px 14px;background:var(--paper,#fffdf7);border:1px solid var(--ink,#14110d);color:var(--ink,#14110d);font:500 12px/1 var(--mono,monospace);letter-spacing:.14em;box-shadow:0 6px 20px rgba(20,17,13,.14)}
.sa-pv-l{margin-right:4px}
.sa-pv-b{min-width:48px;min-height:48px;border:1px solid var(--ink,#14110d);background:transparent;color:var(--ink,#14110d);font:500 15px/1 var(--mono,monospace);cursor:pointer;transition:background-color .2s ease,color .2s ease}
.sa-pv-b[aria-pressed="true"]{background:var(--ink,#14110d);color:var(--paper,#fffdf7)}
.sa-pv-b:focus-visible{outline:3px solid var(--accent,#c7472a);outline-offset:2px}
@media (max-width:768px){.sa-pv{bottom:calc(env(safe-area-inset-bottom,0px) + 12px);padding:5px}.sa-pv-l{display:none}body:has(.sa-h-bar) .sa-pv{bottom:calc(env(safe-area-inset-bottom,0px) + 90px)}}
@media (prefers-reduced-motion:reduce){
  .sa *,.sa *::before,.sa *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important}
}
`;

/* ============================== 案1 罫 KEI ============================== */
export const CSS_KEI = String.raw`
@property --sa-p{syntax:"<percentage>";inherits:false;initial-value:-8%}
.sa-k-list{border-top:1px solid var(--sa-line)}
.sa-k-li{position:relative;border-bottom:1px solid var(--sa-line)}
.sa-k-row{
  position:relative;display:grid;grid-template-columns:160px minmax(0,1fr) auto auto;column-gap:24px;align-items:center;
  min-height:96px;margin:0 -24px;padding:16px 24px;color:var(--sa-ink);overflow:hidden;isolation:isolate;text-decoration:none;
  transition:transform .16s var(--sa-ease),color .22s ease;
}
.sa-k-row::before{
  content:"";position:absolute;inset:0;background:var(--sa-ink);--sa-p:-8%;
  clip-path:polygon(0 0,calc(var(--sa-p) + 8%) 0,var(--sa-p) 100%,0 100%);transition:--sa-p .75s var(--sa-ease);z-index:-1;
}
.sa-k-row::after{content:"";position:absolute;left:24px;right:24px;bottom:0;height:2px;background:var(--sa-red);transform:scaleX(0);transform-origin:0 50%;transition:transform .7s var(--sa-ease) .14s}
.sa-k-row[data-from="r"]::before{transform:scaleX(-1)}
.sa-k-row.is-hero{background:var(--sa-red);color:var(--sa-paper);min-height:116px}
.sa-k-row.is-hero .sa-k-label{font-size:clamp(30px,3.7vw,50px)}
.sa-k-cat{display:flex;align-items:center;gap:12px;font:500 12px/1 var(--mono);letter-spacing:.2em;color:var(--sa-soft);transition:color .22s ease}
.sa-k-no{opacity:.9}
.sa-k-row.is-hero .sa-k-cat{color:var(--sa-paper)}
.sa-k-cat{grid-column:1}
.sa-k-label{grid-column:2;font:500 clamp(26px,3vw,40px)/1.2 var(--serif);letter-spacing:.02em;word-break:keep-all;overflow-wrap:break-word;min-width:0;transition:transform .6s var(--sa-ease)}
.sa-k-note{grid-column:3;justify-self:end;max-width:min(34vw,340px);text-align:right;font:400 14px/1.6 var(--body);letter-spacing:.04em;color:var(--sa-soft);overflow-wrap:anywhere;word-break:break-all;transition:color .22s ease,transform .6s var(--sa-ease)}
.sa-k-row.is-hero .sa-k-note{color:var(--sa-paper)}
.sa-k-arrow{
  grid-column:4;display:grid;place-items:center;width:52px;height:52px;border:1px solid currentColor;border-radius:50%;
  transition:background-color .4s var(--sa-ease),color .4s var(--sa-ease),border-color .4s var(--sa-ease);
}
.sa-k-arrow svg{width:22px;height:22px;transform:rotate(-45deg);transition:transform .7s var(--sa-ease)}
.sa-k-row[data-dir="down"] .sa-k-arrow svg{transform:rotate(90deg)}
.sa-k-row:focus-visible{outline:3px solid var(--sa-red);outline-offset:-7px}
.sa-k-row:focus-visible,.sa-k-row:active{color:var(--sa-paper)}
.sa-k-row:focus-visible::before,.sa-k-row:active::before{--sa-p:100%}
.sa-k-row:active::before{transition-duration:.12s}
.sa-k-row:focus-visible::after{transform:scaleX(1)}
.sa-k-row:focus-visible .sa-k-cat,.sa-k-row:active .sa-k-cat,.sa-k-row:focus-visible .sa-k-note,.sa-k-row:active .sa-k-note{color:rgba(255,253,247,.9)}
.sa-k-row:focus-visible .sa-k-arrow,.sa-k-row:active .sa-k-arrow{background:var(--sa-paper);color:var(--sa-ink);border-color:var(--sa-paper)}
.sa-k-row:focus-visible .sa-k-arrow svg{transform:rotate(0) translateX(2px)}
.sa-k-row[data-dir="down"]:focus-visible .sa-k-arrow svg{transform:rotate(90deg) translateX(3px)}
.sa-k-row:focus-visible .sa-k-label{transform:translateX(14px)}
.sa-k-row:active{transform:translateY(2px) scale(.994);transition-duration:.07s}
.sa-k-row:active .sa-k-arrow svg{transform:rotate(0) translateX(5px)}
@media (hover:hover){
  .sa-k-row:hover{color:var(--sa-paper)}
  .sa-k-row:hover::before{--sa-p:100%}
  .sa-k-row:hover::after{transform:scaleX(1)}
  .sa-k-row:hover .sa-k-cat,.sa-k-row:hover .sa-k-note{color:rgba(255,253,247,.9)}
  .sa-k-row:hover .sa-k-arrow{background:var(--sa-paper);color:var(--sa-ink);border-color:var(--sa-paper)}
  .sa-k-row:hover .sa-k-arrow svg{transform:rotate(0) translateX(2px)}
  .sa-k-row[data-dir="down"]:hover .sa-k-arrow svg{transform:rotate(90deg) translateX(3px)}
  .sa-k-row:hover .sa-k-label{transform:translateX(14px)}
  .sa-k-row:active .sa-k-arrow svg{transform:rotate(0) translateX(5px)}
}
.sa-k-row.is-hero .sa-visit{stroke:transparent}
.sa-k-row.is-hero:visited .sa-visit{stroke:#fffdf7}
.sa-k-sub{display:grid;grid-template-columns:160px minmax(0,1fr);column-gap:24px;padding:20px 0 6px}
.sa-k-subcat{font:500 12px/44px var(--mono);letter-spacing:.2em;color:var(--sa-soft)}
.sa-k-sublist{display:flex;flex-wrap:wrap;gap:0 30px}
.sa-k-sublink{
  display:inline-flex;align-items:center;gap:8px;min-height:48px;font:400 14px/1.5 var(--body);letter-spacing:.02em;color:var(--sa-ink);
  text-decoration:underline;text-decoration-color:rgba(20,17,13,.3);text-decoration-thickness:1px;text-underline-offset:6px;
  transition:color .25s ease,text-decoration-color .25s ease;
}
.sa-k-sublink svg{width:15px;height:15px;transform:rotate(-45deg);transition:transform .5s var(--sa-ease)}
.sa-k-sublink.is-in svg{transform:none}
@media (hover:hover){
  .sa-k-sublink:hover{color:var(--sa-red);text-decoration-color:var(--sa-red)}
  .sa-k-sublink:hover svg{transform:rotate(0) translateX(3px)}
}
.sa-k-sublink:active{color:var(--sa-red)}
.sa-k-share{display:grid;grid-template-columns:160px minmax(0,1fr);column-gap:24px;margin-top:14px;padding-top:22px;border-top:1px solid var(--sa-line)}
.sa-k-sharecat{font:500 12px/48px var(--mono);letter-spacing:.2em;color:var(--sa-soft)}
.sa-k-sharebtns{display:flex;flex-wrap:wrap;gap:10px}
.sa-k-sb{
  position:relative;display:inline-flex;align-items:center;gap:9px;min-height:48px;padding:0 18px;border:1px solid var(--sa-rule);
  color:var(--sa-ink);font:500 14px/1 var(--body);letter-spacing:.04em;overflow:hidden;isolation:isolate;text-decoration:none;
  transition:color .25s ease,transform .1s ease,border-color .25s ease;
}
.sa-k-sb::before{content:"";position:absolute;inset:0;background:var(--sa-ink);transform:scaleX(0);transform-origin:0 50%;transition:transform .5s var(--sa-ease);z-index:-1}
.sa-k-sb svg{width:19px;height:19px;flex:none}
.sa-k-sb:focus-visible{color:var(--sa-paper);border-color:var(--sa-ink)}
.sa-k-sb:focus-visible::before,.sa-k-sb:active::before{transform:scaleX(1)}
.sa-k-sb:active{color:var(--sa-paper);transform:translateY(1px) scale(.98)}
@media (hover:hover){
  .sa-k-sb:hover{color:var(--sa-paper);border-color:var(--sa-ink)}
  .sa-k-sb:hover::before{transform:scaleX(1)}
}
.sa-k-sb.is-done{border-color:var(--sa-green);color:var(--sa-green)}
.sa[data-enter="pre"] .sa-k-li,.sa[data-enter="pre"] .sa-k-sub,.sa[data-enter="pre"] .sa-k-share{opacity:0;transform:translateY(18px)}
.sa[data-enter="in"] .sa-k-li,.sa[data-enter="in"] .sa-k-sub,.sa[data-enter="in"] .sa-k-share{
  transition:opacity .8s var(--sa-ease) calc(var(--i,0)*70ms),transform .9s var(--sa-ease) calc(var(--i,0)*70ms);
}
@media (max-width:1024px){
  .sa-k-row{margin:0 -16px;padding-left:16px;padding-right:16px}
  .sa-k-row::after{left:16px;right:16px}
}
@media (max-width:768px){
  .sa{margin-top:40px}
  .sa-k-row{
    grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"cat arrow" "label arrow" "note arrow";row-gap:4px;column-gap:14px;
    min-height:84px;margin:0 -14px;padding:14px;
  }
  .sa-k-row::after{left:14px;right:14px}
  .sa-k-cat{grid-area:cat}
  .sa-k-label{grid-area:label}
  .sa-k-note{grid-area:note;justify-self:start;max-width:100%;text-align:left}
  .sa-k-arrow{grid-area:arrow;width:46px;height:46px}
  .sa-k-label{font-size:clamp(24px,6.6vw,30px)}
  .sa-k-row.is-hero{min-height:96px}
  .sa-k-row.is-hero .sa-k-label{font-size:clamp(28px,8vw,36px)}
  .sa-k-sub,.sa-k-share{grid-template-columns:1fr;padding-top:16px}
  .sa-k-subcat,.sa-k-sharecat{line-height:1;margin-bottom:8px}
  .sa-k-sublist{gap:0 22px}
  .sa-k-sharebtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .sa-k-sb{justify-content:center}
  .sa-k-sb{padding:0 14px;min-height:48px}
}
@media (prefers-reduced-motion:reduce){
  .sa[data-enter="pre"] .sa-k-li,.sa[data-enter="pre"] .sa-k-sub,.sa[data-enter="pre"] .sa-k-share{opacity:1;transform:none}
  .sa-k-row::before{--sa-p:100%;transition:opacity .2s ease;opacity:0}
  .sa-k-row::after{transform:none;opacity:0;transition:opacity .2s ease}
  .sa-k-row:hover::before,.sa-k-row:focus-visible::before,.sa-k-row:active::before{opacity:1}
  .sa-k-row:hover::after,.sa-k-row:focus-visible::after{opacity:1}
}
`;

/* ============================== 案2 印 IN ============================== */
export const CSS_IN = String.raw`
.sa-i-grid{display:grid;grid-template-columns:repeat(var(--n,5),minmax(150px,230px));gap:44px 0;justify-content:start}
.sa-i-grid.is-spread{grid-template-columns:repeat(var(--n,5),minmax(0,1fr))}
.sa-i-li{position:relative;display:flex;justify-content:center}
.sa-i-li::before{content:"";position:absolute;left:0;right:0;top:68px;height:1px;background:var(--sa-line)}
.sa-i-cell{position:relative;z-index:1;width:150px}
.sa-i-cell{
  --mx:0px;--my:0px;display:flex;flex-direction:column;align-items:center;gap:18px;color:var(--sa-ink);text-decoration:none;
  transform:translate3d(var(--mx),var(--my),0);outline:none;
}
.sa-i-wrap{position:relative;display:grid;place-items:center;width:136px;height:136px;transition:transform .55s var(--sa-ease)}
.sa-i-disc{
  --d:120px;position:relative;display:grid;place-items:center;width:var(--d);height:var(--d);border-radius:50%;box-shadow:inset 0 0 0 1px var(--sa-rule);
  background:var(--sa-bg);isolation:isolate;color:var(--sa-ink);transition:color .3s ease,box-shadow .3s ease;
}
.sa-i-disc::before{content:"";position:absolute;inset:0;border-radius:50%;background:var(--sa-ink);transform:scale(0);transform-origin:var(--ox,50%) var(--oy,50%);transition:transform .7s var(--sa-ease);z-index:-1}
.sa-i-disc::after{content:"";position:absolute;inset:15%;border-radius:50%;box-shadow:inset 0 0 0 1px currentColor;opacity:.26;transition:opacity .3s ease}
.sa-i-cell.is-hero .sa-i-disc{background:radial-gradient(circle at 32% 26%,rgba(255,255,255,.18),rgba(255,255,255,0) 58%),var(--sa-red);color:var(--sa-paper);box-shadow:none}
.sa-i-halo{position:absolute;inset:-7px;border-radius:50%;border:1px solid var(--sa-red);opacity:.7;pointer-events:none;transition:inset .6s var(--sa-ease),opacity .4s ease}
@media (hover:hover){.sa-i-cell:hover .sa-i-halo{inset:-11px;opacity:.35}}
.sa-i-cell:focus-visible .sa-i-halo{inset:-11px;opacity:.35}
@media (min-width:769px){.sa-i-cell.is-hero .sa-i-disc{--d:136px}}
.sa-i-cell.is-hero .sa-i-disc::after{opacity:.6}
.sa-i-r1{position:absolute;inset:0;pointer-events:none}
.sa-i-ring{display:block;width:100%;height:100%;animation:sa-i-spin 20s linear infinite;animation-play-state:paused}
.sa-i-rt{font:500 11px/1 var(--mono,monospace);fill:currentColor}
.sa-i-ico{position:relative;transition:transform .6s var(--sa-ease)}
.sa-i-rip{position:absolute;inset:0;border-radius:50%;border:2px solid var(--sa-red);opacity:0;pointer-events:none}
.sa-i-rip.is-go{animation:sa-i-ink .9s var(--sa-ease) both}
.sa-i-go{position:absolute;right:-2px;top:-2px;z-index:2;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--sa-ink);color:var(--sa-paper);box-shadow:0 0 0 3px var(--sa-bg);transition:background-color .35s ease,transform .5s var(--sa-ease)}
.sa-i-go svg{width:14px;height:14px;transform:rotate(-45deg);transition:transform .6s var(--sa-ease)}
.sa-i-cell[data-dir="down"] .sa-i-go svg{transform:rotate(90deg)}
.sa-i-cell:focus-visible .sa-i-go,.sa-i-cell:active .sa-i-go{background:var(--sa-red)}
.sa-i-cell:focus-visible .sa-i-go svg{transform:rotate(0)}
@media (hover:hover){.sa-i-cell:hover .sa-i-go{background:var(--sa-red)}.sa-i-cell:hover .sa-i-go svg{transform:rotate(0)}.sa-i-cell[data-dir="down"]:hover .sa-i-go svg{transform:rotate(90deg) translateX(2px)}}
.sa-i-vis{position:absolute;right:1px;bottom:1px;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background-color:transparent;box-shadow:0 0 0 0 transparent}
.sa-i-vis svg{stroke:transparent}
a:visited .sa-i-vis{background-color:#0a5c3e}
a:visited .sa-i-vis svg{stroke:#fffdf7}
.sa-i-cap{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:100%;text-align:center}
.sa-i-label{font:500 17px/1.35 var(--serif);letter-spacing:.04em;word-break:keep-all;overflow-wrap:break-word}
.sa-i-note{
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;max-width:100%;
  font:400 12.5px/1.5 var(--mono,monospace);letter-spacing:.01em;color:var(--sa-soft);overflow-wrap:anywhere;
}
.sa-i-cell:focus-visible .sa-i-disc{outline:3px solid var(--sa-ink);outline-offset:6px}
.sa-i-cell:focus-visible .sa-i-disc,.sa-i-cell:active .sa-i-disc{color:var(--sa-paper);box-shadow:inset 0 0 0 1px var(--sa-ink)}
.sa-i-cell:focus-visible .sa-i-disc::before,.sa-i-cell:active .sa-i-disc::before{transform:scale(1.02)}
.sa-i-cell:focus-visible .sa-i-ring{animation-play-state:running}
.sa-i-cell:focus-visible .sa-i-ico{transform:scale(1.1)}
.sa-i-cell:active .sa-i-wrap{transform:scale(.9);transition-duration:.08s}
@media (hover:hover){
  .sa-i-cell:hover .sa-i-disc{color:var(--sa-paper);box-shadow:inset 0 0 0 1px var(--sa-ink)}
  .sa-i-cell:hover .sa-i-disc::before{transform:scale(1.02)}
  .sa-i-cell:hover .sa-i-ring{animation-play-state:running}
  .sa-i-cell:hover .sa-i-ico{transform:scale(1.1)}
}
.sa-i-sub{display:flex;flex-wrap:wrap;gap:0 30px;margin-top:40px;padding-top:12px;border-top:1px solid var(--sa-line)}
.sa-i-sublink{
  display:inline-flex;align-items:center;gap:8px;min-height:48px;font:400 14px/1.5 var(--body);letter-spacing:.02em;color:var(--sa-ink);
  text-decoration:underline;text-decoration-color:rgba(20,17,13,.3);text-decoration-thickness:1px;text-underline-offset:6px;
  transition:color .25s ease,text-decoration-color .25s ease;
}
.sa-i-sublink-a{display:inline-block;transition:transform .45s var(--sa-ease)}
.sa-i-sublink-a svg{display:block;width:15px;height:15px;transform:rotate(-45deg)}
.sa-i-sublink.is-in .sa-i-sublink-a svg{transform:none}
@media (hover:hover){
  .sa-i-sublink:hover{color:var(--sa-red);text-decoration-color:var(--sa-red)}
  .sa-i-sublink:hover .sa-i-sublink-a{transform:translateX(3px)}
}
.sa-i-sublink:active{color:var(--sa-red)}
.sa-i-share{display:flex;flex-wrap:wrap;align-items:center;gap:8px 22px;margin-top:20px;padding-top:20px;border-top:1px solid var(--sa-line)}
.sa-i-sharecap{font:500 12px/1 var(--mono,monospace);letter-spacing:.2em;color:var(--sa-soft)}
.sa-i-sharerow{display:flex;gap:12px}
.sa-i-sd{
  position:relative;display:grid;place-items:center;width:56px;height:56px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--sa-rule);
  color:var(--sa-ink);isolation:isolate;transition:color .3s ease,box-shadow .3s ease,transform .1s ease;
}
.sa-i-sd::before{content:"";position:absolute;inset:0;border-radius:50%;background:var(--sa-ink);transform:scale(0);transform-origin:var(--ox,50%) var(--oy,50%);transition:transform .6s var(--sa-ease);z-index:-1}
.sa-i-sd:focus-visible{outline:3px solid var(--sa-ink);outline-offset:4px;color:var(--sa-paper)}
.sa-i-sd:focus-visible::before,.sa-i-sd:active::before{transform:scale(1.02)}
.sa-i-sd:active{color:var(--sa-paper);transform:scale(.9)}
@media (hover:hover){
  .sa-i-sd:hover{color:var(--sa-paper);box-shadow:inset 0 0 0 1px var(--sa-ink)}
  .sa-i-sd:hover::before{transform:scale(1.02)}
}
.sa-i-sd.is-done{color:var(--sa-green);box-shadow:inset 0 0 0 1.5px var(--sa-green)}
.sa-i-share .sa-share-msg,.sa-i-share .sa-share-url{flex:1 0 100%;margin-top:0}
.sa-i-share .sa-share-msg{min-height:1.2em}
@keyframes sa-i-spin{to{transform:rotate(360deg)}}
@keyframes sa-i-turn{from{transform:rotate(-250deg);opacity:0}to{transform:rotate(0);opacity:1}}
@keyframes sa-i-ink{0%{transform:scale(1);opacity:.75;border-width:3px}100%{transform:scale(1.8);opacity:0;border-width:.5px}}
.sa[data-enter="pre"] .sa-i-li{opacity:0;transform:scale(.78) translateY(14px)}
.sa[data-enter="pre"] .sa-i-sub,.sa[data-enter="pre"] .sa-i-share{opacity:0;transform:translateY(14px)}
.sa[data-enter="in"] .sa-i-li,.sa[data-enter="in"] .sa-i-sub,.sa[data-enter="in"] .sa-i-share{
  transition:opacity .7s var(--sa-ease) calc(var(--i,0)*70ms),transform .9s var(--sa-ease) calc(var(--i,0)*70ms);
}
.sa[data-enter="in"] .sa-i-r1{animation:sa-i-turn 2s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(var(--i,0)*70ms + 140ms)}
@media (max-width:768px){
  .sa-i-grid,.sa-i-grid.is-spread{grid-template-columns:repeat(3,minmax(0,1fr));gap:30px 0;justify-content:stretch}
  .sa-i-li::before{top:48px}
  .sa-i-cell{width:100%}
  .sa-i-wrap{width:96px;height:96px}
  .sa-i-disc,.sa-i-cell.is-hero .sa-i-disc{--d:96px}
  .sa-i-ico{width:26px;height:26px}
  .sa-i-label{font-size:15px}
  .sa-i-sub{margin-top:32px}
}
@media (prefers-reduced-motion:reduce){
  .sa[data-enter="pre"] .sa-i-li,.sa[data-enter="pre"] .sa-i-sub,.sa[data-enter="pre"] .sa-i-share{opacity:1;transform:none}
  .sa-i-ring{animation:none}
  .sa-i-cell:active .sa-i-wrap{transform:none}
}
`;

/* ============================== 案3 箱 HAKO ============================== */
export const CSS_HAKO = String.raw`
.sa-h-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:22px}
.sa-h-title{margin:0;font:500 clamp(32px,3.6vw,50px)/1.1 var(--serif);letter-spacing:-.01em}
.sa-h-title em{font-style:italic;color:var(--sa-red);font-weight:500}
.sa-h-board{
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(184px,auto);grid-auto-flow:row dense;
  gap:1px;background:var(--sa-line);border:1px solid var(--sa-line);grid-template-rows:var(--rows,none);
}
.sa-h-t{grid-column:span var(--c,1);grid-row:span var(--r,1);min-width:0;background:var(--sa-paper)}
.sa-h-tile{
  position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 1fr;gap:14px;height:100%;padding:26px;
  color:var(--sa-ink);text-decoration:none;isolation:isolate;overflow:hidden;transition:transform .16s var(--sa-ease),color .3s ease;
}
.sa-h-tile::before{content:"";position:absolute;inset:0;background:var(--sa-ink);clip-path:circle(0% at 100% 0%);transition:clip-path .8s var(--sa-ease);z-index:-1}
.sa-h-hero .sa-h-tile{background:var(--sa-red);color:var(--sa-paper)}
.sa-h-wm{position:absolute;right:-18px;bottom:-26px;width:260px;height:260px;opacity:.13;stroke-width:1;pointer-events:none;z-index:-1;transition:opacity .4s ease}
.sa-h-tile:hover .sa-h-wm{opacity:.18}
.sa-h-ico{grid-column:1;grid-row:1;display:flex;align-items:center;gap:10px;align-self:start}
.sa-h-go{grid-column:2;grid-row:1;position:relative;width:34px;height:34px;overflow:hidden}
.sa-h-arr{position:absolute;inset:0;display:grid;place-items:center;transition:transform .6s var(--sa-ease)}
.sa-h-arr svg{width:26px;height:26px;transform:rotate(-45deg)}
.sa-h-a2{transform:translate(-115%,115%)}
.sa-h-tile[data-dir="down"] .sa-h-arr svg{transform:rotate(90deg)}
.sa-h-tile[data-dir="down"] .sa-h-a2{transform:translate(0,-115%)}
.sa-h-tile[data-dir="down"]:focus-visible .sa-h-a1,.sa-h-tile[data-dir="down"]:active .sa-h-a1{transform:translate(0,115%)}
.sa-h-body{grid-column:1 / -1;grid-row:2;align-self:end;display:flex;flex-direction:column;gap:7px;min-width:0}
.sa-h-label{font:500 clamp(20px,1.75vw,25px)/1.3 var(--serif);letter-spacing:.02em;word-break:keep-all;overflow-wrap:break-word}
.sa-h-note{font:400 13px/1.55 var(--mono,monospace);letter-spacing:.02em;color:var(--sa-soft);overflow-wrap:anywhere;word-break:break-all;transition:color .3s ease}
.sa-h-coord{display:flex;flex-wrap:wrap;gap:0 14px;font:500 12px/1.5 var(--mono,monospace);letter-spacing:.1em;color:var(--sa-soft);transition:color .3s ease}
.sa-h-coord span{white-space:nowrap}
.sa-h-hero .sa-h-label{font-size:clamp(48px,6.2vw,88px);line-height:1.04;letter-spacing:.01em}
.sa-h-hero .sa-h-label.is-long{font-size:clamp(34px,4.3vw,62px);line-height:1.12}
.sa-h-hero .sa-h-note{font:500 clamp(18px,2vw,27px)/1.4 var(--mono,monospace);letter-spacing:.06em;color:var(--sa-paper)}
.sa-h-tile:focus-visible{outline:3px solid var(--sa-red);outline-offset:-8px}
.sa-h-tile:focus-visible,.sa-h-tile:active{color:var(--sa-paper)}
.sa-h-tile:focus-visible::before,.sa-h-tile:active::before{clip-path:circle(160% at 100% 0%)}
.sa-h-tile:focus-visible .sa-h-note,.sa-h-tile:focus-visible .sa-h-coord,.sa-h-tile:active .sa-h-note,.sa-h-tile:active .sa-h-coord{color:rgba(255,253,247,.9)}
.sa-h-tile:focus-visible .sa-h-a1,.sa-h-tile:active .sa-h-a1{transform:translate(115%,-115%)}
.sa-h-tile:focus-visible .sa-h-a2,.sa-h-tile:active .sa-h-a2{transform:none;transition-delay:.06s}
.sa-h-tile:active{transform:scale(.985);transition-duration:.07s}
@media (hover:hover){
  .sa-h-tile:hover{color:var(--sa-paper)}
  .sa-h-tile:hover::before{clip-path:circle(160% at 100% 0%)}
  .sa-h-tile:hover .sa-h-note,.sa-h-tile:hover .sa-h-coord{color:rgba(255,253,247,.9)}
  .sa-h-tile:hover .sa-h-a1{transform:translate(115%,-115%)}
  .sa-h-tile[data-dir="down"]:hover .sa-h-a1{transform:translate(0,115%)}
  .sa-h-tile:hover .sa-h-a2{transform:none;transition-delay:.06s}
}
.sa-h-hero .sa-visit{stroke:transparent}
.sa-h-hero a:visited .sa-visit{stroke:#fffdf7}
.sa-h-share{background:var(--sa-paper)}
.sa-h-sharebox{display:flex;flex-direction:column;justify-content:space-between;gap:14px;height:100%;padding:26px}
.sa-h-sharecap{font:500 12px/1 var(--mono,monospace);letter-spacing:.2em;color:var(--sa-soft)}
.sa-h-share.is-strip .sa-h-sharebox{flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:10px 28px;padding:18px 26px}
.sa-h-share.is-strip .sa-share-msg{flex:1 0 100%;min-height:0}
.sa-h-sharebtns{display:flex;flex-wrap:wrap;gap:8px}
.sa-h-sb{
  position:relative;display:grid;place-items:center;width:48px;height:48px;border:1px solid var(--sa-rule);color:var(--sa-ink);
  isolation:isolate;overflow:hidden;transition:color .25s ease,border-color .25s ease,transform .1s ease;
}
.sa-h-sb::before{content:"";position:absolute;inset:0;background:var(--sa-ink);clip-path:circle(0% at 100% 0%);transition:clip-path .6s var(--sa-ease);z-index:-1}
.sa-h-sb:focus-visible{outline:3px solid var(--sa-ink);outline-offset:3px;color:var(--sa-paper)}
.sa-h-sb:focus-visible::before,.sa-h-sb:active::before{clip-path:circle(160% at 100% 0%)}
.sa-h-sb:active{color:var(--sa-paper);transform:scale(.94)}
@media (hover:hover){
  .sa-h-sb:hover{color:var(--sa-paper);border-color:var(--sa-ink)}
  .sa-h-sb:hover::before{clip-path:circle(160% at 100% 0%)}
}
.sa-h-sb.is-done{color:var(--sa-green);border-color:var(--sa-green)}
.sa-h-sharebox .sa-share-msg{margin:0;min-height:1.4em}
.sa-h-sub{display:flex;flex-wrap:wrap;gap:0 30px;margin-top:14px}
.sa-h-sublink{
  display:inline-flex;align-items:center;gap:8px;min-height:48px;font:400 14px/1.5 var(--body);letter-spacing:.02em;color:var(--sa-ink);
  text-decoration:underline;text-decoration-color:rgba(20,17,13,.3);text-decoration-thickness:1px;text-underline-offset:6px;
  transition:color .25s ease,text-decoration-color .25s ease;
}
.sa-h-sublink-a{display:inline-block;transition:transform .45s var(--sa-ease)}
.sa-h-sublink-a svg{display:block;width:15px;height:15px;transform:rotate(-45deg)}
.sa-h-sublink.is-in .sa-h-sublink-a svg{transform:none}
@media (hover:hover){
  .sa-h-sublink:hover{color:var(--sa-red);text-decoration-color:var(--sa-red)}
  .sa-h-sublink:hover .sa-h-sublink-a{transform:translateX(3px)}
}
.sa-h-sublink:active{color:var(--sa-red)}
.sa[data-enter="pre"] .sa-h-t,.sa[data-enter="pre"] .sa-h-sub{opacity:0;transform:translateY(18px)}
.sa[data-enter="in"] .sa-h-t,.sa[data-enter="in"] .sa-h-sub{transition:opacity .8s var(--sa-ease) calc(var(--i,0)*60ms),transform .9s var(--sa-ease) calc(var(--i,0)*60ms)}
/* スマホ下の固定の行動バー（PC では出さない） */
.sa-h-bar{display:none}
@media (max-width:768px){
  .sa-h-bar{
    display:block;position:fixed;left:0;right:0;bottom:0;z-index:70;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));
    background:rgba(250,248,243,.94);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-top:1px solid var(--sa-line);
    transform:translateY(105%);visibility:hidden;transition:transform .5s var(--sa-ease),visibility 0s linear .5s;
  }
  .sa-h-bar[data-show="1"]{transform:none;visibility:visible;transition:transform .5s var(--sa-ease),visibility 0s}
  .sa-h-bar ul{display:flex;gap:8px;margin:0;padding:0;list-style:none}
  .sa-h-bar li{flex:1 1 0;min-width:0}
  .sa-h-bar li.is-hero{flex:1.25 1 0}
  .sa-h-bi{
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:58px;padding:6px 6px;border:1px solid var(--sa-rule);
    color:var(--sa-ink);font:500 12px/1.2 var(--body);letter-spacing:.04em;text-decoration:none;-webkit-tap-highlight-color:transparent;
    transition:transform .1s ease,background-color .2s ease,color .2s ease;
  }
  .sa-h-bi span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sa-h-bi svg{flex:none}
  .sa-h-bi.is-hero{background:var(--sa-red);border-color:var(--sa-red);color:var(--sa-paper)}
  .sa-h-bi:active{transform:scale(.96);background:var(--sa-ink);border-color:var(--sa-ink);color:var(--sa-paper)}
  .sa-h-bi:focus-visible{outline:3px solid var(--sa-ink);outline-offset:2px}
  body:has(.sa-h-bar) .feat-page > footer{padding-bottom:calc(30px + 82px + env(safe-area-inset-bottom,0px))}
  html:has(.sa-h-bar){scroll-padding-bottom:92px}
  .sa-h-board{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:auto;grid-template-rows:none}
  .sa-h-t:not(.sa-h-share){min-height:136px}
  .sa-h-t{grid-column:span 1;grid-row:span 1}
  .sa-h-t.sa-h-hero,.sa-h-t.sa-h-share,.sa-h-t.sa-h-w2{grid-column:span 2}
  .sa-h-hero{min-height:230px}
  .sa-h-wm{width:200px;height:200px;right:-14px;bottom:-20px}
  .sa-h-tile{padding:18px}
  .sa-h-sharebox{padding:18px}
  .sa-h-label{font-size:19px}
  .sa-h-hero .sa-h-label{font-size:clamp(44px,13.5vw,60px)}
  .sa-h-hero .sa-h-label.is-long{font-size:clamp(34px,10vw,44px)}
  .sa-h-hero .sa-h-note{font-size:19px}
  .sa-h-title{font-size:clamp(32px,9vw,40px)}
}
@media (prefers-reduced-motion:reduce){
  .sa[data-enter="pre"] .sa-h-t,.sa[data-enter="pre"] .sa-h-sub{opacity:1;transform:none}
  .sa-h-bar,.sa-h-bar[data-show="1"]{transition:none}
  .sa-h-tile::before,.sa-h-sb::before{clip-path:none;opacity:0;transition:opacity .2s ease}
  .sa-h-tile:hover::before,.sa-h-tile:focus-visible::before,.sa-h-tile:active::before,.sa-h-sb:hover::before,.sa-h-sb:focus-visible::before,.sa-h-sb:active::before{clip-path:none;opacity:1}
  .sa-h-arr{transition:none}
}
`;
