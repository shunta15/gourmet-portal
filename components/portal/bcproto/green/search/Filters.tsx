"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 左の「検索条件」(見本どおりの見た目)。種類・都道府県・こだわり(1 つ)を選んで「この条件で検索」(GET フォーム → /bodycare/search?kind=…&pref=…&tag=…)。
// 本番の絞り込みと同じ軸(kind・pref・tag は 1 つずつ)なので、チェックの見た目で単一選択(同じ枠の別の物を押すと入れ替わる・もう一度押すと外れる)。
// キーワード(q)と並び(sort)は今の値を隠し項目で引き継ぐ。スマホでは「条件で絞る」ボタンで開く引き出しになる(PC では出ない)。
// 渡す値は小さな形だけ(店のデータは渡さない)。

export type FilterOpt = { value: string; label: string; n: number };
export type FilterState = { kind: string; pref: string; tag: string };

type Props = {
  action: string;
  clearHref: string;
  initial: FilterState;
  carry: { q: string; sort: string };
  kinds: FilterOpt[];
  prefTop: FilterOpt[];
  prefRest: FilterOpt[];
  prefAll: FilterOpt[];
  hoursTags: FilterOpt[];
  etcTags: FilterOpt[];
};

function Icon({ k }: { k: string }) {
  const c = "#2f5a3d";
  if (k === "pin")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill={c} />
        <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
      </svg>
    );
  if (k === "leaf")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M3.4 20.6C2.6 11.6 8.6 4.2 21.2 3.2c.6 11.2-5.6 17.8-14.6 17.4" fill={c} />
        <path d="M3.2 21.4c3.6-5.4 7.4-8.6 12-11" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (k === "clock")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="9.6" fill="none" stroke={c} strokeWidth="2.4" />
        <path d="M12 6.4V12l3.8 2.2" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={c} />
      <path d="M12 5.2v6M9.4 8.8 12 11.4l2.6-2.6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 12.9c0 3.1 2.5 5.1 5.8 5.1s5.8-2 5.8-5.1c-1.4.9-3.5 1.4-5.8 1.4s-4.4-.5-5.8-1.4z" fill="#fff" />
    </svg>
  );
}

const Chev = () => (
  <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true">
    <path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Filters({ action, clearHref, initial, carry, kinds, prefTop, prefRest, prefAll, hoursTags, etcTags }: Props) {
  const [kind, setKind] = useState(initial.kind);
  const [pref, setPref] = useState(initial.pref);
  const [tag, setTag] = useState(initial.tag);
  const [open, setOpen] = useState(false);
  const active = [initial.kind, initial.pref, initial.tag].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  const group = (opts: FilterOpt[], cur: string, set: (v: string) => void, label: string, cols: 1 | 2) => (
    <ul className={`gs-fl gs-fl--${cols}`} aria-label={label}>
      {opts.map((o) => (
        <li key={o.value}>
          <label className="gs-ck">
            <input type="checkbox" checked={cur === o.value} onChange={() => set(cur === o.value ? "" : o.value)} />
            <i aria-hidden="true">
              <svg viewBox="0 0 12 10" width="11" height="9">
                <path d="m1.4 5.2 3.1 3 6.1-6.4" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </i>
            <span>
              {o.label}
              <em> ({o.n.toLocaleString("ja-JP")})</em>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <button type="button" className="gs-ftrig gr-btn gr-press" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        条件で絞る{active > 0 ? `(${active})` : ""}
      </button>
      <div className="gs-fback" data-open={open ? "1" : "0"} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className="gs-side" id="gs-side" data-open={open ? "1" : "0"} aria-label="検索条件">
        <div className="gs-side-head">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="gs-side-ic">
            <rect x="3.2" y="6.4" width="17.6" height="15" rx="2.4" fill="none" stroke="#2f5a3d" strokeWidth="2" />
            <path d="M8.6 6.4V4.4h6.8v2M3.2 11.2h17.6" fill="none" stroke="#2f5a3d" strokeWidth="2" />
            <path d="M8 14.4v3M12 14.4v3M16 14.4v3" stroke="#2f5a3d" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span>検索条件</span>
          <button type="button" className="gs-side-x" onClick={() => setOpen(false)} aria-label="閉じる">
            ×
          </button>
        </div>
        <form className="gs-side-card" action={action} method="get">
          {kind && <input type="hidden" name="kind" value={kind} />}
          {pref && <input type="hidden" name="pref" value={pref} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          {carry.q && <input type="hidden" name="q" value={carry.q} />}
          {carry.sort === "name" && <input type="hidden" name="sort" value="name" />}

          <section className="gs-fs gs-fs--area" id="area">
            <h2 className="gs-fs-t">
              <Icon k="pin" />
              エリア
            </h2>
            <div className="gs-fsel">
              <label className="gs-sel">
                <select value={pref} onChange={(e) => setPref(e.target.value)} aria-label="都道府県">
                  <option value="">すべての都道府県</option>
                  {prefAll.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}({o.n})
                    </option>
                  ))}
                </select>
                <Chev />
              </label>
            </div>
            {group(prefTop, pref, setPref, "店の多いエリア", 2)}
            {prefRest.length > 0 && (
              <details className="gs-more" open={prefRest.some((o) => o.value === pref) || undefined}>
                <summary>
                  ほかのエリア({prefRest.length})<Chev />
                </summary>
                {group(prefRest, pref, setPref, "ほかのエリア", 2)}
              </details>
            )}
          </section>

          <section className="gs-fs gs-fs--kind" id="kind">
            <h2 className="gs-fs-t">
              <Icon k="leaf" />
              施術の種類
            </h2>
            {group(kinds, kind, setKind, "施術の種類", 1)}
          </section>

          {hoursTags.length > 0 && (
            <section className="gs-fs gs-fs--hours">
              <h2 className="gs-fs-t">
                <Icon k="clock" />
                営業時間
              </h2>
              {group(hoursTags, tag, setTag, "営業時間", 1)}
            </section>
          )}

          {etcTags.length > 0 && (
            <section className="gs-fs gs-fs--etc" id="tag">
              <h2 className="gs-fs-t">
                <Icon k="etc" />
                こだわり条件
              </h2>
              {group(etcTags, tag, setTag, "こだわり条件", 1)}
            </section>
          )}

          <div className="gs-fbtns">
            <Link href={clearHref} className="gs-fb gs-fb--line gr-press" onClick={() => setOpen(false)}>
              条件をクリア
            </Link>
            <button type="submit" className="gs-fb gs-fb--solid gr-press gr-shimmer">
              この条件で検索
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
