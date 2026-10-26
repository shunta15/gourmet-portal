import Link from "next/link";
import Header from "../../Header";
import { IcPin, IcArrow } from "../../Icons";
import { LFL } from "../../links";
import type { LiveShop } from "@/components/portal/vkit/common/live";

/* eslint-disable @next/next/no-img-element */
export const SHOP_LIST_PAGE_SIZE = 12;

/**
 * 店舗紹介の一覧(/life/shop。メニューの「店舗紹介」の行き先)。見本には無いページなので、見本 4_店舗紹介 の部品(ヘッダー・赤い縦線の見出し・
 * 「ほかの店舗・スポット」の札)だけで組む。札を押すと、その店の店舗紹介ページ。並びはエリア順(順位ではない)。
 */
export default function ShopListPage({ shops, total, page, pages }: { shops: LiveShop[]; total: number; page: number; pages: number }) {
  const hrefOf = (n: number) => (n > 1 ? `${LFL.shops}?page=${n}` : LFL.shops);
  return (
    <div className="lf-shop lf-list">
      <Header variant="c" current="shops" />
      <nav className="sh-crumb" aria-label="パンくず">
        <Link href={LFL.top}>トップ</Link>
        <span aria-hidden="true">&gt;</span>
        <span aria-current="page">店舗紹介</span>
      </nav>
      <header className="ls-title">
        <p className="sh-kicker">
          <i aria-hidden="true" />
          店舗紹介
        </p>
        <h1>店舗紹介</h1>
        <p className="sh-area">掲載している店　{total}軒</p>
      </header>
      <section className="sh-others ls-body" id="results" aria-label="店舗紹介の一覧">
        <div className="sh-others-h">
          <h2>くらしの店</h2>
          <Link href={LFL.search}>
            場所を探す
            <IcArrow />
          </Link>
        </div>
        {shops.length > 0 ? (
          <ul>
            {shops.map((s) => (
              <li key={s.id}>
                <Link href={LFL.shop(s.id)}>
                  {s.photo ? <img className="lf-ph" src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={s.photo.alt} loading="lazy" decoding="async" /> : null}
                  <span className="sh-o-tx">
                    <em>
                      <i aria-hidden="true" />
                      {s.kindName}
                    </em>
                    <b>{s.name}</b>
                    <span>
                      <IcPin className="lf-ico" />
                      {s.area}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ls-empty">掲載の準備をしています。掲載できる店が確認でき次第、ここに並びます。</p>
        )}
        {pages > 1 ? (
          <nav className="sr-pager ls-pager" aria-label="ページ送り">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={hrefOf(n)} prefetch={false} aria-current={n === page ? "page" : undefined} aria-label={`${n}ページ`}>
                {n}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
