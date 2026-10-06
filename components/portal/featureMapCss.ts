/**
 * 特集記事の「店を地図でまとめて見る」（巡り図・components/portal/FeatureMap.tsx）の CSS。
 * 公開スイッチ ON のときだけ、部品が <style href="fm-base" precedence="fm"> で出す。app/globals.css は変えない。
 * 色・書体は globals.css の変数（--ink --paper --accent --serif --mono …）。値が無い環境のために既定値を持つ。
 * 接頭辞 .fm-
 */
export const CSS = `
.fm{--fm-ink:var(--ink,#14110d);--fm-ink2:var(--ink-soft,#3a342b);--fm-mute:#6b6256;--fm-paper:var(--paper,#fffdf7);--fm-bg:var(--bg,#faf8f3);--fm-bg2:var(--bg-2,#f2ede2);--fm-line:var(--line,#d9d1bf);--fm-red:var(--accent,#c7472a);--fm-redt:#b43d22;--fm-ease:cubic-bezier(.19,1,.22,1);
  --fm-serif:var(--serif,"Shippori Mincho B1","Hiragino Mincho ProN",serif);--fm-mono:var(--mono,"JetBrains Mono",ui-monospace,monospace);--fm-sans:var(--body,"Noto Sans JP",sans-serif);
  margin:0 0 clamp(64px,8vw,104px);color:var(--fm-ink)}
.fm *,.fm *::before,.fm *::after{box-sizing:border-box}
.fm a{color:inherit;text-decoration:none}
.fm button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;appearance:none;-webkit-tap-highlight-color:transparent}

/* 見出し（記事の見出し .article-head と同じ組み） */
.fm-head{display:grid;grid-template-columns:1fr 3fr;gap:40px;padding-bottom:40px;border-top:1px solid var(--fm-ink);padding-top:32px}
.fm-kick{font:500 11px/1 var(--fm-mono);letter-spacing:.3em;color:var(--fm-ink2)}
.fm-big{display:block;margin-top:8px;font:700 72px/1 var(--fm-serif);color:var(--fm-ink);letter-spacing:-.02em}
.fm-h{margin:0;font:500 clamp(30px,3.8vw,56px)/1.08 var(--fm-serif);letter-spacing:-.02em}
.fm-h em{font-style:italic;color:var(--fm-red)}
.fm-sub{margin-top:18px;max-width:640px;font:400 14.5px/1.95 var(--fm-sans);color:var(--fm-ink2);text-wrap:pretty}
.fm-sub b{font-weight:600;color:var(--fm-ink)}

.fm-body{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(300px,1fr);gap:clamp(28px,3.2vw,48px);align-items:start}
.fm-left{min-width:0}
@media (min-width:901px) and (min-height:820px){.fm-left{position:sticky;top:84px}}

/* 図の中の「もう一度」 */
.fm-replay{position:absolute;z-index:2;left:14px;top:14px;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 20px 0 16px;border:1px solid var(--fm-ink);font:500 13.5px/1 var(--fm-sans);letter-spacing:.06em;cursor:pointer;
  background:linear-gradient(var(--fm-ink),var(--fm-ink)) no-repeat left center/0% 100%,rgba(255,253,247,.92);transition:background-size .55s var(--fm-ease),color .3s,transform .25s var(--fm-ease)}
.fm-replay svg{display:block;flex:none;transition:transform .7s var(--fm-ease)}
.fm-replay:active{transform:scale(.97)}
.fm-replay:focus-visible,.fm-pick:focus-visible,.fm-btn:focus-visible,.fm-go:focus-visible,.fm-aside a:focus-visible{outline:3px solid var(--fm-ink);outline-offset:3px}
@media (hover:hover){.fm-replay:hover{background-size:100% 100%;color:var(--fm-paper)} .fm-replay:hover svg{transform:rotate(-200deg)}}

/* 図（紙の上の略図。実際の地図は使わない） */
.fm-frame{position:relative;min-height:380px;border:1px solid var(--fm-ink);background:var(--fm-paper);overflow:hidden;touch-action:manipulation}
.fm-frame::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 40%,transparent 55%,rgba(20,17,13,.045) 100%)}
.fm-svg{display:block;width:100%;height:auto;opacity:0;transition:opacity .8s var(--fm-ease);user-select:none;-webkit-user-select:none}
.fm-frame[data-ready="1"] .fm-svg{opacity:1}
.fm-grid line{stroke:rgba(20,17,13,.085);stroke-width:1}
.fm-cross{fill:none;stroke:var(--fm-red);stroke-opacity:.42;stroke-width:1}
.fm-rule{fill:none;stroke:rgba(20,17,13,.32);stroke-width:1}
.fm-st rect{fill:var(--fm-paper);stroke:var(--fm-ink2);stroke-width:1.3}
.fm-st-t,.fm-leglab,.fm-ringlab,.fm-lab{paint-order:stroke;stroke:var(--fm-paper);stroke-width:4.5px;stroke-linejoin:round}
.fm-st-t{font:500 12px var(--fm-sans);fill:var(--fm-ink2)}
.fm-ring{fill:none;stroke:rgba(20,17,13,.34);stroke-width:1;stroke-dasharray:2 5;transform-box:fill-box;transform-origin:center}
.fm-ringlab{font:500 12px var(--fm-mono);fill:var(--fm-ink2)}
.fm-ray{fill:none;stroke:var(--fm-ink);stroke-opacity:.6;stroke-width:1.1;stroke-dasharray:1 1}
.fm-bleed{fill:none;stroke:var(--fm-red);stroke-opacity:.15;stroke-width:10;stroke-linejoin:round;stroke-dasharray:1 1}
.fm-route{fill:none;stroke:var(--fm-ink);stroke-width:2.2;stroke-linejoin:round;stroke-dasharray:1 1}
.fm-chev{fill:var(--fm-ink)}
.fm-leglab{font:500 12px var(--fm-mono);fill:var(--fm-ink);stroke:none}
.fm-pill{fill:var(--fm-paper);stroke:rgba(20,17,13,.42);stroke-width:1}
.fm [data-leg]{transition:opacity .45s var(--fm-ease)}
.fm [data-leg][data-done="0"]{opacity:0}
.fm-anchor{fill:var(--fm-ink)}
.fm-leader{stroke:var(--fm-ink);stroke-opacity:.55;stroke-width:1}
.fm-pt{cursor:pointer;outline:none}
.fm-hit{fill:transparent}
.fm-ping{fill:none;stroke:var(--fm-red);stroke-width:1.6;opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.72);transition:opacity .25s,transform .55s var(--fm-ease)}
.fm-pt[data-hover="1"] .fm-ping,.fm-pt[data-sel="1"] .fm-ping{opacity:1;transform:none}
.fm-startring{fill:none;stroke:var(--fm-ink);stroke-width:1.2}
.fm-stamp{transform-box:fill-box;transform-origin:center}
.fm-disc{fill:var(--fm-paper);stroke:var(--fm-ink);stroke-width:1.6;transition:fill .35s,stroke .35s}
.fm-num{font:700 15px var(--fm-serif);fill:var(--fm-ink);text-anchor:middle;transition:fill .35s;pointer-events:none}
.fm [data-reached="1"] > .fm-stamp .fm-disc{fill:var(--fm-red);stroke:var(--fm-red)}
.fm [data-reached="1"] > .fm-stamp .fm-num{fill:var(--fm-paper)}
.fm [data-reached="1"] > .fm-stamp{animation:fm-stamp .55s var(--fm-ease) both}
@keyframes fm-stamp{0%{transform:scale(1.9) rotate(-16deg);opacity:0}45%{opacity:1}72%{transform:scale(.92) rotate(2deg)}100%{transform:none;opacity:1}}
.fm-lab{font:600 13px var(--fm-serif);fill:var(--fm-ink);pointer-events:none;transition:fill .25s}
.fm-lab[data-on="1"]{fill:var(--fm-redt)}
.fm-flag{pointer-events:none}
.fm-flag rect{fill:var(--fm-red)}
.fm-flag text{font:700 11px var(--fm-sans);letter-spacing:.12em;fill:var(--fm-paper);text-anchor:middle}
.fm-north{transform-box:fill-box;transform-origin:50% 60%}
.fm[data-seen="1"] .fm-north{animation:fm-swing 1.3s var(--fm-ease) .2s both}
@keyframes fm-swing{0%{transform:rotate(-26deg)}35%{transform:rotate(11deg)}60%{transform:rotate(-5deg)}100%{transform:none}}
.fm[data-seen="1"] .fm-big{animation:fm-seal .7s var(--fm-ease) both}
@keyframes fm-seal{0%{transform:scale(1.55) rotate(-8deg);opacity:0;color:var(--fm-red)}50%{opacity:1}100%{transform:none;color:var(--fm-ink)}}
.fm-big{transform-origin:left center}
.fm-north path{fill:var(--fm-red)}
.fm-north line{stroke:var(--fm-ink);stroke-width:1.2}
.fm-north text{font:700 14px var(--fm-serif);fill:var(--fm-ink);text-anchor:middle}
.fm-scale line{stroke:var(--fm-ink);stroke-width:1.5}
.fm-scale text{font:500 12px var(--fm-mono);fill:var(--fm-ink2);paint-order:stroke;stroke:var(--fm-paper);stroke-width:4px}
.fm-walker{opacity:0;pointer-events:none}
.fm-walker .g{fill:var(--fm-red);opacity:.2}
.fm-walker .c{fill:var(--fm-red)}
.fm-note{margin-top:16px;font:400 12.5px/1.85 var(--fm-sans);color:var(--fm-ink2);text-wrap:pretty}
.fm-note b{font-weight:600;color:var(--fm-ink)}

/* 順路をたどるつまみ */
.fm-scrub{display:flex;align-items:center;gap:16px;margin-top:6px;min-height:48px}
.fm-scrub label{flex:none;font:500 11px/1 var(--fm-mono);letter-spacing:.2em;color:var(--fm-ink2)}
.fm-rangewrap{position:relative;flex:1;min-width:0;height:48px}
.fm-range{position:absolute;inset:0;width:100%;height:48px;margin:0;background:transparent;appearance:none;-webkit-appearance:none;cursor:pointer;touch-action:pan-y}
.fm-range::-webkit-slider-runnable-track{height:2px;background:var(--fm-ink)}
.fm-range::-moz-range-track{height:2px;background:var(--fm-ink)}
.fm-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;margin-top:-10px;border-radius:50%;background:var(--fm-red);border:3px solid var(--fm-paper);box-shadow:0 0 0 1px var(--fm-ink);transition:transform .25s var(--fm-ease)}
.fm-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--fm-red);border:3px solid var(--fm-paper);box-shadow:0 0 0 1px var(--fm-ink)}
.fm-range:active::-webkit-slider-thumb{transform:scale(1.25)}
.fm-range:focus-visible{outline:none}
.fm-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 1px var(--fm-ink),0 0 0 4px var(--fm-paper),0 0 0 6px var(--fm-ink)}
.fm-range:focus-visible::-moz-range-thumb{box-shadow:0 0 0 1px var(--fm-ink),0 0 0 4px var(--fm-paper),0 0 0 6px var(--fm-ink)}
.fm-ticks{position:absolute;left:0;right:0;top:50%;height:0;pointer-events:none}
.fm-ticks i{position:absolute;top:-9px;width:1px;height:8px;background:var(--fm-ink)}
/* 選んだ店の札 */
.fm-card{display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 18px;margin-top:16px;padding:18px;border:1px solid var(--fm-ink);background:var(--fm-paper);position:relative}
.fm-card::before{content:"";position:absolute;left:0;top:-1px;height:3px;width:56px;background:var(--fm-red)}
.fm-thumb{display:block;width:96px;height:96px;object-fit:cover;background:var(--fm-bg2);border:1px solid var(--fm-line)}
.fm-card[data-nothumb="1"]{grid-template-columns:minmax(0,1fr)}
.fm-ctop{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;font:500 11px/1 var(--fm-mono);letter-spacing:.2em;color:var(--fm-ink2)}
.fm-badge{display:inline-flex;align-items:center;height:22px;padding:0 9px;background:var(--fm-red);color:var(--fm-paper);font:700 11px/1 var(--fm-sans);letter-spacing:.1em}
.fm-cname{margin:8px 0 0;font:500 clamp(19px,1.9vw,24px)/1.4 var(--fm-serif);overflow-wrap:anywhere}
.fm-cmeta{margin-top:6px;font:400 13px/1.7 var(--fm-sans);color:var(--fm-ink2)}
.fm-cdist{margin-top:8px;font:600 13.5px/1.7 var(--fm-sans);color:var(--fm-redt)}
.fm-cwarn{margin-top:4px;font:400 12px/1.7 var(--fm-sans);color:var(--fm-mute)}
.fm-acts{grid-column:1 / -1;display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.fm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 18px;border:1px solid var(--fm-ink);background:transparent;color:var(--fm-ink);font:500 13.5px/1.2 var(--fm-sans);letter-spacing:.05em;cursor:pointer;transition:background-color .3s,color .3s,transform .2s var(--fm-ease)}
.fm-btn.pri{background:var(--fm-ink);color:var(--fm-paper)}
.fm-btn.on{cursor:default;border-color:var(--fm-red);color:var(--fm-redt)}
.fm-btn.on svg{color:var(--fm-red)}
.fm-all{width:100%;margin-top:14px}
.fm-all:disabled{border-color:rgba(20,17,13,.28);background:rgba(20,17,13,.06);color:var(--fm-ink2)}
.fm-btn:disabled{border-color:rgba(20,17,13,.28);background:rgba(20,17,13,.06);color:var(--fm-mute);cursor:default}
.fm-btn:not(:disabled):active{transform:scale(.97)}
@media (hover:hover){.fm-btn:not(:disabled):not(.on):hover{background:var(--fm-ink);color:var(--fm-paper)} .fm-btn.pri:hover{background:var(--fm-red);border-color:var(--fm-red)}}
.fm-card .sv-b.sv-inline{border-radius:0;padding:0 16px 0 12px;font:500 13.5px/1.2 var(--fm-sans);letter-spacing:.05em}

/* 一覧 */
.fm-list{margin:0;padding:0;list-style:none;border-top:1px solid var(--fm-ink)}
.fm-listh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:0 0 12px;font:500 11px/1.6 var(--fm-mono);letter-spacing:.2em;color:var(--fm-ink2)}
.fm-li{position:relative}
.fm-li[data-line="1"]::before{content:"";position:absolute;left:21px;top:0;bottom:0;border-left:1px solid rgba(20,17,13,.38)}
.fm-li[data-line="1"][data-first="1"]::before{top:30px}
.fm-li[data-line="1"][data-last="1"]::before{bottom:auto;height:calc(var(--fm-legh,40px) + 30px)}
.fm-li[data-line="1"][data-first="1"][data-last="1"]::before{display:none}
.fm-leg{position:relative;display:flex;align-items:center;gap:8px;overflow:hidden;min-height:var(--fm-legh,40px);padding-left:44px;font:500 12.5px/1.4 var(--fm-sans);color:var(--fm-ink2)}
.fm-leg svg{flex:none;color:var(--fm-red)}
.fm-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 48px;border-bottom:1px solid var(--fm-line)}
.fm-pick{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr);align-items:start;width:100%;min-height:76px;padding:16px 8px 16px 0;text-align:left;cursor:pointer;overflow:hidden;isolation:isolate}
.fm-pick::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--fm-ink);transform:scaleX(0);transform-origin:left;transition:transform .5s var(--fm-ease)}
.fm-row[data-sel="1"] .fm-pick{background:var(--fm-bg2);box-shadow:inset 3px 0 0 var(--fm-red)}
.fm-row[data-hover="1"] .fm-pick::before{transform:scaleX(1)}
.fm-row[data-hover="1"] .fm-pick{color:var(--fm-paper)}
.fm-mk{position:relative;z-index:1;display:grid;place-items:center;width:28px;height:28px;margin:0 0 0 8px;border:1.5px solid var(--fm-ink);border-radius:50%;background:var(--fm-paper);color:var(--fm-ink);font:700 14px/1 var(--fm-serif);transition:background-color .35s,border-color .35s,color .35s}
.fm [data-reached="1"] .fm-mk{background:var(--fm-red);border-color:var(--fm-red);color:var(--fm-paper);animation:fm-stamp .55s var(--fm-ease) both}
.fm-row[data-start="1"] .fm-mk{box-shadow:0 0 0 3px var(--fm-paper),0 0 0 4px var(--fm-ink)}
.fm-row[data-hover="1"][data-start="1"] .fm-mk{box-shadow:0 0 0 3px var(--fm-ink),0 0 0 4px var(--fm-paper)}
.fm-nm{display:block;font:500 clamp(16px,1.35vw,18px)/1.5 var(--fm-serif);overflow-wrap:anywhere}
.fm-nm i{margin-left:.6em;padding:2px 7px;background:var(--fm-red);color:var(--fm-paper);font:700 11px/1.4 var(--fm-sans);font-style:normal;letter-spacing:.1em;vertical-align:.12em;transition:background-color .3s}
.fm-mt{display:block;margin-top:2px;font:400 12.5px/1.7 var(--fm-sans);color:var(--fm-ink2);transition:color .3s}
.fm-mt b{font-weight:600}
.fm-row[data-hover="1"] .fm-mt{color:rgba(255,253,247,.86)}
.fm-row[data-hover="1"] .fm-nm i{background:var(--fm-paper);color:var(--fm-redt)}
.fm-go{display:grid;place-items:center;width:48px;min-height:76px;color:var(--fm-ink);transition:color .3s,background-color .3s}
.fm-go svg{transition:transform .4s var(--fm-ease)}
@media (hover:hover){.fm-go:hover{background:var(--fm-red);color:var(--fm-paper)} .fm-go:hover svg{transform:translate(3px,-3px)}}

/* 図に出せない店 */
.fm-aside{margin-top:28px;padding:18px 18px 14px;border:1px dashed rgba(20,17,13,.42)}
.fm-aside h4{margin:0;font:500 11px/1.6 var(--fm-mono);letter-spacing:.2em;color:var(--fm-ink2)}
.fm-aside p{margin-top:6px;font:400 12.5px/1.8 var(--fm-sans);color:var(--fm-ink2)}
.fm-aside ul{margin:8px 0 0;padding:0;list-style:none}
.fm-aside li{border-top:1px solid var(--fm-line)}
.fm-aside li:first-child{border-top:0}
.fm-aside li > a,.fm-aside li > span{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;font:500 15px/1.5 var(--fm-serif)}
.fm-aside li > a svg{flex:none;color:var(--fm-red)}
@media (hover:hover){.fm-aside li > a:hover{color:var(--fm-redt)}}
.fm-aside small{display:block;font:400 12px/1.5 var(--fm-sans);color:var(--fm-mute)}

/* 巡り図の札（図の右下。絵図の題箋） */
.fm-cart{position:absolute;z-index:1;right:14px;bottom:14px;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 9px 10px;border:1px solid var(--fm-ink);background:var(--fm-paper);box-shadow:inset 0 0 0 3px var(--fm-paper),inset 0 0 0 4px rgba(20,17,13,.38);pointer-events:none}
.fm-cart[data-done="1"]{animation:fm-thud .55s var(--fm-ease);border-color:var(--fm-red)}
.fm-cart[data-done="1"] i{color:var(--fm-redt)}
@keyframes fm-thud{0%{transform:scale(1.22) rotate(-3deg)}60%{transform:scale(.97)}100%{transform:none}}
.fm-cart b{writing-mode:vertical-rl;font:700 19px/1 var(--fm-serif);letter-spacing:.34em;color:var(--fm-ink)}
.fm-cart i{font:500 11px/1 var(--fm-mono);font-style:normal;letter-spacing:.06em;color:var(--fm-redt)}
/* 距離の棒（その区間・その店までの直線距離を、いちばん長いものに対する長さで） */
.fm-bar{display:block;position:absolute;left:44px;right:auto;bottom:6px;height:3px;max-width:calc(100% - 100px);background:var(--fm-red);transform-origin:left;transform:scaleX(1);transition:transform .7s var(--fm-ease)}
.fm [data-reached="0"] .fm-bar{transform:scaleX(0)}
.fm-leg .fm-bar{margin:0}
.fm-mt{position:relative}
.fm-mt .fm-bar.w{position:static;margin-top:6px;max-width:100%;height:3px;background:var(--fm-red)}
.fm-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

@media (max-width:900px){
  .fm-body{grid-template-columns:minmax(0,1fr);gap:28px}
}
@media (max-width:768px){
  .fm-head{grid-template-columns:1fr;gap:18px;padding-bottom:28px}
  .fm-big{font-size:48px}
  .fm-frame{min-height:320px}
  .fm-cart{right:10px;bottom:10px;padding:10px 7px 8px}
  .fm-cart[data-done="1"]{animation:fm-thud .55s var(--fm-ease);border-color:var(--fm-red)}
.fm-cart[data-done="1"] i{color:var(--fm-redt)}
@keyframes fm-thud{0%{transform:scale(1.22) rotate(-3deg)}60%{transform:scale(.97)}100%{transform:none}}
.fm-cart b{font-size:16px}
  .fm-card{padding:16px;gap:0 14px}
  .fm-thumb{width:72px;height:72px}
  .fm-acts .fm-btn,.fm-acts .sv-b{flex:1 1 auto}
}
@media (prefers-reduced-motion:reduce){
  .fm *,.fm *::before,.fm *::after{animation:none!important;transition:none!important}
}
@media (forced-colors:active){
  .fm-frame,.fm-card,.fm-btn,.fm-replay{border:1px solid CanvasText}
  .fm-disc{stroke:CanvasText}
}
`;
