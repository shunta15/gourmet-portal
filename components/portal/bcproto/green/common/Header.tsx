"use client";

import { useState } from "react";
import Link from "next/link";
import { BASE, SEARCH_HREF, SHOPS_HREF, SPECIAL_HREF, IMG_COMMON } from "./site";

// メニューは「トップ」「探す」「店舗紹介」「特集」の 4 つだけ(2026-10-24 オーナー決定。業種のページは「最初・探す・店舗紹介・特集」の 4 種類)。お気に入り・閲覧履歴は本番に機能が無いので置かない。
// 最初のページの節へ飛ぶだけだった「エリアから探す」「施術の種類から探す」「こだわりから探す」は外した(同じ絞り込みは最初のページ本体と探すページにある)。
// PC もスマホも 4 つ全部をメニューに出す(PC は横に 4 つ、スマホはメニューを開くと 4 つ)。PC の右の緑のボタン「店を探す」(見本では「エリアを選ぶ」。2026-10-24 オーナー指示で文字だけ変更)は見本にあるボタンで、メニューの数には入れない(行き先は「店を探す」と同じ。オーナー判断待ち)。
// 「店舗紹介」は /bodycare/shop(掲載中の全店の札の一覧)、「特集」は /bodycare/special(業種の特集記事)。マチノワ トップ・運営の案内はフッターの小さな 1 行。
const NAV: Array<{ label: string; href: string }> = [
  { label: "トップ", href: BASE },
  { label: "店を探す", href: SEARCH_HREF },
  { label: "店舗紹介", href: SHOPS_HREF },
  { label: "特集", href: SPECIAL_HREF },
];

/**
 * 3 枚の見本に共通の上の帯(高さは --gr-hh。最初・探す=54/52px、店舗詳細=48px)。
 * ロゴ(見本から切り出した画像)+ ナビ + 緑の「店を探す」(= 探す)。
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
          <Link href={SEARCH_HREF} className="gr-area-btn gr-press gr-shimmer">
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path d="M12 21.2s-6.6-6-6.6-11.3a6.6 6.6 0 0 1 13.2 0C18.6 15.2 12 21.2 12 21.2z" fill="currentColor" />
              <circle cx="12" cy="9.7" r="2.5" fill="#2f5a3d" />
            </svg>
            <span>店を探す</span>
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
      </nav>
    </header>
  );
}
