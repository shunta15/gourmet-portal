import Link from "next/link";
import Header from "../Header";
import { Pin, Chevron, ArrowShort } from "../Icons";
import { SPL } from "../../links";
import "../shop/shop.css";
import "../special/special.css";
import "../story/story.css";
import "./list.css";
import type { LiveShop } from "@/components/portal/vkit/common/live";

/* eslint-disable @next/next/no-img-element */
export const SHOP_LIST_PAGE_SIZE = 12;

/**
 * 店舗紹介の一覧(/sports/shop。メニューの「店舗紹介」の行き先)。見本2には無いページなので、店舗紹介の見出し(英字・明朝の店名の見出し・線)と、
 * 特集の「PICK UP」の店の札(写真・種類の札・店名・所在地・矢印)だけで組む。札を押すと、その店の店舗紹介ページ。並びはエリア順(順位ではない)。
 */
export default function ShopListPage({ shops, total, page, pages }: { shops: LiveShop[]; total: number; page: number; pages: number }) {
  const hrefOf = (n: number) => (n > 1 ? `${SPL.shops}?page=${n}` : SPL.shops);
  return (
    <div className="s2b-shop s2b-story">
      <div className="s2b-hdw s2b-hdw--shop">
        <Header variant="shop" current="shops" />
      </div>

      <nav className="s2b-sh-crumb s2b-st-crumb" aria-label="パンくず">
        <span className="s2b-st-crumb-i"><Link href={SPL.top}>トップ</Link></span>
        <span className="s2b-st-crumb-i"><Chevron className="s2b-ci" /><span aria-current="page">店舗紹介</span></span>
      </nav>

      <header className="s2b-st-title">
        <p className="s2b-sh-kicker">SHOP LIST</p>
        <h1>店舗紹介</h1>
        <p className="s2b-sh-loc">
          <i aria-hidden="true" />
          <span>掲載している店　{total}軒</span>
          <i aria-hidden="true" />
        </p>
      </header>

      <section className="s2b-sh-rel s2b-st-stores-sec s2b-ls-body" id="results" aria-label="店舗紹介の一覧">
        <div className="s2b-sh-rel-h">
          <span className="s2b-sh-rel-en">STORES</span>
          <b>スポーツの店</b>
          <i aria-hidden="true" />
          <Link href={SPL.search}>施設を探す<ArrowShort className="s2b-sh-rel-va" /></Link>
        </div>
        {shops.length > 0 ? (
          <ul className="s2b-sp-shops s2b-st-shops">
            {shops.map((s) => (
              <li key={s.id}>
                <Link href={SPL.shop(s.id)}>
                  <span className="s2b-sp-shop-ph">
                    {s.photo ? <img className="s2b-ph" src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={s.photo.alt} loading="lazy" decoding="async" /> : null}
                    <em>{s.kindName}</em>
                  </span>
                  <b>{s.name}</b>
                  <span className="s2b-sp-shop-loc"><Pin className="s2b-ci" />{s.area}</span>
                  <ArrowShort className="s2b-sp-shop-ar" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="s2b-ls-empty">掲載の準備をしています。掲載できる店が確認でき次第、ここに並びます。</p>
        )}
        {pages > 1 ? (
          <nav className="s2b-pager" aria-label="ページ送り">
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
