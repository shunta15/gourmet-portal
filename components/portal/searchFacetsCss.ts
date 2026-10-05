/**
 * 「こだわり条件で絞る」の CSS。固有の接頭辞 `.fc-`。公開スイッチ ON の /search だけが、SearchFacets の中の
 * `<style href="fc-search" precedence="fc-1">` として出す（app/globals.css は変更しない。OFF のときは何も読み込まれない）。
 * 色と書体は app/globals.css の変数（--ink --paper --accent --line --serif --body --mono）。新しい書体は足さない。
 *
 * 見た目: 生成りの紙（--paper）に墨（--ink）の細い罫、選んだ条件は墨ベタ＋左に朱の1本線。0 店になる条件は破線で薄く。
 * 画面幅 767px 以下では、条件のパネルは下から出るシート（.fc-sheet）になり、上のボタン（.fc-open）で開く。
 */
export const CSS_SEARCH_FACETS = String.raw`
.fc{--fc-ink:var(--ink,#14110d);--fc-soft:var(--ink-soft,#3a342b);--fc-line:var(--line,#d9d1bf);--fc-paper:var(--paper,#fffdf7);--fc-red:var(--accent,#c7472a);--fc-mute:#6b6355;--fc-ease:cubic-bezier(.22,1,.36,1);position:relative;margin:0 0 28px;color:var(--fc-ink);font-family:var(--body)}
.fc *,.fc *::before,.fc *::after{box-sizing:border-box}
/* リセットは :where で詳細度 0 にする（.fc button だと、あとの .fc-chip などの枠・余白を打ち消してしまう） */
:where(.fc) button{appearance:none;font:inherit;color:inherit;background:none;border:0;padding:0;margin:0}
.fc :focus-visible{outline:3px solid var(--fc-ink);outline-offset:3px}
.fc-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
.fc-bar,.fc-backdrop,.fc-close,.fc-foot{display:none}

.fc-sheet{background:var(--fc-paper);border:1px solid var(--fc-line)}
.fc-head{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:24px;row-gap:12px;align-items:end;padding:28px 32px 20px}
.fc-eyebrow{font:500 11px/1 var(--mono);letter-spacing:.3em;color:var(--fc-red);margin:0 0 12px}
.fc-title{font:600 clamp(22px,2.2vw,28px)/1.2 var(--serif);letter-spacing:-.01em;margin:0}
.fc-title em{font-style:italic;font-weight:600;color:var(--fc-red)}
.fc-lead{grid-column:1/-1;margin:0;max-width:66ch;font:400 13px/1.8 var(--body);color:var(--fc-soft)}
.fc-clear{display:inline-flex;align-items:center;min-height:44px;padding:0 2px;border-bottom:1px solid currentColor;font:500 13px/1.2 var(--body);letter-spacing:.04em;color:var(--fc-ink);white-space:nowrap;transition:color .2s ease}
.fc-clear:hover{color:var(--fc-red)}
.fc-clear[aria-disabled="true"]{color:var(--fc-mute);border-bottom-style:dashed}
.fc-clear[aria-disabled="true"]:hover{color:var(--fc-mute)}

.fc-scroll{padding:0 32px 10px}
.fc-group{display:grid;grid-template-columns:152px minmax(0,1fr);gap:10px 24px;align-items:start;padding:18px 0;border-top:1px solid var(--fc-line)}
.fc-gl{padding-top:13px;font:500 11px/1.5 var(--mono);letter-spacing:.2em;color:var(--fc-soft)}
.fc-gl small{display:block;margin-top:6px;font:400 11px/1.6 var(--body);letter-spacing:0;color:var(--fc-mute)}
.fc-chips{display:flex;flex-wrap:wrap;align-items:flex-start;align-content:flex-start;gap:8px;min-width:0}

.fc-chip{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 16px;border:1px solid var(--fc-line);background:transparent;color:var(--fc-ink);font:500 14px/1.2 var(--body);text-align:left;transition:background-color .2s ease,color .2s ease,border-color .2s ease,box-shadow .2s ease}
.fc-chip:hover{border-color:var(--fc-ink)}
.fc-c{padding-left:10px;border-left:1px solid currentColor;font:500 11px/1 var(--mono);letter-spacing:.06em;color:var(--fc-soft);font-variant-numeric:tabular-nums}
.fc-chip[aria-pressed="true"]{background:var(--fc-ink);border-color:var(--fc-ink);color:var(--fc-paper);box-shadow:inset 3px 0 0 var(--fc-red)}
.fc-chip[aria-pressed="true"] .fc-c{color:var(--fc-paper)}
.fc-chip[aria-disabled="true"]{border-style:dashed;color:var(--fc-mute)}
.fc-chip[aria-disabled="true"] .fc-c{color:var(--fc-mute)}
.fc-chip[aria-disabled="true"]:hover{border-color:var(--fc-line)}

/* 結果の上の注意書き（条件を選んだときだけ） */
.fc-note{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;margin:0 0 28px;padding:14px 18px;background:rgba(199,71,42,.08);border-left:3px solid var(--accent,#c7472a);color:var(--ink,#14110d);font:500 14px/1.7 var(--body,sans-serif)}
.fc-note small{font:400 12px/1.7 var(--body,sans-serif);color:var(--ink-soft,#3a342b)}

/* 結果の店カード。文字は生成りの白（墨のグラデーションの上で読めるように）。影は明るい写真の上の小さな文字用 */
.fc-card{color:#fffdf7}
.fc-card .meta,.fc-card .cuisine{text-shadow:0 1px 3px rgba(20,17,13,.8)}
.fc-card .cuisine{opacity:.92}
.fc-card h4{text-shadow:0 1px 4px rgba(20,17,13,.6)}
/* カード全面のリンク（z-index は付けない: 付けると写真が下のグラデーションより上に出る）。右上は「候補に入れる」のボタンの場所 */
.fc-card-link{position:absolute;inset:0;display:block;color:inherit}
.fc-card-link:focus-visible{outline:3px solid #fffdf7;outline-offset:-6px}
.fc-card .meta{padding-right:52px}

/* 結果の店に添える札（店カードの下、墨のグラデーションの上）。選んだ条件は生成りのベタ＋左に朱の線で、先頭に並べる */
.fc-tags{list-style:none;display:flex;flex-wrap:wrap;gap:4px;margin:10px 0 0;padding:0}
.fc-tags li{padding:3px 7px;border:1px solid rgba(255,253,247,.55);background:rgba(20,17,13,.78);color:#fffdf7;font:500 11px/1.3 var(--body,sans-serif)}
.fc-tags li[data-on="1"]{border-color:#fffdf7;background:#fffdf7;color:#14110d;box-shadow:inset 3px 0 0 var(--accent,#c7472a);padding-left:10px;font-weight:700}

@media (max-width:767px){
  .fc{margin:0 0 20px}
  .fc-bar{display:block}
  .fc-open{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:56px;padding:0 18px;border:1px solid var(--fc-ink);background:var(--fc-paper);font:500 15px/1.2 var(--body);letter-spacing:.04em;text-align:left}
  .fc-open svg{flex:none}
  .fc-open-l{display:inline-flex;align-items:center;gap:12px}
  .fc-badge{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 8px;border-radius:999px;background:var(--fc-red);color:#fff;font:500 13px/1 var(--mono)}
  .fc-backdrop{display:block;position:fixed;inset:0;z-index:900;background:rgba(20,17,13,.5);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility 0s linear .3s}
  .fc[data-open="1"] .fc-backdrop{opacity:1;visibility:visible;transition:opacity .3s ease,visibility 0s}
  .fc-sheet{position:fixed;left:0;right:0;bottom:0;z-index:910;display:flex;flex-direction:column;max-height:min(88vh,760px);max-height:min(88dvh,760px);border:0;border-top:1px solid var(--fc-ink);transform:translateY(100%);visibility:hidden;transition:transform .34s var(--fc-ease),visibility 0s linear .34s}
  .fc[data-open="1"] .fc-sheet{transform:none;visibility:visible;transition:transform .34s var(--fc-ease),visibility 0s}
  .fc-head{flex:none;padding:20px 72px 14px 20px;grid-template-columns:minmax(0,1fr);position:relative}
  .fc-head .fc-clear{display:none}
  .fc-close{display:grid;place-items:center;position:absolute;top:8px;right:8px;width:48px;height:48px;font:300 28px/1 var(--body)}
  .fc-lead{font-size:12px}
  .fc-scroll{flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;padding:0 20px 12px;-webkit-overflow-scrolling:touch}
  .fc-group{grid-template-columns:minmax(0,1fr);gap:4px;padding:16px 0}
  .fc-gl{padding-top:0}
  .fc-chip{min-height:48px;padding:0 14px}
  .fc-foot{display:flex;flex:none;gap:10px;padding:12px 20px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--fc-line);background:var(--fc-paper)}
  .fc-foot .fc-clear{justify-content:center;min-height:48px;padding:0 14px;border:1px solid var(--fc-line);flex:0 0 auto}
  .fc-apply{flex:1 1 auto;min-height:48px;padding:0 18px;background:var(--fc-ink);color:var(--fc-paper);font:500 15px/1.2 var(--body);letter-spacing:.06em;box-shadow:inset 3px 0 0 var(--fc-red)}
  .fc-apply em{font-style:normal;font:500 18px/1 var(--mono);margin-right:2px}
  .fc-note{margin-bottom:20px;padding:12px 14px;font-size:13px}
}
@media (hover:none),(pointer:coarse){
  :where(.fc) button{cursor:pointer}
}
@media (prefers-reduced-motion:reduce){
  .fc *,.fc *::before,.fc *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important}
}
`;

/** グルメのトップ（公開スイッチ ON の /gourmet）の、さがすの下の入口 */
export const CSS_FACET_ENTRANCE = String.raw`
.fc-entrance{background:#f4efe3;padding:36px 40px;border-bottom:1px solid var(--line,#d9d1bf)}
.fc-entrance-link{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px 28px;align-items:center;max-width:1600px;margin:0 auto;padding:22px 28px;border:1px solid var(--ink,#14110d);color:var(--ink,#14110d);background:var(--paper,#fffdf7);transition:background-color .3s ease,color .3s ease}
.fc-entrance-link:hover{background:var(--ink,#14110d);color:var(--paper,#fffdf7)}
.fc-entrance-link:focus-visible{outline:3px solid var(--ink,#14110d);outline-offset:4px}
.fc-entrance-no{font:500 11px/1 var(--mono,monospace);letter-spacing:.3em;color:var(--accent,#c7472a);white-space:nowrap}
.fc-entrance-link:hover .fc-entrance-no{color:#fff}
.fc-entrance-text{font:500 clamp(16px,1.6vw,20px)/1.6 var(--serif,serif);letter-spacing:.01em}
.fc-entrance-text small{display:block;margin-top:2px;font:400 13px/1.7 var(--body,sans-serif);color:var(--ink-soft,#3a342b);letter-spacing:0}
.fc-entrance-link:hover .fc-entrance-text small{color:#e7e0cf}
.fc-entrance-go{display:grid;place-items:center;width:44px;height:44px;border:1px solid currentColor;border-radius:50%;font:400 18px/1 var(--body,sans-serif);transition:transform .35s cubic-bezier(.22,1,.36,1)}
.fc-entrance-link:hover .fc-entrance-go{transform:translateX(4px)}
@media (max-width:900px){
  .fc-entrance{padding:24px 20px}
  .fc-entrance-link{grid-template-columns:minmax(0,1fr) auto;padding:18px 18px;gap:6px 16px}
  .fc-entrance-no{grid-column:1/-1}
}
@media (max-width:600px){
  .fc-entrance-text small{display:none}
}
@media (prefers-reduced-motion:reduce){
  .fc-entrance-link,.fc-entrance-go{transition-duration:.001ms!important}
}
`;
