import Link from "next/link";
import Shell from "../../common/Shell";
import { Reveal, MaskLines, Write, Heart, FillHeading, Marquee, PawTrail, Flee } from "../../common/Motion";
import { IconSearch, IconArrow, IconChevron, Paw } from "../../common/Icons";
import { ptLinks } from "../../common/site";
import { dotDate, interleave, kindsWithShops, loadPetArticles, loadPetShops, prefsWithShops, scenesWithShops, visualLen, type LiveArticle, type LiveShop } from "../../common/live";
import { CatIcon, PetMark, Leaf } from "../icons";
import { T } from "../data";
import HeroFx from "../HeroFx";
import "../top.css";
import "./live.css";

/* eslint-disable @next/next/no-img-element */

// ペットの最初のページ(本番 /pet。決定デザイン)。見本の再現(../TopPage.tsx)と同じ骨格・動きで、中身を実在の店(getPlaces("pet"))に置き換えてある。
// 見本の架空の店名・日付・記事・「おすすめ」「人気」は出さない。実データが無い欄は出さない(店が 0 件でも壊れない)。
// 飾りの写真(ヒーロー・カテゴリの札・エリアの丸)は見本の素材(AI 生成・CC0)のまま。店の写真は店の実物の写真だけ。

const L = ptLinks("live");
const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/** 検索の箱の文言。「駅名」は探すページが駅名を引けるとは限らないので入れない */
const SEARCH_HINT = "エリア・お店の名前で探す";

function Hero() {
  return (
    <section className="tp-hero" aria-label="マチノワPet">
      <div className="tp-hero-in">
        <div className="tp-hero-photo pt-live pt-shine">
          <div className="tp-ph-push">
            <div className="tp-ph-breathe">
              <img src={`${T}/hero.webp`} width={948} height={332} alt="" fetchPriority="high" />
              <div className="tp-bun" aria-hidden="true" />
            </div>
          </div>
        </div>
        <MaskLines as="h1" className="tp-h1" lines={["ペットと、", "この街で、", "もっと豊かに。"]} delay={120} step={150} />
        <Reveal as="p" variant="fade" delay={650} className="tp-lead">
          マチノワPetは、ペットと一緒に行けるお店や
          <br />
          サービスを見つけられる地域密着型のポータルサイトです。
          <br />
          ペットとのおでかけが、もっと身近で、もっと楽しくなる。
          <br />
          そんな毎日を、この街から。
        </Reveal>
        <form className="tp-search pt-pop pt-float pt-live" action={L.search} method="get" role="search">
          <IconSearch className="tp-search-ic" />
          <input className="tp-search-in" type="text" name="q" placeholder={SEARCH_HINT} aria-label={SEARCH_HINT} autoComplete="off" />
          <button type="submit" className="tp-search-go pt-press pt-shimmer pt-magnet" data-magnet="0.12" data-magnet-r="40" aria-label="検索する">
            <IconArrow />
          </button>
        </form>
        <Write className="tp-hand pt-hand" lines={["いっしょの時間が、", "この街を、もっと好きにする。"]} delay={1100} step={800} />
        <div className="tp-scroll pt-live" aria-hidden="true">
          <span>SCROLL</span>
          <i />
        </div>
      </div>
    </section>
  );
}

function SecHead({ id, en, jp, more, href, children }: { id: string; en: string; jp: string; more: string; href: string; children?: React.ReactNode }) {
  return (
    <div className="pt-sechead tp-sh">
      <h2 id={id} className="pt-h2 tp-h2 io">
        <FillHeading as="span">{en}</FillHeading>
      </h2>
      <span className="pt-h2-sub tp-sub io">{jp}</span>
      {children}
      <Link className="pt-more tp-more pt-press pt-magnet io" href={href} data-magnet="0.5" data-magnet-r="60">
        {more}
        <IconArrow />
      </Link>
    </div>
  );
}

/* ---------- Category: 実在の種類(lib/verticals/pet.ts)のうち、店のある種類だけ ---------- */

/** 種類ごとの札の中身(見本の札の写真・線画・説明。写真は 1〜6 が見本の並びの番号) */
const CAT_UI: Record<string, { icon: string; img: number; l1: string; l2: string }> = {
  "dog-cafe": { icon: "cafe", img: 1, l1: "ペットと一緒に楽しめる", l2: "カフェやレストラン" },
  trimming: { icon: "trim", img: 2, l1: "大切な家族を", l2: "キレイに、健やかに" },
  "dog-run": { icon: "run", img: 3, l1: "のびのび遊べる", l2: "屋外・屋内ドッグラン" },
  "pet-hotel": { icon: "hotel", img: 4, l1: "旅行やおでかけも", l2: "安心して預けられる" },
  vet: { icon: "clinic", img: 5, l1: "お住まいの地域の", l2: "動物病院を探す" },
  "pet-shop": { icon: "shop", img: 6, l1: "お住まいの地域の", l2: "ペットショップを探す" },
};
const CAT_W = 135.5;
const CAT_STEP = (859 - CAT_W) / 5; // 6 枚のとき見本の幅いっぱい(0〜859)。少ないときは中央に寄せる
const CAT_SHIFT = 40;

function Category({ kinds }: { kinds: Array<{ slug: string; name: string }> }) {
  const n = kinds.length;
  const x0 = (859 - ((n - 1) * CAT_STEP + CAT_W)) / 2;
  const half = Math.ceil(n / 2);
  return (
    <section className="tp-sec tp-cat" id="pt-category" aria-labelledby="tp-cat-h">
      <SecHead id="tp-cat-h" en="Category" jp="カテゴリから探す" more="すべてのお店を見る" href={L.search}>
        <Flee className="tp-deco tp-deco--leaf-a io" style={d(260)} radius={150} strength={46}>
          <Leaf className="tp-leaf pt-live" />
        </Flee>
        <Flee className="tp-deco tp-deco--paw-a io" style={d(380)} radius={140} strength={42}>
          <Paw className="tp-dpaw pt-float pt-live" />
        </Flee>
        <Flee className="tp-deco tp-deco--paw-b io" style={d(480)} radius={140} strength={42}>
          <Paw className="tp-dpaw pt-float pt-live" style={{ animationDelay: "-2.4s" }} />
        </Flee>
      </SecHead>
      <ul className="tp-cats pt-skew" data-skew="0.4" data-io-group>
        {kinds.map((k, i) => {
          const ui = CAT_UI[k.slug] ?? CAT_UI["pet-shop"];
          // 中央に近い札から順に動く(外側の札が先に動くと、後ろの札と重なって交差する)
          const dist = Math.abs(i - (n - 1) / 2);
          const delay = Math.max(0, Math.round(60 + (dist - 0.5) * 130));
          return (
            <li
              key={k.slug}
              className="tp-cat-li io"
              data-io={i < half ? "left" : "right"}
              style={{ ["--x" as string]: x0 + i * CAT_STEP, ["--w" as string]: CAT_W, ["--tl" as string]: ui.icon === "run" ? 34 : 35.5, ["--d" as string]: `${delay}ms`, ["--io-x" as string]: CAT_SHIFT }}
            >
              <Link href={L.searchWith({ kind: k.slug })} className="tp-cat-card pt-hov tp-hv pt-tilt" data-tilt="7">
                <span className="tp-cat-ph tp-up pt-zoom tp-sheen">
                  <img src={`${T}/cat-${ui.img}.webp`} width={136} height={97} alt="" loading="lazy" />
                  <i className="pt-tilt-glare" aria-hidden="true" />
                </span>
                <span className={`tp-cat-ic pt-bounce ${ui.icon === "run" ? "tp-cat-ic--run" : ""}`}>
                  <CatIcon name={ui.icon} />
                </span>
                <span className="tp-cat-t">{k.name}</span>
                <span className="tp-cat-s">
                  {ui.l1}
                  <br />
                  {ui.l2}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <PawTrail className="tp-trail tp-trail--cat" count={15} direction="right" />
    </section>
  );
}

/* ---------- Feature: 実在の店の特集記事・紹介記事(写真のある店。特集記事のある店が先) ---------- */

const FEAT_SLOT = [
  { x: 45, w: 212 },
  { x: 267, w: 208 },
  { x: 485, w: 210 },
  { x: 704, w: 200 },
];

function Feature({ items }: { items: LiveArticle[] }) {
  return (
    <div className="tp-band tp-band--feat pt-bgshift" style={{ ["--bg-to" as string]: "#f8f7f5", ["--bg-from" as string]: "#efe5d8" }}>
      <section className="tp-sec tp-feat" aria-labelledby="tp-feat-h">
        <div className="pt-sechead tp-sh">
          <h2 id="tp-feat-h" className="pt-h2 tp-h2 io">
            <FillHeading as="span">Feature</FillHeading>
          </h2>
          <span className="tp-h2-jp pt-min io">
            <FillHeading as="span">特集記事</FillHeading>
          </span>
          <p className="tp-feat-desc io">
            掲載しているお店を、一軒ずつ記事で紹介します。
            <br />
            メニューや設備、行き方など、確認できた情報をまとめています。
          </p>
          <Link className="pt-more tp-more pt-press pt-magnet io" href={L.articles} data-magnet="0.5" data-magnet-r="60">
            すべての特集記事を見る
            <IconArrow />
          </Link>
        </div>
        <PawTrail className="tp-trail tp-trail--feat" count={15} direction="left" />
        <ul className="tp-feats pt-skew" data-skew="0.4" data-io-group>
          {items.map((a, i) => {
            const slot = FEAT_SLOT[i];
            const ph = a.photo;
            const kindName = a.shop.kindName;
            return (
              <li key={a.id} className="tp-feat-li io" style={{ ["--x" as string]: slot.x - 45, ["--w" as string]: slot.w, ...d(i * 110) }}>
                <Link href={L.shop(a.id)} className="tp-fcard pt-hov tp-hv pt-tilt" data-tilt="5">
                  <span className="tp-fcard-in tp-up">
                    <span className="tp-fcard-ph pt-zoom pt-wipe tp-sheen" data-wipe={i % 2 ? "right" : "left"} style={d(i * 110 + 260)}>
                      <img src={ph.src} width={ph.w} height={ph.h} alt="" loading="lazy" decoding="async" />
                    </span>
                    {kindName ? (
                      <span className="tp-fcard-tag" style={{ ["--tw" as string]: Math.round(21 + 7.3 * visualLen(kindName)) }}>
                        {kindName}
                      </span>
                    ) : null}
                    <span className="tp-fcard-t tpl-clamp2">{a.title}</span>
                    {a.date ? <time className="tp-fcard-d" dateTime={a.date}>確認 {dotDate(a.date)}</time> : null}
                    <i className="pt-tilt-glare" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Stores: 写真のある実在の店(種類を順に回して並べる。ランキングではない) ---------- */

const PICK_SLOT = [
  { x: 45, w: 168 },
  { x: 222, w: 161 },
  { x: 394, w: 160 },
  { x: 565, w: 163 },
  { x: 739, w: 165 },
];

/** 英字が主の店名は見本の欧文の書体(en)で出す */
const isLatin = (s: string) => visualLen(s) <= s.length * 0.7;

function Pickup({ shops, kindNames }: { shops: LiveShop[]; kindNames: string[] }) {
  return (
    <section className="tp-sec tp-pick" aria-labelledby="tp-pick-h">
      <SecHead id="tp-pick-h" en="Stores" jp="掲載のお店" more="すべてのお店を見る" href={L.search}>
        <Flee className="tp-deco tp-deco--paw-c io" style={d(260)} radius={140} strength={42}>
          <Paw className="tp-dpaw pt-float pt-live" style={{ animationDelay: "-1.2s" }} />
        </Flee>
        <Flee className="tp-deco tp-deco--paw-d io" style={d(360)} radius={140} strength={42}>
          <Paw className="tp-dpaw pt-float pt-live" style={{ animationDelay: "-3.6s" }} />
        </Flee>
        <Flee className="tp-deco tp-deco--leaf-b io" style={d(460)} radius={150} strength={46}>
          <Leaf className="tp-leaf tp-leaf--b pt-live" />
        </Flee>
      </SecHead>
      <ul className="tp-picks pt-skew" data-skew="0.4" data-io-group>
        {shops.map((s, i) => {
          const slot = PICK_SLOT[i];
          const ph = s.photo!;
          const tags = [s.kindName, s.tags[0]].filter((t): t is string => !!t);
          return (
            <li key={s.id} className="tp-pick-li io" style={{ ["--x" as string]: slot.x - 45, ["--w" as string]: slot.w, ...d(i * 100) }}>
              <article className="tp-pcard pt-hov tp-hv pt-tilt" data-tilt="6">
                <Link href={L.shop(s.id)} className="tp-pcard-link" tabIndex={-1} aria-hidden="true">
                  <span className="tp-pcard-ph tp-up pt-zoom pt-wipe tp-sheen" data-wipe={i % 2 ? "right" : "left"} style={d(i * 100 + 240)}>
                    <img src={ph.src} width={ph.w} height={ph.h} alt="" loading="lazy" decoding="async" />
                    <i className="pt-tilt-glare" aria-hidden="true" />
                  </span>
                </Link>
                <Heart className="tp-pheart" label={`${s.name}をお気に入りに追加`} size={11} />
                <h3 className={`tp-pcard-n ${isLatin(s.name) ? "tp-pcard-n--en" : ""}`}>
                  <Link href={L.shop(s.id)}>{s.name}</Link>
                </h3>
                {s.area ? <p className="tp-pcard-a">{s.area}</p> : null}
                {tags.length > 0 ? (
                  <ul className="tp-pcard-tags">
                    {tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
      {kindNames.length > 0 ? (
        <div className="tp-mq-wrap" aria-hidden="true">
          <Marquee className="tp-mq" items={kindNames} sep={<Paw className="tp-mq-paw" />} repeat={Math.max(2, Math.ceil(12 / kindNames.length))} duration={46} fade />
        </div>
      ) : null}
    </section>
  );
}

/* ---------- Scene: 実在の利用シーン(lib/verticals/pet.ts の scenes)のうち、店のあるもの ---------- */

function Scenes({ scenes }: { scenes: ReturnType<typeof scenesWithShops> }) {
  const names = scenes.map((s) => s.name);
  return (
    <section className="tp-sec tp-art tpl-art" aria-label="利用シーンから探す" style={{ ["--rows" as string]: scenes.length }}>
      <div className="tp-acol tp-acol--scene tpl-acol">
        <div className="tp-ahead">
          <span className="tp-amark pt-popin" style={d(120)}>
            <PetMark kind="cat" />
          </span>
          <h2 className="pt-h2 tp-h2 tp-ah2 io">
            <FillHeading as="span">Scene</FillHeading>
          </h2>
          <span className="pt-h2-sub tp-sub tp-asub io">利用シーンから探す</span>
          <Link className="pt-more tp-more pt-press pt-magnet io" href={`${L.articles}#ar-scene`} data-magnet="0.5" data-magnet-r="60">
            すべてのシーンを見る
            <IconArrow />
          </Link>
          <p className="tp-adesc io">
            {names.join("・")}など、
            <br />
            お店ごとの条件から探せます。
          </p>
        </div>
        <ul className="tp-arows" data-io-group>
          {scenes.map((s, i) => (
            <li key={s.slug} className="tp-arow-li io" data-io="right" style={d(i * 140 + 140)}>
              <Link href={`/pet/scene/${s.slug}`} className="tp-arow pt-hov">
                <span className={`tp-arow-ph pt-zoom tp-sheen ${s.shop?.photo ? "" : "tpl-nophoto"}`}>
                  {s.shop?.photo ? <img src={s.shop.photo.src} width={s.shop.photo.w} height={s.shop.photo.h} alt="" loading="lazy" decoding="async" /> : <Paw className="tpl-nophoto-paw" />}
                </span>
                <span className="tp-arow-t">
                  {s.name}のお店
                  <br />
                  {s.count}店を掲載中
                </span>
                <IconChevron className="tp-arow-c" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Area: 店のある都道府県(写真のあるのは見本の素材がある都道府県だけ。ほかは写真なしの丸) ---------- */

/** 見本のエリアの丸の写真(area-N.webp)が写している都道府県。写っている所と丸の名前が合うものだけ */
const AREA_PHOTO: Record<string, number> = { tokyo: 1, kanagawa: 2, chiba: 3, saitama: 4, osaka: 5, yamanashi: 6 };
const CIRCLE_RIGHT = 881.5;
const CIRCLE_STEP = 58.2;

function Area({ prefs }: { prefs: ReturnType<typeof prefsWithShops> }) {
  const list = prefs.slice(0, 6);
  return (
    <section className="tp-area" id="pt-area" aria-labelledby="tp-area-h">
      <div className="tp-area-in">
        <img className="tp-area-bg pt-scale-scroll" style={{ ["--ss" as string]: 0.18, ["--sy" as string]: "calc(-14 * var(--u))" }} src={`${T}/area-bg.webp`} width={948} height={128} alt="" loading="lazy" />
        <div className="tp-area-txt">
          <p className="tp-area-en io">Area Search</p>
          <h2 id="tp-area-h" className="tp-area-h io">
            <FillHeading as="span" start={0.99} end={0.76}>
              エリアから探す
            </FillHeading>
          </h2>
          <p className="tp-area-p io">
            お住まいの地域から、ペットと一緒に行ける
            <br />
            お店やサービスを見つけられます。
          </p>
          <Link href={L.search} className="tp-area-btn pt-press pt-shimmer pt-magnet io" data-magnet="0.4" data-magnet-r="56">
            お店を探す
            <IconArrow />
          </Link>
        </div>
        <Write className="tp-area-hand pt-hand" lines={["ペットと行ける場所が、", "きっと見つかる。"]} delay={300} step={700} />
        {list.length > 0 ? (
          <ul className="tp-circles" data-io-group>
            {list.map((a, i) => {
              const photo = AREA_PHOTO[a.slug];
              const cx = CIRCLE_RIGHT - (list.length - 1 - i) * CIRCLE_STEP;
              return (
                <li key={a.slug} className="tp-circle-li pt-popin" style={{ ["--cx" as string]: cx, ...d(180 + i * 120) }}>
                  <Link href={L.searchWith({ pref: a.slug })} className="tp-circle pt-hov">
                    <span className={`tp-circle-ph pt-zoom ${photo ? "" : "tpl-nophoto"}`}>
                      {photo ? <img src={`${T}/area-${photo}.webp`} width={43} height={43} alt="" loading="lazy" /> : <Paw className="tpl-nophoto-paw" />}
                    </span>
                    <span className="tp-circle-jp">{a.short}</span>
                    <span className="tp-circle-en">{a.slug.replace(/-/g, " ").toUpperCase()}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/** 掲載 0 件のあいだ、カテゴリの代わりに出す短い案内(VerticalHub の「掲載準備中」と同じ言い方) */
function Preparing() {
  return (
    <section className="tpl-prep" id="pt-category" aria-labelledby="tpl-prep-h">
      <h2 id="tpl-prep-h" className="tpl-prep-h">
        掲載準備中です
      </h2>
      <p className="tpl-prep-p">ペットの掲載は、まだありません(現在 0 件)。掲載できる店が確認でき次第、ここに並びます。</p>
    </section>
  );
}

/** 重複を避けて n 件取る(足りなければ除外に入れた店からも足す) */
function take(primary: LiveShop[], exclude: LiveShop[], n: number): LiveShop[] {
  const ex = new Set(exclude.map((s) => s.id));
  const fresh = primary.filter((s) => !ex.has(s.id));
  return [...fresh, ...primary.filter((s) => ex.has(s.id))].slice(0, n);
}

/** shops を渡すと、その店で組む(確認用。本番のページは渡さない=getPlaces("pet")) */
export default async function PetTop({ shops: given }: { shops?: LiveShop[] } = {}) {
  const shops = given ?? (await loadPetShops());
  const kinds = kindsWithShops(shops);
  const withPhoto = shops.filter((s) => s.photo);
  const feats = (await loadPetArticles(shops)).slice(0, FEAT_SLOT.length);
  const picks = take(interleave(withPhoto), feats.map((a) => a.shop), PICK_SLOT.length);
  const scenes = scenesWithShops(shops);
  const prefs = prefsWithShops(shops);

  return (
    <Shell page="top" mode="live">
      <Hero />
      <div className="tp-flow">
        {kinds.length > 0 ? <Category kinds={kinds} /> : <Preparing />}
        {feats.length > 0 ? <Feature items={feats} /> : null}
        {picks.length > 0 ? (
          <div className="tp-band tp-band--pick pt-bgshift" style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f7f0e6" }}>
            <Pickup shops={picks} kindNames={kinds.map((k) => k.name)} />
          </div>
        ) : null}
        {scenes.length > 0 ? (
          <div className="tp-band tp-band--art pt-bgshift" style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f1f5ee" }}>
            <Scenes scenes={scenes} />
          </div>
        ) : null}
        <Area prefs={prefs} />
      </div>
      <HeroFx placeholder={SEARCH_HINT} />
    </Shell>
  );
}
