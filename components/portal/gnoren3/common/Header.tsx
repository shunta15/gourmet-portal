"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BowlMark, SearchIcon, MenuIcon, CloseIcon } from "./icons";
import { GN3_BASE, GN3_NAV, type Gn3Page } from "./nav";

/**
 * 共通ヘッダー(新見本 5 枚と同じ)。PC は高さ 55u の濃い茶黒の帯(古い木の板)+ 下の縁に銅色の細い桟。
 * 左: まるいロゴ + 「マチノワ」(明朝)+ 縦線 + 小さな「街の、うまいが、つながっていく。」
 * 右: トップ・さがす・店舗紹介・特集(現在のページに白い下線)+ 検索の虫眼鏡。
 * ≤768px はロゴ + ハンバーガー(44px)。開くと 4 つのナビ + 検索(44px 以上)。
 */
export default function Header({ page }: { page: Gn3Page }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="gn3-hdr" data-open={open ? "1" : "0"}>
      <div className="gn3-hdr-in">
        <Link href={GN3_BASE} className="gn3-logo" onClick={() => setOpen(false)} aria-label="マチノワ トップへ">
          <BowlMark className="gn3-logo-mark" />
          <span className="gn3-logo-name">マチノワ</span>
        </Link>
        <span className="gn3-hdr-sep" aria-hidden="true" />
        <p className="gn3-logo-tag">街の、うまいが、つながっていく。</p>

        <nav className="gn3-nav" aria-label="メインメニュー">
          {GN3_NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={n.key === page ? "page" : undefined}>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        <Link href={`${GN3_BASE}/search`} className="gn3-hdr-search" aria-label="検索">
          <SearchIcon />
        </Link>

        <button
          type="button"
          className="gn3-burger"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          aria-controls="gn3-mpanel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div id="gn3-mpanel" className="gn3-mpanel" hidden={!open}>
        <nav aria-label="スマートフォン用メニュー">
          {GN3_NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={n.key === page ? "page" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link href={`${GN3_BASE}/search`} onClick={() => setOpen(false)}>
            <SearchIcon /> 検索
          </Link>
        </nav>
        <p className="gn3-mpanel-tag">街の、うまいが、つながっていく。</p>
      </div>
    </header>
  );
}
