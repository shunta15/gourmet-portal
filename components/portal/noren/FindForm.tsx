"use client";
import type { FormEvent, ReactNode } from "react";

/**
 * 地域のページ・シーンのページの「絞り込みの帯」の form。ふつうの <form method="get" action="/search">（JavaScript が動かなくても送れる）。
 * 押すと /search?<条件>… へ移る。条件は、固定の条件（hidden。地域のページなら region、シーンのページなら scene）と、帯の中の入力・選択・押したボタン（name・value）。
 * 送る直前だけ、空の入力・選択を一時的に無効にして、URL に空の引数（?q=&region= など）を付けない（送ったあとすぐ元に戻す。OpenSearchForm と同じ）。
 */
export default function FindForm({ hidden, label, className = "", children }: { hidden: Record<string, string>; label: string; className?: string; children: ReactNode }) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const off: (HTMLInputElement | HTMLSelectElement)[] = [];
    for (const el of Array.from(e.currentTarget.elements)) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement) || !el.name || el.type === "hidden") continue;
      if (el instanceof HTMLInputElement) el.value = el.value.trim();
      if (!el.value) {
        el.disabled = true;
        off.push(el);
      }
    }
    window.setTimeout(() => off.forEach((el) => (el.disabled = false)), 0);
  };
  return (
    <form className={`vFb-form ${className}`.trim()} method="get" action="/search" role="search" aria-label={label} onSubmit={onSubmit}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
    </form>
  );
}
