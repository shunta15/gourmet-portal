"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BASE } from "@/lib/portal/bproto/colorplay/types";
import { IconClose, IconHeart, IconMenu, IconSearch } from "./Icons";

const LINKS = [
  { href: `${BASE}/search`, label: "お店を探す" },
  { href: `${BASE}/search#area`, label: "エリア" },
  { href: `${BASE}#features`, label: "特集" },
];

export default function Header({ onColor = false }: { onColor?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <header className={`cp-header ${onColor ? "on-color" : ""}`}>
      <div className="cp-header-in">
        <Link href={BASE} className="cp-logo" aria-label="マチノワ Beauty トップ">
          マチノワ<i>·</i><span>Beauty</span>
        </Link>
        <nav className="cp-hnav" aria-label="ビューティーの見本のメニュー">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href}>{l.label}</Link>
          ))}
        </nav>
        <div className="cp-hicons">
          <Link href={`${BASE}/search`} aria-label="お店を探す" className="cp-ic"><IconSearch size={22} /></Link>
          <Link href="/list" aria-label="候補リストを見る" className="cp-ic"><IconHeart size={22} /></Link>
          <button type="button" className="cp-menu-btn" aria-label="メニューを開く" aria-expanded={open} onClick={() => setOpen(true)}>
            <IconMenu size={22} />
          </button>
        </div>
      </div>
      {open && (
        <div className="cp-overlay" role="dialog" aria-modal="true" aria-label="メニュー">
          <button type="button" className="cp-overlay-x" aria-label="メニューを閉じる" onClick={() => setOpen(false)}><IconClose size={24} /></button>
          <p className="cp-script cp-overlay-sc">Machinowa Beauty</p>
          <ul>
            {LINKS.map((l, i) => (
              <li key={l.label} style={{ ["--i" as string]: i }}>
                <Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
              </li>
            ))}
            <li style={{ ["--i" as string]: 3 }}><Link href="/list" onClick={() => setOpen(false)}>候補リスト</Link></li>
            <li style={{ ["--i" as string]: 4 }}><Link href="/beauty" onClick={() => setOpen(false)}>マチノワ ビューティー(本番)</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}
