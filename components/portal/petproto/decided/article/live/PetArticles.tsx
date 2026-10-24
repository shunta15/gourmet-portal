import type { CSSProperties } from "react";
import Link from "next/link";
import Shell from "../../common/Shell";
import PawRun from "../PawRun";
import { ArtIcon } from "../ArtIcons";
import { Reveal, MaskLines, Write, FillHeading } from "../../common/Motion";
import { IconArrow } from "../../common/Icons";
import { IMG_ARTICLE, IMG_TOP, ptLinks } from "../../common/site";
import { dotDate, kindsWithShops, loadPetArticles, loadPetShops, scenesWithShops, type LiveArticle, type LiveShop } from "../../common/live";
import LiveTabs, { type LiveCardData, type LiveTab } from "./LiveTabs";
import "../article.css";
import "./live.css";

/* eslint-disable @next/next/no-img-element */

// ペットの記事の一覧(本番 /pet/article。決定デザイン ④)。見本(../Sections.tsx・../LatestTabs.tsx)と同じ骨格・動きで、中身を実在のデータに置き換えてある。
//   ヒーロー(ARTICLE) → カテゴリから探す(店のある種類) → シーンから探す(店のある利用シーン) → 特集記事(大 1 + 小 2) → 記事の一覧(種類ごとのタブ)
// 外した欄: 専門家コラム(専門家の名前・監修は実在のデータが無い)・こんな記事もおすすめ(記事の一覧が兼ねる)・新着/人気/編集部のおすすめのタブ(順位に見えるため。種類ごとに替えた)。
// 記事 = 写真のある実在の店の特集記事・紹介記事(リンク先はその店のページ /pet/shop/{id}。店の詳細と特集記事は同じページ)。実データが無い欄は出さない。

const L = ptLinks("live");

const KIND_IMG: Record<string, { src: string; w: number; h: number; icon: string }> = {
  trimming: { src: `${IMG_ARTICLE}/cat-grooming.webp`, w: 308, h: 158, icon: "scissors" },
  "pet-hotel": { src: `${IMG_ARTICLE}/cat-hotel.webp`, w: 304, h: 158, icon: "house" },
  "dog-cafe": { src: `${IMG_ARTICLE}/cat-cafe.webp`, w: 310, h: 158, icon: "cup" },
  vet: { src: `${IMG_ARTICLE}/cat-hospital.webp`, w: 308, h: 158, icon: "stetho" },
  "dog-run": { src: `${IMG_ARTICLE}/cat-outing.webp`, w: 314, h: 158, icon: "tree" },
  "pet-shop": { src: `${IMG_TOP}/cat-6.webp`, w: 136, h: 97, icon: "paw" },
};
const SCENE_ICON: Record<string, string> = { "large-dog-ok": "paw", "cat-ok": "heart", "pickup-delivery": "car", "night-care": "house" };

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as CSSProperties;
const checked = (iso?: string) => (iso ? `確認 ${dotDate(iso)}` : "");

function Hero() {
  return (
    <section className="ar-hero pt-live" aria-label="記事">
      <div className="ar-hero-bg pt-shine">
        <span className="ar-hero-par" data-par="0.015">
          <img className="pt-kb" src={`${IMG_ARTICLE}/hero.webp`} width={1896} height={488} alt="" fetchPriority="high" decoding="async" />
        </span>
      </div>
      <div className="ar-hero-in">
        <Reveal as="p" variant="fade" className="ar-hero-label">
          ARTICLE
        </Reveal>
        <MaskLines as="h1" className="ar-hero-h1" lines={["ペットとの暮らしを、", "もっと豊かに。"]} delay={180} step={160} />
        <Write as="p" className="ar-hero-sub" lines={["お店の紹介記事と、種類・利用シーンから探せるページをまとめています。", "メニューや設備、行き方など、お店の情報をお届けします。"]} delay={700} step={420} />
      </div>
    </section>
  );
}

type Tile = { id: string; label: string; icon: string; href: string; photo?: { src: string; w: number; h: number } | null };

function PickRow({ id, title, more, items, variant }: { id: string; title: string; more?: { label: string; href: string }; items: Tile[]; variant: "cat" | "scene" }) {
  return (
    <section className={`ar-pick ar-pick--${variant} pt-wrap`} aria-labelledby={id} id={`ar-${variant}`}>
      {variant === "scene" ? <PawRun className="ar-paws--scene" count={11} direction="right" /> : null}
      <div className="ar-rowhead io">
        <h2 id={id} className="ar-h2">
          <FillHeading as="span" start={0.96} end={0.6}>
            {title}
          </FillHeading>
        </h2>
        {more ? (
          <Link className="pt-more ar-more" href={more.href}>
            {more.label}
            <IconArrow />
          </Link>
        ) : null}
      </div>
      <ul className="ar-grid5 arl-grid pt-skew" data-skew="0.45" data-io-group style={{ ["--n" as string]: Math.min(items.length, 6) }}>
        {items.map((it) => (
          <li key={it.id} className="pt-popin">
            <Link href={it.href} className="ar-cc ar-lift pt-hov pt-tilt" data-tilt="7">
              <span className={`ar-cc-img pt-zoom ar-sheen ${it.photo ? "" : "arl-nophoto"}`}>
                {it.photo ? <img src={it.photo.src} width={it.photo.w} height={it.photo.h} alt="" loading="lazy" decoding="async" /> : <ArtIcon name="paw" className="arl-nophoto-ic" />}
              </span>
              <span className="ar-cc-lab">
                <span className="ar-cc-ic pt-bounce">
                  <ArtIcon name={it.icon} className="pt-draw" />
                </span>
                <span className="ar-cc-t">{it.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Features({ items }: { items: LiveArticle[] }) {
  const [m, ...small] = items;
  const smalls = small.slice(0, 2);
  return (
    <section className="ar-feat arl-feat pt-wrap" aria-labelledby="ar-h-feat" id="ar-feature">
      <PawRun className="ar-paws--feat" count={12} direction="left" />
      <div className="ar-rowhead io">
        <h2 id="ar-h-feat" className="ar-h2 ar-h2--lg">
          <FillHeading as="span" start={0.96} end={0.6}>
            特集記事
          </FillHeading>
        </h2>
        <Link className="pt-more ar-more" href={L.search}>
          すべてのお店を見る
          <IconArrow />
        </Link>
      </div>
      <div className={`ar-feat-grid arl-feat-grid pt-skew ${smalls.length === 0 ? "arl-feat-grid--1" : ""}`} data-skew="0.4">
        <div className="io ar-fb-wrap" data-io="zoom">
          <Link href={L.shop(m.id)} className="ar-fb arl-fb ar-lift pt-hov pt-live pt-tilt pt-tilt--glare" data-tilt="4">
            <span className="ar-fb-photo pt-zoom pt-shine pt-wipe ar-sheen" data-wipe="right" style={d(200)}>
              <img src={m.photo.src} width={m.photo.w} height={m.photo.h} alt="" decoding="async" />
            </span>
            <span className="ar-fb-txt">
              <span className="ar-fb-label io" data-io="fade" style={d(700)}>
                FEATURE
              </span>
              <h3 className="ar-fb-t io arl-clamp4" style={d(800)}>
                {m.title}
              </h3>
              {m.lede ? (
                <p className="ar-fb-d io arl-clamp4" style={d(950)}>
                  {m.lede}
                </p>
              ) : null}
              {m.date ? (
                <time className="ar-date ar-fb-date io" data-io="fade" style={d(1100)} dateTime={m.date}>
                  {checked(m.date)}
                </time>
              ) : null}
            </span>
            <span className="pt-arrow ar-fb-arrow">
              <IconArrow />
            </span>
            <i className="pt-tilt-glare" aria-hidden="true" />
          </Link>
        </div>
        {smalls.length > 0 ? (
          <ul className={`ar-fs-col arl-fs-col ${smalls.length === 1 ? "arl-fs-col--1" : ""}`} data-io-group>
            {smalls.map((s, i) => (
              <li key={s.id} className="io" data-io="right" style={d(150 + i * 220)}>
                <Link href={L.shop(s.id)} className="ar-fs arl-fs ar-lift pt-hov pt-tilt" data-tilt="5">
                  <span className="ar-fs-img pt-zoom pt-wipe ar-sheen" data-wipe="up" style={d(350 + i * 220)}>
                    <img src={s.photo.src} width={s.photo.w} height={s.photo.h} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="ar-fs-body">
                    <h3 className="ar-fs-t io arl-clamp3" style={d(750 + i * 220)}>
                      {s.title}
                    </h3>
                    {s.date ? (
                      <time className="ar-date ar-fs-date io" data-io="fade" style={d(1000 + i * 220)} dateTime={s.date}>
                        {checked(s.date)}
                      </time>
                    ) : null}
                  </span>
                  <span className="pt-arrow ar-arrow--fill ar-fs-arrow">
                    <IconArrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

const cardOf = (a: LiveArticle): LiveCardData => ({
  id: a.id,
  href: L.shop(a.id),
  tag: a.shop.kindName,
  title: a.title,
  desc: a.lede,
  date: checked(a.date),
  dateIso: a.date ?? "",
  img: { src: a.photo.src, w: a.photo.w, h: a.photo.h },
});

/** 一覧のタブ: すべて + 記事のある種類(2 種類以上あるときだけ種類のタブを足す) */
function tabsOf(articles: LiveArticle[]): LiveTab[] {
  const tabs: LiveTab[] = [{ key: "all", label: "すべて", items: articles.map(cardOf) }];
  const kinds = kindsWithShops(articles.map((a) => a.shop));
  if (kinds.length >= 2) {
    for (const k of kinds) tabs.push({ key: k.slug, label: k.name, items: articles.filter((a) => a.shop.kind === k.slug).map(cardOf) });
  }
  return tabs;
}

function Preparing() {
  return (
    <section className="arl-prep pt-wrap" aria-labelledby="arl-prep-h">
      <h2 id="arl-prep-h" className="arl-prep-h">
        掲載準備中です
      </h2>
      <p className="arl-prep-p">記事の掲載は、まだありません。掲載できる店が確認でき次第、ここに並びます。</p>
      <p className="arl-prep-l">
        <Link href={L.search}>お店を探す</Link>
      </p>
    </section>
  );
}

/** shops を渡すと、その店で組む(確認用。本番のページは渡さない=getPlaces("pet")) */
export default async function PetArticles({ shops: given }: { shops?: LiveShop[] } = {}) {
  const shops = given ?? (await loadPetShops());
  const articles = await loadPetArticles(shops);
  const kinds = kindsWithShops(shops);
  const scenes = scenesWithShops(shops);

  const catTiles: Tile[] = kinds.map((k) => {
    const ui = KIND_IMG[k.slug] ?? KIND_IMG["pet-shop"];
    return { id: k.slug, label: k.name, icon: ui.icon, href: L.searchWith({ kind: k.slug }), photo: { src: ui.src, w: ui.w, h: ui.h } };
  });
  const sceneTiles: Tile[] = scenes.map((s) => ({
    id: s.slug,
    label: s.name,
    icon: SCENE_ICON[s.slug] ?? "paw",
    href: `/pet/scene/${s.slug}`,
    photo: s.shop?.photo ? { src: s.shop.photo.src, w: s.shop.photo.w, h: s.shop.photo.h } : null,
  }));
  const nothing = catTiles.length === 0 && sceneTiles.length === 0 && articles.length === 0;

  return (
    <Shell page="article" mode="live">
      <Hero />
      {nothing ? <Preparing /> : null}
      {catTiles.length > 0 ? <PickRow id="ar-h-cat" title="カテゴリから探す" more={{ label: "すべてのお店を見る", href: L.search }} items={catTiles} variant="cat" /> : null}
      {sceneTiles.length > 0 ? <PickRow id="ar-h-scene" title="シーンから探す" items={sceneTiles} variant="scene" /> : null}
      {articles.length > 0 ? <Features items={articles.slice(0, 3)} /> : null}
      {articles.length > 3 ? <LiveTabs tabs={tabsOf(articles)} /> : null}
    </Shell>
  );
}
