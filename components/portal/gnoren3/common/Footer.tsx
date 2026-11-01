import Link from "next/link";
import { BowlMark } from "./icons";
import { GN3_BASE, GN3_NAV } from "./nav";

/** 共通フッター(見本には無いので暖簾 2 の Footer を流用。地の色だけヘッダーの濃い茶黒に合わせた)。 */
export default function Footer() {
  return (
    <div role="contentinfo" className="gn3-foot">
      <div className="gn3-wrap gn3-foot-in">
        <Link href={GN3_BASE} className="gn3-foot-logo" aria-label="マチノワ トップへ">
          <BowlMark className="gn3-foot-mark" />
          <span className="gn3-foot-name">マチノワ</span>
          <span className="gn3-foot-tag">街の、うまいが、つながっていく。</span>
        </Link>
        <nav className="gn3-foot-nav" aria-label="フッターメニュー">
          {GN3_NAV.map((n) => (
            <Link key={n.key} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="gn3-foot-copy">© マチノワ</p>
      </div>
    </div>
  );
}
