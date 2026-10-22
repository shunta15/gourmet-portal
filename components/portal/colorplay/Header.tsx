"use client";
/**
 * COLOR PLAY(本番)のヘッダー。ロゴ・3 つのリンク・虫めがね・ハート(候補リスト)・メニュー。
 * 業種ごとの違い(行き先・ロゴ)は props で受ける。リンクは本物のページへ。JS が無くてもリンクは使える(メニューの全画面だけ JS)。
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconClose, IconHeart, IconMenu, IconSearch } from "@/components/portal/bproto/colorplay/Icons";

export type CpHeaderProps = {
  base: string;
  logoA: string;
  logoB: string;
  onColor?: boolean;
  /** 色面の上に重ねるとき、字を黒にするか(ピンク・水色の面) */
  ink?: boolean;
  /** 黒い面の上に重ねるとき、メニューのボタンを白にするか */
  invert?: boolean;
};

export default function Header({ base, logoA, logoB, onColor = false, ink = false, invert = false }: CpHeaderProps) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: `${base}/search`, label: "お店を探す" },
    { href: `${base}#area`, label: "エリア" },
    { href: `${base}#kinds`, label: "種類" },
    { href: `${base}/article`, label: "特集記事" },
  ];
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <header className={`cp-header ${onColor ? "on-color" : ""} ${onColor && ink ? "ink" : ""} ${onColor && invert ? "inv" : ""}`}>
      <div className="cp-header-in">
        <Link href={base} className="cp-logo" aria-label={`${logoA} ${logoB} トップ`}>
          {logoA}<i>·</i><span>{logoB}</span>
        </Link>
        <nav className="cp-hnav" aria-label="メニュー">
          {links.map((l) => (
            <Link key={l.label} href={l.href}>{l.label}</Link>
          ))}
        </nav>
        <div className="cp-hicons">
          <Link href={`${base}/search`} aria-label="お店を探す" className="cp-ic"><IconSearch size={22} /></Link>
          <Link href="/list" prefetch={false} aria-label="候補リストを見る" className="cp-ic"><IconHeart size={22} /></Link>
          <button type="button" className="cp-menu-btn" aria-label="メニューを開く" aria-expanded={open} onClick={() => setOpen(true)}>
            <IconMenu size={22} />
          </button>
        </div>
      </div>
      {open && (
        <div className="cp-overlay" role="dialog" aria-modal="true" aria-label="メニュー">
          <button type="button" className="cp-overlay-x" aria-label="メニューを閉じる" onClick={() => setOpen(false)}><IconClose size={24} /></button>
          <p className="cp-script cp-overlay-sc">Machinowa {logoB}</p>
          <ul>
            {links.map((l, i) => (
              <li key={l.label} style={{ ["--i" as string]: i }}>
                <Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
              </li>
            ))}
            <li style={{ ["--i" as string]: links.length }}><Link href="/list" prefetch={false} onClick={() => setOpen(false)}>候補リスト</Link></li>
            <li style={{ ["--i" as string]: links.length + 1 }}><Link href="/" onClick={() => setOpen(false)}>マチノワ トップ</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}
