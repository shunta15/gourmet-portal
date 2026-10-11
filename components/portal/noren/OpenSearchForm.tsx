"use client";
import type { FormEvent } from "react";

/**
 * 入口の「店をさがす」の検索の箱。ふつうの <form method="get" action="/search">（JavaScript が動かなくても送れる）。
 * 送る直前だけ、空の項目を一時的に無効にして、URL に ?q=&region=&cuisine= のような空の引数を付けない（送ったあとすぐ元に戻す）。
 * 引数の名前と値の形は、暖簾版の検索（NorenSearch）に合わせる: q（キーワード）・region（地域のキー）・cuisine（業種の分類の名前）。
 */
export default function OpenSearchForm({
  regions,
  cuisines,
  total,
}: {
  regions: { key: string; name: string; count: number }[];
  cuisines: { label: string; count: number }[];
  total: number;
}) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const off: (HTMLInputElement | HTMLSelectElement)[] = [];
    for (const el of Array.from(e.currentTarget.elements)) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement) || !el.name) continue;
      if (el instanceof HTMLInputElement) el.value = el.value.trim();
      if (!el.value) {
        el.disabled = true;
        off.push(el);
      }
    }
    // フォームの値は、この送信の処理が終わった直後に集められる。そのあとで元に戻す
    window.setTimeout(() => off.forEach((el) => (el.disabled = false)), 0);
  };

  return (
    <form className="vOs-form" method="get" action="/search" role="search" aria-label="店をさがす" onSubmit={onSubmit}>
      <div className="vOs-fld vOs-fld-q">
        <label htmlFor="vOs-q">キーワード</label>
        <input id="vOs-q" name="q" type="text" enterKeyHint="search" autoComplete="off" placeholder="店名・エリア・料理名" />
      </div>
      <div className="vOs-fld">
        <label htmlFor="vOs-region">エリア</label>
        <select id="vOs-region" name="region" defaultValue="">
          <option value="">すべてのエリア（{total}）</option>
          {regions.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name}（{r.count}）
            </option>
          ))}
        </select>
      </div>
      <div className="vOs-fld">
        <label htmlFor="vOs-cuisine">業種</label>
        <select id="vOs-cuisine" name="cuisine" defaultValue="">
          <option value="">すべての業種</option>
          {cuisines.map((c) => (
            <option key={c.label} value={c.label}>
              {c.label}（{c.count}）
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="vOs-btn" data-cursor="SEARCH">
        さがす <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
