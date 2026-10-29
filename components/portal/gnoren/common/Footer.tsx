import Link from "next/link";
import { NorenMark } from "./icons";
import { GN_BASE, GN_NAV } from "./nav";

/** 共通フッター(見本には無いので、生成りの地・同じ書体の控えめなもの)。 */
export default function Footer() {
  return (
    <div role="contentinfo" className="gn-foot gn-linen">
      <div className="gn-wrap gn-foot-in">
        <Link href={GN_BASE} className="gn-logo gn-foot-logo">
          <NorenMark className="gn-logo-mark" />
          <span className="gn-logo-t">
            <span className="gn-logo-name">マチノワ グルメ</span>
            <span className="gn-logo-tag">この街の、おいしいがつながる。</span>
          </span>
        </Link>
        <nav className="gn-foot-nav" aria-label="フッターメニュー">
          {GN_NAV.map((n) => (
            <Link key={n.key} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="gn-foot-copy">© マチノワ</p>
      </div>
    </div>
  );
}
