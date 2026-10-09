/**
 * 新業種（ビューティー・ボディケア）の実在の店の特集ページ。/{v}/feature/{id}（id は店舗名。日本語のまま）
 * 各業種の app/{v}/feature/[id]/page.tsx は featurePage(key) の結果をそのまま出すだけ。
 *
 * 見た目と組みは、グルメの特集ページ（components/FeatureClient.tsx）と同じ:
 *   ヒーロー → 帯（Marquee）→ 導入と 5 つのポイント → 編集部のひとこと → 最後に、歩き方。
 * クラス名・CSS は app/globals.css の .feat-*・.article・.rank-item・.quote-block をそのまま使う（差分だけ components/portal/feature.css）。
 * グルメの特集ページの部品は FeatureClient を含めて 1 行も変えていない。ここは別のサーバー部品で、次の点だけ違う:
 *   - グルメ専用の部品を出さない（グルメのフッター・特集タブ・「Google マップで開く」・「次に読む、街ガイド」・「2026年 春号」の帯）
 *   - 写真は <img>（幅・高さつき・遅延読み込み。ヒーローは優先）。写真が無い POINT は空の枠を出さない
 *   - ページの終わりに、情報の出どころ・確認日・お出かけ前の注意書き
 *   - その店の店ページ（/{v}/shop/{ID}）があれば相互にリンク
 * データは lib/places/features.ts（lib/places/generated/features-*.json。build-features.mjs の自動生成）。確認用の facts・notes は入っていない。
 * 公開スイッチ OFF のあいだは、新業種の全ルートがレイアウトで 404（generateStaticParams も空）。
 * 構造化データは Article（星・口コミなし）とパンくず。robots は他の新業種ページと同じ gate（業種の掲載が 3 件以上）。
 * サーバーで fs を使って public/ を見ない（写真の寸法はデータに入れてある）。
 */
import "../feature.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Marquee from "@/components/Marquee";
import FeatureReveal from "../FeatureReveal";
import JsonLd from "../JsonLd";
import { liveStaticParams } from "@/lib/portal/launch";
import { getPlaces } from "@/lib/places";
import { featurePath, findFeature, getGeneratedFeatures, type PlaceFeature } from "@/lib/places/features";
import { getVertical } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals/types";
import { buildMetadata } from "@/lib/seo/meta";
import { article as articleLd, breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { safeDecode } from "@/lib/stations/query";
import type { GeneratedVertical } from "@/lib/places/newVerticals";
import { notFoundMetadata } from "./data";

type Props = { params: Promise<{ id: string }> };

/** "2026-10-09" → "2026年10月9日"（形式が違えばそのまま） */
function japaneseDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}

/** 本文を段落に分ける（改行で区切る） */
function paragraphs(body: string): string[] {
  return body.split(/\n+/).map((x) => x.trim()).filter(Boolean);
}

function Photo({ f, src, loading, priority, className }: { f: PlaceFeature; src: string; loading?: "lazy"; priority?: boolean; className: string }) {
  const p = f.photos[src];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt={p?.alt ?? ""}
      {...(p?.w && p?.h ? { width: p.w, height: p.h } : {})}
      {...(priority ? { fetchPriority: "high" as const } : { loading })}
      decoding="async"
    />
  );
}

function Ranking({ f }: { f: PlaceFeature }) {
  return (
    <div className="ranking">
      {f.article.ranking.map((r, i) => {
        // "POINT 01" のような英字＋数字は分割表示（グルメの特集ページと同じ）
        const m = r.rank.match(/^([A-Z]+)\s+(\d+)$/);
        const has = r.images.length > 0;
        return (
          <article key={i} className={has ? "rank-item reveal" : "rank-item reveal mpf-noimg"}>
            <div className="rank">
              {m ? (
                <>
                  <span className="rank-label">{m[1]}</span>
                  <em>{m[2]}</em>
                </>
              ) : (
                <em>{r.rank}</em>
              )}
            </div>
            <div className="info">
              <div className="cuisine">{[r.cuisine, r.area].filter(Boolean).join(" · ")}</div>
              <h3>{r.name}</h3>
              {paragraphs(r.desc).map((t, j) => (
                <p key={j} className="desc">
                  {t}
                </p>
              ))}
              {r.specs.length > 0 && (
                <div className="specs">
                  {r.specs.map((s, j) => (
                    <div key={j}>
                      <b>{s.k}</b>
                      {s.v}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {has && (
              <div className={r.images.length === 1 ? "imgs mpf-one" : "imgs"}>
                {r.images.map((src) => (
                  <Photo key={src} f={f} src={src} loading="lazy" className="im" />
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function featurePage(key: GeneratedVertical) {
  async function find(params: Props["params"]): Promise<PlaceFeature | null> {
    const { id } = await params;
    return (await findFeature(key, safeDecode(id))) ?? null;
  }

  return {
    generateStaticParams: liveStaticParams(async () => {
      return (await getGeneratedFeatures(key)).map((f) => ({ id: f.id }));
    }),

    async generateMetadata({ params }: Props): Promise<Metadata> {
      const f = await find(params);
      if (!f) return notFoundMetadata();
      const v = getVertical(key);
      const a = f.article;
      const path = encodeURI(featurePath(key, f.id));
      const meta = buildMetadata({
        vertical: key,
        title: `${a.title}｜${v.brand}`,
        description: f.summary,
        path,
        count: (await getPlaces(key)).length,
      });
      // 共有画像は、その特集のヒーロー写真
      const og = absUrl(encodeURI(a.ogImage ?? a.heroImage));
      const hero = f.photos[a.ogImage ?? a.heroImage];
      return {
        ...meta,
        openGraph: {
          ...meta.openGraph,
          type: "article",
          images: [{ url: og, ...(hero?.w && hero?.h ? { width: hero.w, height: hero.h } : {}), alt: a.title }],
        },
        twitter: { ...meta.twitter, images: [og] },
      };
    },

    async Page({ params }: Props) {
      const f = await find(params);
      if (!f) notFound();
      const v: Vertical = getVertical(key);
      const A = f.article;
      const path = featurePath(key, f.id);
      const all = await getPlaces(key);
      const shop = f.placeId ? all.find((p) => p.id === f.placeId) : undefined;
      const others = (await getGeneratedFeatures(key)).filter((x) => x.id !== f.id).slice(0, 4);
      const heroSrc = A.heroImage;

      const articleJsonLd = {
        ...articleLd({
          headline: A.title,
          description: f.summary,
          image: absUrl(encodeURI(A.ogImage ?? heroSrc)),
          url: absUrl(encodeURI(path)),
          datePublished: A.date,
        }),
        publisher: { "@type": "Organization", name: "マチノワ", url: "https://machinowa.tokyo" },
        mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(encodeURI(path)) },
      };
      const crumbsJsonLd = breadcrumb([
        { name: "マチノワ", url: absUrl("/") },
        { name: v.name, url: absUrl(v.path) },
        ...(shop ? [{ name: shop.name, url: absUrl(`${v.path}/shop/${shop.id}`) }] : []),
        { name: A.title, url: absUrl(encodeURI(path)) },
      ]);

      return (
        <div className="feat-page" style={{ ["--accent" as string]: v.accent.color }}>
          <FeatureReveal />
          <JsonLd data={articleJsonLd} />
          <JsonLd data={crumbsJsonLd} />

          <section className="feat-hero">
            <Photo f={f} src={heroSrc} priority className="mpf-hero-img" />
            <div className="feat-hero-inner">
              <div>
                <div className="kicker">
                  <span className="b"></span>
                  {A.no && (
                    <>
                      <span>{A.no}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{A.date}</span>
                  {A.reading && (
                    <>
                      <span>·</span>
                      <span>{A.reading}</span>
                    </>
                  )}
                </div>
                <div style={{ marginTop: 30 }} className="reveal-line">
                  <div style={{ font: "500 11px/1 var(--mono)", letterSpacing: ".35em", color: "var(--accent)" }}>{A.kicker}</div>
                </div>
              </div>

              <div>
                <h1 style={{ marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: A.titleHTML }} />
                <div className="bot">
                  <p>{A.lede}</p>
                  <div className="dt">
                    <h6>副題</h6>
                    <p>{A.subtitle}</p>
                  </div>
                  <div className="dt">
                    <h6>編集</h6>
                    <p>{A.author}</p>
                  </div>
                  <div className="dt">
                    <h6>戻る</h6>
                    <p>
                      <Link href={v.path} prefetch={false} data-cursor="BACK">
                        ← {v.name}のトップへ戻る
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Marquee items={[A.subtitle, `${v.name}の特集`, A.kicker, `${A.ranking.length} POINTS`]} />

          <div className="feat-body mpf-body">
            <section className="article">
              <div className="article-head reveal">
                <div className="label">
                  POINT<span className="big">{A.ranking.length}</span>
                </div>
                <div>
                  <h2>
                    {A.subtitle.split(" / ")[0]}
                    <em>。</em>
                  </h2>
                  <p className="sub">
                    編集部が選んだ{A.ranking.length}つのポイントを順にご紹介します。
                    {A.lede}
                  </p>
                </div>
              </div>
              <Ranking f={f} />
              {shop && (
                <div className="mpf-links reveal">
                  <Link href={`${v.path}/shop/${shop.id}`} prefetch={false} className="mpf-link" data-cursor="VIEW">
                    {shop.name}の店ページ（営業時間・地図）→
                  </Link>
                </div>
              )}
            </section>

            {A.quote && (
              <section className="quote-block">
                <div className="quote-label">編集部のひとこと</div>
                <blockquote>{A.quote}</blockquote>
                <cite>{A.quoteCite}</cite>
              </section>
            )}

            <section className="article">
              <div className="article-head reveal">
                <div className="label">
                  編集後記<span className="big">末</span>
                </div>
                <div>
                  <h2>
                    最後に、<em>歩き方。</em>
                  </h2>
                  <p className="sub">{A.closing}</p>
                </div>
              </div>
            </section>

            <section className="mpf-src" aria-labelledby="mpf-src-h">
              <h2 id="mpf-src-h">情報の出どころ</h2>
              {f.sources.length > 0 && (
                <ul>
                  {f.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">
                        {s.label}
                        <span className="mp-sr">（別のタブで開きます）</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {f.checkedAt && (
                <p className="mpf-checked">
                  確認日　<time dateTime={f.checkedAt}>{japaneseDate(f.checkedAt)}</time>
                </p>
              )}
              <p className="mpf-note">料金・営業時間は変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
            </section>

            {others.length > 0 && (
              <section className="mpf-more" aria-labelledby="mpf-more-h">
                <div className="lab">MORE FEATURES</div>
                <h2 id="mpf-more-h">ほかの{v.name}の特集</h2>
                <div className="mpf-cards">
                  {others.map((o) => (
                    <Link key={o.id} href={encodeURI(featurePath(key, o.id))} prefetch={false} className="mpf-card" data-cursor="READ">
                      <Photo f={o} src={o.article.heroImage} loading="lazy" className="" />
                      <span className="info">
                        <span className="t" style={{ display: "block" }}>
                          {o.storeName}
                        </span>
                        <h3>{o.article.title}</h3>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      );
    },
  };
}
