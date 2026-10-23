"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { IconMenu, IconArrow } from "./Icons";
import { vkLinks, type VkConfig } from "../config";

// メニューは 3 つだけ(トップ・〇〇を探す・特集記事)。業種のページは 4 種類(最初・探す・店の紹介・記事)で、
// 店の紹介は 1 店ごとのページなのでメニューには置かない(最初・探す・記事に並ぶ店の札から入る)。
function navOf(cfg: VkConfig): Array<{ label: string; href: string }> {
  const L = vkLinks(cfg);
  return [
    { label: "トップ", href: L.home },
    { label: `${cfg.noun}を探す`, href: L.search },
    { label: "特集記事", href: L.articles },
  ];
}

/**
 * 4 枚の見本に共通の上の帯。左にロゴ、ナビ 3 つ(PC)。最初のページだけ右端に「〇〇を探す →」の枠だけのボタン。
 * スマホ(999px 以下)はナビの代わりに右端のハンバーガーを出し、開くと同じ 3 つが並ぶ。
 * 4 枚の見本は帯の高さ・地の色・ナビの位置が少しずつ違うので、Shell の page で base.css が切り替える:
 *   top     … 地が透けてヒーローの上に重なる。ロゴは濃い字、ナビは白(写真の上)。右端に「〇〇を探す →」の枠だけのボタン。スクロールすると明るい帯になる
 *   search  … 左 65% が明るい帯、右は透けてヒーローの写真の上
 *   shop    … 濃い紺の帯(明るい字)
 *   article … 明るい帯(濃い字)
 * 隠れる/現れる・今のヘッダーの下端(--vk-hy)は Motion の MotionFx が受け持つ([data-vk-head])。
 * 検索・お気に入りのアイコンは置かない(検索はメニューの「探す」と同じ行き先。お気に入りは保存されない見た目だけのボタンだったため外した)。
 */
export default function Header({ cfg, page = "top" }: { cfg: VkConfig; page?: "top" | "search" | "shop" | "article" }) {
  const L = vkLinks(cfg);
  const NAV = navOf(cfg);
  const [open, setOpen] = useState(false);
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
          <button type="button" className="vk-hi vk-hi--menu" aria-label="メニュー" aria-expanded={open} aria-controls="vk-drawer" onClick={() => setOpen((v) => !v)}>
            <span className="vk-hi-i">
              <IconMenu />
            </span>
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
      </nav>
    </header>
  );
}
