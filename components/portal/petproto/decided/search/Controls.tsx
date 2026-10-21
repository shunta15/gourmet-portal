"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import { IconSearch } from "../common/Icons";
import { IconCar, IconCalendar, IconCategory, IconChevronDown, IconChevronLR, IconDogFace, IconHouse, IconTerrace, IconYen } from "./SearchIcons";

/**
 * 探すページの触れる部品(クライアント)。
 *  - Dropdown      : 開くプルダウン(条件の箱・並び替え・カテゴリ)。外を押す/Esc で閉じる
 *  - FilterBar     : 条件 6 つ。スマホでは「条件で絞る」ボタンで開く引き出し
 *  - SearchBox     : ヒーローの下の検索の箱(エリア・駅名 / カテゴリ / この条件で検索)
 *  - SortSelect    : 並び替え
 *  - Pager         : ページ送り
 */
type Icon = ComponentType<SVGProps<SVGSVGElement>>;

function useOutside(ref: React.RefObject<HTMLElement | null>, on: boolean, close: () => void) {
  useEffect(() => {
    if (!on) return;
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [ref, on, close]);
}

type DropProps = {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  className?: string;
  menuClassName?: string;
  label: string;
  children: (open: boolean) => React.ReactNode;
};
/** 開くプルダウン。children は押す部分の中身(open を受け取る) */
function Dropdown({ options, value, onChange, className = "", menuClassName = "", label, children }: DropProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useOutside(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className={`sr-dd ${open ? "is-open" : ""} ${className}`.trim()}>
      <button type="button" className="sr-dd-btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-label={label} onClick={() => setOpen((v) => !v)}>
        {children(open)}
      </button>
      <ul id={id} role="listbox" className={`sr-dd-menu ${menuClassName}`.trim()} aria-label={label}>
        {options.map((o) => (
          <li key={o} role="option" aria-selected={o === value}>
            <button
              type="button"
              className={o === value ? "is-on" : ""}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------------ 条件(6 つ)
export type FilterDef = { key: string; label: string; value: string; options: string[]; icon: "dog" | "house" | "terrace" | "car" | "calendar" | "yen" };

const ICONS: Record<FilterDef["icon"], Icon> = { dog: IconDogFace, house: IconHouse, terrace: IconTerrace, car: IconCar, calendar: IconCalendar, yen: IconYen };

export function FilterBar({ filters }: { filters: FilterDef[] }) {
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(filters.map((f) => [f.key, f.value])));
  const [drawer, setDrawer] = useState(false);
  const picked = filters.filter((f) => vals[f.key] !== f.value).length;
  useEffect(() => {
    if (!drawer) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    if (window.matchMedia("(max-width: 859px)").matches) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [drawer]);
  return (
    <>
      <button type="button" className="sr-fopen pt-press" aria-expanded={drawer} aria-controls="sr-filters" onClick={() => setDrawer(true)}>
        <span>条件で絞る</span>
        {picked ? <em>{picked}</em> : null}
        <IconChevronDown />
      </button>
      <div className="sr-fback" data-open={drawer ? "1" : "0"} onClick={() => setDrawer(false)} aria-hidden="true" />
      <div id="sr-filters" className="sr-filters" data-open={drawer ? "1" : "0"} role="group" aria-label="条件を絞る">
        <div className="sr-fhead">
          <strong>条件で絞る</strong>
          <button type="button" className="sr-fclose" aria-label="閉じる" onClick={() => setDrawer(false)}>
            ×
          </button>
        </div>
        <div className="sr-fgrid" data-io-group>
          {filters.map((f, i) => {
            const I = ICONS[f.icon];
            return (
              <div key={f.key} className={`sr-fp sr-fp${i + 1} io`}>
                <Dropdown label={f.label} options={f.options} value={vals[f.key]} onChange={(v) => setVals((s) => ({ ...s, [f.key]: v }))} className="sr-fdd" menuClassName="sr-fmenu">
                  {() => (
                    <span className="sr-pill pt-hov pt-press">
                      <span className="sr-pill-i pt-bounce">
                        <I className="pt-draw" />
                      </span>
                      <span className="sr-pill-t">
                        <span className="sr-pill-l">{f.label}</span>
                        <span className="sr-pill-v">{vals[f.key]}</span>
                      </span>
                      <IconChevronDown className="sr-pill-c" />
                    </span>
                  )}
                </Dropdown>
              </div>
            );
          })}
        </div>
        <button type="button" className="sr-fdone pt-btn pt-press" onClick={() => setDrawer(false)}>
          この条件で見る
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ 検索の箱
const CATEGORIES = ["すべて", "カフェ・飲食店", "ペットホテル・宿泊", "ドッグラン", "動物病院・クリニック", "ペット用品・ショップ"];
export function SearchBox() {
  const [area, setArea] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const go = (e: FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("sr-results");
    if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  return (
    <form className="sr-box" role="search" onSubmit={go}>
      <span className="sr-box-ic1" aria-hidden="true">
        <IconSearch />
      </span>
      <label className="sr-bf sr-bf1">
        <span className="sr-bf-l">エリア・駅名</span>
        <input type="text" className="sr-bf-in" placeholder="(例：東京、横浜、鎌倉)" value={area} onChange={(e) => setArea(e.target.value)} autoComplete="off" />
      </label>
      <i className="sr-box-div" aria-hidden="true" />
      <span className="sr-box-ic2" aria-hidden="true">
        <IconCategory />
      </span>
      <div className="sr-bf sr-bf2">
        <Dropdown label="カテゴリ" options={CATEGORIES} value={cat} onChange={setCat} className="sr-cdd" menuClassName="sr-cmenu">
          {() => (
            <span className="sr-cbtn">
              <span className="sr-bf-l">カテゴリ</span>
              <span className={`sr-bf-in ${cat ? "is-set" : ""}`}>{cat ?? "(例：カフェ、宿泊、ドッグラン)"}</span>
              <IconChevronDown className="sr-cchev" />
            </span>
          )}
        </Dropdown>
      </div>
      <button type="submit" className="sr-go pt-press pt-shimmer pt-hov">
        <IconSearch className="sr-go-i" />
        <span>この条件で検索</span>
      </button>
    </form>
  );
}

// ------------------------------------------------------------------ 並び替え
export function SortSelect() {
  const [v, setV] = useState("おすすめ順");
  return (
    <div className="sr-sort">
      <span className="sr-sort-l">並び替え</span>
      <Dropdown label="並び替え" options={["おすすめ順", "新着順", "名前順"]} value={v} onChange={setV} className="sr-sdd" menuClassName="sr-smenu">
        {() => (
          <span className="sr-sort-b pt-press">
            <span>{v}</span>
            <IconChevronDown className="sr-sort-c" />
          </span>
        )}
      </Dropdown>
    </div>
  );
}

// ------------------------------------------------------------------ ページ送り
export function Pager({ total = 125 }: { total?: number }) {
  const [cur, setCur] = useState(1);
  const go = (n: number) => setCur(Math.min(total, Math.max(1, n)));
  const nums = [1, 2, 3, 4, 5];
  return (
    <nav className="sr-pager" aria-label="ページ送り">
      <button type="button" className="sr-pg sr-pg-arrow sr-pg-prev pt-press" aria-label="前のページ" disabled={cur === 1} onClick={() => go(cur - 1)}>
        <IconChevronLR dir="left" />
      </button>
      {nums.map((n) => (
        <button key={n} type="button" className={`sr-pg sr-pg-n sr-pg-n${n} pt-press ${cur === n ? "is-on" : ""}`} aria-current={cur === n ? "page" : undefined} onClick={() => go(n)}>
          {n}
        </button>
      ))}
      <span className="sr-pg-dots" aria-hidden="true">
        …
      </span>
      <button type="button" className={`sr-pg sr-pg-last pt-press ${cur === total ? "is-on" : ""}`} aria-current={cur === total ? "page" : undefined} onClick={() => go(total)}>
        {total}
      </button>
      <button type="button" className="sr-pg sr-pg-arrow sr-pg-next pt-press" aria-label="次のページ" disabled={cur === total} onClick={() => go(cur + 1)}>
        <IconChevronLR dir="right" />
      </button>
    </nav>
  );
}
