"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconSearch, IconHeart, IconMenu } from "./Icons";
import { ptLinks, type PtMode } from "./site";

// 見本のナビ 4 つ。「マチノワPetについて」は試作に行き先が無いので、フッターの帯と同じく # にしてある(本番 live は /about)。
function navOf(mode: PtMode): Array<{ label: string; href: string }> {
  const L = ptLinks(mode);
  return [
    { label: "エリアから探す", href: L.areaAnchor },
    { label: "カテゴリから探す", href: L.categoryAnchor },
    { label: "特集記事", href: L.articles },
    { label: "マチノワPetについて", href: mode === "live" ? "/about" : "#" },
  ];
}

/**
 * 4 枚の見本に共通の上の帯。左にロゴ、中央にナビ 4 つ、右に 検索・お気に入り・メニュー(アイコン+小さな字)。
 * 高さ・ロゴの大きさ・ナビの位置はページごとに少し違う(見本の画像が別々なので)。Shell の page で base.css が切り替える。
 * 隠れる/現れる・上端の線・今のヘッダーの下端(--pt-hy)は Motion の MotionFx が受け持つ([data-pt-head])。
 */
export default function Header({ mode = "proto" }: { mode?: PtMode }) {
  const L = ptLinks(mode);
  const NAV = navOf(mode);
  const [open, setOpen] = useState(false);
  const [fav, setFav] = useState(false);
  return (
    <header className="pt-head" data-pt-head>
      <div className="pt-head-in">
        <Link href={L.home} className="pt-head-logo" aria-label="マチノワPet トップ" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="pt-head-nav" aria-label="主なページ">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="pt-head-ic">
          <Link href={L.search} className="pt-hi pt-hov" onClick={() => setOpen(false)}>
            <span className="pt-hi-i pt-bounce">
              <IconSearch className="pt-draw" />
            </span>
            <span className="pt-hi-l">検索</span>
          </Link>
          <button type="button" className={`pt-hi pt-hov ${fav ? "is-on" : ""}`} aria-pressed={fav} aria-label="お気に入り" onClick={() => setFav((v) => !v)}>
            <span className="pt-hi-i pt-bounce">
              <IconHeart className="pt-draw" />
            </span>
            <span className="pt-hi-l">お気に入り</span>
          </button>
          <button type="button" className="pt-hi pt-hov" aria-label="メニュー" aria-expanded={open} aria-controls="pt-drawer" onClick={() => setOpen((v) => !v)}>
            <span className="pt-hi-i pt-bounce">
              <IconMenu className="pt-draw" />
            </span>
            <span className="pt-hi-l">メニュー</span>
          </button>
        </div>
      </div>
      <nav id="pt-drawer" className="pt-drawer" aria-label="メニュー" data-open={open ? "1" : "0"}>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        <Link href={L.search} onClick={() => setOpen(false)}>
          お店を探す
        </Link>
        <Link href={L.home} onClick={() => setOpen(false)}>
          マチノワPet トップ
        </Link>
      </nav>
    </header>
  );
}
