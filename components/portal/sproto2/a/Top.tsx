import Link from "next/link";
import Header from "./Header";
import { IcArrow, IcChev, IcPin, IcSearch } from "./Icons";
import { KINDS, type SShop, type SSpecial } from "./data";

/* eslint-disable @next/next/no-img-element */
const P = "/_portal/sproto2/a/";
const S = "/proto-sports/search";
const CHIPS: Array<[string, string]> = [
  ["磐田市", `${S}?q=${encodeURIComponent("磐田市")}`],
  ["名古屋市", `${S}?q=${encodeURIComponent("名古屋市")}`],
  ["所沢市", `${S}?q=${encodeURIComponent("所沢市")}`],
  ["ジム", `${S}?f=1&kind=gym`],
  ["フィットネス", `${S}?f=1&kind=gym`],
  ["ゴルフ", `${S}?f=1&kind=golf`],
];
const TILES: Array<[string, string, string]> = [
  ["tile1", "筋トレ", `${S}?f=1&kind=gym`],
  ["tile2", "運動習慣", `${S}?f=1&kind=gym`],
  ["tile3", "スタジオ", `${S}?f=1&kind=gym`],
  ["tile4", "格闘技・武道", `${S}?f=1&kind=martial-arts`],
  ["tile5", "このまちで、運動がある暮らし。", S],
  ["tile6", "ゴルフ", `${S}?f=1&kind=golf`],
];
const CATS = [
  { kind: KINDS[0], img: "t-circ1" },
  { kind: KINDS[1], img: "t-circ2" },
  { kind: KINDS[2], img: "t-circ3" },
];
const PILL: Record<string, string> = { gym: "s2-pill-b", "martial-arts": "s2-pill-p", golf: "s2-pill-g" };

/** 最初のページ(見本 4_トップ)。写真・手書き文字・飾りは見本の切り出し(P)。店は実在 3 店、特集は特集記事 3 本へのリンク */
export default function Top({ shops, specials }: { shops: SShop[]; specials: SSpecial[] }) {
  const sp = (i: number) => specials[i]?.href ?? "/proto-sports/special";
  return (
    <main className="s2-page s2-top">
      <Header variant="top" active="top" />

      <section className="s2-hero" aria-label="今日のわたしに、運動を。">
        <img className="s2-hero-bg" src={`${P}t-hero.webp`} alt="" width={1024} height={409} />
        <div className="s2-hero-tx">
          <ul className="s2-hero-en" aria-hidden="true">
            <li>CITY</li>
            <li>FITNESS</li>
            <li>CULTURE</li>
            <li>MAGAZINE</li>
          </ul>
          <h1>
            <span>今日の</span>
            <span>わたしに、</span>
            <span>運動を。</span>
          </h1>
          <p className="s2-hero-sub">
            見つかる、続けられる。
            <br />
            あなたのまちのフィットネス・スポーツ施設。
          </p>
          <form className="s2-hero-form" action={S} method="get" role="search">
            <IcPin className="s2-hero-pin" />
            <input type="text" name="q" aria-label="エリア・駅名で探す" placeholder="エリア・駅名で探す　例：名古屋市、所沢市" />
            <button type="submit" aria-label="検索">
              <IcSearch />
            </button>
          </form>
          <ul className="s2-hero-chips">
            {CHIPS.map(([t, h]) => (
              <li key={t}>
                <Link href={h}>{t}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Link className="s2-hero-l s2-hero-l1" href={`${S}?f=1&kind=gym`} aria-label="STUDIO 仲間と、いい汗を。" />
        <Link className="s2-hero-l s2-hero-l2" href={`${S}?f=1&kind=gym`} aria-label="FITNESS 続く、変わる。" />
      </section>

      <section className="s2-cat" aria-label="カテゴリから探す">
        <img className="s2-cat-sc" src={`${P}t-catscript.webp`} alt="Category から探す" width={100} height={62} />
        {CATS.map((c) => (
          <Link key={c.kind.slug} href={`${S}?f=1&kind=${c.kind.slug}`} className="s2-cat-i">
            <img src={`${P}${c.img}.webp`} alt="" width={72} height={72} />
            <span>
              <b>{c.kind.name}</b>
              <small>{c.kind.en.replace("&", "/")}</small>
            </span>
            <IcArrow />
          </Link>
        ))}
      </section>

      <section className="s2-tiles" aria-label="目的から探す">
        {TILES.map(([k, label, h]) => (
          <Link key={k} href={h} className={`s2-tile s2-${k}`} aria-label={label}>
            <img src={`${P}t-${k}.webp`} alt="" width={347} height={191} />
          </Link>
        ))}
      </section>

      <section className="s2-pick" aria-label="注目の施設">
        <div className="s2-pick-hd">
          <p>PICK UP</p>
          <h2>注目の施設</h2>
          <Link href="/proto-sports/search" className="s2-pick-go" aria-label="施設をもっと見る">
            <IcChev />
          </Link>
        </div>
        <ul className="s2-pick-ls">
          {shops.map((s) => (
            <li key={s.id}>
              <Link href={s.href} className="s2-pc">
                <span className="s2-pc-ph">
                  <img src={s.photo} alt={s.name} style={{ objectPosition: s.pos }} loading="lazy" />
                </span>
                <span className="s2-pc-bd">
                  <em className={`s2-pill ${PILL[s.kindSlug] ?? ""}`}>{s.kind}</em>
                  <b>{s.name}</b>
                  <small>{s.loc}</small>
                  <i className="s2-pc-ar">
                    <IcArrow />
                  </i>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="s2-sp" aria-label="特集">
        <Link href={sp(0)} className="s2-sp-big" aria-label="特集　運動があると、このまちが好きになる。">
          <img src={`${P}t-sp-big.webp`} alt="" width={619} height={337} />
        </Link>
        <Link href={sp(1)} className="s2-sp-s1" aria-label="このまちで見つける、わたしのフィットネス。">
          <img src={`${P}t-sp-s1.webp`} alt="" width={204} height={151} />
        </Link>
        <Link href={sp(2)} className="s2-sp-s2" aria-label="通いたくなる理由が、きっと見つかる。">
          <img src={`${P}t-sp-s2.webp`} alt="" width={204} height={185} />
        </Link>
        <Link href="/proto-sports/special" className="s2-sp-r" aria-label="運動のある暮らしで、まちはもっと楽しくなる。">
          <img src={`${P}t-sp-r.webp`} alt="" width={200} height={337} />
        </Link>
        <Link href={sp(0)} className="s2-sp-btn" aria-label="特集記事を読む" />
      </section>
    </main>
  );
}
