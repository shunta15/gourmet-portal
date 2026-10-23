import Link from "next/link";
import type { CpSite } from "@/lib/portal/colorplay/site";

/**
 * COLOR PLAY(本番)のフッター(サーバー)。黒の面にロゴ・リンク・注意書き。
 * ナビはヘッダーのメニューと同じ 4 つ(トップ・お店を探す・店舗紹介・特集)。
 * サイトとして必要な「マチノワ トップ・編集部について・掲載基準・お問い合わせ」は、メニューに数えない小さな 1 行に置く(2026-10-23 オーナー決定)。
 */
export default function Footer({ site }: { site: CpSite }) {
  return (
    <footer className="cp-footer">
      <div className="cp-wrap">
        <p className="cp-logo cp-logo-f">{site.logoA}<i>·</i><span>{site.logoB}</span></p>
        <ul>
          <li><Link href={site.base}>トップ</Link></li>
          <li><Link href={`${site.base}/search`}>お店を探す</Link></li>
          <li><Link href={`${site.base}/shop`}>店舗紹介</Link></li>
          <li><Link href={`${site.base}/special`}>特集</Link></li>
        </ul>
        <ul className="cp-foot-sub" aria-label="サイトの案内">
          <li><Link href="/">マチノワ トップ</Link></li>
          <li><Link href="/about">編集部について</Link></li>
          <li><Link href="/editorial/guidelines">掲載基準</Link></li>
          <li><Link href="/contact">お問い合わせ</Link></li>
        </ul>
        <p className="cp-note">店の写真・情報は、各店の公式サイトなどをもとにしています。営業時間などは変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
        <p className="cp-note cp-copy">© マチノワ</p>
      </div>
    </footer>
  );
}
