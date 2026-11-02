"use client";
import { useEffect, useState } from "react";
import { COMMON_RULES, PHOTOS, VERTICALS, VERTICAL_KEYS, type VerticalKey } from "./guideData";

const INK = "#2b2a26";
const MUTED = "#6a665b";
const GREEN = "#2E7D32";
const BG = "#F6F1E7";
const CARD = "#fffdf8";
const LINE = "#ddd5c3";

const css = `
.lg{background:${BG};color:${INK};min-height:100vh;padding:104px 16px 72px;font-size:16px;line-height:1.8;cursor:auto}
.lg *{cursor:auto}
.lg button,.lg a{cursor:pointer}
.lg-wrap{max-width:760px;margin:0 auto;display:grid;gap:28px}
.lg h1{font:700 28px/1.35 var(--sans);margin:0}
.lg h2{font:700 20px/1.4 var(--sans);margin:0}
.lg-lead{margin:8px 0 0;color:${MUTED};font-size:15px}
.lg-rules{background:${CARD};border:1px solid ${LINE};border-left:4px solid ${GREEN};border-radius:10px;padding:16px 18px}
.lg-rules h2{font-size:17px;margin-bottom:8px}
.lg-rules ul{margin:0;padding-left:1.2em;display:grid;gap:6px;font-size:15.5px}
.lg-tabs{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
@media(min-width:560px){.lg-tabs{grid-template-columns:repeat(4,1fr)}}
.lg-tab{min-height:48px;padding:8px 10px;border:1px solid ${LINE};border-radius:10px;background:${CARD};color:${INK};font:500 15.5px/1.3 var(--body);text-align:center}
.lg-tab:hover{border-color:${GREEN}}
.lg-tab:focus-visible{outline:2px solid ${GREEN};outline-offset:2px}
.lg-tab[aria-pressed="true"]{background:${GREEN};border-color:${GREEN};color:#fff;font-weight:700}
.lg-sec{display:grid;gap:12px;scroll-margin-top:96px}
.lg-sec[hidden]{display:none}
.lg-note{margin:0;color:${MUTED};font-size:15px}
.lg-kinds{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.lg-kinds li{background:#ebe4d3;border-radius:6px;padding:1px 10px;font-size:15px}
.lg-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}
.lg-card{background:${CARD};border:1px solid ${LINE};border-radius:10px;padding:12px 14px}
.lg-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.lg-name{font-weight:700;font-size:16.5px;line-height:1.5}
.lg-count{flex:none;color:${GREEN};font-weight:700;font-size:15.5px;white-space:nowrap}
.lg-tip{margin:2px 0 0;font-size:15.5px}
.lg-ex{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed ${LINE};display:grid;gap:6px;list-style:none;font-size:15px}
.lg-ex b{font-weight:700}
.lg-ex-h{color:${MUTED};font-size:15px;margin:10px 0 0}
.lg-total{margin:0;font-size:15.5px;background:#e9efe2;border-radius:10px;padding:10px 14px}
.lg-total b{color:${GREEN}}
.lg-foot{color:${MUTED};font-size:15px;border-top:1px solid ${LINE};padding-top:16px}
`;

export default function GuideClient({ initial }: { initial: VerticalKey }) {
  const [current, setCurrent] = useState<VerticalKey>(initial);

  // ハッシュ(#beauty など)でも開けるようにする。読み込み時と、ハッシュが変わったとき
  useEffect(() => {
    const apply = (scroll: boolean) => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (VERTICAL_KEYS.includes(id as VerticalKey)) {
        setCurrent(id as VerticalKey);
        if (scroll) {
          requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
        }
      }
    };
    apply(true);
    const onHash = () => apply(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const select = (key: VerticalKey) => {
    setCurrent(key);
    try {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${key}`);
    } catch {
      /* 履歴が使えなくても表示の切り替えには影響しない */
    }
  };

  return (
    <div className="lg">
      <style>{css}</style>
      <div className="lg-wrap">
        <header>
          <h1>撮影シーン詳細</h1>
          <p className="lg-lead">LINE からお越しの店舗オーナー様向けに、業種ごとの撮影シーンと撮り方をご案内します。</p>
        </header>

        <section className="lg-rules" aria-labelledby="lg-rules-h">
          <h2 id="lg-rules-h">全業種 共通のお願い</h2>
          <ul>
            {COMMON_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <nav aria-label="業種の切り替え">
          <div className="lg-tabs">
            {VERTICALS.map((v) => (
              <button key={v.key} type="button" className="lg-tab" aria-pressed={current === v.key} onClick={() => select(v.key)}>
                {v.label}
              </button>
            ))}
          </div>
        </nav>

        {VERTICALS.map((v) => (
          <section key={v.key} id={v.key} className="lg-sec" hidden={current !== v.key} aria-labelledby={`lg-h-${v.key}`}>
            <div>
              <h2 id={`lg-h-${v.key}`}>{v.label}</h2>
              {v.note && <p className="lg-note">{v.note}</p>}
              {v.kinds && (
                <ul className="lg-kinds" aria-label="対象の分類">
                  {v.kinds.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              )}
            </div>
            <ul className="lg-list">
              {v.scenes.map((s) => (
                <li key={s.name} className="lg-card">
                  <div className="lg-row">
                    <span className="lg-name">{s.name}</span>
                    <span className="lg-count">{s.count} 本</span>
                  </div>
                  <p className="lg-tip">{s.tip}</p>
                  {s.examples && (
                    <>
                      <p className="lg-ex-h">分類別の例</p>
                      <ul className="lg-ex" style={{ marginTop: 4, paddingTop: 0, borderTop: 0 }}>
                        {s.examples.map((e) => (
                          <li key={e.name}>
                            <b>{e.name}</b>　{e.tip}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <p className="lg-total">
              目安: 合計 <b>{v.total}</b>・各 20〜60 秒・スマホは縦
            </p>
          </section>
        ))}

        <section id="photos" className="lg-sec" aria-labelledby="lg-photos-h">
          <div>
            <h2 id="lg-photos-h">記事に載せる写真(全業種 共通)</h2>
            <p className="lg-note">{PHOTOS.note}</p>
          </div>
          <ul className="lg-list">
            {PHOTOS.rows.map((r) => (
              <li key={r.name} className="lg-card">
                <div className="lg-row">
                  <span className="lg-name">{r.name}</span>
                  <span className="lg-count">{r.amount}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="lg-foot">マチノワ 記事・SNS動画制作窓口</div>
      </div>
    </div>
  );
}
