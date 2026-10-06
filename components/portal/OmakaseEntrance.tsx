/**
 * グルメのトップ（/gourmet。公開スイッチ ON のときだけ）に出す「おまかせ提案」の入口（サーバー）。
 * 4 つの質問（壱 どこで／弐 誰と／参 予算／四 気分）を短冊にして並べ、/omakase へ。クライアントの JS は持たない。
 * CSS は app/globals.css に足さず、この入口が描画されるときだけ head に入れる（React 19 の <style href precedence>）。
 * 色・書体は globals.css の変数（--ink --accent --paper --line --serif --body --mono）。数字は渡された掲載店数だけ。
 */
import Link from "next/link";

const CSS = String.raw`
.om-ent{background:#f4efe3;border-bottom:1px solid var(--line,#d9d1bf);padding:clamp(40px,5vw,72px) 40px}
.om-ent-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(28px,5vw,80px);align-items:center;max-width:1600px;margin:0 auto}
.om-ent-no{font:500 11px/1 var(--mono,monospace);letter-spacing:.3em;color:var(--accent,#c7472a)}
.om-ent h2{margin-top:16px;font:600 clamp(30px,4vw,56px)/1.25 var(--serif,serif);letter-spacing:.02em;word-break:auto-phrase}
.om-ent h2 em{font-style:normal;color:var(--accent,#c7472a)}
.om-ent-lead{margin-top:16px;max-width:36em;font:400 14px/2 var(--body,sans-serif);color:var(--ink-soft,#3a342b)}
.om-ent-btn{display:inline-flex;align-items:center;justify-content:space-between;gap:28px;min-height:56px;margin-top:26px;padding:0 28px;border-radius:999px;background:var(--ink,#14110d);color:#f4efe3;font:600 15px/1 var(--body,sans-serif);letter-spacing:.06em;transition:background-color .35s}
.om-ent-btn:hover{background:var(--accent,#c7472a)}
.om-ent-btn i{font-style:normal;transition:transform .35s cubic-bezier(.19,1,.22,1)}
.om-ent-btn:hover i{transform:translateX(5px)}
.om-ent-btn:focus-visible{outline:3px solid var(--ink,#14110d);outline-offset:3px}
.om-ent-slips{display:flex;justify-content:center;gap:clamp(8px,1.2vw,16px);margin:0;padding:0;list-style:none}
.om-ent-slips li{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;width:clamp(58px,6.4vw,92px);height:clamp(190px,19vw,270px);padding:14px 0 16px;background:var(--paper,#fffdf7);border:1px solid var(--ink,#14110d);transform-origin:50% 0;transition:transform .6s cubic-bezier(.19,1,.22,1)}
.om-ent-slips li::before{content:"";position:absolute;left:50%;top:-14px;width:1px;height:14px;background:var(--ink,#14110d)}
.om-ent-slips li:nth-child(2){margin-top:14px}
.om-ent-slips li:nth-child(3){margin-top:6px}
.om-ent-slips li:nth-child(4){margin-top:22px}
.om-ent-slips b{font:600 clamp(18px,1.8vw,24px)/1 var(--serif,serif);color:var(--accent,#c7472a);padding-bottom:12px;border-bottom:1px solid var(--line,#d9d1bf);width:60%;text-align:center}
.om-ent-slips span{writing-mode:vertical-rl;font:600 clamp(18px,1.9vw,26px)/1 var(--serif,serif);letter-spacing:.3em;color:var(--ink,#14110d)}
.om-ent:hover .om-ent-slips li:nth-child(odd){transform:rotate(-1.4deg)}
.om-ent:hover .om-ent-slips li:nth-child(even){transform:rotate(1.2deg)}
@media (max-width:900px){
  .om-ent{padding:36px 20px}
  .om-ent-in{grid-template-columns:minmax(0,1fr);gap:34px}
  .om-ent-slips{justify-content:flex-start}
  .om-ent-btn{width:100%}
}
@media (prefers-reduced-motion:reduce){.om-ent-btn,.om-ent-btn i,.om-ent-slips li{transition:none}}
`;

export default function OmakaseEntrance({ total }: { total: number }) {
  return (
    <section className="om-ent" aria-labelledby="om-ent-h">
      <style href="om-ent" precedence="default">{CSS}</style>
      <div className="om-ent-in">
        <div className="om-ent-txt">
          <p className="om-ent-no">◎ おまかせ提案</p>
          <h2 id="om-ent-h">
            4つ答えて、<em>おまかせ。</em>
          </h2>
          <p className="om-ent-lead">
            どこで・誰と・予算・気分。答えるたびに、掲載店{total}店から条件に合う店が絞られ、最後に3軒を出します。店の案内に書かれていることだけで絞り、評価や人気では選びません。
          </p>
          <Link href="/omakase" prefetch={false} className="om-ent-btn" data-cursor="OMAKASE">
            おまかせで探す
            <i aria-hidden="true">→</i>
          </Link>
        </div>
        <ol className="om-ent-slips" aria-label="4つの質問">
          <li>
            <b>壱</b>
            <span>どこで</span>
          </li>
          <li>
            <b>弐</b>
            <span>誰と</span>
          </li>
          <li>
            <b>参</b>
            <span>予算</span>
          </li>
          <li>
            <b>四</b>
            <span>気分</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
