import Link from "next/link";
import Header from "../Header";
import { IcPin, IcChev, IcChevL, IcArrow, IcSearch, IcUp, IcBrand } from "../Icons";
import { LFL } from "../links";
import { AREA_OPTIONS, type LShop, type SearchArgs } from "../data";
import { SHOP_COPY } from "../inner/shop/copy";

/* eslint-disable @next/next/no-img-element */
const IMG = "/_portal/life/";
const KIND_LABEL: Record<string, string> = { lesson: "習い事・教室", "shrine-temple": "神社・寺", "fashion-craft": "ファッション・雑貨・工芸", "photo-marriage": "写真館・結婚相談" };
const PHOTO_SIDE = ["l", "r", "l", "r"] as const;

/** 探すページ(見本 3_探す)。条件は URL の引数(kind・region・pref・q・page)で、「この条件で検索する」で GET する(JS なしで動く) */
export default function Search({ shops, total, all, args, pages }: { shops: LShop[]; total: number; all: LShop[]; args: SearchArgs; pages: number }) {
  const kinds = Object.keys(KIND_LABEL).filter((k) => all.some((s) => s.kindSlug === k));
  const kindOn = (k: string) => args.kinds.length === 0 || args.kinds.includes(k);
  const regOn = (r: string) => args.regions.length === 0 || args.regions.includes(r);
  const hrefOf = (n: number) => LFL.searchWith({ kind: args.kinds, region: args.regions, pref: args.pref, q: args.q, page: n });
  const first = (args.page - 1) * 4;
  return (
    <div className="lf-search">
      <Header variant="b" current="search" />

      <div className="sr-band">
        <img className="sr-band-img" src={`${IMG}s-band.webp`} alt="" width={1488} height={246} aria-hidden="true" />
        <div className="sr-band-tx">
          <IcBrand className="sr-band-i" />
          <h1>場所を探す</h1>
          <p>まちの暮らしや文化に出会える、全国のスポットを探せます。</p>
        </div>
      </div>

      <div className="sr-body">
        <aside className="sr-side" aria-label="検索条件">
          <form className="sr-form" action={LFL.search} method="get">
            <p className="sr-form-h">
              <IcPin className="sr-form-i" />
              <span>
                検索条件
                <small>SEARCH</small>
              </span>
            </p>
            <fieldset>
              <legend>カテゴリーで絞り込む</legend>
              {kinds.map((k) => (
                <label key={k} className="sr-ck">
                  <input type="checkbox" name="kind" value={k} defaultChecked={kindOn(k)} />
                  <span>{KIND_LABEL[k]}</span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>エリアで絞り込む</legend>
              {AREA_OPTIONS.map((a) => (
                <label key={a.slug} className="sr-ck">
                  <input type="checkbox" name="region" value={a.slug} defaultChecked={regOn(a.slug)} />
                  <span>{a.name}</span>
                </label>
              ))}
              <label className="sr-ck">
                <input type="checkbox" name="region" value="all" defaultChecked={false} />
                <span>すべてのエリア</span>
              </label>
            </fieldset>
            <fieldset>
              <legend>キーワードで探す</legend>
              <span className="sr-kw">
                <input type="search" name="q" defaultValue={args.q} placeholder="キーワードを入力" aria-label="キーワード" />
                <IcSearch />
              </span>
            </fieldset>
            {args.pref ? <input type="hidden" name="pref" value={args.pref} /> : null}
            <button type="submit" className="sr-go">
              この条件で検索する
              <IcArrow />
            </button>
          </form>
          <div className="sr-deco">
            <img src={`${IMG}s-bird.webp`} alt="" width={689} height={436} aria-hidden="true" />
            <p className="sr-deco-h">
              まちの中に、
              <br />
              まだ知らない
              <br />
              好きがある。
            </p>
            <p className="sr-deco-p">
              マチノワライフは、
              <br />
              日本各地の暮らしや文化、
              <br />
              人の想いがつまった場所を
              <br />
              ご紹介する、地域発の
              <br />
              おでかけ・発見メディアです。
            </p>
          </div>
        </aside>

        <main className="sr-main">
          <div className="sr-top">
            <p className="sr-count">
              検索結果 <b>{total}</b> 件
            </p>
            <div className="sr-mapimg">
              <img src={`${IMG}s-map.webp`} alt="日本地図" width={498} height={430} loading="lazy" decoding="async" />
            </div>
          </div>

          {shops.length === 0 ? (
            <p className="sr-empty">条件に合う場所が見つかりませんでした。条件を変えて、もう一度探してみてください。</p>
          ) : (
            <ol className="sr-list">
              {shops.map((s, i) => {
                const side = PHOTO_SIDE[(first + i) % 4];
                const text = SHOP_COPY[s.id]?.introP ?? s.blurb;
                return (
                  <li key={s.id} className={`sr-row sr-row--${side}`}>
                    <p className="sr-no">
                      <span>{String(first + i + 1).padStart(2, "0")}</span>
                      <i aria-hidden="true" />
                    </p>
                    <Link href={s.href} className="sr-card">
                      <span className="sr-ph">{s.photo ? <img className="lf-ph" src={s.photo} alt={`${s.name}の写真`} style={{ objectPosition: s.pos }} loading="lazy" decoding="async" /> : null}</span>
                      <span className="sr-tx">
                        <em className="sr-kind">{s.kind}</em>
                        <b>{s.name}</b>
                        <span className="sr-loc">
                          <IcPin className="lf-ico" />
                          {s.loc}
                        </span>
                        <span className="sr-p">{text}</span>
                      </span>
                      <span className="sr-chev" aria-hidden="true">
                        {side === "l" ? <IcChev /> : <IcChevL />}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}

          {pages > 1 ? (
            <nav className="sr-pager" aria-label="ページ送り">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={hrefOf(n)} prefetch={false} aria-current={n === args.page ? "page" : undefined} aria-label={`${n}ページ`}>
                  {n}
                </Link>
              ))}
            </nav>
          ) : null}
        </main>
      </div>

      <footer className="sr-ft">
        <Link href={LFL.top} className="sr-ft-logo" aria-label="マチノワライフ トップへ">
          <svg viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="28" fill="none" stroke="#e9dfcc" strokeWidth="1.500" />
            <g fill="none" stroke="#e9dfcc" strokeWidth="2.400">
              <circle cx="30" cy="20" r="9" />
              <circle cx="30" cy="40" r="9" />
              <circle cx="20" cy="30" r="9" />
              <circle cx="40" cy="30" r="9" />
            </g>
          </svg>
          <span>
            <b>マチノワライフ</b>
            <i>MACHINOWA LIFE</i>
          </span>
        </Link>
        <p className="sr-ft-tag">
          まちの、いい時間に出会う
          <br />
          日本のまちで見つける、暮らし・文化・ひと・場所
        </p>
        <img className="sr-ft-orn" src={`${IMG}s-orn.webp`} alt="" width={548} height={132} aria-hidden="true" />
        <nav className="sr-ft-nav" aria-label="フッターメニュー">
          <Link href={LFL.top}>トップ</Link>
          <Link href={LFL.search}>場所を探す</Link>
          <Link href={LFL.shops}>店舗紹介</Link>
          <Link href={LFL.special}>特集</Link>
        </nav>
        <Link href="#" className="sr-ft-up" aria-label="ページの先頭へ">
          <IcUp />
        </Link>
      </footer>
    </div>
  );
}
