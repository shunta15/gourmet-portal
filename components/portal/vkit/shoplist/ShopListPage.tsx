import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import { IconArrow } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { vkImg, vkLinks, type VkConfig } from "../config";
import { loadShops, sortShops, type LiveShop } from "../common/live";
import { Card, Pager } from "../articlelist/ArticleListPage";
import { PAGE_SIZE } from "../articlelist/data";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "../articlelist/articlelist.css";

/* eslint-disable @next/next/no-img-element */

/**
 * 店舗紹介の一覧(本番 /sports/shop・/life/shop。メニューの「店舗紹介」の行き先。オーナー決定 2026-10-23)。
 * 作り: 記事の一覧(articlelist/ArticleListPage.tsx)の部品と CSS をそのまま使う(ヒーロー → 01 02 … の札の一覧。写真は左右交互。札を押すと、その店の店舗紹介ページ /{業種}/shop/{id})。
 * 新しいデザインは作らない。違うのは: 見出し「店舗紹介」と件数(掲載している全店の実数。写真が無い店も出す)だけを出し、絞り込み・検索の箱・並べ替えは付けない。
 * 店が増えたら、探す・記事の一覧と同じ作法でページを分ける(PAGE_SIZE ずつ。?page=2 以降は noindex。正本は引数なしの /{業種}/shop)。
 * 料金・評価・おすすめ・人気は出さない。「01 02 …」は表示している順の連番(順位ではない。並びはエリア順)。
 */

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const pageOf = (sp: SP) => Math.min(Math.max(parseInt(one(sp.page)) || 1, 1), 500);

function hrefOfPage(cfg: VkConfig, n: number): string {
  const base = vkLinks(cfg).shops;
  return n > 1 ? `${base}?page=${n}#val-results` : `${base}#val-results`;
}

function Hero({ cfg }: { cfg: VkConfig }) {
  const L = vkLinks(cfg);
  const c = cfg.list;
  return (
    <section className="val-hero val-hero--plain" aria-label="店舗紹介">
      <div className="val-hero-clip vk-live" aria-hidden="true">
        {/* 飾りの写真(店の一覧の飾りと同じ。Wikimedia Commons の CC0・パブリックドメイン。店そのものではない。出典は configs/credits.json) */}
        <img className={`val-hero-img vk-kb${c.heroFlip ? " val-hero-img--flip" : ""}`} src={`${vkImg(cfg).list}/hero.webp`} width={2400} height={880} alt="" fetchPriority="high" decoding="async" style={{ objectPosition: `50% ${c.heroFocus}%` }} />
        <span className="val-hero-wash" />
      </div>
      <div className="val-hero-in">
        <Crumbs items={[{ label: "ホーム", href: L.home }, { label: "店舗紹介" }]} className="val-crumbs" />
        <h1 className="val-h1">
          <MaskLines lines={["店舗紹介", c.h1[1]]} step={170} delay={100} />
        </h1>
        <Reveal as="p" variant="fade" className="val-sub" delay={600}>
          {c.sub}
        </Reveal>
      </div>
      <Reveal as="p" variant="fade" className="val-hero-note" delay={800}>
        {`掲載している${cfg.noun}を、`}
        <br />
        すべて並べています。
      </Reveal>
    </section>
  );
}

function Empty({ cfg }: { cfg: VkConfig }) {
  const L = vkLinks(cfg);
  const c = cfg.list;
  return (
    <div className="val-empty">
      <p className="val-empty-t">{c.emptyNone[0]}</p>
      <p className="val-empty-d">{c.emptyNone[1]}</p>
      <Link href={L.search} className="vk-more">
        <span>{cfg.noun}を探す</span>
        <IconArrow />
      </Link>
    </div>
  );
}

/** 店舗紹介の一覧の中身(サーバー)。shops は loadShops の全部(店 ID の順。ここでエリア順に並べる) */
export function ShopListView({ cfg, shops: all, sp }: { cfg: VkConfig; shops: LiveShop[]; sp: SP }) {
  const L = vkLinks(cfg);
  const v = VERTICALS[cfg.key];
  const list = sortShops(all, "area");
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(pageOf(sp), pages);
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "店舗紹介", url: absUrl(L.shops) },
  ]);
  return (
    <Shell cfg={cfg} page="search">
      <JsonLd data={ld} />
      <div className="val">
        <Hero cfg={cfg} />
        <div className="val-body" data-side="0">
          <div className="val-main">
            {list.length > 0 ? (
              <div className="val-rh" id="val-results">
                <h2 className="val-rh-t">
                  <span className="val-rh-l">店舗紹介</span>
                  <span className="val-rh-n">{list.length}</span>
                  <span className="val-rh-u">件</span>
                </h2>
              </div>
            ) : null}
            {shown.length > 0 ? (
              <div className="val-rows" data-io-group>
                {shown.map((s, i) => (
                  <Card key={s.id} cfg={cfg} s={s} n={(cur - 1) * PAGE_SIZE + i + 1} i={i} href={L.shop(s.id)} />
                ))}
              </div>
            ) : (
              <Empty cfg={cfg} />
            )}
            <Pager page={cur} pages={pages} hrefOf={(n) => hrefOfPage(cfg, n)} />
            {shown.length > 0 ? <p className="val-note">{cfg.shop.note}</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}

type Props = { searchParams: Promise<SP> };

/** app/{業種}/shop/page.tsx が使う。generateMetadata と Page(中身)を返す。外枠(VkFrame・公開スイッチ)は page.tsx が持つ */
export function vkShopListPage(cfg: VkConfig) {
  async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const sp = await searchParams;
    const v = VERTICALS[cfg.key];
    // 2 ページ目以降の URL は noindex(件数 0 を渡す)で、正本は引数なしの /{業種}/shop。robots は他の一覧と同じ gate(掲載が 3 件未満なら noindex)
    const first = pageOf(sp) === 1;
    return buildMetadata({
      vertical: cfg.key,
      title: `店舗紹介 | ${v.brand}`,
      description: `${v.brand}に掲載している${cfg.noun}の一覧です。${cfg.noun}を選ぶと、所在地・営業時間・アクセスをまとめた店舗紹介のページが開きます。`,
      path: vkLinks(cfg).shops,
      count: first ? await countPlaces(cfg.key) : 0,
    });
  }

  async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const shops = await loadShops(cfg);
    return <ShopListView cfg={cfg} shops={shops} sp={sp} />;
  }

  return { generateMetadata, Page };
}
