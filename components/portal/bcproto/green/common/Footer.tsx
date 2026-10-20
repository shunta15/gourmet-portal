import Link from "next/link";
import { BASE, SEARCH_HREF, SPECIAL_HREF, PORTAL_HREF, TOP_AREA_HREF, TOP_KIND_HREF, TOP_TAG_HREF, IMG_COMMON } from "./site";

/** 見本には無いので、ヘッダーと同じ見た目の控えめなフッター(ロゴ・リンク数個・マチノワ トップ・© マチノワ)。行き先は本番の URL */
export default function Footer() {
  return (
    <footer className="gr-foot">
      <div className="gr-foot-in">
        <Link href={BASE} className="gr-foot-logo" aria-label="マチノワ Body Care トップ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG_COMMON}/logo.webp`} width={214} height={46} alt="マチノワ.Body Care" loading="lazy" />
        </Link>
        <nav className="gr-foot-nav" aria-label="フッターのリンク">
          <Link href={TOP_AREA_HREF}>エリアから探す</Link>
          <Link href={TOP_KIND_HREF}>施術の種類から探す</Link>
          <Link href={TOP_TAG_HREF}>こだわりから探す</Link>
          <Link href={SEARCH_HREF}>店を探す</Link>
          <Link href={SPECIAL_HREF}>特集記事</Link>
          <Link href={PORTAL_HREF}>マチノワ トップ</Link>
        </nav>
        <p className="gr-foot-c">© マチノワ</p>
      </div>
    </footer>
  );
}
