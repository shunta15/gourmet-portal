"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconSearch, IconHeart, IconMenu, IconArrow } from "./Icons";
import { vkLinks, type VkConfig } from "../config";

// ナビ 4 つ(エリアから探す・〇〇の種類から探す・特集記事・マチノワ〇〇について)。
function navOf(cfg: VkConfig): Array<{ label: string; href: string }> {
  const L = vkLinks(cfg);
  return [
    { label: "エリアから探す", href: L.areaAnchor },
    { label: `${cfg.noun}の種類から探す`, href: L.typeAnchor },
    { label: "特集記事", href: L.articles },
    { label: `${cfg.brand}について`, href: L.about },
  ];
}

/**
 * 4 枚の見本に共通の上の帯。左にロゴ、ナビ 4 つ、右に 検索・お気に入り・メニュー(アイコン+小さな字)。
 * 4 枚の見本は帯の高さ・地の色・ナビの位置・アイコンの並べ方が少しずつ違うので、Shell の page で base.css が切り替える:
 *   top     … 地が透けてヒーローの上に重なる。ロゴは濃い字、ナビと右のアイコンは白(写真の上)。右端に「〇〇を探す →」の枠だけのボタン。スクロールすると明るい帯になる
 *   search  … 左 65% が明るい帯、右は透けてヒーローの写真の上(白いアイコン)。アイコンは字が下。スクロールすると全面が明るい帯になる
 *   shop    … 濃い紺の帯(明るい字)。アイコンは字が下
 *   article … 明るい帯(濃い字)。アイコンの横に字
 * 隠れる/現れる・今のヘッダーの下端(--vk-hy)は Motion の MotionFx が受け持つ([data-vk-head])。
 * お気に入りは見た目だけの切り替え(ペットと同じ。保存はしない)。
 */
export default function Header({ cfg, page = "top" }: { cfg: VkConfig; page?: "top" | "search" | "shop" | "article" }) {
  const L = vkLinks(cfg);
  const NAV = navOf(cfg);
  const [open, setOpen] = useState(false);
  const [fav, setFav] = useState(false);
  return (
    <header className="vk-head" data-vk-head>
      <div className="vk-head-in">
        <Link href={L.home} className="vk-head-logo" aria-label={`${cfg.brand} トップ`} onClick={() => setOpen(false)}>
          <Logo cfg={cfg} />
        </Link>
        <nav className="vk-head-nav" aria-label="主なページ">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="vk-head-ic">
          <Link href={L.search} className="vk-hi" aria-label="検索" onClick={() => setOpen(false)}>
            <span className="vk-hi-i">
              <IconSearch />
            </span>
            <span className="vk-hi-l">検索</span>
          </Link>
          <button type="button" className={`vk-hi ${fav ? "is-on" : ""}`} aria-pressed={fav} aria-label="お気に入り" onClick={() => setFav((v) => !v)}>
            <span className="vk-hi-i">
              <IconHeart />
            </span>
            <span className="vk-hi-l">お気に入り</span>
          </button>
          <button type="button" className="vk-hi vk-hi--menu" aria-label="メニュー" aria-expanded={open} aria-controls="vk-drawer" onClick={() => setOpen((v) => !v)}>
            <span className="vk-hi-i">
              <IconMenu />
            </span>
            <span className="vk-hi-l">メニュー</span>
          </button>
        </div>
        {page === "top" ? (
          <Link href={L.search} className="vk-head-cta" onClick={() => setOpen(false)}>
            <span>{cfg.noun}を探す</span>
            <IconArrow />
          </Link>
        ) : null}
      </div>
      <nav id="vk-drawer" className="vk-drawer" aria-label="メニュー" data-open={open ? "1" : "0"}>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>
            {n.label}
          </Link>
        ))}
        <Link href={L.search} onClick={() => setOpen(false)}>
          {cfg.noun}を探す
        </Link>
        <Link href={L.home} onClick={() => setOpen(false)}>
          {cfg.brand} トップ
        </Link>
      </nav>
    </header>
  );
}
