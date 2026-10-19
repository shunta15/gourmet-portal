/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BASE, IMG } from "./const";
import { P3 } from "./copy";
import "./header.css";

const NAV: [string, string][] = [["お店を探す", "/search"], ["特集記事", "/feature"], ["まちのニュース", "/feature"], ["エリアガイド", "/search"], ["マチノワについて", "/gourmet"]];

/** ヘッダー(見本の高さ 70)。スクロールすると縮んで上に残る。 */
export default function Header() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let on = false, away = false, lastY = window.scrollY, raf = 0;
    const f = () => {
      raf = 0;
      const y = window.scrollY;
      const s = y > 30; if (s !== on) { on = s; el.classList.toggle("is-stuck", s); }
      // 下へ進むと上に隠れ、上へ戻るときだけスライドダウンで再表示
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
    <div className="hm-headwrap" ref={ref}>
      <header className="hm-head">
        <div className="hm-head-in">
          <Link href={BASE} className="hm-logo hm-press" aria-label="マチノワ(見本)のトップ">
            <img src={`${IMG}/common/logo.webp`} alt="マチノワ Machinowa" width={264} height={85} />
          </Link>
          <p className="hm-tag">{P3.replace("\n", "")}</p>
          <nav className="hm-nav" aria-label="メインメニュー">
            <Link href={BASE} className="is-on hm-press"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 1 8h2v6h4v-4h2v4h4V8h2L8 1.5Z" fill="currentColor" /></svg>ホーム</Link>
            {NAV.map(([t, h]) => <Link key={t} href={h} className="hm-press">{t}</Link>)}
          </nav>
          <div className="hm-head-r">
            <button type="button" className="hm-ico hm-press" aria-label="検索"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.8" fill="none" stroke="#2c97cf" strokeWidth="2.4" /><path d="m15.6 15.6 5 5" stroke="#2c97cf" strokeWidth="2.6" strokeLinecap="round" /></svg></button>
            <i className="hm-div" />
            <button type="button" className="hm-ico hm-press" aria-label="お気に入り"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C4.5 15.2 2.4 11.6 2.4 8.4A5 5 0 0 1 12 6.6a5 5 0 0 1 9.6 1.8c0 3.200-2.100 6.800-9.600 12.600Z" fill="#ee5a7a" /></svg></button>
            <i className="hm-div" />
            <button type="button" className="hm-fav hm-press"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C4.5 15.2 2.4 11.6 2.4 8.4A5 5 0 0 1 12 6.6a5 5 0 0 1 9.6 1.8c0 3.200-2.100 6.800-9.600 12.600Z" fill="#fff" /></svg>お気に入り</button>
            <button type="button" className="hm-menu hm-press"><svg viewBox="0 0 20 16" aria-hidden="true"><path d="M1 2h18M1 8h18M1 14h18" stroke="#444" strokeWidth="1.6" strokeLinecap="round" /></svg>メニュー</button>
          </div>
        </div>
      </header>
    </div>
  );
}
