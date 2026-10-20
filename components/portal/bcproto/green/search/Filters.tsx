"use client";

import { useState } from "react";

// 左の「検索条件」(見本どおりの見た目)。押すとチェックが入る・外れる。絞り込みは見本の 4 件の表示のまま。
// スマホでは「条件で絞る」ボタンで開く引き出しになる(PC では出ない)。

type Opt = { id: string; label: string; n?: number; on?: boolean };
type Sec = { key: string; title: string; icon: string; cols: 1 | 2 | 3; opts: Opt[]; variant?: "wide" | "tiny" };

const SECS: Sec[] = [
  {
    key: "area", title: "エリア", icon: "pin", cols: 2,
    opts: [
      { id: "a1", label: "渋谷駅", n: 342, on: true }, { id: "a2", label: "神泉駅", n: 86 },
      { id: "a3", label: "代々木公園駅", n: 54 }, { id: "a4", label: "代々木上原駅", n: 38 },
      { id: "a5", label: "代官山駅", n: 62 }, { id: "a6", label: "その他のエリア", n: 112 },
    ],
  },
  {
    key: "worry", title: "お悩み・症状", icon: "person", cols: 2,
    opts: [
      { id: "w1", label: "肩こり", n: 412, on: true }, { id: "w2", label: "腰痛", n: 324 },
      { id: "w3", label: "頭痛", n: 118 }, { id: "w4", label: "姿勢のゆがみ", n: 203 },
      { id: "w5", label: "眼の疲れ", n: 96 }, { id: "w6", label: "むくみ", n: 157 },
      { id: "w7", label: "自律神経の乱れ", n: 112 }, { id: "w8", label: "ストレス", n: 101 },
      { id: "w9", label: "冷え・むくみ", n: 72 }, { id: "w10", label: "その他", n: 58 },
    ],
  },
  {
    key: "kind", title: "施術の種類", icon: "leaf", cols: 2,
    opts: [
      { id: "k1", label: "整体", n: 465, on: true }, { id: "k2", label: "接骨院・整骨院", n: 218 },
      { id: "k3", label: "鍼灸院", n: 164 }, { id: "k4", label: "マッサージ", n: 302 },
      { id: "k5", label: "リラクゼーション", n: 261 }, { id: "k6", label: "美容鍼", n: 95 },
    ],
  },
  {
    key: "price", title: "料金の目安", icon: "yen", cols: 2, variant: "wide",
    opts: [
      { id: "p1", label: "〜3,000円", n: 112 }, { id: "p2", label: "3,000円〜5,000円", n: 384, on: true },
      { id: "p3", label: "5,000円〜8,000円", n: 258 }, { id: "p4", label: "8,000円〜", n: 120 },
    ],
  },
  {
    key: "hours", title: "営業時間", icon: "clock", cols: 3, variant: "wide",
    opts: [
      { id: "h1", label: "平日営業", on: true }, { id: "h2", label: "土日営業" }, { id: "h3", label: "夜20時以降も営業" },
    ],
  },
  {
    key: "etc", title: "こだわり条件", icon: "etc", cols: 3, variant: "tiny",
    opts: [
      { id: "e1", label: "駅から徒歩5分以内", on: true }, { id: "e2", label: "クレジットカード可" }, { id: "e3", label: "女性スタッフ在籍" },
      { id: "e4", label: "完全個室" }, { id: "e5", label: "お子様連れOK" }, { id: "e6", label: "駐車場あり" },
    ],
  },
];

function Icon({ k }: { k: string }) {
  const c = "#2f5a3d";
  if (k === "pin")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill={c} />
        <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
      </svg>
    );
  if (k === "person")
    return (
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
        <circle cx="12" cy="7.4" r="4.4" fill={c} />
        <path d="M3.4 21.2c.4-4.8 3.8-7.6 8.6-7.6s8.2 2.8 8.6 7.6z" fill={c} />
      </svg>
    );
  if (k === "leaf")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M3.4 20.6C2.6 11.6 8.6 4.2 21.2 3.2c.6 11.2-5.6 17.8-14.6 17.4" fill={c} />
        <path d="M3.2 21.4c3.6-5.4 7.4-8.6 12-11" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  if (k === "yen")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill={c} />
        <path d="M12 5.4v13.2M7.2 8.2l4.8 4.4 4.8-4.4M8 12.4h8M8 15.4h8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (k === "clock")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="9.6" fill="none" stroke={c} strokeWidth="2.4" />
        <path d="M12 6.4V12l3.8 2.2" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (k === "etc")
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill={c} />
        <path d="M12 5.2v6M9.4 8.8 12 11.4l2.6-2.6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.2 12.9c0 3.1 2.5 5.1 5.8 5.1s5.8-2 5.8-5.1c-1.4.9-3.5 1.4-5.8 1.4s-4.4-.5-5.8-1.4z" fill="#fff" />
      </svg>
    );
  return null;
}

const Chev = () => (
  <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true">
    <path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Filters() {
  const [on, setOn] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    SECS.forEach((s) => s.opts.forEach((o) => (m[o.id] = !!o.on)));
    return m;
  });
  const [open, setOpen] = useState(false);
  const count = Object.values(on).filter(Boolean).length;
  const clear = () => setOn((p) => Object.fromEntries(Object.keys(p).map((k) => [k, false])));

  return (
    <>
      <button type="button" className="gs-ftrig gr-btn gr-press" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        条件で絞る{count > 0 ? `(${count})` : ""}
      </button>
      <div className="gs-fback" data-open={open ? "1" : "0"} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className="gs-side" data-open={open ? "1" : "0"} aria-label="検索条件">
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
        <div className="gs-side-card">
          {SECS.map((s) => (
            <section key={s.key} className={`gs-fs gs-fs--${s.key}`}>
              <h2 className="gs-fs-t">
                <Icon k={s.icon} />
                {s.title}
              </h2>
              {s.key === "area" && (
                <div className="gs-fsel">
                  <label className="gs-sel">
                    <select defaultValue="tokyo" aria-label="都道府県">
                      <option value="tokyo">東京都</option>
                      <option value="kanagawa">神奈川県</option>
                      <option value="saitama">埼玉県</option>
                    </select>
                    <Chev />
                  </label>
                  <label className="gs-sel">
                    <select defaultValue="shibuya" aria-label="エリア">
                      <option value="shibuya">渋谷エリア</option>
                      <option value="shinjuku">新宿エリア</option>
                      <option value="ikebukuro">池袋エリア</option>
                    </select>
                    <Chev />
                  </label>
                </div>
              )}
              <ul className={`gs-fl gs-fl--${s.cols} ${s.variant ? `gs-fl--${s.variant}` : ""}`}>
                {s.opts.map((o) => (
                  <li key={o.id}>
                    <label className="gs-ck">
                      <input type="checkbox" checked={!!on[o.id]} onChange={(e) => setOn((p) => ({ ...p, [o.id]: e.target.checked }))} />
                      <i aria-hidden="true">
                        <svg viewBox="0 0 12 10" width="11" height="9">
                          <path d="m1.4 5.2 3.1 3 6.1-6.4" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </i>
                      <span>
                        {o.label}
                        {o.n != null && <em> ({o.n.toLocaleString("ja-JP")})</em>}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="gs-fbtns">
            <button type="button" className="gs-fb gs-fb--line gr-press" onClick={clear}>
              条件をクリア
            </button>
            <button type="button" className="gs-fb gs-fb--solid gr-press gr-shimmer" onClick={() => setOpen(false)}>
              この条件で検索
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/** 並び替え(おすすめ順)。見た目だけで、並びは変わらない */
export function SortSelect() {
  return (
    <label className="gs-sort-sel gr-press">
      <select defaultValue="rec" aria-label="並び替え">
        <option value="rec">おすすめ順</option>
        <option value="near">駅から近い順</option>
        <option value="price">料金の安い順</option>
        <option value="rate">評価の高い順</option>
      </select>
      <Chev />
    </label>
  );
}
