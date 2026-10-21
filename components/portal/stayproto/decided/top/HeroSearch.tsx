"use client";

import type { FormEvent } from "react";
import { IconPin, IconBed, IconSearch, IconArrow, IconChevronDown } from "../common/Icons";

/**
 * 最初のページのヒーローの下の検索の箱(見本の「エリアを選ぶ / 宿の種類を選ぶ / チェックイン・チェックアウト / 宿を探す」)。
 * 見本の 3 つ目(日付)は予約の箱なので置き換え、宿名・地名の文字入力にしてある。送り先は探すページ(GET。kind・pref・q)。
 * 選ばなかった欄は URL に出さない(送る直前にその欄だけ無効にして、すぐ戻す)。JS が動かなくても送れる(空の欄が付くだけ)。
 */
export type HeroSearchProps = {
  action: string;
  /** 地方ごとの都道府県(宿のある所だけ。optgroup になる) */
  areas: Array<{ label: string; prefs: Array<{ slug: string; name: string }> }>;
  /** 宿のある種類 */
  kinds: Array<{ slug: string; name: string }>;
  hint: string;
};

export default function HeroSearch({ action, areas, kinds, hint }: HeroSearchProps) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const off: Array<HTMLSelectElement | HTMLInputElement> = [];
    for (const el of Array.from(e.currentTarget.elements)) {
      if ((el instanceof HTMLSelectElement || el instanceof HTMLInputElement) && el.name && !el.value.trim()) {
        el.disabled = true;
        off.push(el);
      }
    }
    window.setTimeout(() => off.forEach((el) => (el.disabled = false)), 0);
  };
  return (
    <form className="sy-t-search" action={action} method="get" role="search" onSubmit={onSubmit}>
      <label className="sy-t-seg">
        <IconPin className="sy-t-seg-i" />
        <select name="pref" defaultValue="" aria-label="エリアを選ぶ" disabled={areas.length === 0}>
          <option value="">エリアを選ぶ</option>
          {areas.map((a) => (
            <optgroup key={a.label} label={a.label}>
              {a.prefs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <IconChevronDown className="sy-t-seg-a" />
      </label>
      <label className="sy-t-seg">
        <IconBed className="sy-t-seg-i" />
        <select name="kind" defaultValue="" aria-label="宿の種類を選ぶ" disabled={kinds.length === 0}>
          <option value="">宿の種類を選ぶ</option>
          {kinds.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.name}
            </option>
          ))}
        </select>
        <IconChevronDown className="sy-t-seg-a" />
      </label>
      <label className="sy-t-seg sy-t-seg--q">
        <IconSearch className="sy-t-seg-i" />
        <input type="text" name="q" placeholder={hint} aria-label={hint} autoComplete="off" />
      </label>
      <button type="submit" className="sy-t-go">
        <span>宿を探す</span>
        <IconArrow />
      </button>
    </form>
  );
}
