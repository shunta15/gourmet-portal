import Link from "next/link";
import Header from "./Header";
import { IcArrow, IcCheck, IcChev, IcDown, IcPin, IcRefresh, IcSearch } from "./Icons";
import { FEATURES, KINDS, type SearchArgs, type SShop } from "../data";
import { SPL } from "../links";

/* eslint-disable @next/next/no-img-element */
const P = "/_portal/sports/top/";
const S = SPL.search;
const VLAB: Record<string, string> = { gym: "GYM & FITNESS", "martial-arts": "MARTIAL ARTS", golf: "GOLF" };

/** ページ送りの番号。9 ページまでは全部、それ以上は 先頭・今のページの前後・最後 */
function pageNums(pages: number, cur: number): number[] {
  if (pages <= 9) return Array.from({ length: pages }, (_, i) => i + 1);
  return [...new Set([1, pages, cur - 1, cur, cur + 1].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);
}

function Card({ s, big }: { s: SShop; big?: boolean }) {
  return (
    <Link href={s.href} className={`s2-rc s2-rc-${s.kindSlug}${big ? " s2-rc-big" : ""}`}>
      <span className="s2-rc-lab">
        <span>{VLAB[s.kindSlug] ?? s.kindEn}</span>
      </span>
      <span className="s2-rc-ph">
        {s.photo ? <img src={s.photo} alt={s.name} style={{ objectPosition: s.pos }} loading="lazy" /> : null}
      </span>
      <span className="s2-rc-bd">
        <b>{s.name}</b>
        <small>{s.loc}</small>
        <IcArrow className="s2-rc-ar" />
      </span>
    </Link>
  );
}

/**
 * 探すページ(見本 2_探す)。条件は URL の引数(kind・pref・city・feat・q・page。data.ts の SearchArgs)、絞り込みはサーバーで動く(JS なしでもリンクとフォームで絞れる)。
 * 「設備・特徴」は、店の紹介記事に書いてある事実で絞る(data.ts の FEATURES)。
 */
export default function Search({
  shops,
  total,
  all,
  args,
  pages,
}: {
  /** この 1 ページに出す店 */
  shops: SShop[];
  /** 条件に合う店の数 */
  total: number;
  /** 掲載している全店(エリア・種類の選択肢と件数に使う) */
  all: SShop[];
  args: SearchArgs;
  pages: number;
}) {
  const [first, ...others] = shops;
  const prefs = Array.from(new Map(all.map((s) => [s.pref, s.prefName])).entries());
  const cities = Array.from(new Set(all.filter((s) => !args.pref || s.pref === args.pref).map((s) => s.city).filter(Boolean)));
  // カテゴリのチェック欄 = 掲載のある種類(見本の 3 つ + 店が増えて 3 つ以外の種類が載ったら、その種類)
  const kindBoxes = [
    ...KINDS.filter((k) => all.some((s) => s.kindSlug === k.slug)).map((k) => ({ slug: k.slug, name: k.name })),
    ...Array.from(new Map(all.filter((s) => !KINDS.some((k) => k.slug === s.kindSlug)).map((s) => [s.kindSlug, s.kind])).entries()).map(([slug, name]) => ({ slug, name })),
  ];
  const count = (k: string) => all.filter((s) => s.kindSlug === k).length;
  const href = (page: number) => SPL.searchWith({ kind: args.kinds, pref: args.pref, city: args.city, feat: args.feats, q: args.q, page });
  return (
    <main className="s2-page s2-sr">
      <Header variant="search" active="search" />
      <h1 className="s2-sr">
        <img className="s2-banner" src={`${P}s-banner.webp`} alt="気になる場所を、探しにいこう。ジム・フィットネス、格闘技・武道、ゴルフ。あなたのまちのスポーツ施設を見つけて、新しい一歩をはじめよう。" width={1024} height={327} />
      </h1>

      <div className="s2-bar">
        <form className="s2-bar-f" action={S} method="get" role="search">
          <IcSearch className="s2-bar-ic" />
          <input type="text" name="q" defaultValue={args.q} aria-label="エリア・駅名・施設名で検索" placeholder="エリア・駅名・施設名で検索" />
          <button type="submit">検索</button>
        </form>
      </div>

      <nav className="s2-kinds" aria-label="カテゴリから探す">
        {KINDS.map((k, i) => (
          <Link key={k.slug} href={SPL.searchWith({ kind: k.slug })} className={`s2-kinds-i s2-kinds-${k.slug}`}>
            <img src={`${P}s-ic${i + 1}.webp`} alt="" width={52} height={44} />
            <span>
              <b>{k.name}</b>
              <small>{k.en}</small>
            </span>
            <IcChev />
          </Link>
        ))}
      </nav>

      <div className="s2-main">
        <form className="s2-flt" action={S} method="get">
          <h2>条件で絞り込む</h2>
          <div className="s2-flt-b">
            <h3>
              <IcPin className="s2-flt-pin" />
              エリア
            </h3>
            <div className="s2-sel">
              <select name="pref" aria-label="都道府県を選択" defaultValue={args.pref}>
                <option value="">都道府県を選択</option>
                {prefs.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
              <IcDown />
            </div>
            <div className="s2-sel">
              <select name="city" aria-label="市区町村を選択" defaultValue={args.city}>
                <option value="">市区町村を選択</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <IcDown />
            </div>
            <h3 className="s2-flt-h2">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3h6v2.2c2 .5 3.5 2.3 3.5 4.4 0 1-.3 1.9-.9 2.7H18c1.7 0 3 1.3 3 3V20H3v-4.7c0-1.7 1.3-3 3-3h.4c-.6-.8-.9-1.700-.9-2.700 0-2.100 1.500-3.900 3.500-4.400Z" /></svg>
              カテゴリ
            </h3>
            <ul className="s2-chk">
              {kindBoxes.map((k) => (
                <li key={k.slug}>
                  <label>
                    <input type="checkbox" name="kind" value={k.slug} defaultChecked={args.kinds.includes(k.slug)} />
                    <i>
                      <IcCheck />
                    </i>
                    <span>
                      {k.name} <small>({count(k.slug)})</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <h3 className="s2-flt-h3">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm-3 4v10a2 2 0 0 0 2 2h9v1.500H7a3.500 3.500 0 0 1-3.500-3.500V8Z" /></svg>
              設備・特徴
            </h3>
            <ul className="s2-chk">
              {FEATURES.map((f) => (
                <li key={f.key}>
                  <label>
                    <input type="checkbox" name="feat" value={f.key} defaultChecked={args.feats.includes(f.key)} />
                    <i>
                      <IcCheck />
                    </i>
                    <span>{f.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            {args.q ? <input type="hidden" name="q" value={args.q} /> : null}
            <button type="submit" className="s2-flt-go">
              <span>この条件で検索</span>
              <IcArrow />
            </button>
            <Link href={S} className="s2-flt-clr">
              <IcRefresh />
              条件をリセット
            </Link>
          </div>
        </form>

        <section className="s2-res" aria-label="検索結果">
          <div className="s2-res-hd">
            <h2>
              検索結果<b>{total}</b>件
            </h2>
          </div>
          <div className="s2-res-l">
            {first ? <Card s={first} big /> : <p className="s2-empty">条件に合う施設はありません。条件をリセットしてもう一度お試しください。</p>}
          </div>
          <div className="s2-res-r">
            <div className="s2-map">
              <img src={`${P}s-map.webp`} alt="" width={324} height={85} />
            </div>
            {others.map((s) => (
              <Card key={s.id} s={s} />
            ))}
          </div>
          {pages > 1 ? (
            <nav className="s2-pager" aria-label="ページ送り">
              {pageNums(pages, args.page).map((n) => (
                <Link key={n} href={href(n)} prefetch={false} aria-current={n === args.page ? "page" : undefined} aria-label={`${n}ページ`}>
                  {n}
                </Link>
              ))}
            </nav>
          ) : null}
        </section>
      </div>

      <div className="s2-bottom">
        <img src={`${P}s-bottom.webp`} alt="動く人が、まちをおもしろくする。スポーツがあると、日常がちょっと変わる。新しい自分に出会ったり、まちで仲間ができたり。マチノワスポーツは、地域のスポーツシーンを応援します。" width={1024} height={319} />
      </div>
    </main>
  );
}
