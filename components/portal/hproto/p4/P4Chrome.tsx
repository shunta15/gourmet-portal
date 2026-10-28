import Link from "next/link";
import ContactLine from "@/components/portal/ContactLine";

// 総合トップ(見本4)と、同じ雰囲気の総合のページ(/special)が共有するヘッダー・フッター・業種の表。
export const IMG = "/_portal/hproto/p4/";
export const HREF_SPECIAL = "/special"; // 総合の特集一覧(8 業種それぞれの特集への入口)
export const HREF_FAV = "/list";
// ヘッダー・フッターのナビ。「マチノワについて」は 2026-10-29 オーナー指示で外した / 特集・街歩き = 総合の特集一覧(/special。2026-10-29 オーナー指示「全部グルメに飛ぶのをやめて」。グルメの /feature からは外した)。
// インタビュー・お知らせは、中身が合うページがまだ無いので # のまま(オーナー判断待ち)
export const NAV: readonly (readonly [string, string])[] = [
  ["特集", HREF_SPECIAL],
  ["街歩き", HREF_SPECIAL],
  ["インタビュー", "#"],
  ["お知らせ", "#"],
];
export const CATS = [
  ["gourmet", "グルメ", "GOURMET"],
  ["beauty", "ビューティー", "BEAUTY"],
  ["bodycare", "ボディケア", "BODYCARE"],
  ["pet", "ペット", "PET"],
  ["stay", "ステイ", "STAY"],
  ["activity", "アクティビティ", "ACTIVITY"],
  ["sports", "スポーツ", "SPORTS"],
  ["life", "くらし", "LIFESTYLE"],
] as const;
export const CAT_R = ["36% 42% 38% 34% / 32% 36% 42% 36%", "40% 34% 42% 36% / 36% 40% 34% 42%", "34% 40% 36% 42% / 40% 34% 40% 36%", "42% 36% 34% 40% / 34% 42% 36% 40%"];
export const Heart = ({ c = "#d9423f", f = true }: { c?: string; f?: boolean }) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
    <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.8 4.5 6.4 4.5c2.2 0 4 1.3 5.6 3.2 1.6-1.9 3.4-3.2 5.6-3.2 3.6 0 5.5 3.7 4 7.2C19.5 16.4 12 21 12 21z" fill={f ? c : "none"} stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
export const Arrow = () => (
  <svg viewBox="0 0 24 10" width="16" height="7" aria-hidden>
    <path d="M1 5h21M17 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// 内向きのリンクは Link、同じページ内(#…)や # は <a>
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return href.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href}>{children}</a>;
}
export const Logo = () => (
  <Link href="/" className="p4-logo" aria-label="マチノワ トップへ">
    <span className="p4-logo-ja">マチノワ</span>
    <span className="p4-logo-en">MACHINOWA</span>
  </Link>
);

export function P4Header() {
  return (
    <>
      {/* ヘッダー */}
      <header className="p4-header">
        <Logo />
        <nav className="p4-nav" aria-label="サイトナビゲーション">
          {NAV.map(([t, h]) => (
            <NavLink key={t} href={h}>{t}</NavLink>
          ))}
        </nav>
        <details className="p4-menu">
          <summary className="p4-burger" aria-label="メニュー"><i /><i /><i /></summary>
          <ul className="p4-menu-list">
            {CATS.map(([k, ja]) => (
              <li key={k}><Link href={"/" + k}>{ja}</Link></li>
            ))}
            <li><Link href={HREF_FAV}>お気に入り</Link></li>
          </ul>
        </details>
      </header>
    </>
  );
}

export function P4Footer() {
  return (
    <>
      {/* フッター */}
      <footer className="p4-footwrap">
      <div className="p4-foot">
        <Logo />
        <nav className="p4-fnav" aria-label="フッターナビゲーション">
          {NAV.map(([t, h]) => (
            <NavLink key={t} href={h}>{t}</NavLink>
          ))}
        </nav>
        <span className="p4-soc">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="#2b2724" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" fill="#2b2724" /></svg>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M13 3v11.5a3.5 3.5 0 1 1-3.5-3.5M13 3c.4 2.6 2 4.4 5 4.7" fill="none" stroke="#2b2724" strokeWidth="2.6" strokeLinecap="round" /></svg>
          <svg viewBox="0 0 24 24" width="20" height="18" aria-hidden><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#2b2724" /><path d="M10 9l5 3-5 3z" fill="#f3efea" /></svg>
        </span>
        <i className="p4-fdiv" />
        <Link href={HREF_FAV} className="p4-fav">
          <span className="p4-fav-i"><Heart c="#2b2724" f={false} /></span>お気に入り
        </Link>
      </div>
      <ContactLine className="p4-contact" style={{ margin: 0, padding: "0 var(--wrap) 18px", textAlign: "center", color: "#5a544d", opacity: 1 }} />
      </footer>
    </>
  );
}
