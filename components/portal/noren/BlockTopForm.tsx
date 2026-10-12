"use client";
import type { FormEvent } from "react";
import { PinIcon, SearchIcon } from "./BlockSearchParts";

/**
 * 入口の「店を、さがす。」(block の見た目)の検索の箱。白い丸い箱 1 本に、エリアのセレクト + キーワードの入力 + 橙の丸い検索ボタン。
 * ふつうの <form method="get" action="/search">（JavaScript が動かなくても送れる）。送る直前だけ、空の項目を一時的に無効にして、URL に空の引数（?q=&region=）を付けない。
 * 引数の名前と値の形は、検索（NorenSearch）に合わせる: region（地域のキー）・q（キーワード）。
 */
export default function BlockTopForm({ regions }: { regions: { key: string; name: string; count: number }[] }) {
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
    window.setTimeout(() => off.forEach((el) => (el.disabled = false)), 0);
  };
  return (
    <div className="vBkt-sboxw">
    <p className="vBkt-sbox-cap">店名・エリア・駅名でさがす</p>
    <form className="vBkt-sbox" method="get" action="/search" role="search" aria-label="店をさがす" onSubmit={onSubmit}>
      <label className="vBkt-sbox-area">
        <PinIcon size={18} />
        <select name="region" defaultValue="" aria-label="エリアを選ぶ">
          <option value="">エリアを選ぶ</option>
          {regions.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name}（{r.count}）
            </option>
          ))}
        </select>
      </label>
      <input name="q" type="search" enterKeyHint="search" autoComplete="off" placeholder="店名・エリア・駅名・料理名でさがす" aria-label="キーワード" />
      <button type="submit">
        <SearchIcon size={22} sw={2.4} />
        <span>さがす</span>
      </button>
    </form>
    </div>
  );
}
