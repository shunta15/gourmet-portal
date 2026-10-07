import Link from "next/link";
import { notFound } from "next/navigation";
import "../../feature.css";
import FeatureMap from "@/components/portal/FeatureMap";
import FeatureIndex from "@/components/portal/noren/FeatureIndex";
import FeatureTabsRail from "@/components/portal/noren/FeatureTabsRail";
import { getFeatureArticleById } from "@/lib/db/features";
import { FEATURES } from "@/lib/data";
import { ARTICLE_STORE_ID_BY_FEATURE } from "@/lib/articleStores";
import { buildFmap } from "@/lib/portal/fmapData";
import { mapsUrlForRankItem } from "@/lib/maps";
import { sized } from "@/lib/imageUrl";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { isUnusableImage } from "@/lib/portal/noren/shop";
import { NOREN_TOP, noFeature } from "@/lib/portal/noren/nav";
import { photoSpans, plainLen, protoHref, splitRank, titleSize } from "@/lib/portal/noren/feature";

// 暖簾の見本（特集記事ページ）。今の /feature/[id] と同じデータ・同じ取り方で、同じ中身を出す。プレビュー・ローカル専用（門は app/proto-noren/layout.tsx）。
export const dynamic = "force-dynamic";

const usable = (u: string) => !isUnusableImage(u) && !isBlockedImage(u);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getFeatureArticleById(id);
  if (!a) return { title: "記事が見つかりません — マチノワ" };
  return { title: `${a.title} — マチノワ`, description: a.lede, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const A = await getFeatureArticleById(id);
  if (!A) notFound();

  // 今の特集ページと同じ取り方
  const storeId = ARTICLE_STORE_ID_BY_FEATURE[A.id];
  const storeHref = storeId ? `/proto-noren/restaurant/${storeId}` : undefined;
  const fmap = await buildFmap(A);

  const isCourse = A.articleType === "course";
  const isGuide = A.articleType === "guide";
  const isSinglePoint = A.ranking.length > 0 && /^POINT/i.test(A.ranking[0].rank);
  const headLabel = isSinglePoint ? "POINT" : "厳選";
  const introText = isSinglePoint
    ? `編集部が選んだ${A.ranking.length}つのポイントを順にご紹介します。`
    : isGuide
      ? `順位ではなく、編集部が選んだ${A.ranking.length}スポットを順にご紹介します。`
      : `順位ではなく、編集部が選んだ${A.ranking.length}軒の名店を順にご紹介します。`;
  const tickerItems = [
    A.subtitle,
    "編集部厳選",
    A.kicker,
    isSinglePoint ? `${A.ranking.length} POINTS` : `厳選${A.ranking.length}スポット`,
    "2026年 春号",
  ].filter(Boolean);

  const heroSrc = usable(A.heroImage) ? sized(A.heroImage, 1800) : "";
  const tfs = titleSize(plainLen(A.titleHTML));
  const index = A.ranking.map((r, i) => {
    const sr = splitRank(r.rank);
    return { id: `spot-${i + 1}`, no: String(i + 1).padStart(2, "0"), name: r.name || sr.num };
  });
  const tabs = FEATURES.map((t) => ({ id: t.id, no: t.no, title: t.title, href: noFeature(t.id) }));

  return (
    <>
      {/* 巻頭 */}
      <section className="vF-hero" aria-label="巻頭">
        {heroSrc && <div className="vF-hero-img" style={{ backgroundImage: `url("${heroSrc}")` }} aria-hidden="true" />}
        <div className="vF-hero-in">
          <div className="vF-hero-l">
            <nav className="vF-crumbs" aria-label="パンくず">
              <ol>
                <li>
                  <Link href={NOREN_TOP} data-cursor="BACK">トップ</Link>
                </li>
                <li>
                  <Link href="/feature" data-cursor="BACK">特集</Link>
                </li>
                <li>
                  <span aria-current="page">{A.title}</span>
                </li>
              </ol>
            </nav>
            <p className="vF-meta">
              {A.no && (
                <>
                  <span>{A.no}</span>
                  <i aria-hidden="true">·</i>
                </>
              )}
              <span>{A.date}</span>
              {A.reading && (
                <>
                  <i aria-hidden="true">·</i>
                  <span>{A.reading}</span>
                </>
              )}
            </p>
            {A.kicker && <p className="vF-kk">{A.kicker}</p>}
            <dl className="vF-colo">
              <div>
                <dt>副題</dt>
                <dd>{A.subtitle}</dd>
              </div>
              <div>
                <dt>編集</dt>
                <dd>{A.author}</dd>
              </div>
              <div>
                <dt>戻る</dt>
                <dd>
                  <Link href={NOREN_TOP} data-cursor="BACK">← トップへ戻る</Link>
                </dd>
              </div>
            </dl>
          </div>
          <div className="vF-hero-r">
            <h1 className="vF-title" style={{ ["--tfs" as string]: `${tfs}px` }} dangerouslySetInnerHTML={{ __html: A.titleHTML }} />
          </div>
        </div>
        <div className="vF-cue" aria-hidden="true">
          <i />
          <span>Scroll</span>
        </div>
      </section>

      {/* 帯（今のページの流れる文字） */}
      <div className="vF-tick" aria-hidden="true">
        <div className="vF-tick-in">
          {[0, 1].flatMap((k) => tickerItems.map((t, i) => <span key={`${k}-${i}`}>{t}</span>))}
        </div>
      </div>

      {/* 巻物（本文） */}
      <div className="vF-wrap">
        <div className="vF-scroll">
          {index.length > 0 && <FeatureIndex items={index} targetId="vF-sheet" />}
          <div className="vF-rod" aria-hidden="true">
            <i style={{ left: "16%" }} />
            <i style={{ right: "16%" }} />
          </div>
          <div id="vF-sheet" className="vF-sheet vN-paper">
            <div className="vF-sheet-in">
              {/* 導入（巻物が開く） */}
              <div className="vF-capw vN-rv">
                <div className="vF-cap">
                  <div className="vF-intro">
                    <div className="vF-count" aria-hidden="false">
                      <span className="l">{headLabel}</span>
                      <b>{A.ranking.length}</b>
                    </div>
                    <div>
                      <h2 className="vF-h2">
                        {A.subtitle.split(" / ")[0]}
                        <em>。</em>
                      </h2>
                      <p className="vF-sub">
                        {introText}
                        {A.lede}
                      </p>
                    </div>
                  </div>
                </div>
                <i className="vF-roller" aria-hidden="true" />
              </div>

              {fmap && (
                <div className="vF-map vN-rv">
                  <FeatureMap data={fmap} />
                </div>
              )}

              {/* 店・スポット */}
              <div className={`vF-list${isCourse ? " is-course" : ""}`}>
                {A.ranking.map((r, i) => {
                  const sr = splitRank(r.rank);
                  const imgs = r.images.filter(usable);
                  const spans = photoSpans(imgs.length);
                  const mapUrl = mapsUrlForRankItem(r);
                  return (
                    <div key={i} className="vF-itemw">
                      <article id={`spot-${i + 1}`} className="vF-item vN-rv" aria-labelledby={`spot-${i + 1}-n`}>
                        <div className="vF-rank">
                          <span className="vF-stamp" aria-hidden="true" />
                          {sr.label && <small>{sr.label}</small>}
                          <em>{sr.num}</em>
                        </div>
                        <div className="vF-body">
                          {isCourse && (r.time || r.purpose) && (
                            <p className="vF-badges">
                              {r.time && <span className="t">{r.time}</span>}
                              {r.purpose && <span className="p">{r.purpose}</span>}
                            </p>
                          )}
                          <p className="vF-cu">
                            {r.cuisine} · {r.area}
                          </p>
                          <h3 id={`spot-${i + 1}-n`} className="vF-name">{r.name}</h3>
                          {r.heading && <p className="vF-hd">{r.heading}</p>}
                          <p className="vF-desc">{r.desc}</p>
                          {r.specs.length > 0 && (
                            <dl className="vF-specs">
                              {r.specs.map((s, j) => (
                                <div key={j}>
                                  <dt>{s.k}</dt>
                                  <dd>{s.v}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          <p className="vF-acts">
                            {r.href && (
                              <Link href={protoHref(r.href)} className="go" data-cursor="VIEW">
                                店舗詳細を見る →
                              </Link>
                            )}
                            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="map" data-cursor="MAP">
                              Google マップで開く ↗<span className="vN-vh">（外部サイトが新しいタブで開きます）</span>
                            </a>
                          </p>
                        </div>
                        {imgs.length > 0 && (
                          <ul className={`vF-ph n${Math.min(imgs.length, 6)}`}>
                            {imgs.slice(0, 6).map((im, j) => (
                              <li key={im + j} style={{ gridColumn: `span ${spans[j] ?? 2}` }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sized(im, spans[j] >= 3 ? 1000 : 700)} alt={`${r.name} 写真 ${j + 1}`} loading="lazy" decoding="async" />
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                      {isCourse && r.transit && (
                        <div className="vF-transit">
                          <span className="ln" />
                          <span className="tx">↓ {r.transit}</span>
                          <span className="ln" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {storeHref && (
                <p className="vF-store vN-rv">
                  <Link href={storeHref} className="go" data-cursor="VIEW">
                    店舗情報（営業時間・地図）→
                  </Link>
                </p>
              )}

              {A.quote && (
                <section className="vF-quote vN-rv" aria-label="編集部のひとこと">
                  <p className="k">編集部のひとこと</p>
                  <blockquote>{A.quote}</blockquote>
                  {A.quoteCite && <cite>{A.quoteCite}</cite>}
                </section>
              )}

              <section className="vF-end vN-rv" aria-labelledby="vF-end-h">
                <div className="vF-end-l">
                  <span className="vF-han" aria-hidden="true">末</span>
                  <p className="k">編集後記</p>
                </div>
                <div>
                  <h2 id="vF-end-h" className="vF-h2">
                    最後に、<em>{isGuide ? "歩き方" : "選び方"}。</em>
                  </h2>
                  <p className="vF-sub">{A.closing}</p>
                </div>
              </section>
            </div>
          </div>
          <div className="vF-rod is-end" aria-hidden="true">
            <i style={{ left: "16%" }} />
            <i style={{ right: "16%" }} />
          </div>
        </div>
      </div>

      {/* 関連記事 */}
      {A.sideArticles.length > 0 && (
        <section className="vF-rel" aria-labelledby="vF-rel-h">
          <div className="vF-rel-in">
            <div className="vF-rel-hd vN-rv">
              <p className="k">関連記事</p>
              <h2 id="vF-rel-h" className="vF-h2d">
                次に読む、<em>{isGuide ? "街ガイド" : "利用シーン"}。</em>
              </h2>
            </div>
            <ul className="vF-rel-l">
              {A.sideArticles.map((s, i) => (
                <li key={i} className="vN-rv" style={{ ["--d" as string]: i }}>
                  <Link href={protoHref(s.h)} className="vF-rc" data-cursor="READ">
                    <span className="im">
                      {s.img && usable(s.img) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sized(s.img, 640)} alt="" loading="lazy" decoding="async" />
                      )}
                    </span>
                    <span className="tx">
                      <b>{s.t}</b>
                      <span>記事を読む →</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 特集の一覧（今のページのタブ） */}
      <section className="vF-tabs" aria-labelledby="vF-tabs-h">
        <div className="vF-tabs-in">
          <h2 id="vF-tabs-h" className="vF-h2d vN-rv">特集</h2>
          <FeatureTabsRail items={tabs} activeId={A.id} />
        </div>
      </section>
    </>
  );
}
