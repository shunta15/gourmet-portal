/**
 * 候補リスト（店を保存・/list・画面隅の入口）の CSS。
 * 総合サイトのページ（.mp の中）と、公開スイッチ ON のときのグルメの店ページ（globals.css の世界）の両方に出るので、
 * 色・書体は --sv-* に自前で持つ（.mp の変数に頼らない）。app/globals.css・portal.css は変えない。
 * 部品が <style href="sv-base" precedence="sv"> で出す（React が head に集めて、同じ href は 1 度だけ出す）。
 * 公開スイッチ OFF のあいだ、この CSS を読む部品は 1 つも描画されない（グルメの HTML・CSS は変わらない）。
 */

/** 保存ボタン・画面隅の入口・案内文（保存ボタンと入口が出るページすべてで使う） */
export const CSS_BASE = `
:root{--sv-ink:#15110e;--sv-paper:#faf7f1;--sv-ivory:#f4efe6;--sv-red:#b83f25;--sv-mute:#645b51;--sv-rule:rgba(21,17,14,.16);--sv-ease:cubic-bezier(.19,1,.22,1);
--sv-sans:"Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif;--sv-serif:"Shippori Mincho B1","Hiragino Mincho ProN","Yu Mincho",serif;--sv-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,monospace}
.sv-b{position:relative;appearance:none;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;text-decoration:none}
.sv-ic{display:block;flex:none;overflow:visible}
.sv-ic .bm{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round}
.sv-ic .ck{fill:none;stroke:var(--sv-chk,transparent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:0}
.sv-b[aria-pressed="true"] .sv-ic .bm{fill:currentColor}
.sv-b[aria-pressed="true"] .sv-ic .ck{opacity:1}
.sv-b[data-pop="1"] .sv-ic{animation:sv-pop .5s var(--sv-ease)}
@keyframes sv-pop{0%{transform:scale(.7)}55%{transform:scale(1.22)}100%{transform:scale(1)}}

/* 店カードの写真の隅に重ねる、アイコンだけのボタン（タップ領域は 48px） */
.sv-b.sv-card{position:absolute;z-index:2;top:var(--sv-top,9px);right:6px;width:48px;height:48px;display:grid;place-items:center}
.sv-card .sv-disc{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--sv-paper);border:1px solid var(--sv-ink);color:var(--sv-ink);--sv-chk:var(--sv-paper);box-shadow:0 2px 8px rgba(21,17,14,.22);transition:background-color .25s,color .25s,border-color .25s,transform .25s var(--sv-ease)}
.sv-card[aria-pressed="true"] .sv-disc{background:var(--sv-red);border-color:var(--sv-red);color:#fff;--sv-chk:var(--sv-red)}
.sv-card:active .sv-disc{transform:scale(.9)}
.sv-card:focus-visible{outline:none}
.sv-card:focus-visible .sv-disc{outline:3px solid var(--sv-ink);outline-offset:2px;box-shadow:0 0 0 2px var(--sv-paper),0 0 0 5px var(--sv-ink)}
@media (hover:hover){.sv-card:hover .sv-disc{background:var(--sv-ink);color:var(--sv-paper);--sv-chk:var(--sv-ink)} .sv-card[aria-pressed="true"]:hover .sv-disc{background:#8f2f1a;border-color:#8f2f1a;color:#fff;--sv-chk:#8f2f1a}}
/* カードを持ち上げる動き（.mp-st-card:hover）に、ボタンも付いていく */
.sv-host{position:relative}
.sv-host .sv-b.sv-card{transition:transform .5s var(--sv-ease)}
.sv-host:has(.mp-st-card:hover) .sv-b.sv-card{transform:translateY(-3px)}
.sv-host .mp-place small,.sv-host .mp-place b{padding-right:52px}

/* 店ページの写真の上（グルメの世界観。角は丸めない） */
.sv-b.sv-hero{display:inline-flex;align-items:center;gap:11px;min-height:48px;padding:0 24px 0 16px;border:1px solid rgba(244,239,227,.85);background:rgba(20,17,13,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#f4efe3;--sv-chk:#f4efe3;font:500 14px/1 var(--sv-sans);letter-spacing:.08em;transition:background-color .3s,color .3s,border-color .3s,transform .2s}
.sv-hero[aria-pressed="true"]{background:#f4efe3;border-color:#f4efe3;color:var(--sv-red);--sv-chk:#f4efe3}
.sv-hero[aria-pressed="true"] .sv-t{color:var(--sv-ink)}
.sv-hero:active{transform:scale(.97)}
.sv-hero:focus-visible{outline:3px solid #f4efe3;outline-offset:3px}
@media (hover:hover){.sv-hero:hover{background:#f4efe3;border-color:#f4efe3;color:var(--sv-red);--sv-chk:#f4efe3} .sv-hero:hover .sv-t{color:var(--sv-ink)}}
.sv-hero-slot{position:relative;z-index:2;display:flex;justify-content:center;margin-top:-20px}

/* 総合サイトの紙の上（共有されたリストの 1 店ずつ） */
.sv-b.sv-inline{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 20px 0 14px;border:1px solid var(--sv-ink);border-radius:999px;background:transparent;color:var(--sv-ink);--sv-chk:var(--sv-paper);font:500 13.5px/1 var(--sv-sans);letter-spacing:.05em;transition:background-color .25s,color .25s,transform .2s}
.sv-inline[aria-pressed="true"]{background:var(--sv-ink);color:var(--sv-paper);--sv-chk:var(--sv-ink)}
.sv-inline:active{transform:scale(.97)}
.sv-inline:focus-visible{outline:3px solid var(--sv-ink);outline-offset:3px}
@media (hover:hover){.sv-inline:hover{background:var(--sv-ink);color:var(--sv-paper);--sv-chk:var(--sv-ink)}}

/* 画面の隅の入口（保存が 1 店以上のとき） */
.sv-fab{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:50;display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 8px 0 14px;border:1px solid var(--sv-ink);background:var(--sv-paper);color:var(--sv-ink);font:500 13px/1 var(--sv-sans);letter-spacing:.06em;text-decoration:none;box-shadow:0 6px 20px rgba(20,17,13,.16);transition:background-color .25s,color .25s,bottom .5s var(--sv-ease)}
.sv-fab .sv-ic{color:var(--sv-red);--sv-chk:var(--sv-paper)}
.sv-fab .sv-ic .bm{fill:currentColor}
.sv-fab .sv-ic .ck{opacity:1}
.sv-fab b{display:inline-grid;place-items:center;min-width:44px;height:32px;padding:0 10px;background:var(--sv-ink);color:var(--sv-paper);font:600 13px/1 var(--sv-sans);letter-spacing:.04em;transition:background-color .25s,color .25s}
.sv-fab b[data-bump="1"]{animation:sv-bump .5s var(--sv-ease)}
@keyframes sv-bump{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
.sv-fab:focus-visible{outline:3px solid var(--sv-red);outline-offset:3px}
@media (hover:hover){.sv-fab:hover{background:var(--sv-ink);color:var(--sv-paper)} .sv-fab:hover b{background:var(--sv-paper);color:var(--sv-ink)}}
/* 店ページ案3のスマホ下の固定バー（.sa-h-bar）が出ている間は、その上に逃げる。ボタン案の切替が開いている間は隠す */
@media (max-width:768px){
  body:has(.sa-h-bar[data-show="1"]) .sv-fab{bottom:calc(90px + env(safe-area-inset-bottom,0px))}
  body:has(.sa-pv[data-open="1"]) .sv-fab{visibility:hidden}
}

/* 保存した・外した・満杯のお知らせ（読み上げも兼ねる） */
.sv-toast{position:fixed;left:12px;bottom:calc(72px + env(safe-area-inset-bottom,0px));z-index:90;width:max-content;max-width:min(520px,calc(100vw - 100px));transform:translateY(8px);padding:12px 16px;background:var(--sv-ink);color:var(--sv-paper);font:500 13.5px/1.7 var(--sv-sans);letter-spacing:.04em;text-wrap:balance;word-break:auto-phrase;opacity:0;pointer-events:none;transition:opacity .3s,transform .4s var(--sv-ease),bottom .5s var(--sv-ease)}
.sv-toast[data-on="1"]{opacity:1;transform:none}
.sv-toast:empty{padding:0}
@media (max-width:768px){body:has(.sa-h-bar[data-show="1"]) .sv-toast{bottom:calc(150px + env(safe-area-inset-bottom,0px))}}
@media (prefers-reduced-motion:reduce){
  .sv-b,.sv-card .sv-disc,.sv-host .sv-b.sv-card,.sv-hero,.sv-inline,.sv-fab,.sv-fab b,.sv-toast{transition:none}
  .sv-b[data-pop="1"] .sv-ic,.sv-fab b[data-bump="1"]{animation:none}
  .sv-toast,.sv-toast[data-on="1"]{transform:none}
}
@media (forced-colors:active){
  .sv-card .sv-disc,.sv-fab,.sv-fab b,.sv-hero,.sv-inline{border:1px solid ButtonText}
  .sv-ic .ck{stroke:Canvas}
}
`;

/** /list のページ本体 */
export const CSS_PAGE = `
.sv-sec{padding-block:clamp(20px,3vw,40px) clamp(64px,8vw,112px)}
.sv-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px 32px;padding-bottom:22px;border-bottom:1px solid var(--rule)}
.sv-bar > div:first-child{min-width:0;flex:1 1 320px}
.sv-h{margin:0;font:500 clamp(24px,2.6vw,36px)/1.3 var(--serif);letter-spacing:-.01em;outline:none}
.sv-h small{margin-left:.5em;font:500 .6em/1 var(--mono);letter-spacing:.1em;color:var(--ink-3)}
.sv-sub{margin-top:10px;max-width:40em;font:400 13.5px/1.95 var(--sans);color:var(--ink-2);text-wrap:pretty}
.sv-warn{margin-top:12px;max-width:40em;padding:12px 16px;border:1px solid #97560f;background:rgba(151,86,15,.07);font:400 13px/1.8 var(--sans);color:#6b3d0a}
.sv-tools{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.sv-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:0 22px;border:1px solid var(--ink);border-radius:999px;background:transparent;color:var(--ink);font:500 14px/1.2 var(--sans);letter-spacing:.04em;cursor:pointer;text-decoration:none;transition:background-color .25s,color .25s,border-color .25s}
.sv-btn.pri{background:var(--ink);color:var(--ivory)}
.sv-btn.dng{border-color:var(--sv-red);color:var(--sv-red)}
.sv-btn.dng.fill{background:var(--sv-red);color:#fff}
.sv-btn:disabled{border-color:rgba(21,17,14,.22);background:rgba(21,17,14,.07);color:var(--ink-3);cursor:not-allowed}
@media (hover:hover){.sv-btn:not(:disabled):hover{background:var(--ink);color:var(--ivory)} .sv-btn.dng:not(:disabled):hover{background:var(--sv-red);border-color:var(--sv-red);color:#fff}}
.sv-btn:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.sv-link{display:inline-flex;align-items:center;min-height:48px;font:500 13.5px/1.4 var(--sans);letter-spacing:.04em;border-bottom:1px solid var(--rule);align-self:center}
.sv-link:hover{border-color:var(--ink)}
.sv-confirm{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin-top:18px;padding:14px 18px;border:1px solid var(--sv-red);background:rgba(184,63,37,.06);font:500 14px/1.7 var(--sans)}
.sv-confirm p{margin:0;flex:1 1 220px}
.sv-msg{min-height:1.8em;margin-top:14px;font:500 13.5px/1.8 var(--sans);color:var(--ink-2)}
.sv-msg:empty{min-height:0;margin-top:0}
.sv-msg a,.sv-msg button{margin-left:.8em;min-height:44px;padding:0 4px;display:inline-flex;align-items:center;border:0;border-bottom:1px solid currentColor;background:none;color:var(--ink);font:inherit;cursor:pointer}
.sv-list{margin:6px 0 0;padding:0;list-style:none}
.sv-row{display:grid;grid-template-columns:34px 136px minmax(0,1fr) auto;align-items:center;gap:0 22px;padding:20px 0;border-bottom:1px solid var(--rule)}
.sv-no{align-self:start;padding-top:6px;font:500 12px/1 var(--mono);letter-spacing:.12em;color:var(--ink-3)}
.sv-ph{position:relative;display:block;aspect-ratio:4/3;background:var(--acl,#e7dfd0);overflow:hidden}
.sv-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sv-ph .g{position:absolute;right:-.04em;top:-.1em;font:600 72px/1 var(--serif);color:rgba(255,255,255,.62);user-select:none}
.sv-body{display:flex;flex-direction:column;gap:6px;min-width:0}
.sv-body small{font:500 10.5px/1.4 var(--mono);letter-spacing:.16em;color:var(--ink-3)}
.sv-nm{font:500 clamp(16px,1.5vw,19px)/1.5 var(--serif);overflow-wrap:anywhere}
.sv-nm:hover{text-decoration:underline;text-underline-offset:4px}
.sv-ar{font:400 13px/1.7 var(--sans);color:var(--ink-2)}
.sv-ctl{display:flex;align-items:center;gap:8px}
.sv-mv{display:grid;place-items:center;width:48px;height:48px;border:1px solid rgba(21,17,14,.28);border-radius:50%;background:transparent;color:var(--ink);cursor:pointer;transition:background-color .25s,color .25s,border-color .25s}
.sv-mv:disabled{opacity:.3;cursor:not-allowed}
@media (hover:hover){.sv-mv:not(:disabled):hover{background:var(--ink);color:var(--ivory);border-color:var(--ink)}}
.sv-mv:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.sv-rm{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border:1px solid rgba(21,17,14,.28);border-radius:999px;background:transparent;color:var(--ink);font:500 13.5px/1 var(--sans);letter-spacing:.05em;cursor:pointer;transition:background-color .25s,color .25s,border-color .25s}
@media (hover:hover){.sv-rm:hover{background:var(--sv-red);border-color:var(--sv-red);color:#fff}}
.sv-rm:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
/* 店のデータが取れなかった行（この店はいま表示できません）。写真の枠は破線、店名の位置には案内の文 */
.sv-gone .sv-ph{background:rgba(21,17,14,.04);outline:1px dashed rgba(21,17,14,.3);outline-offset:-1px}
.sv-gone .sv-ph .g{inset:0;right:auto;top:auto;display:grid;place-items:center;font:500 28px/1 var(--mono);color:rgba(21,17,14,.45)}
.sv-nm-off{color:var(--ink-2)}
.sv-row[data-new="1"]{animation:sv-in .6s var(--sv-ease)}
@keyframes sv-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.sv-url{display:block;width:100%;max-width:640px;margin-top:12px;padding:12px 14px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink-2);font:400 12.5px/1.5 var(--mono);text-overflow:ellipsis}
.sv-url:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.sv-share{margin-top:clamp(28px,4vw,48px)}
.sv-share .mp-share{margin-top:0}
.sv-share .sv-url{margin-top:4px}
.sv-note{margin-top:12px;max-width:44em;font:400 12.5px/1.9 var(--sans);color:var(--ink-3)}
.sv-empty{margin-top:clamp(24px,4vw,48px);padding:clamp(28px,5vw,56px) clamp(20px,4vw,48px);border:1px solid var(--rule);background:var(--paper)}
.sv-empty h3{margin:0;font:500 clamp(20px,2vw,26px)/1.5 var(--serif)}
.sv-empty p{margin-top:12px;max-width:38em;font:400 14px/2 var(--sans);color:var(--ink-2);text-wrap:pretty}
.sv-empty .mp-chips{margin-top:24px}
.sv-empty .sv-inline-ic{display:inline-block;vertical-align:-4px;margin:0 2px;color:var(--sv-red)}
.sv-sk{display:grid;grid-template-columns:34px 136px minmax(0,1fr);gap:0 22px;padding:20px 0;border-bottom:1px solid var(--rule)}
.sv-sk i{display:block;aspect-ratio:4/3;grid-column:2;background:linear-gradient(90deg,rgba(21,17,14,.06),rgba(21,17,14,.12),rgba(21,17,14,.06));background-size:200% 100%;animation:sv-sh 1.4s linear infinite}
.sv-sk span{display:block;grid-column:3;align-self:center;height:16px;max-width:60%;background:rgba(21,17,14,.08)}
@keyframes sv-sh{to{background-position:-200% 0}}
@media (max-width:700px){
  .sv-row{grid-template-columns:22px 96px minmax(0,1fr);gap:12px 14px;padding:16px 0}
  .sv-no{padding-top:2px}
  .sv-ctl{grid-column:1 / -1;justify-content:flex-end}
  .sv-ph .g{font-size:52px}
  .sv-sk{grid-template-columns:22px 96px minmax(0,1fr);gap:0 14px}
  .sv-tools{width:100%}
  .sv-tools .sv-btn.pri{flex:1 1 auto}
}
@media (prefers-reduced-motion:reduce){
  .sv-row[data-new="1"],.sv-sk i{animation:none}
  .sv-btn,.sv-mv,.sv-rm{transition:none}
}
`;
