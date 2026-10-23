"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconMenu } from "./Icons";
import { syLinks, type SyMode } from "./site";

// メニューは「トップ」「探す」「店舗紹介」「特集」の 4 つ(2026-10-24 オーナー決定。全 8 業種で同じ並び・同じ文字。「探す」だけは業種の今の呼び名のまま)。
// 店舗紹介 = 全宿の札の一覧 /stay/shop、特集 = 利用シーン記事・業種の特集記事の一覧 /stay/special。
// 以前の「エリアから探す」「宿の種類から探す」(最初のページの中の節へ飛ぶだけ)・「マチノワステイについて」(/about。フッターに残す)・
// 検索のアイコンと最初のページの「宿を探す →」の枠(どちらも探すと同じ行き先)・お気に入りのハート(押しても保存されない見た目だけのボタン)・PC のメニューのドロワーは外した。
function navOf(mode: SyMode): Array<{ label: string; href: string }> {
  const L = syLinks(mode);
  return [
    { label: "トップ", href: L.home },
    { label: "宿を探す", href: L.search },
    { label: "店舗紹介", href: L.shops },
    { label: "特集", href: L.specials },
  ];
}

/**
 * 4 枚の見本に共通の上の帯。左にロゴ、ナビ 4 つ(PC)。スマホ(999px 以下)はナビの代わりに右にメニュー(ハンバーガー)だけで、開くと同じ 4 つ。
 * 4 枚の見本は帯の高さ・地の色・ナビの位置が少しずつ違うので、Shell の page で base.css が切り替える:
 *   top     … 地が透けてヒーローの上に重なる。ロゴは濃い字、ナビは白(写真の上)。スクロールすると明るい帯になる
 *   search  … 左 65% が明るい帯、右は透けてヒーローの写真の上。スクロールすると全面が明るい帯になる
 *   shop    … 濃い紺の帯(明るい字)
 *   article … 明るい帯(濃い字)。ナビの間に細い縦線
 * 隠れる/現れる・今のヘッダーの下端(--sy-hy)は Motion の MotionFx が受け持つ([data-sy-head])。
 */
export default function Header({ mode = "proto" }: { mode?: SyMode }) {
  const L = syLinks(mode);
  const NAV = navOf(mode);
  const [open, setOpen] = useState(false);
  return (
    <header className="sy-head" data-sy-head>
      <div className="sy-head-in">
        <Link href={L.home} className="sy-head-logo" aria-label="マチノワステイ トップ" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="sy-head-nav" aria-label="主なページ">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="sy-head-ic">
          <button type="button" className="sy-hi sy-hi--menu" aria-label="メニュー" aria-expanded={open} aria-controls="sy-drawer" onClick={() => setOpen((v) => !v)}>
            <span className="sy-hi-i">
              <IconMenu />
            </span>
            <span className="sy-hi-l">メニュー</span>
          </button>
        </div>
      </div>
      <nav id="sy-drawer" className="sy-drawer" aria-label="メニュー" data-open={open ? "1" : "0"}>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
