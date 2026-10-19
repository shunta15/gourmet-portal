/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BASE, IMG } from "./const";
import "./header.css";

const NAV: [string, string][] = [["お店を探す", "/search"], ["特集を読む", "/feature"], ["エリアから探す", "/search"], ["駅から探す", "/station"], ["動画で見る", "/videos"], ["マチノワについて", "/about"]];

/** ヘッダー(見本の座標・1182 基準)。絵の上に重なる。スクロールすると白い帯になり、下へ進むと隠れ、上へ戻ると現れる。 */
export default function Header({ base = BASE }: { base?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let on = false, away = false, lastY = window.scrollY, raf = 0;
    const f = () => {
      raf = 0;
      const y = window.scrollY;
      const s = y > 30; if (s !== on) { on = s; el.classList.toggle("is-stuck", s); }
      const hide = y > 220 && y > lastY + 3 ? true : (y < lastY - 3 || y <= 220 ? false : away);
      if (hide !== away) { away = hide; el.classList.toggle("is-away", hide); }
      if (Math.abs(y - lastY) > 3) lastY = y;
    };
    const on_ = () => { if (!raf) raf = requestAnimationFrame(f); };
    f();
    window.addEventListener("scroll", on_, { passive: true });
    return () => { window.removeEventListener("scroll", on_); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="h2-headwrap" ref={ref}>
      <header className="h2-head">
        <Link href={base} className="h2-logo h2-press" aria-label="マチノワ(見本)のトップ">
          <img src={`${IMG}/common/logo-foot.webp`} alt="マチノワ Machinowa" width={264} height={85} />
        </Link>
        <nav className="h2-nav" aria-label="メインメニュー">
          {NAV.map(([t, h]) => <Link key={t} href={h} className="h2-press">{t}</Link>)}
        </nav>
        <div className="h2-head-r">
          <Link href="/search" className="h2-hsearch h2-press" aria-label="検索"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.4" fill="none" stroke="#2c6fb0" strokeWidth="2.4" /><path d="m15.4 15.4 5 5" stroke="#2c6fb0" strokeWidth="2.6" strokeLinecap="round" /></svg></Link>
          <button type="button" className="h2-fav h2-press"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C4.5 15.2 2.4 11.6 2.4 8.4A5 5 0 0 1 12 6.6a5 5 0 0 1 9.6 1.8c0 3.200-2.100 6.800-9.600 12.600Z" fill="none" stroke="#ee5a7a" strokeWidth="2.6" strokeLinejoin="round" /></svg>お気に入り</button>
          <button type="button" className="h2-menu h2-press" aria-label="メニュー"><svg viewBox="0 0 20 16" aria-hidden="true"><path d="M2 2h16M2 8h16M2 14h16" stroke="#2c3a5c" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
        </div>
      </header>
    </div>
  );
}
