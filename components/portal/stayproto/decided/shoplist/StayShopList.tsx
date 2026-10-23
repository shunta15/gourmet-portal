import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import KindName from "../common/KindName";
import { IconArrow, IconPin, StayTypeIcon } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { IMG, syLinks } from "../common/site";
import { countPlaces } from "@/lib/places";
import type { LiveShop } from "../common/live";
import { IconNoPhoto, TagIcon } from "./ListIcons";
import { cardCopyOf } from "./copy";
import { KIND_EN, loadShopListShops } from "./data";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./shoplist.css";

/* eslint-disable @next/next/no-img-element */

/**
 * ステイの店舗紹介の一覧(本番 /stay/shop。メニューの「店舗紹介」の行き先。2026-10-24 オーナー決定)。
 * 見出し「店舗紹介」と件数(実数)、掲載中の全宿の札。札を押すと、その宿の店舗紹介ページ /stay/shop/{id} を開く。
 * 作りは、これまでの宿の記事の一覧 /stay/article(見本「3_探す」と同じ組み立て)の、ヒーロー + 01 02 … の写真交互の札をそのまま使い、
 * 検索の箱・左の絞り込み・並べ替えは付けない(絞り込みは無し)。全宿を 1 ページに出す(ステイは 8 軒)。CSS は shoplist.css(接頭辞 sal-。記事の一覧のときの名前のまま)。
 * 札の文言は copy.ts(宿ごとの事実の短い文。記事の事実だけ)。
 */

function Hero() {
  const L = syLinks("live");
  return (
    <section className="sal-hero sal-hero--list" aria-label="店舗紹介">
      <div className="sal-hero-clip sy-live" aria-hidden="true">
        {/* 飾りの写真(伊豆・白浜海岸の海と山。Wikimedia Commons の CC0。宿そのものではない。出典は common/credits.json)。ゆっくり寄り続ける */}
        <img className="sal-hero-img sy-kb" src={`${IMG}/articlelist/hero.webp`} width={2400} height={880} alt="" fetchPriority="high" decoding="async" />
        <span className="sal-hero-wash" />
      </div>
      <div className="sal-hero-in">
        <Crumbs items={[{ label: "ホーム", href: L.home }, { label: "店舗紹介" }]} className="sal-crumbs" />
        <h1 className="sal-h1">
          <MaskLines lines={["店舗紹介"]} step={170} delay={100} />
        </h1>
        <Reveal as="p" variant="fade" className="sal-sub" delay={600}>
          実在の宿を、一軒ずつ紹介します。
        </Reveal>
      </div>
      <Reveal as="p" variant="fade" className="sal-hero-note" delay={800}>
        宿ごとに、確認できた
        <br />
        情報をまとめています。
      </Reveal>
    </section>
  );
}

/** 一覧の 1 行 = 1 軒(01 02 … の連番・種類の英字・2 行の見出し・文・小さな札・「詳細を見る」。写真は左右交互。リンク先は宿の店舗紹介) */
function Card({ s, n, i }: { s: LiveShop; n: number; i: number }) {
  const L = syLinks("live");
  const c = cardCopyOf(s);
  const ph = s.photo;
  return (
    <article className={`sal-row sy-hov io ${i % 2 === 1 ? "is-flip" : ""}`} data-io={i % 2 === 1 ? "left" : "right"} data-v={i % 5}>
      <div className="sal-txt">
        <p className="sal-head">
          <span className="sy-num sal-n">{String(n).padStart(2, "0")}</span>
          {KIND_EN[s.kind] ? <span className="sy-kind sal-kind">{KIND_EN[s.kind]}</span> : null}
        </p>
        <h3 className="sal-name">
          <Link href={L.shop(s.id)} prefetch={false}>
            <span className="sal-l1">{c.l1}</span>
            <span className="sal-l2">{c.l2}</span>
          </Link>
        </h3>
        {c.text ? <p className="sal-desc">{c.text}</p> : null}
        {c.feats.length > 0 ? (
          <ul className="sal-tags">
            {c.feats.map((t) => (
              <li key={t.key} className="sy-tag">
                {t.kind === "pin" ? <IconPin /> : t.kind === "type" ? <StayTypeIcon slug={s.kind} /> : <TagIcon label={t.label} />}
                <span>{t.kind === "type" ? <KindName name={t.label} /> : t.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="sy-more sal-more">
          <span>詳細を見る</span>
          <IconArrow />
        </span>
      </div>
      <div className={`sal-ph sy-zoom ${ph ? "" : "sal-ph--none"}`}>
        {ph ? (
          <img src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} style={{ objectPosition: `50% ${c.focusY}%` }} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="sal-nophoto">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        )}
      </div>
    </article>
  );
}

function Empty() {
  const L = syLinks("live");
  return (
    <div className="sal-empty">
      <p className="sal-empty-t">宿の掲載は、いま準備をしています。</p>
      <p className="sal-empty-d">確認できた宿から、順に載せていきます。</p>
      <Link href={L.search} className="sy-more">
        <span>宿を探す</span>
        <IconArrow />
      </Link>
    </div>
  );
}

/** 店舗紹介の一覧の中身(サーバー)。shops を渡すと、その宿で組む(確認用。本番のページは渡さない = 全宿) */
export async function StayShopList({ shops: given }: { shops?: LiveShop[] } = {}) {
  const L = syLinks("live");
  const v = VERTICALS.stay;
  const shops = given ?? (await loadShopListShops());
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "店舗紹介", url: absUrl(L.shops) },
  ]);
  return (
    <Shell page="search" mode="live">
      <JsonLd data={ld} />
      <div className="sal">
        <Hero />
        <div className="sal-body" data-side="0">
          <div className="sal-main">
            {shops.length > 0 ? (
              <div className="sal-rh" id="sal-results">
                <h2 className="sal-rh-t">
                  <span className="sal-rh-l">店舗紹介</span>
                  <span className="sal-rh-n">{shops.length}</span>
                  <span className="sal-rh-u">件</span>
                </h2>
              </div>
            ) : null}
            {shops.length > 0 ? (
              <div className="sal-rows" data-io-group>
                {shops.map((s, i) => (
                  <Card key={s.id} s={s} n={i + 1} i={i} />
                ))}
              </div>
            ) : (
              <Empty />
            )}
            {shops.length > 0 ? <p className="sal-note">宿の情報は変わることがあります。最新の情報は、各宿の公式サイトでご確認ください。</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/** metadata。title は「店舗紹介｜サイト名」、canonical は自分自身。robots は他の一覧と同じ gate(掲載が 3 件未満なら noindex) */
export async function stayShopListMetadata(): Promise<Metadata> {
  const v = VERTICALS.stay;
  const count = await countPlaces("stay");
  return buildMetadata({
    vertical: "stay",
    title: `店舗紹介｜${v.brand}`,
    description: `実在の宿${count > 0 ? `${count}軒` : ""}の紹介の一覧です。所在地やチェックイン・チェックアウトなど、確認できた情報をまとめています。`,
    path: syLinks("live").shops,
    count,
  });
}
