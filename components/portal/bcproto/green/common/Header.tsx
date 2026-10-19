"use client";

import { useState } from "react";
import Link from "next/link";
import { BASE, SEARCH_HREF, SCENE_HREF, GUIDE_HREF, IMG_COMMON } from "./site";

const NAV: Array<{ label: string; href: string }> = [
  { label: "エリアから探す", href: SEARCH_HREF },
  { label: "施術の種類から探す", href: SEARCH_HREF },
  { label: "お悩みから探す", href: SEARCH_HREF },
  { label: "特集", href: SCENE_HREF },
  { label: "お役立ちコラム", href: GUIDE_HREF },
];

/**
 * 3 枚の見本に共通の上の帯(高さは --gr-hh。最初・探す=54/52px、店舗詳細=48px)。
 * ロゴ(見本から切り出した画像)+ ナビ + お気に入り・閲覧履歴 + 緑の「エリアを選ぶ」。
 * 隠れる/現れる・上端の線は GreenFx が受け持つ([data-gr-head])。
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="gr-head" data-gr-head>
      <div className="gr-head-in">
        <Link href={BASE} className="gr-logo" aria-label="マチノワ Body Care トップ" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG_COMMON}/logo.webp`} width={214} height={46} alt="マチノワ.Body Care からだが整うと、毎日が変わる。" />
        </Link>
        <nav className="gr-nav" aria-label="主なページ">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="gr-head-r">
          <Link href={SEARCH_HREF} className="gr-hr-i">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            <span>お気に入り</span>
          </Link>
          <Link href={SEARCH_HREF} className="gr-hr-i">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12 7.2V12l3.2 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>閲覧履歴</span>
          </Link>
          <Link href={SEARCH_HREF} className="gr-area-btn gr-press gr-shimmer">
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path d="M12 21.2s-6.6-6-6.6-11.3a6.6 6.6 0 0 1 13.2 0C18.6 15.2 12 21.2 12 21.2z" fill="currentColor" />
              <circle cx="12" cy="9.7" r="2.5" fill="#2f5a3d" />
            </svg>
            <span>エリアを選ぶ</span>
            <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" className="gr-caret">
              <path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button type="button" className="gr-menu-btn" aria-label="メニュー" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <nav className="gr-drawer" aria-label="メニュー" data-open={open ? "1" : "0"}>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        <Link href={SEARCH_HREF} onClick={() => setOpen(false)}>
          お気に入り・閲覧履歴
        </Link>
      </nav>
    </header>
  );
}
