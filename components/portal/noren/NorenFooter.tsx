import Link from "next/link";
import { FOOT_INFO, FOOT_NAV, FOOT_NOREN, FOOT_REGIONS, NOREN_TOP } from "@/lib/portal/noren/nav";
import NorenNewsletter from "./NorenNewsletter";

/**
 * 暖簾の共通フッター（見本 /proto-noren と本番の /gourmet で共通）。竿に五つの小さな暖簾（top の章へ）、その下に今のフッターと同じ行き先
 * （ナビゲーション 5・地域 5・サイト情報 4）とニュースレター。
 * top: トップの行き先（見本は NOREN_TOP、本番は /gourmet）。extraNav: ナビゲーションの末尾に足すリンク（本番の /gourmet だけが渡す。見本は渡さない）。
 */
export default function NorenFooter({ top, extraNav = [] }: { top: string; extraNav?: readonly { href: string; ja: string }[] }) {
  const nav = [...FOOT_NAV.map((n) => (n.href === NOREN_TOP ? { ...n, href: top } : n)), ...extraNav];
  return (
    <footer className="vN-ft">
      <div className="vN-ft-rod" aria-hidden="true" />
      <nav className="vN-ft-noren" aria-label="トップの章へ">
        {FOOT_NOREN.map((c, i) => (
          <Link key={c.key} href={`${top}#ch-${c.key}`} style={{ ["--d" as string]: i }} data-cursor="JUMP" aria-label={`トップの${c.ja}の章へ`}>
            <b aria-hidden="true">{c.kanji}</b>
            <i aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <div className="vN-ft-in">
        <div className="vN-ft-brand">
          <p className="vN-ft-logo">
            <span className="ja">マチノワ</span>
            <em>Gourmet</em>
          </p>
          <p className="vN-ft-nlk">ニュースレター</p>
          <p className="vN-ft-nlh">
            マチノワで繋がる、<em>まだ見ぬ出会い</em>。
          </p>
          <p className="vN-ft-nls">知らない街と一軒との出会いを、編集部が毎週金曜にお届け。</p>
          <NorenNewsletter />
        </div>
        <div className="vN-ft-cols">
          <nav aria-label="ナビゲーション">
            <h2>ナビゲーション</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.href + n.ja}>
                  <Link href={n.href}>{n.ja}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="地域">
            <h2>地域</h2>
            <ul>
              {FOOT_REGIONS.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.ja}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="サイト情報">
            <h2>サイト情報</h2>
            <ul>
              {FOOT_INFO.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.ja}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="vN-ft-c">
          <span>© 2026 マチノワ / 街の輪 · 無断転載禁止</span>
          <span>日本 全国 — 2026年</span>
        </p>
      </div>
    </footer>
  );
}
