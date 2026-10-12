"use client";
/**
 * 「さがす」ページ（block の見た目）の検索の箱。上の帯（写真 +「お店を探す」）の見出しのすぐ下に、大きな白い箱を常に出す（どのタブを開いていても見える）:
 *   「エリアを選ぶ」のセレクト + 入力欄 + 橙のボタン（虫めがねの絵と「さがす」の字）。入力があるときは、欄の中に消すための ×。Enter でも送れる。
 *  - いま絞り込んでいるキーワード・エリア（URL の ?q= ?region=）が、箱に入った状態で出る。
 *  - 送ると、キーワード（q）とエリア（region）だけ替わる。業種・シーン・タグ・こだわり条件・見た目（?map= ?look=）・並べ替え・タブは保つ。ページ番号は 1 に戻す。
 *  - ?tab=q（以前の「キーワード」タブ）で来たときは、入力欄にフォーカスを当てて、エリアのタブを開く（タブの列に「キーワード」は無い）。
 *  - BlockSearchSticky: 帯の箱が画面から消えたら、ヘッダーの下に細い帯（入力欄 + ボタンだけ）で留まる。出入りの動きは「動きを減らす」で無し。
 * 'use client' の部品。大きなデータは持たない（地域の名前だけ lib/regions の REGIONS から）。
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { REGIONS } from "@/lib/regions";
import { PinIcon, SearchIcon } from "./BlockSearchParts";

/** 帯の箱の id（留まる欄が、この箱が画面から消えたかを見る） */
export const SBOX_ID = "vBk-sbox";

const REGION_LIST = Object.entries(REGIONS).map(([key, r]) => ({ key, name: r.name }));

/** いまの URL の引数のうち、キーワードとエリアだけ替えた /search の URL（ほかは保つ。?tab=q は外す。ページ番号は外す） */
export function boxUrl(sp: URLSearchParams, q: string, region: string): string {
  const p = new URLSearchParams(sp.toString());
  p.delete("page");
  p.delete("q");
  p.delete("region");
  if (p.get("tab") === "q") p.delete("tab");
  const qq = q.trim();
  if (qq) p.set("q", qq);
  if (region) p.set("region", region);
  const s = p.toString();
  return `/search${s ? `?${s}` : ""}`;
}

function useBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const spQ = sp.get("q") || "";
  const spRegion = sp.get("region") || "";
  const [q, setQ] = useState(spQ);
  const [region, setRegion] = useState(spRegion in REGIONS ? spRegion : "");
  // 絞り込みが（タブ・札の × などで）替わったら、箱にも入れ直す
  useEffect(() => {
    setQ(spQ);
    setRegion(spRegion in REGIONS ? spRegion : "");
  }, [spQ, spRegion]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(boxUrl(new URLSearchParams(sp.toString()), q, region));
  };
  return { sp, q, setQ, region, setRegion, submit };
}

function Fields({ id, q, setQ, region, setRegion, inputRef, withArea, withClear, big }: { id: string; q: string; setQ: (v: string) => void; region: string; setRegion: (v: string) => void; inputRef?: React.Ref<HTMLInputElement>; withArea: boolean; withClear: boolean; big: boolean }) {
  return (
    <>
      {withArea && (
        <label className="vBk-sb-area">
          <PinIcon size={20} />
          <select name="region" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="エリアを選ぶ">
            <option value="">エリアを選ぶ</option>
            {REGION_LIST.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="vBk-sb-field">
        <label htmlFor={id} className="vBk-sb-lab">
          キーワード（店名・エリア・駅名・料理名）
        </label>
        <input id={id} ref={inputRef} name="q" type="search" enterKeyHint="search" autoComplete="off" placeholder={big ? "店名・エリア・駅名・料理名でさがす" : "店名・エリア・駅名・料理名"} value={q} onChange={(e) => setQ(e.target.value)} />
        {withClear && q && (
          <button type="button" className="vBk-sb-x" aria-label="キーワードを消す" onClick={() => { setQ(""); (document.getElementById(id) as HTMLInputElement | null)?.focus(); }}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        )}
      </div>
      <button type="submit" className="vBk-sb-go">
        <SearchIcon size={big ? 22 : 20} sw={2.4} />
        <span>さがす</span>
      </button>
    </>
  );
}

/** 帯の大きな箱 */
export function BlockSearchBox() {
  const { sp, q, setQ, region, setRegion, submit } = useBox();
  const rid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const tabQ = sp.get("tab") === "q";
  // ?tab=q で来たら、入力欄にフォーカス
  useEffect(() => {
    if (tabQ) inputRef.current?.focus({ preventScroll: true });
  }, [tabQ]);
  return (
    <form id={SBOX_ID} className="vBk-sb" role="search" aria-label="店をさがす" onSubmit={submit}>
      <Fields id={`${SBOX_ID}-q-${rid.replace(/:/g, "")}`} q={q} setQ={setQ} region={region} setRegion={setRegion} inputRef={inputRef} withArea withClear big />
    </form>
  );
}

/** JavaScript が読み込まれる前・URL の引数を読む前の、同じ形の箱（ふつうの form。空のまま送れる） */
export function BlockSearchBoxStatic() {
  return (
    <form id={SBOX_ID} className="vBk-sb" role="search" aria-label="店をさがす" method="get" action="/search">
      <label className="vBk-sb-area">
        <PinIcon size={20} />
        <select name="region" defaultValue="" aria-label="エリアを選ぶ">
          <option value="">エリアを選ぶ</option>
          {REGION_LIST.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <div className="vBk-sb-field">
        <label htmlFor={`${SBOX_ID}-q`} className="vBk-sb-lab">
          キーワード（店名・エリア・駅名・料理名）
        </label>
        <input id={`${SBOX_ID}-q`} name="q" type="search" enterKeyHint="search" autoComplete="off" placeholder="店名・エリア・駅名・料理名でさがす" />
      </div>
      <button type="submit" className="vBk-sb-go">
        <SearchIcon size={22} sw={2.4} />
        <span>さがす</span>
      </button>
    </form>
  );
}

/** 帯の箱が画面から消えたら、ヘッダーの下に細い帯（入力欄 + ボタンだけ）で留まる検索の欄。ヘッダー・ページの重なりより前へ出すため、body に出す */
export function BlockSearchSticky() {
  const { q, setQ, region, setRegion, submit } = useBox();
  const rid = useId();
  const [show, setShow] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [hd, setHd] = useState(62);
  useEffect(() => {
    setHost(document.body);
    let raf = 0;
    const measure = () => {
      raf = 0;
      // ヘッダーの高さ（--hd は暖簾の枠 .vN にある）。箱の下辺がヘッダーの下より上へ行った（= 画面の上へ消えた）とき出す
      const h = parseFloat(getComputedStyle(document.querySelector(".vN") ?? document.documentElement).getPropertyValue("--hd")) || 62;
      setHd(h);
      const el = document.getElementById(SBOX_ID);
      setShow(!!el && el.getBoundingClientRect().bottom < h + 8);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  if (!host) return null;
  return createPortal(
    <div className={`vBk vBk-stick${show ? " is-on" : ""}`} style={{ top: hd }} aria-hidden={!show}>
      <form className="vBk-stick-in" role="search" aria-label="店をさがす（画面の上に留まる欄）" onSubmit={submit}>
        <Fields id={`vBk-stick-q-${rid.replace(/:/g, "")}`} q={q} setQ={setQ} region={region} setRegion={setRegion} withArea={false} withClear={false} big={false} />
      </form>
    </div>,
    host,
  );
}
