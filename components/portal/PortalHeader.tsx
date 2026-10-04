"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import SearchSuggest from "./SearchSuggest";
import { useSiteSearch } from "./useSiteSearch";

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

/**
 * 総合サイト用ヘッダー。ロゴ「マチノワ」＋業種の切り替え＋検索。
 * 検索は総合サイトの /find?q= へ素の GET フォームで渡す（JS が無くても動く）。JS があるときは、入力に応じて
 * 候補（駅・都道府県・市区町村・業種と種類・店）を出す（useSiteSearch・SearchSuggest。候補データは初回フォーカス時に取得）。
 * グルメの既存 /search は変えない（総合サイトからは使わない）。
 */
export default function PortalHeader() {
  const pathname = usePathname() ?? "/";
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const hs = useSiteSearch({
    onNavigate: () => setSearch(false),
    // 候補が閉じているときの Esc は、検索欄を閉じて開くボタンへ戻る
    onEscapeWhenClosed: () => {
      setSearch(false);
      toggle.current?.focus();
    },
  });
  const ms = useSiteSearch({ onNavigate: () => setMenu(false) });

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("mp-menu-open", menu);
    return () => document.documentElement.classList.remove("mp-menu-open");
  }, [menu]);

  useEffect(() => {
    if (search) input.current?.focus();
  }, [search]);

  const current = ORDER.find((k) => {
    const p = VERTICALS[k].path;
    return pathname === p || pathname.startsWith(p + "/");
  });

  return (
    <>
      <header className="mp-hd">
        <Link href="/" className="mp-hd-logo" data-cursor="HOME" aria-label="マチノワ トップへ">
          <span className="ja">マチノワ</span>
          <span className="en">Machinowa</span>
        </Link>

        <nav className="mp-hd-nav" aria-label="業種">
          {ORDER.map((k) => {
            const v = VERTICALS[k];
            const on = current === k;
            return (
              <Link
                key={k}
                href={v.path}
                className={on ? "on" : undefined}
                aria-current={on ? "page" : undefined}
                style={{ ["--ac" as string]: v.accent.color }}
                data-cursor={VERTICAL_FACE[k].en.toUpperCase()}
              >
                <i aria-hidden="true" />
                {v.name}
              </Link>
            );
          })}
        </nav>

        <div className="mp-hd-right">
          <form className={`mp-hd-search${search ? " open" : ""}`} action="/find" method="get" role="search">
            <input
              ref={input}
              type="search"
              name="q"
              placeholder="駅・エリア・店名で探す"
              aria-label="駅・エリア・店名で検索"
              tabIndex={search ? 0 : -1}
              {...hs.inputProps}
            />
            <button
              ref={toggle}
              type={search ? "submit" : "button"}
              className="mp-hd-sbtn"
              aria-label={search ? "検索する" : "検索を開く"}
              onClick={(e) => {
                if (!search) {
                  e.preventDefault();
                  setSearch(true);
                }
              }}
              data-cursor="SEARCH"
            >
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M13 13l4.5 4.5" strokeLinecap="round" />
              </svg>
            </button>
            {search && <SearchSuggest s={hs} />}
          </form>
          <button
            type="button"
            className="mp-hd-burger"
            aria-expanded={menu}
            aria-controls="mp-menu"
            aria-label="メニュー"
            onClick={() => setMenu((v) => !v)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      <div id="mp-menu" className={`mp-menu${menu ? " open" : ""}`} aria-hidden={!menu}>
        <ol>
          {ORDER.map((k, i) => {
            const v = VERTICALS[k];
            return (
              <li key={k} style={{ ["--i" as string]: i, ["--ac" as string]: v.accent.color }}>
                <Link href={v.path} tabIndex={menu ? 0 : -1}>
                  <small>0{i + 1}</small>
                  <b>{v.name}</b>
                  <em>{VERTICAL_FACE[k].en}</em>
                </Link>
              </li>
            );
          })}
        </ol>
        <form className="mp-menu-search" action="/find" method="get" role="search">
          <input
            type="search"
            name="q"
            placeholder="駅・エリア・店名で探す"
            aria-label="駅・エリア・店名で検索"
            tabIndex={menu ? 0 : -1}
            {...ms.inputProps}
          />
          <button type="submit" tabIndex={menu ? 0 : -1}>検索</button>
          {menu && <SearchSuggest s={ms} className="up" />}
        </form>
      </div>
    </>
  );
}
