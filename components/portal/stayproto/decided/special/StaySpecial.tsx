import Link from "next/link";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import { IconArrow } from "../common/Icons";
import { syLinks } from "../common/site";
import { loadStayShops, type LiveShop } from "../common/live";
import { STAY_SPECIALS, dotDate, paragraphsOf, staySpecialBySlug, type StaySpecial } from "./data";
import { breadcrumb, article as articleLd } from "@/lib/seo/jsonld";
import { ogImage } from "@/lib/seo/og";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./special.css";

// ステイの特集(本番 /stay/special・/stay/special/{slug}。メニューの「特集」の行き先。2026-10-24 オーナー決定)。
// 利用シーン記事 + 業種の特集記事の 3 本(lib/specials/stay.json)。店 1 軒の記事は並べない(宿は店舗紹介 /stay/shop にいる)。
// 作りはボディケアの特集(/bodycare/special。一覧 + 目次つきの記事 + あわせて読む + 戻る導線)を手本に、ステイの部品(Shell page="article"・金茶・明朝・sy-lab/sy-num)で組む。
// 節の storeIds の宿は、その宿の店舗紹介ページ(/stay/shop/{id})へのリンクを付ける。写真は使わない(実在の宿の写真を記事の飾りにしない)。

const L = syLinks("live");

function SpecialCard({ s, n }: { s: StaySpecial; n: number }) {
  return (
    <li className="io">
      <Link href={L.special(s.slug)} prefetch={false} className="ssp-card sy-hov">
        <span className="ssp-card-n sy-num" aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        <span className="ssp-card-b">
          <span className="sy-lab ssp-card-k">Special</span>
          <h2 className="ssp-card-t">{s.title}</h2>
          <span className="ssp-card-d">{s.lead}</span>
          <span className="sy-more ssp-card-go">
            <span>記事を読む</span>
            <IconArrow />
          </span>
        </span>
      </Link>
    </li>
  );
}

function Back() {
  return (
    <p className="ssp-back io">
      <span className="ssp-back-l">ほかのページへ</span>
      <Link href={L.shops} className="sy-btn sy-btn--pill ssp-btn">
        店舗紹介を見る
        <IconArrow />
      </Link>
      <Link href={L.search} className="sy-btn sy-btn--pill sy-btn--line ssp-btn">
        宿を探す
        <IconArrow />
      </Link>
    </p>
  );
}

/** 特集の一覧(/stay/special) */
export function StaySpecialIndex() {
  const v = VERTICALS.stay;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "特集記事", url: absUrl(L.specials) },
  ]);
  return (
    <Shell page="article" mode="live">
      <JsonLd data={ld} />
      <div className="ssp">
        <header className="ssp-hero">
          <div className="ssp-in">
            <Crumbs items={[{ label: "トップ", href: L.home }, { label: "特集記事" }]} />
            <p className="sy-lab ssp-label">Special</p>
            <h1 className="ssp-h1">ステイの特集記事</h1>
            <p className="ssp-lead">宿を選ぶときに読む記事です。マチノワステイに載っている宿を例に、種類のちがいや見るところをまとめています。</p>
          </div>
        </header>
        <section className="ssp-in ssp-list" aria-label="特集記事の一覧">
          <ul data-io-group>
            {STAY_SPECIALS.map((s, i) => (
              <SpecialCard key={s.slug} s={s} n={i + 1} />
            ))}
          </ul>
        </section>
        <div className="ssp-in">
          <Back />
        </div>
      </div>
    </Shell>
  );
}

function StoreLinks({ ids, shops }: { ids: string[]; shops: Map<string, LiveShop> }) {
  const list = ids.map((id) => shops.get(id)).filter((s): s is LiveShop => !!s);
  if (list.length === 0) return null;
  return (
    <div className="ssp-stores">
      <p className="ssp-stores-h">この節に出てくる宿(店舗紹介へ)</p>
      <ul>
        {list.map((s) => (
          <li key={s.id}>
            <Link href={L.shop(s.id)} prefetch={false} className="ssp-store sy-hov">
              <span className="ssp-store-n">{s.name}</span>
              {s.kindName ? <span className="ssp-store-k">{s.kindName}</span> : null}
              <IconArrow />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 特集の記事 1 本(/stay/special/{slug})。無い slug は呼ぶ側が 404 にする */
export async function StaySpecialArticle({ slug }: { slug: string }) {
  const s = staySpecialBySlug(slug);
  if (!s) return null;
  const shops = new Map((await loadStayShops()).map((x) => [x.id, x]));
  const v = VERTICALS.stay;
  const path = L.special(s.slug);
  const others = STAY_SPECIALS.filter((x) => x.slug !== s.slug);
  const sid = (n: number) => `ssp-s${n + 1}`;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "特集記事", url: absUrl(L.specials) },
    { name: s.title, url: absUrl(path) },
  ]);
  const ad = articleLd({
    headline: s.title,
    description: s.lead,
    image: absUrl(ogImage(path, s.title).url),
    url: absUrl(path),
    dateModified: s.date,
  });
  return (
    <Shell page="article" mode="live">
      <JsonLd data={ld} />
      <JsonLd data={ad} />
      <article className="ssp">
        <header className="ssp-hero">
          <div className="ssp-in">
            <Crumbs items={[{ label: "トップ", href: L.home }, { label: "特集記事", href: L.specials }, { label: s.title }]} />
            <p className="sy-lab ssp-label">Special</p>
            <h1 className="ssp-h1">{s.title}</h1>
            <p className="ssp-meta">
              <time dateTime={s.date}>{dotDate(s.date)}</time>
              <span>マチノワ編集部</span>
            </p>
            <p className="ssp-lead">{s.lead}</p>
          </div>
        </header>

        <div className="ssp-in ssp-body">
          <nav className="ssp-toc io" aria-label="この記事の内容">
            <h2 className="ssp-toc-h">この記事の内容</h2>
            <ol>
              {s.sections.map((sec, i) => (
                <li key={sec.heading}>
                  <a href={`#${sid(i)}`} className="sy-hov">
                    <span className="sy-num ssp-no">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ssp-toc-t">{sec.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {s.sections.map((sec, i) => (
            <section key={sec.heading} id={sid(i)} className="ssp-sec io" aria-labelledby={`${sid(i)}-h`}>
              <h2 id={`${sid(i)}-h`} className="ssp-h2">
                <span className="sy-num ssp-no">{String(i + 1).padStart(2, "0")}</span>
                <span>{sec.heading}</span>
              </h2>
              {paragraphsOf(sec.text).map((p, k) => (
                <p key={k} className="ssp-p">
                  {p}
                </p>
              ))}
              <StoreLinks ids={sec.storeIds} shops={shops} />
            </section>
          ))}

          {s.closing ? <p className="ssp-closing io">{s.closing}</p> : null}
        </div>

        {others.length > 0 ? (
          <section className="ssp-in ssp-rel" aria-labelledby="ssp-rel-h">
            <h2 id="ssp-rel-h" className="ssp-rel-h io">
              あわせて読む
            </h2>
            <ul data-io-group>
              {others.map((o) => (
                <SpecialCard key={o.slug} s={o} n={STAY_SPECIALS.findIndex((x) => x.slug === o.slug) + 1} />
              ))}
            </ul>
          </section>
        ) : null}
        <div className="ssp-in">
          <Back />
        </div>
      </article>
    </Shell>
  );
}
