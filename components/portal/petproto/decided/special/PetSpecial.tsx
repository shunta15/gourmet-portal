import Link from "next/link";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import { IconArrow } from "../common/Icons";
import { ptLinks } from "../common/site";
import { loadPetShops, type LiveShop } from "../common/live";
import { PET_SPECIALS, dotDate, paragraphsOf, petSpecialBySlug, type PetSpecial } from "./data";
import { breadcrumb, article as articleLd } from "@/lib/seo/jsonld";
import { ogImage } from "@/lib/seo/og";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./special.css";

// ペットの特集(本番 /pet/special・/pet/special/{slug}。メニューの「特集」の行き先。2026-10-24 オーナー決定)。
// 利用シーン記事 + 業種の特集記事の 3 本(lib/specials/pet.json)。店 1 軒の記事は並べない(店は店舗紹介 /pet/shop にいる)。
// 作りはボディケアの特集(/bodycare/special。一覧 + 目次つきの記事 + あわせて読む + 戻る導線)を手本に、ペットの部品(Shell page="article"・茶・明朝)で組む。
// 節の storeIds の店は、その店の店舗紹介ページ(/pet/shop/{id})へのリンクを付ける。写真は使わない(実在の店の写真を記事の飾りにしない)。

const L = ptLinks("live");

function Crumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="psp-crumb" aria-label="パンくず">
      {items.map((c, i) => (
        <span key={c.label} className="psp-crumb-i">
          {i > 0 ? <i aria-hidden="true">&gt;</i> : null}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function SpecialCard({ s, n }: { s: PetSpecial; n: number }) {
  return (
    <li className="io">
      <Link href={L.special(s.slug)} prefetch={false} className="psp-card pt-lift pt-hov">
        <span className="psp-card-n" aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        <span className="psp-card-b">
          <span className="psp-card-k">特集記事</span>
          <h2 className="psp-card-t">{s.title}</h2>
          <span className="psp-card-d">{s.lead}</span>
          <span className="psp-card-go">
            記事を読む
            <span className="pt-arrow psp-card-ar" aria-hidden="true">
              <IconArrow />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

/** 特集の一覧(/pet/special) */
export function PetSpecialIndex() {
  const v = VERTICALS.pet;
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "特集記事", url: absUrl(L.specials) },
  ]);
  return (
    <Shell page="article" mode="live">
      <JsonLd data={ld} />
      <div className="psp">
        <header className="psp-hero">
          <div className="psp-in">
            <Crumbs items={[{ label: "マチノワペット", href: L.home }, { label: "特集記事" }]} />
            <p className="psp-label">SPECIAL</p>
            <h1 className="psp-h1">ペットの特集記事</h1>
            <p className="psp-lead">ペットと行けるお店を探すときに読む記事です。書いてあるのは、マチノワペットに載っているお店のデータと、お店の案内で確かめられた事実だけです。</p>
          </div>
        </header>
        <section className="psp-in psp-list" aria-label="特集記事の一覧">
          <ul data-io-group>
            {PET_SPECIALS.map((s, i) => (
              <SpecialCard key={s.slug} s={s} n={i + 1} />
            ))}
          </ul>
        </section>
        <div className="psp-in">
          <Back />
        </div>
      </div>
    </Shell>
  );
}

function Back() {
  return (
    <p className="psp-back io">
      <span className="psp-back-l">ほかのページへ</span>
      <Link href={L.shops} className="psp-btn pt-press">
        店舗紹介を見る
        <IconArrow />
      </Link>
      <Link href={L.search} className="psp-btn psp-btn--line pt-press">
        お店を探す
        <IconArrow />
      </Link>
    </p>
  );
}

function StoreLinks({ ids, shops }: { ids: string[]; shops: Map<string, LiveShop> }) {
  const list = ids.map((id) => shops.get(id)).filter((s): s is LiveShop => !!s);
  if (list.length === 0) return null;
  return (
    <div className="psp-stores">
      <p className="psp-stores-h">この節に出てくる店(店舗紹介へ)</p>
      <ul>
        {list.map((s) => (
          <li key={s.id}>
            <Link href={L.shop(s.id)} prefetch={false} className="psp-store pt-hov">
              <span className="psp-store-n">{s.name}</span>
              {s.kindName ? <span className="psp-store-k">{s.kindName}</span> : null}
              <IconArrow />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 特集の記事 1 本(/pet/special/{slug})。無い slug は呼ぶ側が 404 にする */
export async function PetSpecialArticle({ slug }: { slug: string }) {
  const s = petSpecialBySlug(slug);
  if (!s) return null;
  const shops = new Map((await loadPetShops()).map((x) => [x.id, x]));
  const v = VERTICALS.pet;
  const path = L.special(s.slug);
  const others = PET_SPECIALS.filter((x) => x.slug !== s.slug);
  const ids = (n: number) => `psp-s${n + 1}`;
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
      <article className="psp">
        <header className="psp-hero">
          <div className="psp-in">
            <Crumbs items={[{ label: "マチノワペット", href: L.home }, { label: "特集記事", href: L.specials }, { label: s.title }]} />
            <p className="psp-label">SPECIAL</p>
            <h1 className="psp-h1">{s.title}</h1>
            <p className="psp-meta">
              <time dateTime={s.date}>{dotDate(s.date)}</time>
              <span>マチノワ編集部</span>
            </p>
            <p className="psp-lead">{s.lead}</p>
          </div>
        </header>

        <div className="psp-in psp-body">
          <nav className="psp-toc io" aria-label="この記事の内容">
            <h2 className="psp-toc-h">この記事の内容</h2>
            <ol>
              {s.sections.map((sec, i) => (
                <li key={sec.heading}>
                  <a href={`#${ids(i)}`} className="pt-hov">
                    <span className="psp-no">{String(i + 1).padStart(2, "0")}</span>
                    <span className="psp-toc-t">{sec.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {s.sections.map((sec, i) => (
            <section key={sec.heading} id={ids(i)} className="psp-sec io" aria-labelledby={`${ids(i)}-h`}>
              <h2 id={`${ids(i)}-h`} className="psp-h2">
                <span className="psp-no">{String(i + 1).padStart(2, "0")}</span>
                <span>{sec.heading}</span>
              </h2>
              {paragraphsOf(sec.text).map((p, k) => (
                <p key={k} className="psp-p">
                  {p}
                </p>
              ))}
              <StoreLinks ids={sec.storeIds} shops={shops} />
            </section>
          ))}

          {s.closing ? <p className="psp-closing io">{s.closing}</p> : null}
        </div>

        {others.length > 0 ? (
          <section className="psp-in psp-rel" aria-labelledby="psp-rel-h">
            <h2 id="psp-rel-h" className="psp-rel-h io">
              あわせて読む
            </h2>
            <ul data-io-group>
              {others.map((o) => (
                <SpecialCard key={o.slug} s={o} n={PET_SPECIALS.findIndex((x) => x.slug === o.slug) + 1} />
              ))}
            </ul>
          </section>
        ) : null}
        <div className="psp-in">
          <Back />
        </div>
      </article>
    </Shell>
  );
}
