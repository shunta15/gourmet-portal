"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { aLinks } from "./links";

/**
 * ヘッダーのメニュー 4 つ(オーナー決定 2026-10-23): トップ・探す・店舗紹介・特集(この順。全業種共通)。
 * いま開いているページの項目に、赤い下線(is-on)と aria-current を付ける(トップ = /activity / 探す = /activity/search / 店舗紹介 = /activity/shop と店のページ /activity/shop/{id} / 特集 = /activity/article の下)。
 * スマホのメニュー(details)は、リンクを押してページが替わったら閉じる(ページが替わっても details の開閉は残るため)。
 */
export const NAV = [
  { t: "トップ", href: aLinks.top, k: "top" },
  { t: "探す", href: aLinks.search, k: "search" },
  { t: "店舗紹介", href: aLinks.shops, k: "shops" },
  { t: "特集", href: aLinks.article, k: "feature" },
] as const;

function isOn(k: (typeof NAV)[number]["k"], path: string): boolean {
  if (k === "top") return path === aLinks.top || path === `${aLinks.top}/`;
  if (k === "search") return path === aLinks.search || path.startsWith(`${aLinks.search}/`);
  if (k === "shops") return path === aLinks.shops || path.startsWith(`${aLinks.shops}/`);
  return path === aLinks.article || path.startsWith(`${aLinks.article}/`);
}

export function PcNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="apa-nav" aria-label="メニュー">
      {NAV.map((n) => {
        const on = isOn(n.k, path);
        return (
          <Link key={n.k} href={n.href} className={`apa-nav-${n.k}${on ? " is-on" : ""}`} aria-current={on ? "page" : undefined}>
            {n.t}
          </Link>
        );
      })}
    </nav>
  );
}

/** スマホのメニューの 4 行 */
export function MenuRows() {
  const path = usePathname() ?? "";
  useEffect(() => {
    document.querySelector<HTMLDetailsElement>(".apa-burger")?.removeAttribute("open");
  }, [path]);
  return (
    <>
      {NAV.map((n) => (
        <Link key={n.k} href={n.href} aria-current={isOn(n.k, path) ? "page" : undefined}>
          {n.t}
        </Link>
      ))}
    </>
  );
}
