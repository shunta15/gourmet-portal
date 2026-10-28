import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import { notFoundMetadata } from "@/components/portal/pages/data";
import Shell from "../../common/Shell";
import { IconArrow } from "../../common/Icons";
import { ptLinks } from "../../common/site";
import TrackedA from "../../shop/live/LiveTrack";
import { articleHref, loadPetArticleItems, loadPetShopDetail, petArticleTitle, petHasArticle, japaneseDate, type ShopDetail } from "../../shop/live/liveShopData";
import { sized } from "@/lib/imageUrl";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { buildMetadata } from "@/lib/seo/meta";
import { getVertical } from "@/lib/verticals";
import "../../special/special.css";
import "./art-live.css";

/**
 * 店の特集記事(本番 /pet/article/{店の ID})。【2026-10-28】ペットの特集の記事(/pet/special/{slug}。special/PetSpecial.tsx)と同じ作り・同じ CSS(psp-)で組む。
 * 組み: 見出しの帯(クリーム色・パンくず・小さな英字・明朝の題) → この記事の内容(目次) → 番号つきの節(茶の下線) → おわりの文 → この記事のお店(店舗詳細・公式サイト・情報の出どころ) → あわせて読む → 戻る導線。
 * 文は店のデータの紹介記事・特集記事(liveShopData.ts の点検済みの文)だけ。足さない・言い換えない。写真も店の実際の写真だけ(店のデータの順に、記事の頭と各節に置く)。
 * 店のページ(/pet/shop/{id})へは、パンくず・「店舗詳細を見る」で戻れる。
 */

const L = ptLinks("live");

function Crumbs({ d }: { d: ShopDetail }) {
  const items: Array<{ label: string; href?: string }> = [
    { label: "マチノワペット", href: L.home },
    { label: "店舗紹介", href: L.shops },
    { label: d.shop.name, href: L.shop(d.place.id) },
    { label: d.story ? "特集記事" : "紹介記事" },
  ];
  return (
    <nav className="psp-crumb" aria-label="パンくず">
      {items.map((c, i) => (
        <span key={c.label} className="psp-crumb-i">
          {i > 0 ? <i aria-hidden="true">&gt;</i> : null}
          {c.href ? (
            <Link href={c.href} prefetch={false}>
              {c.label}
            </Link>
          ) : (
            <span aria-current="page">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

type Block = { heading: string; sub: string; body: string[]; specs: { k: string; v: string }[] };

function blocksOf(d: ShopDetail): Block[] {
  const st = d.story;
  return st ? st.points.map((p) => ({ heading: p.name, sub: p.purpose, body: p.body, specs: p.specs })) : d.sections.map((s) => ({ heading: s.heading, sub: "", body: s.body, specs: [] }));
}

function Fig({ ph, eager, sz = 900 }: { ph: ShopDetail["photos"][number]; eager?: boolean; sz?: number }) {
  return (
    <figure className="pta-fig">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sized(ph.src, sz)} width={ph.w ?? 1200} height={ph.h ?? 800} alt={ph.alt} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchPriority: "high" as const } : {})} />
    </figure>
  );
}

const ctaLabel = (kind: string) => (kind === "reserve" ? "予約ページを開く" : kind === "website" ? "公式サイトを見る" : kind === "instagram" ? "Instagramを見る" : kind === "phone" ? "電話する" : "地図を開く");

function ShopBox({ d }: { d: ShopDetail }) {
  // 公式サイトと予約ページだけ(電話・地図は店のページにある)。予約も公式サイトも無い店は、Instagram(店ページの主なボタンと同じ)
  const links = d.cta.filter((l) => l.kind === "website" || l.kind === "reserve" || l.kind === "instagram");
  return (
    <section className="psp-sec pta-shop io" aria-labelledby="pta-shop-h">
      <h2 id="pta-shop-h" className="psp-h2">
        <span>この記事のお店</span>
      </h2>
      <div className="pta-shop-box">
        <p className="pta-shop-n">{d.shop.name}</p>
        <p className="pta-shop-a">
          {d.shop.kindName ? <span className="psp-store-k">{d.shop.kindName}</span> : null}
          {d.address}
        </p>
        <div className="pta-shop-btns">
          <Link href={L.shop(d.place.id)} prefetch={false} className="psp-btn pt-press">
            店舗詳細を見る
            <IconArrow />
          </Link>
          {links.map((l) => (
            <TrackedA key={l.kind} href={l.href} kind={l.kind} storeId={d.place.id} page={d.path} external={l.external} className="psp-btn psp-btn--line pt-press">
              {ctaLabel(l.kind)}
              <IconArrow />
            </TrackedA>
          ))}
        </div>
        {d.sources.length > 0 ? (
          <div className="pta-src">
            <p className="psp-stores-h">情報の出どころ</p>
            <ul>
              {d.sources.map((src) => (
                <li key={src.url}>
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    {src.label}
                    <span className="pta-sr">（別のタブで開きます）</span>
                  </a>
                </li>
              ))}
            </ul>
            {d.checkedAt ? <p className="pta-src-d">確認日 {japaneseDate(d.checkedAt)}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

async function Related({ d }: { d: ShopDetail }) {
  const all = (await loadPetArticleItems()).filter((x) => x.shop.id !== d.place.id);
  const items = [...all].sort((a, b) => Number(b.shop.kind === d.shop.kind) * 2 + Number(b.shop.pref === d.shop.pref) - (Number(a.shop.kind === d.shop.kind) * 2 + Number(a.shop.pref === d.shop.pref))).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <section className="psp-in psp-rel" aria-labelledby="psp-rel-h">
      <h2 id="psp-rel-h" className="psp-rel-h io">
        あわせて読む
      </h2>
      <ul data-io-group>
        {items.map((r, i) => (
          <li key={r.shop.id} className="io">
            <Link href={articleHref(r.shop.id)} prefetch={false} className="psp-card pt-lift pt-hov">
              <span className="psp-card-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="psp-card-b">
                <span className="psp-card-k">店の特集記事</span>
                <h3 className="psp-card-t">{r.title}</h3>
                <span className="psp-card-d">
                  {r.shop.name}
                  {r.shop.place ? `　${r.shop.place}` : ""}
                </span>
                <span className="psp-card-go">
                  記事を読む
                  <span className="pt-arrow psp-card-ar" aria-hidden="true">
                    <IconArrow />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Back({ d }: { d: ShopDetail }) {
  return (
    <p className="psp-back io">
      <span className="psp-back-l">ほかのページへ</span>
      <Link href={L.shop(d.place.id)} prefetch={false} className="psp-btn pt-press">
        店舗詳細を見る
        <IconArrow />
      </Link>
      <Link href={L.shops} className="psp-btn psp-btn--line pt-press">
        店舗紹介を見る
        <IconArrow />
      </Link>
      <Link href={L.specials} className="psp-btn psp-btn--line pt-press">
        特集記事を見る
        <IconArrow />
      </Link>
    </p>
  );
}

function ArticleBody({ d, rel }: { d: ShopDetail; rel: React.ReactNode }) {
  const st = d.story;
  const blocks = blocksOf(d);
  const lede = st ? st.lede : d.about;
  const title = petArticleTitle(d);
  const ids = (n: number) => `pta-s${n + 1}`;
  const [first, ...rest] = d.photos;
  return (
    <article className="psp pta">
      <header className="psp-hero">
        <div className="psp-in">
          <Crumbs d={d} />
          <p className="psp-label">{st ? "FEATURE" : "ARTICLE"}</p>
          <h1 className="psp-h1">{title}</h1>
          <p className="psp-meta">
            <span>{d.shop.name}</span>
            <span>
              {d.shop.kindName}
              {d.shop.place ? `　${d.shop.place}` : ""}
            </span>
          </p>
          {st?.subtitle ? <p className="psp-lead">{st.subtitle}</p> : null}
        </div>
      </header>

      <div className="psp-in psp-body">
        {first ? <Fig ph={first} eager sz={1024} /> : null}
        {lede.length > 0 ? (
          <div className="pta-lede io">
            {lede.map((t, i) => (
              <p key={i} className="psp-p">
                {t}
              </p>
            ))}
          </div>
        ) : null}

        <nav className="psp-toc io" aria-label="この記事の内容">
          <h2 className="psp-toc-h">この記事の内容</h2>
          <ol>
            {blocks.map((b, i) => (
              <li key={ids(i)}>
                <a href={`#${ids(i)}`} className="pt-hov">
                  <span className="psp-no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="psp-toc-t">{b.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {blocks.map((b, i) => {
          const ph = rest[i];
          return (
            <section key={ids(i)} id={ids(i)} className="psp-sec io" aria-labelledby={`${ids(i)}-h`}>
              <h2 id={`${ids(i)}-h`} className="psp-h2">
                <span className="psp-no">{String(i + 1).padStart(2, "0")}</span>
                <span>{b.heading}</span>
              </h2>
              {b.sub ? <p className="pta-sub">{b.sub}</p> : null}
              {b.body.map((t, j) => (
                <p key={j} className="psp-p">
                  {t}
                </p>
              ))}
              {b.specs.length > 0 ? (
                <dl className="pta-specs">
                  {b.specs.map((x) => (
                    <div key={x.k}>
                      <dt>{x.k}</dt>
                      <dd>{x.v}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {ph ? <Fig ph={ph} /> : null}
            </section>
          );
        })}

        {st?.quote ? (
          <blockquote className="psp-closing io">
            {st.quote}
            {st.quoteCite ? <cite className="pta-cite">{st.quoteCite}</cite> : null}
          </blockquote>
        ) : null}
        {st && st.closing.length > 0
          ? st.closing.map((t, i) => (
              <p key={i} className="psp-closing io">
                {t}
              </p>
            ))
          : null}

        {d.menus.length > 0 && !blocks.some((b) => /メニュー/.test(b.heading)) ? (
          <section className="psp-sec io" aria-labelledby="pta-menu-h">
            <h2 id="pta-menu-h" className="psp-h2">
              <span>メニュー</span>
            </h2>
            <ul className="pta-menus">
              {d.menus.map((m, i) => (
                <li key={`${m.name}-${i}`}>
                  {m.name}
                  {m.minutes ? <span>　{m.minutes}分</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ShopBox d={d} />
      </div>

      {rel}
      <div className="psp-in">
        <Back d={d} />
      </div>
    </article>
  );
}

export function petArticlePage() {
  type Props = { params: Promise<{ id: string }> };
  async function load(id: string) {
    const d = await loadPetShopDetail(id);
    return d && petHasArticle(d) ? d : null;
  }
  const path = (id: string) => `/pet/article/${id}`;
  return {
    async generateStaticParams() {
      return (await loadPetArticleItems()).map((x) => ({ id: x.shop.id }));
    },
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const d = await load((await params).id);
      if (!d) return notFoundMetadata();
      const ph = d.photos[0];
      return buildMetadata({
        vertical: "pet",
        title: `${petArticleTitle(d)}｜${d.shop.name}｜マチノワ Pet`,
        description: d.headline || `${d.shop.name}の紹介記事。`,
        path: path(d.place.id),
        count: 3,
        ...(ph ? { image: { url: ph.src, width: ph.w, height: ph.h, alt: ph.alt } } : {}),
      });
    },
    async Page({ params }: Props) {
      const d = await load((await params).id);
      if (!d) notFound();
      const v = getVertical("pet");
      return (
        <Shell page="article" mode="live">
          <JsonLd
            data={breadcrumb([
              { name: "マチノワ", url: absUrl("/") },
              { name: v.name, url: absUrl(v.path) },
              { name: "店舗紹介", url: absUrl(L.shops) },
              { name: d.shop.name, url: absUrl(d.path) },
              { name: "特集記事", url: absUrl(path(d.place.id)) },
            ])}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Article",
              headline: petArticleTitle(d),
              author: { "@type": "Organization", name: "マチノワ編集部" },
              mainEntityOfPage: absUrl(path(d.place.id)),
              about: { "@type": "LocalBusiness", name: d.shop.name, address: d.address },
            }}
          />
          <ArticleBody d={d} rel={<Related d={d} />} />
        </Shell>
      );
    },
  };
}
