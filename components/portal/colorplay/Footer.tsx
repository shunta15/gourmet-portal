import Link from "next/link";
import type { CpSite } from "@/lib/portal/colorplay/site";

/** COLOR PLAY(本番)のフッター(サーバー)。黒の面にロゴ・リンク・注意書き */
export default function Footer({ site }: { site: CpSite }) {
  return (
    <footer className="cp-footer">
      <div className="cp-wrap">
        <p className="cp-logo cp-logo-f">{site.logoA}<i>·</i><span>{site.logoB}</span></p>
        <ul>
          <li><Link href={`${site.base}/search`}>お店を探す</Link></li>
          <li><Link href={`${site.base}#area`}>エリア</Link></li>
          <li><Link href={`${site.base}#kinds`}>種類</Link></li>
          <li><Link href={`${site.base}/article`}>特集記事</Link></li>
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
