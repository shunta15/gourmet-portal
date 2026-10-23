"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconMenu } from "./Icons";
import { ptLinks, type PtMode } from "./site";

// メニューは「トップ」「探す」「特集記事」の 3 つだけ(2026-10-23 オーナー決定: 業種のページは 4 種類 = 最初・店舗紹介・探す・記事。
// 店舗紹介は 1 店ごとのページなので、メニューには置かない。最初のページ・探す・記事に並ぶ店の札から入る)。
// 以前の「エリアから探す」「カテゴリから探す」(最初のページの中の節へ飛ぶだけ)・「マチノワPetについて」(/about。フッターに残す)・検索のアイコン(探すと同じ行き先)・
// お気に入りのハート(押しても保存されない見た目だけのボタン)・PC のメニューのドロワーは外した。
function navOf(mode: PtMode): Array<{ label: string; href: string }> {
  const L = ptLinks(mode);
  return [
    { label: "ペット トップ", href: L.home },
    { label: "お店を探す", href: L.search },
    { label: "特集記事", href: L.articles },
  ];
}

/**
 * 4 枚の見本に共通の上の帯。左にロゴ、中央にナビ 3 つ(PC)。スマホ(859px 以下)はナビの代わりに右にメニュー(ハンバーガー)だけで、開くと同じ 3 つ。
 * 高さ・ロゴの大きさ・ナビの位置はページごとに少し違う(見本の画像が別々なので)。Shell の page で base.css が切り替える。
 * 隠れる/現れる・上端の線・今のヘッダーの下端(--pt-hy)は Motion の MotionFx が受け持つ([data-pt-head])。
 */
export default function Header({ mode = "proto" }: { mode?: PtMode }) {
  const L = ptLinks(mode);
  const NAV = navOf(mode);
  const [open, setOpen] = useState(false);
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
      </nav>
    </header>
  );
}
