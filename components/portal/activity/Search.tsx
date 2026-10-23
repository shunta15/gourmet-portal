import SearchBody, { type CourseCard, type SearchInit } from "./SearchBody";
import { IcBinoc, IcCal, IcCompass, IcPin, Mountain, Pine, Pines, Stamp, Waves } from "./Deco";
import { PICKS, pickShops, prefShort, toCard, type AShop } from "./data";

const IMG = "/_portal/activity/";

// 上の 4 つの札は、下の絞り込みの同じ名前の欄へ(#fac-…。SearchBody が開いて、そこまで動く)
const TABS = [
  { t: "シーンから探す", s: "どんな時間を過ごしたい?", Ic: IcBinoc, on: true, to: "#fac-style" },
  { t: "ジャンルから探す", s: "やってみたいことは?", Ic: IcCompass, on: false, to: "#fac-genre" },
  { t: "エリアから探す", s: "どこで体験する?", Ic: IcPin, on: false, to: "#fac-area" },
  { t: "日付から探す", s: "いつ行く?", Ic: IcCal, on: false, to: "#fac-date" },
];

/**
 * 探すページ(見本 83)。結果の札は掲載している全店(見本は 12 枚)、モデルコースは見本どおり 3 枚。料金の絞り込み・「人気」「NEW」・星は出さない。
 * init = URL の引数から作った、絞り込みの最初の状態(最初のページ・テーマの丸などのリンク先が効く)。
 */
export default function Search({ shops, init }: { shops: AShop[]; init: SearchInit }) {
  const prefNames = Object.fromEntries(shops.map((s) => [s.pref, prefShort(s.pref, s.prefName)]));
  const courses: CourseCard[] = pickShops(shops, PICKS.course).map((s) => {
    const a = s.photoList[1] ?? s.photoList[0];
    const b = s.photoList[2] ?? s.photoList[0];
    return { id: s.id, title: s.course.title, badge: s.course.badge, tags: s.course.tags, place: s.course.place, a: a.src, b: b.src, altA: a.alt, altB: b.alt };
  });
  return (
    <div className="apa-page apa-search">
      <section className="s-hero" aria-label="アクティビティを探す">
        <i className="s-yel s-yel-1" />
        <i className="s-yel s-yel-2" />
        <i className="s-yel s-yel-3" />
        <i className="s-yel s-yel-4" />
        <i className="s-yel s-yel-5" />
        <figure className="s-hero-photo">
          <img src={`${IMG}se-hero-hikers.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>やってみたいが、</span>
            <span>きっと見つかる。</span>
          </figcaption>
          <Stamp id="sfind" className="s-hero-stamp" lines={["FIND", "ACTIVITY"]} mountain={false} />
          <Pines className="s-hero-stamp-pines" />
        </figure>
        <div className="s-ticket">
          <div className="s-ticket-in">
            <p className="s-ticket-lab">MACHINOWA ACTIVITY</p>
            <h1 className="s-ticket-h1">
              <span>マチノワで、</span>
              <span>あたらしい体験を</span>
              <em>探そう。</em>
            </h1>
            <Waves className="s-ticket-waves" />
            <Pines className="s-ticket-pines" />
            <Mountain className="s-ticket-mtn" />
          </div>
          <Stamp id="stk" className="s-ticket-stamp" mountain wave={false} />
        </div>
        <figure className="s-hero-kayak">
          <img src={`${IMG}se-hero-kayak.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>あの景色に、</span>
            <span>会いにいこう。</span>
          </figcaption>
        </figure>
        <figure className="s-hero-pottery">
          <img src={`${IMG}se-hero-pottery.webp`} alt="" />
          <figcaption className="apa-hand">
            <span>つくる時間が、</span>
            <span>思い出になる。</span>
          </figcaption>
        </figure>
        <Stamp id="stj" className="s-hero-travel" ring="TRAVEL" lines={["JAPAN"]} mountain />
        <Pine className="s-hero-pine s-hero-pine-1" />
        <Pine className="s-hero-pine s-hero-pine-2" />
      </section>

      <nav className="s-tabs" aria-label="探し方">
        {TABS.map(({ t, s, Ic, on, to }, i) => (
          <a key={t} href={to} className={`s-tab s-tab-${i}${on ? " is-on" : ""}`}>
            <Ic className="s-tab-ic" />
            <span className="s-tab-t">
              <b>{t}</b>
              <small>{s}</small>
            </span>
          </a>
        ))}
      </nav>

      <SearchBody shops={shops.map(toCard)} courses={courses} init={init} prefNames={prefNames} />

      <div className="s-bottom" aria-hidden="true">
        <img src={`${IMG}se-bottom.webp`} alt="" />
      </div>
    </div>
  );
}
