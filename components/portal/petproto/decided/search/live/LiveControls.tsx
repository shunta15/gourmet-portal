"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch, IconPin } from "../../common/Icons";
import { IconCategory, IconChevronDown, IconDogFace } from "../SearchIcons";
import { IconTag } from "./LiveIcons";

/**
 * 探すページ(本番)の触れる部品(クライアント)。見本(../Controls.tsx)と同じ見た目・動きで、中身は実在のデータ。
 * 状態は URL の引数(kind・pref・tag・animal・q・sort・page)。選ぶとリンクで移動する(サーバーが絞り込んで描き直す)ので、
 * 選択肢は <a> として HTML に入っている(検索エンジンも辿れる)。
 *  - LinkDropdown : 開くプルダウン(選択肢はリンク)。外を押す/Esc で閉じる
 *  - FilterBar    : 条件(最大 4 つ)。スマホでは「条件で絞る」ボタンで開く引き出し
 *  - SearchBox    : ヒーローの下の検索の箱(エリア・店名 / 種類 / この条件で検索)
 *  - SortSelect   : 並び替え(エリア順・店名順)
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

export type LinkOption = { label: string; href: string; on: boolean };

type DropProps = {
  options: LinkOption[];
  className?: string;
  menuClassName?: string;
  label: string;
  /** 選んだあとに呼ぶ(スマホの引き出しを閉じる等) */
  onPick?: () => void;
  children: (open: boolean) => React.ReactNode;
};
/** 開くプルダウン(選択肢はリンク)。children は押す部分の中身 */
function LinkDropdown({ options, className = "", menuClassName = "", label, onPick, children }: DropProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useOutside(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className={`lsr-dd ${open ? "is-open" : ""} ${className}`.trim()}>
      <button type="button" className="lsr-dd-btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-label={label} onClick={() => setOpen((v) => !v)}>
        {children(open)}
      </button>
      <ul id={id} role="listbox" className={`lsr-dd-menu ${menuClassName}`.trim()} aria-label={label}>
        {options.map((o) => (
          <li key={o.label + o.href} role="option" aria-selected={o.on}>
            <Link
              href={o.href}
              prefetch={false}
              className={o.on ? "is-on" : ""}
              onClick={() => {
                setOpen(false);
                onPick?.();
              }}
            >
              {o.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------------ 条件
export type PillIcon = "category" | "pin" | "dog" | "tag";
export type PillDef = { key: string; label: string; value: string; active: boolean; options: LinkOption[]; icon: PillIcon };

const PILL_ICONS: Record<PillIcon, Icon> = { category: IconCategory, pin: IconPin, dog: IconDogFace, tag: IconTag };

export function FilterBar({ pills }: { pills: PillDef[] }) {
  const [drawer, setDrawer] = useState(false);
  const picked = pills.filter((f) => f.active).length;
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
      <button type="button" className="lsr-fopen pt-press" aria-expanded={drawer} aria-controls="lsr-filters" onClick={() => setDrawer(true)}>
        <span>条件で絞る</span>
        {picked ? <em>{picked}</em> : null}
        <IconChevronDown />
      </button>
      <div className="lsr-fback" data-open={drawer ? "1" : "0"} onClick={() => setDrawer(false)} aria-hidden="true" />
      <div id="lsr-filters" className="lsr-filters" data-open={drawer ? "1" : "0"} data-n={pills.length} role="group" aria-label="条件を絞る">
        <div className="lsr-fhead">
          <strong>条件で絞る</strong>
          <button type="button" className="lsr-fclose" aria-label="閉じる" onClick={() => setDrawer(false)}>
            ×
          </button>
        </div>
        <div className="lsr-fgrid">
          {pills.map((f, i) => {
            const I = PILL_ICONS[f.icon];
            return (
              <div key={f.key} className="lsr-fp pt-popin" style={{ ["--d" as string]: `${760 + i * 100}ms` }}>
                <LinkDropdown label={f.label} options={f.options} className="lsr-fdd" menuClassName="lsr-fmenu" onPick={() => setDrawer(false)}>
                  {() => (
                    <span className="lsr-pill pt-hov pt-press">
                      <span className="lsr-pill-i pt-bounce">
                        <I className="pt-draw" />
                      </span>
                      <span className="lsr-pill-t">
                        <span className="lsr-pill-l">{f.label}</span>
                        <span className="lsr-pill-v">{f.value}</span>
                      </span>
                      <IconChevronDown className="lsr-pill-c" />
                    </span>
                  )}
                </LinkDropdown>
              </div>
            );
          })}
        </div>
        <button type="button" className="lsr-fdone pt-btn pt-press" onClick={() => setDrawer(false)}>
          この条件で見る
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ 検索の箱
/** 例文を、箱がポップインしたあとにタイプライターで打つ(打ち終わるとそのまま残る)。動きを減らす設定では打たずに最初から全文。start = 打ち始める ms */
function useTypewriter(full: string, start: number, speed: number): string {
  const [t, setT] = useState(full);
  useEffect(() => {
    if (!full || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let iv = 0;
    setT("");
    const to = window.setTimeout(() => {
      iv = window.setInterval(() => {
        i++;
        setT(full.slice(0, i));
        if (i >= full.length) window.clearInterval(iv);
      }, speed);
    }, start);
    return () => {
      window.clearTimeout(to);
      window.clearInterval(iv);
      setT(full);
    };
  }, [full, start, speed]);
  return t;
}

export type BoxProps = {
  action: string;
  q: string;
  kind: string;
  /** 検索のときにそのまま引き継ぐ条件(pref・tag・animal・sort) */
  keep: Record<string, string>;
  kinds: Array<{ slug: string; name: string }>;
  /** データにある地名・種類から作った例文(無ければ空) */
  areaEx: string;
  kindEx: string;
};

export function SearchBox({ action, q, kind, keep, kinds, areaEx, kindEx }: BoxProps) {
  const router = useRouter();
  const [area, setArea] = useState(q);
  const [cat, setCat] = useState(kind);
  // 条件のプルダウン・並び替え・ページ送りで URL が変わっても箱は作り直されないので、URL の値に合わせ直す
  useEffect(() => setArea(q), [q]);
  useEffect(() => setCat(kind), [kind]);
  const ph1 = useTypewriter(areaEx, 1250, 85);
  const ph2 = useTypewriter(kindEx, 2500, 70);
  const catName = kinds.find((k) => k.slug === cat)?.name;
  const go = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (cat) p.set("kind", cat);
    for (const [k, v] of Object.entries(keep)) if (v) p.set(k, v);
    const text = area.replace(/\s+/g, " ").trim();
    if (text) p.set("q", text);
    const s = p.toString();
    router.push(`${action}${s ? `?${s}` : ""}#lsr-results`);
  };
  return (
    <form className="lsr-box" role="search" action={action} method="get" onSubmit={go}>
      <span className="lsr-box-ic1 pt-popin" style={{ ["--d" as string]: "900ms" }} aria-hidden="true">
        <IconSearch />
      </span>
      <label className="lsr-bf lsr-bf1">
        <span className="lsr-bf-l">エリア・店名</span>
        <input type="text" name="q" className="lsr-bf-in" placeholder={ph1 || " "} value={area} onChange={(e) => setArea(e.target.value)} autoComplete="off" maxLength={40} />
      </label>
      <i className="lsr-box-div" aria-hidden="true" />
      <span className="lsr-box-ic2 pt-popin" style={{ ["--d" as string]: "1000ms" }} aria-hidden="true">
        <IconCategory />
      </span>
      <div className="lsr-bf lsr-bf2">
        <KindPicker kinds={kinds} cat={cat} onChange={setCat}>
          <span className="lsr-cbtn">
            <span className="lsr-bf-l">種類</span>
            <span className={`lsr-bf-in ${catName ? "is-set" : ""}`}>{catName ?? (ph2 || "すべて")}</span>
            <IconChevronDown className="lsr-cchev" />
          </span>
        </KindPicker>
        {cat ? <input type="hidden" name="kind" value={cat} /> : null}
      </div>
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <button type="submit" className="lsr-go pt-press pt-shimmer pt-hov pt-magnet">
        <IconSearch className="lsr-go-i" />
        <span>この条件で検索</span>
      </button>
    </form>
  );
}

/** 検索の箱の中の「種類」の選び先(選ぶと箱の中の状態が変わるだけ。検索ボタンで移動する) */
function KindPicker({ kinds, cat, onChange, children }: { kinds: Array<{ slug: string; name: string }>; cat: string; onChange: (v: string) => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useOutside(ref, open, () => setOpen(false));
  const all = [{ slug: "", name: "すべて" }, ...kinds];
  return (
    <div ref={ref} className={`lsr-dd lsr-cdd ${open ? "is-open" : ""}`}>
      <button type="button" className="lsr-dd-btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-label="種類" onClick={() => setOpen((v) => !v)}>
        {children}
      </button>
      <ul id={id} role="listbox" className="lsr-dd-menu lsr-cmenu" aria-label="種類">
        {all.map((k) => (
          <li key={k.slug || "all"} role="option" aria-selected={k.slug === cat}>
            <button
              type="button"
              className={k.slug === cat ? "is-on" : ""}
              onClick={() => {
                onChange(k.slug);
                setOpen(false);
              }}
            >
              {k.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------------ 並び替え
export function SortSelect({ value, options }: { value: string; options: LinkOption[] }) {
  return (
    <div className="lsr-sort">
      <span className="lsr-sort-l">並び替え</span>
      <LinkDropdown label="並び替え" options={options} className="lsr-sdd" menuClassName="lsr-smenu">
        {() => (
          <span className="lsr-sort-b pt-press">
            <span>{value}</span>
            <IconChevronDown className="lsr-sort-c" />
          </span>
        )}
      </LinkDropdown>
    </div>
  );
}
