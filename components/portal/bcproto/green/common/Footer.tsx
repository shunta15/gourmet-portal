import Link from "next/link";
import { BASE, SEARCH_HREF, SCENE_HREF, GUIDE_HREF, IMG_COMMON } from "./site";

/** 見本には無いので、ヘッダーと同じ見た目の控えめなフッター(ロゴ・リンク数個・© マチノワ) */
export default function Footer() {
  return (
    <footer className="gr-foot">
      <div className="gr-foot-in">
        <Link href={BASE} className="gr-foot-logo" aria-label="マチノワ Body Care トップ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG_COMMON}/logo.webp`} width={214} height={46} alt="マチノワ.Body Care" loading="lazy" />
        </Link>
        <nav className="gr-foot-nav" aria-label="フッターのリンク">
          <Link href={SEARCH_HREF}>エリアから探す</Link>
          <Link href={SEARCH_HREF}>施術の種類から探す</Link>
          <Link href={SEARCH_HREF}>お悩みから探す</Link>
          <Link href={SCENE_HREF}>特集</Link>
          <Link href={GUIDE_HREF}>はじめての方へ</Link>
          <Link href={GUIDE_HREF}>お役立ちコラム</Link>
        </nav>
        <p className="gr-foot-c">© マチノワ</p>
      </div>
    </footer>
  );
}
