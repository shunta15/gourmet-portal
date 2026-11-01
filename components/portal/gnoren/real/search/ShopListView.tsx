import Link from "next/link";
import "../../search/search.css";
import "./real.css";
import Card from "./Card";
import type { SearchShop } from "./types";

/**
 * 店舗紹介の一覧 /restaurant(サーバー描画)。さがすと同じ札・同じ並び(gn-search-card・gn-search-grid)。絞り込みは付けない。
 * 見出し「店舗紹介」と件数(実数)・24 店/ページ・店 ID の番号の順・ページ送り(?page=)。
 * 札の右肩の料理の名前は、料理の分類(BROAD_GROUPS)の名前を labels(key → 名前)で受けて出す。
 */
export default function ShopListView({
  shops,
  total,
  page,
  pages,
  labels,
  basePath,
}: {
  shops: SearchShop[];
  total: number;
  page: number;
  pages: number;
  labels: Record<string, string>;
  basePath: string;
}) {
  const href = (n: number) => (n <= 1 ? basePath : `${basePath}?page=${n}`);
  return (
    <main className="gn-search gn-search-r-list">
      <section className="gn-search-r-lhead" aria-labelledby="gn-search-r-lh">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-search-r-lhead-town" src="/_portal/gnoren/search/townscape.webp" alt="" aria-hidden="true" width={788} height={148} />
        <div className="gn-search-r-lhead-in">
          <h1 id="gn-search-r-lh" className="gn-search-h1">
            店舗紹介
          </h1>
          <p className="gn-search-r-lhead-n">
            <b>{total}</b>
            <span>件</span>
          </p>
        </div>
      </section>
      <section className="gn-search-results gn-search-r-lres" aria-label="店舗紹介の一覧">
        <ul className="gn-search-grid">
          {shops.map((s, i) => (
            <Card key={s.id} shop={s} index={i} chipLabel={s.cuisineKeys[0] ? labels[s.cuisineKeys[0]] : undefined} />
          ))}
        </ul>
        {pages > 1 && (
          <nav className="gn-search-r-pager" aria-label="ページ">
            {page > 1 ? (
              <Link href={href(page - 1)} rel="prev">
                前へ
              </Link>
            ) : (
              <span className="is-off" aria-hidden="true">前へ</span>
            )}
            <span aria-current="page">
              {page} / {pages}
            </span>
            {page < pages ? (
              <Link href={href(page + 1)} rel="next">
                次へ
              </Link>
            ) : (
              <span className="is-off" aria-hidden="true">次へ</span>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
