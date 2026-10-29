"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NorenMark, SearchIcon, HeartIcon, MenuIcon, CloseIcon } from "./icons";
import { GN_BASE, GN_NAV, type GnPage } from "./nav";

/**
 * 共通ヘッダー(見本 1〜5 と同じ)。PC は絵の上に重なる白い半透明の帯(下の縁がゆるく波打つ)で、高さ 58u。
 * ≤768px はロゴ + ハンバーガー(44px)。開くと 4 つのナビ + 検索/お気に入りのパネル。
 */
export default function Header({ page }: { page: GnPage }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="gn-hdr" data-open={open ? "1" : "0"}>
      <div className="gn-hdr-shadow" aria-hidden="true">
        <div className="gn-hdr-bg" />
      </div>
      <div className="gn-hdr-in">
        <Link href={GN_BASE} className="gn-logo" onClick={() => setOpen(false)}>
          <NorenMark className="gn-logo-mark" />
          <span className="gn-logo-t">
            <span className="gn-logo-name">マチノワ グルメ</span>
            <span className="gn-logo-tag">この街の、おいしいがつながる。</span>
          </span>
        </Link>

        <nav className="gn-nav" aria-label="メインメニュー">
          {GN_NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={n.key === page ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="gn-tools">
          <Link href={`${GN_BASE}/search`} className="gn-tool">
            <SearchIcon /> <span>検索</span>
          </Link>
          <Link href={`${GN_BASE}/search`} className="gn-tool">
            <HeartIcon /> <span>お気に入り</span>
          </Link>
        </div>

        <button
          type="button"
          className="gn-burger"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          aria-controls="gn-mpanel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div id="gn-mpanel" className="gn-mpanel" hidden={!open}>
        <nav aria-label="スマートフォン用メニュー">
          {GN_NAV.map((n) => (
            <Link key={n.key} href={n.href} aria-current={n.key === page ? "page" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="gn-mpanel-tools">
          <Link href={`${GN_BASE}/search`} onClick={() => setOpen(false)}>
            <SearchIcon /> 検索
          </Link>
          <Link href={`${GN_BASE}/search`} onClick={() => setOpen(false)}>
            <HeartIcon /> お気に入り
          </Link>
        </div>
      </div>
    </header>
  );
}
