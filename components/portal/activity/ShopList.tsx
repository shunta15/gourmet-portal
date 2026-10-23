import Link from "next/link";
import ShopCard from "./ShopCard";
import { IcChevL, IcChevR, Mountain, Pine, Pines, Stamp, Waves } from "./Deco";
import { aLinks } from "./links";
import { toCard, type AShop } from "./data";

const IMG = "/_portal/activity/";

/** 1 ページの札の数(探すの結果の「見本は 12 枚」と同じ) */
export const SHOP_PAGE_SIZE = 12;

/** ページ送りの URL(1 ページ目は引数なし) */
export const shopsPageHref = (n: number) => (n > 1 ? `${aLinks.shops}?page=${n}#sl-results` : `${aLinks.shops}#sl-results`);

/**
 * 店舗紹介の一覧ページ(/activity/shop。メニューの「店舗紹介」の行き先。オーナー決定 2026-10-23)。
 * 作りは A 組の部品だけ: ヒーローは特集のページ(Article.tsx)のヒーローと同じ組み立て(写真のコラージュ+切手風のチケット。字だけ「店舗紹介」に)、
 * 一覧は探すの結果の札(ShopCard の list)と同じ並べ方。新しいデザインは作っていない。絞り込み・並べ替えは付けない。
 * 札 = 掲載している全店(保留の店は出ない)。件数は実数。札を押すと、その店の店舗紹介ページ。店が増えたら、探すの結果と同じ作法で SHOP_PAGE_SIZE ずつにページを分ける(?page=2。2 ページ目以降は noindex)。
 * 星・口コミ・料金・「人気」は出さない。並びはエリア順(順位ではない)。
 */
export default function ShopList({ shops, page, pages, total }: { shops: AShop[]; page: number; pages: number; total: number }) {
  return (
    <div className="apa-page apa-article apa-shoplist">
      {/* ---- ヒーロー(特集のヒーローと同じ組み立て) ---- */}
      <section className="f-hero" aria-label="アクティビティの店舗紹介">
        <i className="f-yel f-yel-1" />
        <i className="f-yel f-yel-2" />
        <i className="f-yel f-yel-3" />
        <i className="f-yel f-yel-4" />
        <i className="f-tape" />
        <figure className="f-woman">
          <img src={`${IMG}ar-hero-woman.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>あたらしい</span>
            <span>景色に、</span>
            <span>会いにいこう。</span>
          </figcaption>
          <Stamp id="slw" className="f-woman-stamp" ring="MACHINOWA ACTIVITY" mountain wave />
          <Pine className="f-woman-pine f-woman-pine-1" />
          <Pine className="f-woman-pine f-woman-pine-2" />
        </figure>

        <div className="f-ticket">
          <div className="f-ticket-in">
            <p className="f-ticket-lab">MACHINOWA SHOPS</p>
            <h1 className="f-ticket-h1">
              <span>アクティビティ</span>
              <em>店舗紹介</em>
            </h1>
            <p className="f-ticket-sub">
              <span>体験できる場所を、</span>
              <span>ぜんぶ見わたそう。</span>
            </p>
            <p className="f-ticket-p">
              マチノワに載っている、
              <br />
              アクティビティの店を
              <br />
              すべて並べています。
            </p>
            <Mountain className="f-ticket-mtn" />
            <Mountain className="f-ticket-mtn f-ticket-mtn-2" />
          </div>
        </div>
        <Waves className="f-hero-waves" />

        <figure className="f-p f-p1">
          <img src={`${IMG}ar-hero-lake.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>どこへ行く?</span>
            <span>気になる店は?</span>
          </figcaption>
        </figure>
        <figure className="f-p f-p2">
          <img src={`${IMG}ar-hero-spring.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>店ごとの紹介を</span>
            <span>のぞいてみよう!</span>
          </figcaption>
        </figure>
        <span className="f-ticket-tab">TICKET</span>
        <figure className="f-p f-p3">
          <img src={`${IMG}ar-hero-kayak.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>きっと、</span>
            <span>好きな体験が見つかる。</span>
          </figcaption>
        </figure>
        <figure className="f-p f-p4">
          <img src={`${IMG}ar-hero-pottery.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>はじめてでも</span>
            <span>探せます!</span>
          </figcaption>
          <Pines className="f-p4-pines" />
        </figure>
      </section>

      {/* ---- 一覧(探すの結果の札と同じ) ---- */}
      <section className="sl-main" id="sl-results" aria-label="店舗紹介の一覧">
        <div className="s-res-head">
          <h2 className="s-res-n">
            店舗紹介 <b>{total}</b>件
          </h2>
          <Pines className="s-res-pines" />
        </div>
        {shops.length > 0 ? (
          <div className="s-grid">
            {shops.map((s) => (
              <ShopCard key={s.id} s={toCard(s)} variant="list" href={aLinks.shop(s.id)} />
            ))}
          </div>
        ) : (
          <p className="s-empty">店は、いま掲載の準備をしています。</p>
        )}
        {pages > 1 ? (
          <nav className="s-pager" aria-label="ページ送り">
            {page > 1 ? (
              <Link href={shopsPageHref(page - 1)} className="s-pg s-pg-arrow is-live" aria-label="前のページ" rel="prev" prefetch={false}>
                <IcChevL />
              </Link>
            ) : (
              <span className="s-pg s-pg-arrow" aria-disabled="true">
                <IcChevL />
              </span>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
              n === page ? (
                <span key={n} className="s-pg is-on" aria-current="page">
                  {n}
                </span>
              ) : (
                <Link key={n} href={shopsPageHref(n)} className="s-pg is-live" aria-label={`${n}ページ`} prefetch={false}>
                  {n}
                </Link>
              ),
            )}
            {page < pages ? (
              <Link href={shopsPageHref(page + 1)} className="s-pg s-pg-arrow is-live" aria-label="次のページ" rel="next" prefetch={false}>
                <IcChevR />
              </Link>
            ) : (
              <span className="s-pg s-pg-arrow" aria-disabled="true">
                <IcChevR />
              </span>
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
