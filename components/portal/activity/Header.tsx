import Link from "next/link";
import { IcHeart, LogoMark } from "./Deco";
import { MenuRows, PcNav } from "./HeaderNav";
import { aLinks } from "./links";

/**
 * 共通のヘッダー(見本どおり。白い帯・左にロゴと一言・中央に横メニュー・右にお気に入り/掲載相談)。全ページ「アクティビティ」の下に赤い線だったところは、いま開いているページの項目の下線に。
 * メニューは 4 つ(トップ・探す・店舗紹介・特集。オーナー決定 2026-10-23。見た目は見本のまま、もとのメニューの範囲の中で間を詰めて並べた。スポット・コース・マガジン・検索・編集部のアイコンは外した。
 * コースとマガジンのページは消さず、探す・特集のページの中の節に残っている)。
 * 右は、ハート(お気に入り = ハートで入れた体験だけの探す /activity/search?fav=1)と、赤い「掲載相談」(/contact。掲載依頼・修正依頼の窓口)だけ。
 * スマホのメニューは同じ 4 行と、その下に小さく「お気に入り」「掲載の相談」。
 */
export default function Header() {
  return (
    <header className="apa-head">
      <div className="apa-head-in">
        <Link href={aLinks.top} className="apa-logo" aria-label="マチノワ アクティビティ">
          <LogoMark className="apa-logo-mark" />
          <span className="apa-logo-t">マチノワ</span>
        </Link>
        <p className="apa-head-tag">まちでつながる、わたしのアクティビティ</p>
        <PcNav />
        <div className="apa-head-ic">
          <Link href={aLinks.favs} className="apa-hi apa-hi-fav">
            <IcHeart />
            <span>お気に入り</span>
          </Link>
        </div>
        <details className="apa-burger">
          <summary aria-label="メニューを開く">
            <i />
            <i />
            <i />
          </summary>
          <div className="apa-burger-list">
            <MenuRows />
            <div className="apa-burger-sub">
              <Link href={aLinks.favs}>お気に入り</Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
