"use client";
import { useCallback, useEffect, useState } from "react";
import {
  BLOCKS,
  CLOSING,
  COMMON_RULES,
  COMMON_TITLE,
  INTRO,
  ONE,
  PEOPLE,
  SUMMARY,
  TITLE,
  VERTICAL_KEYS,
  type VerticalKey,
} from "./guideData";

const INK = "#2b2a26";
const MUTED = "#6a665b";
const GREEN = "#2E7D32";
const BG = "#F6F1E7";
const CARD = "#fffdf8";
const LINE = "#ddd5c3";
const STORE_KEY = "machinowa-line-guide-checks-v1";

const css = `
.lg{background:${BG};color:${INK};min-height:100vh;padding:104px 16px 72px;font-size:16px;line-height:1.8;cursor:auto}
.lg *{cursor:auto}
.lg button,.lg a,.lg label,.lg input{cursor:pointer}
.lg-wrap{max-width:760px;margin:0 auto;display:grid;gap:28px}
.lg h1{font:700 26px/1.4 var(--sans);margin:0}
.lg h2{font:700 20px/1.4 var(--sans);margin:0}
.lg h3{font:700 17px/1.5 var(--sans);margin:0}
.lg-intro{display:grid;gap:4px;margin:10px 0 0;font-size:15.5px}
.lg-intro p{margin:0}
.lg-box{background:${CARD};border:1px solid ${LINE};border-left:4px solid ${GREEN};border-radius:10px;padding:16px 18px;display:grid;gap:10px}
.lg-box ol{margin:0;padding-left:1.5em;display:grid;gap:6px;font-size:15.5px}
.lg-box p{margin:0;font-size:15.5px}
.lg-sec{display:grid;gap:12px;scroll-margin-top:96px}
.lg-sec[hidden]{display:none}
.lg-p{margin:0;font-size:15.5px}
.lg-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}
.lg-card{background:${CARD};border:1px solid ${LINE};border-radius:10px;padding:12px 14px}
.lg-name{font-weight:700;font-size:16.5px;line-height:1.5}
.lg-kvs{display:flex;flex-wrap:wrap;gap:4px 14px;margin:4px 0 0;font-size:15px}
.lg-kv{display:inline-flex;gap:6px;align-items:baseline}
.lg-k{color:${MUTED};font-size:15px}
.lg-v{color:${GREEN};font-weight:700;font-size:16px}
.lg-tip{margin:4px 0 0;font-size:15.5px}
.lg-tabs{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
@media(min-width:560px){.lg-tabs{grid-template-columns:repeat(4,1fr)}}
.lg-tab{min-height:48px;padding:8px 10px;border:1px solid ${LINE};border-radius:10px;background:${CARD};color:${INK};font:500 15.5px/1.3 var(--body);text-align:center}
.lg-tab:hover{border-color:${GREEN}}
.lg-tab:focus-visible{outline:2px solid ${GREEN};outline-offset:2px}
.lg-tab[aria-pressed="true"]{background:${GREEN};border-color:${GREEN};color:#fff;font-weight:700}
.lg-sub{margin:6px 0 0}
.lg-ck{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start}
.lg-ck input{appearance:auto;-webkit-appearance:checkbox;width:26px;height:26px;margin:2px 0 0;accent-color:${GREEN}}
.lg-ck:has(input:checked){background:#eaf1e3;border-color:${GREEN}}
.lg-ck:has(input:checked) .lg-name{color:${GREEN}}
.lg-total{background:#e9efe2;border-color:#cddcc2}
.lg-note{margin:0;font-size:15.5px;background:${CARD};border:1px solid ${LINE};border-radius:10px;padding:10px 14px}
.lg-note b{color:${GREEN};margin-right:.6em}
.lg-closing{border-top:1px solid ${LINE};padding-top:16px;margin:0;font-size:15.5px}
`;

export default function GuideClient({ initial }: { initial: VerticalKey }) {
  const [current, setCurrent] = useState<VerticalKey>(initial);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // チェックの保存はこの端末のブラウザの中だけ(localStorage)。読めない・書けなくても表示は崩れない
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setChecks(parsed as Record<string, boolean>);
      }
    } catch {
      /* 読めなければ空のまま */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) delete next[id];
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* 書けなくても、画面のチェックはそのまま使える */
      }
      return next;
    });
  }, []);

  // ハッシュ(#beauty など)でも開けるようにする。読み込み時と、ハッシュが変わったとき
  useEffect(() => {
    const apply = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      } catch {
        return;
      }
      if (VERTICAL_KEYS.includes(id as VerticalKey)) {
        setCurrent(id as VerticalKey);
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const select = (key: VerticalKey) => {
    setCurrent(key);
    try {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${key}`);
    } catch {
      /* 履歴が使えなくても表示の切り替えには影響しない */
    }
  };

  const H = SUMMARY.headers;

  return (
    <div className="lg">
      <style>{css}</style>
      <div className="lg-wrap">
        <header>
          <h1>{TITLE}</h1>
          <div className="lg-intro">
            {INTRO.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </header>

        <section className="lg-box" aria-labelledby="lg-common-h">
          <h2 id="lg-common-h">{COMMON_TITLE}</h2>
          <ol>
            {COMMON_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <h3>{PEOPLE.title}</h3>
          <p>{PEOPLE.text}</p>
          <h3>{ONE.title}</h3>
          <p>{ONE.text}</p>
        </section>

        <section className="lg-sec" aria-labelledby="lg-sum-h">
          <h2 id="lg-sum-h">{SUMMARY.title}</h2>
          <p className="lg-p">{SUMMARY.lead}</p>
          <ul className="lg-list">
            {SUMMARY.rows.map((r) => (
              <li key={r.industry} className="lg-card">
                <div className="lg-name">{r.industry}</div>
                <div className="lg-kvs">
                  <span className="lg-kv">
                    <span className="lg-k">{H.min}</span>
                    <span className="lg-v">{r.min}</span>
                  </span>
                  <span className="lg-kv">
                    <span className="lg-k">{H.up}</span>
                    <span className="lg-v">{r.up}</span>
                  </span>
                </div>
                <p className="lg-tip">
                  <span className="lg-k">{H.key}　</span>
                  {r.key}
                </p>
              </li>
            ))}
          </ul>
          <p className="lg-p">{SUMMARY.after}</p>
        </section>

        <nav aria-label="業種の切り替え">
          <div className="lg-tabs">
            {BLOCKS.map((b) => (
              <button key={b.key} type="button" className="lg-tab" aria-pressed={current === b.key} onClick={() => select(b.key)}>
                {b.tab}
              </button>
            ))}
          </div>
        </nav>

        {BLOCKS.map((b) => (
          <section key={b.key} id={b.key} className="lg-sec" hidden={current !== b.key} aria-labelledby={`lg-h-${b.key}`}>
            <div>
              <h2 id={`lg-h-${b.key}`}>{b.heading}</h2>
              <p className="lg-p">対象：{b.target}</p>
            </div>
            {b.groups.map((g, gi) => (
              <div key={gi} className="lg-sec" style={{ scrollMarginTop: 96 }}>
                {g.title && <h3 className="lg-sub">▶ {g.title}</h3>}
                <ul className="lg-list">
                  {g.rows.map((r) => {
                    const id = `${b.key}/${gi}/${r.name}`;
                    return (
                      <li key={id}>
                        <label className="lg-card lg-ck" style={{ display: "grid" }}>
                          <input type="checkbox" checked={!!checks[id]} onChange={() => toggle(id)} aria-label={`${r.name}　撮れたらチェック`} />
                          <span>
                            <span className="lg-name">{r.name}</span>
                            <span className="lg-kvs">
                              <span className="lg-kv">
                                <span className="lg-k">最低限（本）</span>
                                <span className="lg-v">{r.min}</span>
                              </span>
                              <span className="lg-kv">
                                <span className="lg-k">クオリティを上げるなら（本）</span>
                                <span className="lg-v">{r.up}</span>
                              </span>
                            </span>
                            {r.tip && <span className="lg-tip" style={{ display: "block" }}>{r.tip}</span>}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                  <li className="lg-card lg-total">
                    <span className="lg-name">合計</span>
                    <span className="lg-kvs">
                      <span className="lg-kv">
                        <span className="lg-k">最低限（本）</span>
                        <span className="lg-v">{g.totalMin}</span>
                      </span>
                      <span className="lg-kv">
                        <span className="lg-k">クオリティを上げるなら（本）</span>
                        <span className="lg-v">{g.totalUp}</span>
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
            ))}
            {b.note && (
              <p className="lg-note">
                <b>{b.note.label}</b>
                {b.note.text}
              </p>
            )}
          </section>
        ))}

        <p className="lg-closing">{CLOSING}</p>
      </div>
    </div>
  );
}
