/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IMG } from "./const";
import { PROD_MENU } from "./prodData";
import "./header.css";

/** ヘッダー(見本の座標・1182 基準)。絵の上に重なる。スクロールすると白い帯になり、下へ進むと隠れ、上へ戻ると現れる。 */
export default function Header() {
  const ref = useRef<HTMLDivElement>(null);
  // メニュー（三本線）を開くと業種・探し方・案内のリンクが出る。外を押す・Esc・リンクを押す・ページ移動で閉じる
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const out = (e: Event) => { if (!(e.target as Element | null)?.closest?.(".h2-menuwrap")) setMenu(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", esc); };
  }, [menu]);
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
        <Link href="/" className="h2-logo h2-press" aria-label="マチノワ トップへ">
          <img src={`${IMG}/common/logo-foot.webp`} alt="マチノワ Machinowa" width={264} height={85} />
        </Link>
        <div className="h2-head-r">
          <div className="h2-menuwrap">
            <button type="button" className="h2-menu h2-press" aria-label="メニュー" aria-expanded={menu} aria-controls="h2-menupanel" onClick={() => setMenu((v) => !v)}><svg viewBox="0 0 20 16" aria-hidden="true"><path d="M2 2h16M2 8h16M2 14h16" stroke="#2c3a5c" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
            <nav id="h2-menupanel" className={`h2-menupanel${menu ? " is-open" : ""}`} aria-label="サイトメニュー" aria-hidden={!menu}>
              <ul>{PROD_MENU.map(([t, h]) => <li key={t}><Link href={h} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}>{t}</Link></li>)}</ul>
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
