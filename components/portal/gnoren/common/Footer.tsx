import Link from "next/link";
import { NorenMark } from "./icons";
import { GN_LIVE_LINKS, gnNav, type GnLinks } from "./nav";

/**
 * 小さな 1 行(グルメから総合トップ・動画・写真へ戻る道)。文言は lib/portal/noren/nav.ts の FOOT_SMALL(マチノワ トップ・動画)+「写真」。
 * 行き先は全業種共通の固定(/ ・ /videos ・ /photos)で、links では変えない。
 */
const FOOT_SMALL_LINKS = [
  { href: "/", ja: "マチノワ トップ" },
  { href: "/videos", ja: "動画" },
  { href: "/photos", ja: "写真" },
] as const;

/** 共通フッター(見本には無いので、生成りの地・同じ書体の控えめなもの)。いちばん下に小さな 1 行を足してある。 */
export default function Footer({ links = GN_LIVE_LINKS }: { links?: GnLinks }) {
  const nav = gnNav(links);
  return (
    <div role="contentinfo" className="gn-foot gn-linen">
      <div className="gn-wrap gn-foot-in">
        <Link href={links.top} className="gn-logo gn-foot-logo">
          <NorenMark className="gn-logo-mark" />
          <span className="gn-logo-t">
            <span className="gn-logo-name">マチノワ グルメ</span>
          </span>
        </Link>
        <nav className="gn-foot-nav" aria-label="フッターメニュー">
          {nav.map((n) => (
            <Link key={n.key} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="gn-foot-copy">© マチノワ</p>
      </div>
      <nav className="gn-wrap gn-foot-small" aria-label="マチノワのほかのページ">
        {FOOT_SMALL_LINKS.map((n) => (
          <Link key={n.href} href={n.href}>
            {n.ja}
          </Link>
        ))}
      </nav>
    </div>
  );
}
