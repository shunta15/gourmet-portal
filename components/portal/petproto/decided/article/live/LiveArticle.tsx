import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import { notFoundMetadata } from "@/components/portal/pages/data";
import Shell from "../../common/Shell";
import { MaskLines, FillHeading, PawTrail } from "../../common/Motion";
import { IconArrow, IconChevron, Paw } from "../../common/Icons";
import { ptLinks } from "../../common/site";
import { IconPawLine } from "../../search/live/LiveIcons";
import { articleHref, loadPetArticleItems, loadPetShopDetail, petArticleTitle, petHasArticle, japaneseDate, type ShopDetail } from "../../shop/live/liveShopData";
import { shopHref } from "../../search/live/liveData";
import { sized } from "@/lib/imageUrl";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { buildMetadata } from "@/lib/seo/meta";
import { getVertical } from "@/lib/verticals";
import "../../shop/live/shop-live.css";
import "./art-live.css";

/**
 * 店の特集記事(本番 /pet/article/{店の ID})。【2026-10-26 試作】見本 記事.webp(「ARTICLE」の小さな字・明朝の大見出し・右に大きな写真・白い札の並び)の見た目で、実在の店の記事を出す。
 * 文は店のデータの紹介記事・特集記事(liveShopData.ts の点検済みの文)だけ。足さない・言い換えない。店のページ(/pet/shop/{id})へは「店舗詳細を見る」で戻れる。
 * 見本は記事の「一覧」なので、1 本の記事の本文・店の札は、店のページの部品(lsp-)の見た目に合わせてある。
 */

function Crumb({ d }: { d: ShopDetail }) {
  const L = ptLinks("live");
  return (
    <nav className="lsp-bc" aria-label="パンくず">
      <Link href={L.home}>ホーム</Link>
      <IconChevron aria-hidden="true" />
      <Link href={L.shops}>店舗紹介</Link>
      <IconChevron aria-hidden="true" />
      <Link href={shopHref(d.place.id)} prefetch={false}>
        {d.shop.name}
      </Link>
      <IconChevron aria-hidden="true" />
      <span aria-current="page">{d.story ? "特集記事" : "紹介記事"}</span>
    </nav>
  );
}

function Hero({ d }: { d: ShopDetail }) {
  const ph = d.photos[0];
  const title = petArticleTitle(d);
  const size = title.length <= 18 ? "l" : title.length <= 30 ? "m" : "s";
  return (
    <section className={`pta-hero${ph ? "" : " pta-hero--none"}`} aria-label="記事の見出し">
      {ph ? (
        <div className="pta-hero-ph">
          <img src={sized(ph.src, 1024)} width={ph.w ?? 1200} height={ph.h ?? 800} alt={ph.alt} fetchPriority="high" decoding="async" />
        </div>
      ) : (
        <div className="pta-hero-ph pta-hero-ph--none" role="img" aria-label="この店の写真はまだありません">
          <Paw className="lsp-nophoto-paw" />
        </div>
      )}
      <div className="pta-hero-tx">
        <p className="pta-lab">{d.story ? "FEATURE" : "ARTICLE"}</p>
        <h1 className={`pta-h1 pta-h1--${size}`}>
          <MaskLines lines={[title]} delay={150} />
        </h1>
        <p className="pta-shopname">
          {d.shop.name}　<span>{d.shop.kindName}　{d.shop.place}</span>
        </p>
        {d.story?.subtitle ? <p className="pta-sub">{d.story.subtitle}</p> : null}
        <Link href={shopHref(d.place.id)} prefetch={false} className="lsp-ghost pta-btn pt-press pt-hov pt-magnet">
          <span>店舗詳細を見る</span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function Body({ d }: { d: ShopDetail }) {
  const st = d.story;
  const blocks = st ? st.points.map((p) => ({ heading: p.name, sub: p.purpose, body: p.body, specs: p.specs })) : d.sections.map((s) => ({ heading: s.heading, sub: "", body: s.body, specs: [] as { k: string; v: string }[] }));
  const lede = st ? st.lede : d.about;
  return (
    <section className="lsp-card lsp-art pta-art" id="story" aria-label={st ? "特集記事" : "紹介記事"}>
      <div className="lsp-art-hd io" data-io="left">
        <p className="lsp-lab">{st ? "Feature" : "Article"}</p>
        <FillHeading as="h2" className="lsp-ttl lsp-ttl--art">
          {st ? st.title || "特集記事" : "お店の紹介"}
        </FillHeading>
      </div>
      <div className="lsp-art-body">
        {lede.length > 0 ? (
          <div className="lsp-art-lede io">
            {lede.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        ) : null}
        {blocks.map((b, i) => (
          <section key={i} className="lsp-art-sec io" aria-labelledby={`pta-art-${i}`}>
            <h3 id={`pta-art-${i}`} className="lsp-art-h">
              {b.heading}
            </h3>
            {b.sub ? <p className="lsp-art-purpose">{b.sub}</p> : null}
            {b.body.map((t, j) => (
              <p key={j}>{t}</p>
            ))}
            {b.specs.length > 0 ? (
              <dl className="lsp-art-specs">
                {b.specs.map((x) => (
                  <div key={x.k}>
                    <dt>{x.k}</dt>
                    <dd>{x.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ))}
        {st?.quote ? (
          <blockquote className="lsp-art-bq io">
            <p>{st.quote}</p>
            {st.quoteCite ? <cite>{st.quoteCite}</cite> : null}
          </blockquote>
        ) : null}
        {st && st.closing.length > 0 ? (
          <div className="lsp-art-close io">
            {st.closing.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        ) : null}
        {d.menus.length > 0 && !blocks.some((b) => /メニュー/.test(b.heading)) ? (
          <div className="pta-menus io">
            <h3 className="lsp-art-h">メニュー</h3>
            <ul>
              {d.menus.map((m, i) => (
                <li key={`${m.name}-${i}`}>
                  {m.name}
                  {m.minutes ? <span>　{m.minutes}分</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <PawTrail count={6} direction="right" size={13} gap="calc(9 * var(--u))" className="lsp-paws-art" />
      </div>
    </section>
  );
}

function ShopBand({ d }: { d: ShopDetail }) {
  const ph = d.photos[1] ?? d.photos[0];
  return (
    <section className="pta-shop" aria-label="この記事のお店">
      <div className={`pta-shop-ph${ph ? "" : " pta-shop-ph--none"}`}>{ph ? <img src={sized(ph.src, 480)} width={ph.w ?? 480} height={ph.h ?? 320} alt="" loading="lazy" decoding="async" /> : <Paw className="lsp-nophoto-paw" />}</div>
      <div className="pta-shop-tx">
        <p className="lsp-lab">Shop</p>
        <h2 className="pta-shop-n">{d.shop.name}</h2>
        <p className="pta-shop-a">
          {d.shop.kindName}　{d.address}
        </p>
        {d.sources.length > 0 ? (
          <p className="pta-shop-s">
            情報の出どころ：
            {d.sources.map((src, i) => (
              <span key={src.url}>
                {i > 0 ? "・" : ""}
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.label}
                  <span className="lsp-sr">（別のタブで開きます）</span>
                </a>
              </span>
            ))}
            {d.checkedAt ? <span>　確認日 {japaneseDate(d.checkedAt)}</span> : null}
          </p>
        ) : null}
        <Link href={shopHref(d.place.id)} prefetch={false} className="lsp-ghost pta-btn pt-press pt-hov pt-magnet">
          <span>店舗詳細を見る</span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

async function Related({ d }: { d: ShopDetail }) {
  const all = (await loadPetArticleItems()).filter((x) => x.shop.id !== d.place.id);
  const items = [...all].sort((a, b) => Number(b.shop.kind === d.shop.kind) * 2 + Number(b.shop.pref === d.shop.pref) - (Number(a.shop.kind === d.shop.kind) * 2 + Number(a.shop.pref === d.shop.pref))).slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="lsp-rel pta-rel" id="related" aria-label="こんな記事もおすすめ" data-io-group>
      <div className="lsp-rel-l io">
        <p className="lsp-lab">Related</p>
        <FillHeading as="h2" className="lsp-ttl lsp-ttl--rel">
          こんな記事もおすすめ
        </FillHeading>
      </div>
      <div className="lsp-items">
        {items.map((r) => (
          <Link key={r.shop.id} href={articleHref(r.shop.id)} prefetch={false} className="lsp-ra pt-lift pt-tilt io" data-tilt="6">
            <div className={`lsp-ra-ph pt-zoom pt-wipe ${r.shop.photo ? "" : "lsp-ra-ph--none"}`} data-wipe="right">
              {r.shop.photo ? <img src={sized(r.shop.photo.src, 480)} width={r.shop.photo.w ?? 350} height={r.shop.photo.h ?? 233} alt={r.shop.photo.alt} loading="lazy" decoding="async" /> : <span className="lsp-ra-none"><IconPawLine aria-hidden="true" />写真なし</span>}
            </div>
            <h3 className="lsp-ra-t pta-rel-t">{r.title}</h3>
            <p className="lsp-ra-d">
              {r.shop.name}
              {r.shop.place ? `　${r.shop.place}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </section>
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
      const L = ptLinks("live");
      return (
        <Shell page="shop" mode="live">
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
          <div className="lsp-bg">
            <div className="lsp pta">
              <Crumb d={d} />
              <Hero d={d} />
              <div className="lsp-body">
                <Body d={d} />
                <ShopBand d={d} />
                <Related d={d} />
              </div>
            </div>
          </div>
        </Shell>
      );
    },
  };
}
