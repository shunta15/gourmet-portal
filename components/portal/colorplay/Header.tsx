"use client";
/**
 * COLOR PLAY(本番)のヘッダー。ロゴ・メニュー 3 つ(トップ・お店を探す・特集記事)・ハート(候補リスト)。
 * メニューは 3 つだけ(2026-10-23 オーナー決定)。PC は 3 つを横に並べ、スマホだけ全画面メニュー(同じ 3 つ)を開く。
 * 最初のページの節へ飛ぶだけの「エリア」「種類」、探すと同じ行き先の虫めがね・「候補リスト」の文字、「マチノワ トップ」は外した
 * (マチノワ トップ・運営の案内はフッターの小さな 1 行)。ハートは実際に保存した店へ戻る道具なので残す。
 * 業種ごとの違い(行き先・ロゴ)は props で受ける。リンクは本物のページへ。JS が無くてもリンクは使える(メニューの全画面だけ JS)。
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { IconClose, IconHeart, IconMenu } from "@/components/portal/bproto/colorplay/Icons";

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
    { href: base, label: "トップ" },
    { href: `${base}/search`, label: "お店を探す" },
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
          <Link href="/list" prefetch={false} aria-label="候補リストを見る" className="cp-ic"><IconHeart size={22} /></Link>
          <button type="button" className="cp-menu-btn cp-menu-btn-sp" aria-label="メニューを開く" aria-expanded={open} onClick={() => setOpen(true)}>
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
          </ul>
        </div>
      )}
    </header>
  );
}
