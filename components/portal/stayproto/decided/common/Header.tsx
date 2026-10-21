"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconSearch, IconHeart, IconMenu, IconArrow } from "./Icons";
import { syLinks, type SyMode } from "./site";

// 見本のナビ 4 つ(エリアから探す・宿の種類から探す・特集記事・マチノワステイについて)。
function navOf(mode: SyMode): Array<{ label: string; href: string }> {
  const L = syLinks(mode);
  return [
    { label: "エリアから探す", href: L.areaAnchor },
    { label: "宿の種類から探す", href: L.typeAnchor },
    { label: "特集記事", href: L.articles },
    { label: "マチノワステイについて", href: L.about },
  ];
}

/**
 * 4 枚の見本に共通の上の帯。左にロゴ、ナビ 4 つ、右に 検索・お気に入り・メニュー(アイコン+小さな字)。
 * 4 枚の見本は帯の高さ・地の色・ナビの位置・アイコンの並べ方が少しずつ違うので、Shell の page で base.css が切り替える:
 *   top     … 地が透けてヒーローの上に重なる。ロゴは濃い字、ナビと右のアイコンは白(写真の上)。右端に「宿を探す →」の枠だけのボタン。スクロールすると明るい帯になる
 *   search  … 左 65% が明るい帯、右は透けてヒーローの写真の上(白いアイコン)。アイコンは字が下。スクロールすると全面が明るい帯になる
 *   shop    … 濃い紺の帯(明るい字)。アイコンは字が下
 *   article … 明るい帯(濃い字)。アイコンの横に字
 * 隠れる/現れる・今のヘッダーの下端(--sy-hy)は Motion の MotionFx が受け持つ([data-sy-head])。
 * お気に入りは見た目だけの切り替え(ペットと同じ。保存はしない)。
 */
export default function Header({ mode = "proto", page = "top" }: { mode?: SyMode; page?: "top" | "search" | "shop" | "article" }) {
  const L = syLinks(mode);
  const NAV = navOf(mode);
  const [open, setOpen] = useState(false);
  const [fav, setFav] = useState(false);
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
          <Link href={L.search} className="sy-hi" aria-label="検索" onClick={() => setOpen(false)}>
            <span className="sy-hi-i">
              <IconSearch />
            </span>
            <span className="sy-hi-l">検索</span>
          </Link>
          <button type="button" className={`sy-hi ${fav ? "is-on" : ""}`} aria-pressed={fav} aria-label="お気に入り" onClick={() => setFav((v) => !v)}>
            <span className="sy-hi-i">
              <IconHeart />
            </span>
            <span className="sy-hi-l">お気に入り</span>
          </button>
          <button type="button" className="sy-hi sy-hi--menu" aria-label="メニュー" aria-expanded={open} aria-controls="sy-drawer" onClick={() => setOpen((v) => !v)}>
            <span className="sy-hi-i">
              <IconMenu />
            </span>
            <span className="sy-hi-l">メニュー</span>
          </button>
        </div>
        {page === "top" ? (
          <Link href={L.search} className="sy-head-cta" onClick={() => setOpen(false)}>
            <span>宿を探す</span>
            <IconArrow />
          </Link>
        ) : null}
      </div>
      <nav id="sy-drawer" className="sy-drawer" aria-label="メニュー" data-open={open ? "1" : "0"}>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        <Link href={L.search} onClick={() => setOpen(false)}>
          宿を探す
        </Link>
        <Link href={L.home} onClick={() => setOpen(false)}>
          マチノワステイ トップ
        </Link>
      </nav>
    </header>
  );
}
