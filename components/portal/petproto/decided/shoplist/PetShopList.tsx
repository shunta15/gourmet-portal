import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import { ArtIcon } from "../article/ArtIcons";
import { Reveal, MaskLines, Write } from "../common/Motion";
import { IconArrow } from "../common/Icons";
import { IMG_ARTICLE, ptLinks } from "../common/site";
import { loadPetShops, type LiveShop } from "../common/live";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "../article/article.css";
import "../article/live/live.css";
import "./shoplist.css";

/* eslint-disable @next/next/no-img-element */

// ペットの店舗紹介の一覧(本番 /pet/shop。メニューの「店舗紹介」の行き先。2026-10-24 オーナー決定)。
// 見出し「店舗紹介」と件数(実数)、掲載中の全店の札。札を押すと、その店の店舗紹介ページ /pet/shop/{id} を開く。
// 作りは、これまでの記事の一覧 /pet/article と同じ(ヒーロー + 札の並び。外枠 Shell page="article"・article.css の札)。新しいデザインは作らない。絞り込み(タブ・検索)は付けない。
// 札: 写真(無い店は肉球の面)・種類・店名・所在地。全店を 1 ページに出す(ペットは 19 店)。ランキングに見えないよう、並びは店 ID の順。

const L = ptLinks("live");

function Card({ s, i }: { s: LiveShop; i: number }) {
  return (
    <li className="io" data-io={i % 4 < 2 ? "left" : "right"}>
      <Link href={L.shop(s.id)} prefetch={false} className="ar-lt-card ar-lift pt-hov pt-tilt" data-tilt="6">
        <span className={`ar-lt-img pt-zoom pt-shine ar-sheen ${s.photo ? "" : "arl-nophoto"}`}>
          {s.photo ? (
            <img src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={s.photo.alt} loading={i < 4 ? "eager" : "lazy"} decoding="async" />
          ) : (
            <ArtIcon name="paw" className="arl-nophoto-ic" />
          )}
        </span>
        <span className="ar-lt-body">
          {s.kindName ? <span className="ar-tagp">{s.kindName}</span> : null}
          <h3 className="ar-lt-t arl-clamp3">{s.name}</h3>
          {s.area ? <p className="ar-lt-d arl-clamp2 psl-area">{s.area}</p> : null}
          <span className="ar-lt-foot">
            <span />
            <span className="pt-arrow ar-lt-arrow">
              <IconArrow />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function PetShopList() {
  const shops = await loadPetShops();
  const v = VERTICALS.pet;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "店舗紹介", url: absUrl(L.shops) },
  ]);
  return (
    <Shell page="article" mode="live">
      <JsonLd data={ld} />
      <section className="ar-hero psl-hero pt-live" aria-label="店舗紹介">
        <div className="ar-hero-bg pt-shine">
          <span className="ar-hero-par" data-par="0.015">
            <img className="pt-kb" src={`${IMG_ARTICLE}/hero.webp`} width={1896} height={488} alt="" fetchPriority="high" decoding="async" />
          </span>
        </div>
        <div className="ar-hero-in">
          <Reveal as="p" variant="fade" className="ar-hero-label">
            SHOP
          </Reveal>
          <MaskLines as="h1" className="ar-hero-h1" lines={["店舗紹介"]} delay={180} step={160} />
          <Write as="p" className="ar-hero-sub" lines={["ペットと行けるお店を、1軒ずつ紹介しています。", "メニューや設備、行き方など、確認できた情報をまとめています。"]} delay={700} step={420} />
        </div>
      </section>

      {shops.length > 0 ? (
        <section className="ar-lt arl-lt psl pt-wrap" aria-labelledby="psl-h">
          <div className="psl-head io">
            <h2 id="psl-h" className="ar-h2">
              掲載中のお店
            </h2>
            <p className="psl-count">
              <b>{shops.length}</b>件
            </p>
          </div>
          <ul className="ar-lt-grid pt-skew" data-skew="0.45" data-io-group>
            {shops.map((s, i) => (
              <Card key={s.id} s={s} i={i} />
            ))}
          </ul>
        </section>
      ) : (
        <section className="arl-prep pt-wrap" aria-labelledby="arl-prep-h">
          <h2 id="arl-prep-h" className="arl-prep-h">
            掲載準備中です
          </h2>
          <p className="arl-prep-p">お店の掲載は、まだありません。掲載できる店が確認でき次第、ここに並びます。</p>
          <p className="arl-prep-l">
            <Link href={L.search}>お店を探す</Link>
          </p>
        </section>
      )}
    </Shell>
  );
}

/** metadata。title は「店舗紹介 | サイト名」、canonical は自分自身。robots は他の一覧と同じ gate(掲載が 3 件未満なら noindex) */
export async function petShopListMetadata(): Promise<Metadata> {
  const v = VERTICALS.pet;
  const count = await countPlaces("pet");
  return buildMetadata({
    vertical: "pet",
    title: `店舗紹介 | ${v.brand}`,
    description: `ペットと行けるお店${count > 0 ? `${count}店` : ""}の紹介の一覧です。カフェ・飲食店、トリミング、ペットホテル、動物病院、ペットショップ・ブリーダー。メニューや設備、行き方など、確認できた情報をまとめています。`,
    path: L.shops,
    count,
  });
}
