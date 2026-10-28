import Link from "next/link";
import Header from "../Header";
import { IcSearch, IcPin, IcPinLine, IcArrow, IcBowl, IcTorii, IcBag, IcCamera } from "../Icons";
import { LFL } from "../links";
import type { LShop } from "../data";
import { SHOP_COPY } from "../inner/shop/copy";
import { lifeGroupBySlug } from "@/lib/verticals/lifeKinds";

/* eslint-disable @next/next/no-img-element */
/** 種類の札(組の名前・補足は lib/verticals/lifeKinds.ts)。上の小さな札と、下の写真つきの札で同じものを使う */
const KINDS = [
  { slug: "visit", sub: "地域に息づく、祈りと歴史", chip: ["出かける"], Icon: IcTorii },
  { slug: "learn", sub: "学びで広がる、暮らしの楽しみ", chip: ["習う"], Icon: IcBowl },
  { slug: "shop", sub: "つくり手の想いに出会う", chip: ["買う・", "借りる"], Icon: IcBag },
  { slug: "service", sub: "大切な時間を、未来につなぐ", chip: ["任せる"], Icon: IcCamera },
].map((k) => ({ ...k, group: lifeGroupBySlug(k.slug)! }));
const AREAS = [
  { pref: "tokyo", name: "東京都", img: "t-area-tokyo.webp" },
  { pref: "kyoto", name: "京都府", img: "t-area-kyoto.webp" },
  { pref: "yamagata", name: "山形県", img: "t-area-yamagata.webp" },
  { pref: "hyogo", name: "兵庫県", img: "t-area-hyogo.webp" },
];
/** 見本の並び(白金陶芸教室・藤森神社・中島清吉商店・サンフォトタカハシ)。それ以外の店は後ろに続く */
const ORDER = ["li0002", "li0001", "li0004", "li0003"];
const IMG = "/_portal/life/";

function Photo({ s, className }: { s: LShop; className?: string }) {
  return s.photo ? <img className={`lf-ph ${className ?? ""}`} src={s.photo} alt={`${s.name}の写真`} style={{ objectPosition: s.pos }} loading="lazy" decoding="async" /> : null;
}

/** 最初のページ(見本 2_トップ)。店は実在の店(getPlaces("life"))、写真は店の実写。大きな写真と地名の写真は見本から切り出した飾り */
export default function Top({ shops }: { shops: LShop[] }) {
  const ordered = [...ORDER.map((id) => shops.find((s) => s.id === id)).filter(Boolean), ...shops.filter((s) => !ORDER.includes(s.id))] as LShop[];
  const feat = ordered.slice(0, 3);
  const kindShop = (slug: string) => shops.find((s) => s.groupSlug === slug);
  return (
    <div className="lf-top">
      <Header variant="a" current="top" />

      <section className="tp-hero" aria-label="マチノワライフ">
        <img className="tp-hero-img" src={`${IMG}t-hero.webp`} alt="石畳の参道と鳥居の見える、神社の境内" width={1898} height={1537} fetchPriority="high" />
        <p className="tp-hero-cap">
          地域の
          <br />
          もの・こと・ひとに出会い
          <br />
          いつもの暮らしが、
          <br />
          少し特別になる。
        </p>
        <p className="tp-rail" aria-hidden="true">
          <span>MACHINOWA LIFE</span>
          <i />
          <span>まちと、つながる。</span>
        </p>
        <div className="tp-panel">
          <h1>
            暮らしのそばに、
            <br />
            いい出会い。
          </h1>
          <svg className="tp-swirl" viewBox="0 0 180 30" fill="none" aria-hidden="true">
            <path d="M2 14c28-6 52-8 80-2 26 5 44 9 70 5 10-1 18-4 26-9" stroke="#a8352c" strokeWidth="1.300" strokeLinecap="round" />
            <path d="M70 12c20-8 40-6 52 6-12-2-30-2-52-6Z" fill="#a8352c" opacity=".9" />
          </svg>
          <p className="tp-lead">
            まちには、まだ知らない
            <br />
            素敵な場所や人、文化がある。
            <br />
            マチノワライフは、
            <br />
            地域で出会える“好き”や“学び”を通して
            <br />
            日々の暮らしをちょっと豊かにする
            <br />
            ローカルな場所のポータルサイトです。
          </p>
          <p className="tp-find">
            <IcPin className="tp-find-i" />
            場所を探す
          </p>
          <form className="tp-form" action={LFL.search} role="search">
            <IcPinLine className="tp-form-pin" />
            <input name="q" type="search" placeholder="エリア・市区町村を入力" aria-label="エリア・市区町村を入力" />
            <button type="submit" aria-label="検索">
              <IcSearch />
            </button>
          </form>
          <ul className="tp-chips">
            {KINDS.map((k) => (
              <li key={k.slug}>
                <Link href={LFL.searchWith({ kind: k.slug })}>
                  <k.Icon className="tp-chip-i" />
                  <span>
                    {k.chip.map((t, i) => (
                      <span key={i}>
                        {t}
                        {i < k.chip.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ul className="tp-kinds" aria-label="種類から探す">
        {KINDS.map((k) => {
          const s = kindShop(k.slug);
          return (
            <li key={k.slug}>
              <Link href={LFL.searchWith({ kind: k.slug })}>
                {s ? <Photo s={s} /> : null}
                <span className="tp-kind-tx">
                  <b>
                    {k.group.name}
                    <small>({k.group.note})</small>
                  </b>
                  <em>{k.sub}</em>
                </span>
                <span className="lf-circ lf-circ--w tp-kind-ar">
                  <IcArrow />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="tp-sp" aria-label="特集">
        <div className="tp-sp-l">
          <p className="tp-sp-k">
            <IcTorii className="tp-sp-ki" />
            特集
          </p>
          <h2>
            まちの
            <br />
            いい出会い
          </h2>
          <p className="tp-sp-p">
            地域で出会える、
            <br />
            とっておきの場所をご紹介します。
          </p>
          <Link href={LFL.special} className="tp-btn">
            特集一覧を見る
            <IcArrow />
          </Link>
        </div>
        {feat[0] ? (
          <Link href={feat[0].href} className="tp-sp-big">
            <Photo s={feat[0]} />
            <span className="tp-sp-box">
              <span className="lf-tagchip">{feat[0].kind}</span>
              <b>{feat[0].name}</b>
              <em>
                <IcPin className="lf-ico" />
                {feat[0].loc}
              </em>
              <span className="tp-sp-d">{SHOP_COPY[feat[0].id]?.blurb ?? feat[0].blurb}</span>
              <span className="lf-circ tp-sp-ar">
                <IcArrow />
              </span>
            </span>
          </Link>
        ) : null}
        <div className="tp-sp-r">
          {feat.slice(1).map((s) => (
            <Link key={s.id} href={s.href} className="tp-sp-sm">
              <span className="tp-sp-sm-ph">
                <Photo s={s} />
              </span>
              <span className="tp-sp-sm-tx">
                <span className="lf-tagchip">{s.kind}</span>
                <b>{s.name}</b>
                <em>
                  <IcPin className="lf-ico" />
                  {s.loc}
                </em>
                <span className="tp-sp-d">{SHOP_COPY[s.id]?.blurb ?? s.blurb}</span>
                <span className="lf-circ tp-sp-ar">
                  <IcArrow />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="tp-new" aria-label="新着の店舗紹介">
        <div className="tp-new-h">
          <IcTorii className="tp-new-i" />
          <h2>新着の店舗紹介</h2>
          <span className="tp-new-bar" aria-hidden="true" />
          <p>まちの魅力あふれる、{ordered.length}つの店舗をご紹介します。</p>
          <Link href={LFL.shops} className="tp-btn tp-btn--s">
            店舗紹介一覧を見る
            <IcArrow />
          </Link>
        </div>
        <ul className="tp-new-l">
          {ordered.slice(0, 4).map((s) => (
            <li key={s.id}>
              <Link href={s.href}>
                <span className="tp-new-ph">
                  <Photo s={s} />
                </span>
                <span className="tp-new-bd">
                  <span className="lf-tagchip">{s.kind}</span>
                  <b>{s.name}</b>
                  <em>
                    <IcPin className="lf-ico" />
                    {s.loc}
                  </em>
                  <span className="lf-circ tp-new-ar">
                    <IcArrow />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="tp-area" aria-label="エリアから探す">
        <div className="tp-area-l">
          <h2>
            <IcPin className="tp-area-i" />
            エリアから探す
          </h2>
          <p>行きたいエリアから、店舗を探せます。</p>
          <Link href={LFL.search} className="tp-btn tp-btn--s">
            エリア一覧を見る
            <IcArrow />
          </Link>
        </div>
        <ul className="tp-area-r">
          {AREAS.map((a) => (
            <li key={a.pref}>
              <Link href={LFL.searchWith({ pref: a.pref })}>
                <img className="lf-ph" src={`${IMG}${a.img}`} alt={`${a.name}の風景`} loading="lazy" decoding="async" />
                <b>{a.name}</b>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
