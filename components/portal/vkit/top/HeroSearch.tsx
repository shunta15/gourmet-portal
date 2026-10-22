"use client";

import type { FormEvent } from "react";
import { IconPin, IconSearch, IconArrow, IconChevronDown, KindIcon } from "../common/Icons";
import type { VkIconKey } from "../config";

/**
 * 最初のページのヒーローの下の検索の箱(エリアを選ぶ / 種類を選ぶ / 名前・地名の文字入力 / 探す)。
 * 送り先は探すページ(GET。kind・pref・q)。選ばなかった欄は URL に出さない(送る直前にその欄だけ無効にして、すぐ戻す)。JS が動かなくても送れる(空の欄が付くだけ)。
 */
export type HeroSearchProps = {
  action: string;
  /** 地方ごとの都道府県(店のある所だけ。optgroup になる) */
  areas: Array<{ label: string; prefs: Array<{ slug: string; name: string }> }>;
  /** 店のある種類 */
  kinds: Array<{ slug: string; name: string }>;
  hint: string;
  /** 「〇〇を探す」の〇〇(体験・施設・場所) */
  noun: string;
  /** 種類の箱の絵 */
  icon: VkIconKey;
};

export default function HeroSearch({ action, areas, kinds, hint, noun, icon }: HeroSearchProps) {
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
    <form className="vk-t-search" action={action} method="get" role="search" onSubmit={onSubmit}>
      <label className="vk-t-seg">
        <IconPin className="vk-t-seg-i" />
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
        <IconChevronDown className="vk-t-seg-a" />
      </label>
      <label className="vk-t-seg">
        <KindIcon icon={icon} className="vk-t-seg-i" />
        <select name="kind" defaultValue="" aria-label={`${noun}の種類を選ぶ`} disabled={kinds.length === 0}>
          <option value="">{noun}の種類を選ぶ</option>
          {kinds.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.name}
            </option>
          ))}
        </select>
        <IconChevronDown className="vk-t-seg-a" />
      </label>
      <label className="vk-t-seg vk-t-seg--q">
        <IconSearch className="vk-t-seg-i" />
        <input type="text" name="q" placeholder={hint} aria-label={hint} autoComplete="off" />
      </label>
      <button type="submit" className="vk-t-go">
        <span>{noun}を探す</span>
        <IconArrow />
      </button>
    </form>
  );
}
