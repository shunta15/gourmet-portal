import Link from "next/link";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

/** 総合サイト用フッター。グルメの既存フッター（components/Footer.tsx）とは別物。 */
export default function PortalFooter() {
  return (
    <footer className="mp-ft">
      <div className="mp-wrap">
        <div className="mp-ft-top">
          <div className="mp-ft-col">
            <h2>業種から</h2>
            <ul>
              {ORDER.map((k) => (
                <li key={k} style={{ ["--ac" as string]: VERTICALS[k].accent.color }}>
                  <Link href={VERTICALS[k].path}>
                    <i aria-hidden="true" />
                    {VERTICALS[k].brand}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="sub">探し方</h2>
            <ul>
              <li><Link href="/map" prefetch={false}>地図で探す</Link></li>
              <li><Link href="/station" prefetch={false}>駅から探す</Link></li>
              <li><Link href="/videos" prefetch={false}>動画で探す</Link></li>
            </ul>
          </div>
          <div className="mp-ft-col">
            <h2>グルメを読む</h2>
            <ul>
              <li><Link href="/feature">特集</Link></li>
              <li><Link href="/region">地域から探す</Link></li>
              <li><Link href="/scene">利用シーンから探す</Link></li>
              <li><Link href="/search">店舗を探す</Link></li>
            </ul>
          </div>
          <div className="mp-ft-col">
            <h2>マチノワについて</h2>
            <ul>
              <li><Link href="/about">編集部について</Link></li>
              <li><Link href="/editorial/guidelines">掲載基準</Link></li>
              <li><Link href="/contact">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>
        <p className="mp-ft-mark" aria-hidden="true">
          マチノワ<em>Machinowa</em>
        </p>
        <div className="mp-ft-bot">
          <span>© マチノワ</span>
          <span>Prototype · 非公開</span>
        </div>
      </div>
    </footer>
  );
}
