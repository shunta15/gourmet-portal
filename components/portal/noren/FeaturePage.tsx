import Link from "next/link";
import "@/app/proto-noren/feature.css";
import FeatureMap from "@/components/portal/FeatureMap";
import FeatureHero, { type StreetItem } from "@/components/portal/noren/FeatureHero";
import FeatureIndex from "@/components/portal/noren/FeatureIndex";
import FeatureTabsRail from "@/components/portal/noren/FeatureTabsRail";
import DoorLift from "@/components/portal/noren/DoorLift";
import Lantern from "@/components/portal/noren/Lantern";
import type { Feature, FeatureArticle } from "@/lib/regions";
import type { FmapData } from "@/lib/portal/fmap";
import { mapsUrlForRankItem } from "@/lib/maps";
import { sized } from "@/lib/imageUrl";
import { isBlockedImage } from "@/lib/imageBlocklist";
import { isUnusableImage } from "@/lib/portal/noren/shop";
import type { NorenLinks } from "@/lib/portal/noren/nav";
import { bandNameSize, bandPlan, clothName, colsOf, emOf, kanjiNo, photoSpans, plainLen, splitRank, titleSize } from "@/lib/portal/noren/feature";

// 暖簾の特集記事ページの中身（サーバーコンポーネント）。見本 /proto-noren/feature/[id] と、公開スイッチ ON の本番 /gourmet/feature/[id]
// （/feature/<id> が next.config.ts の rewrites でここに来る）が共通で使う。データの取り方・メタ情報・構造化データは呼び出し側のページ。
// ここは「今の /feature/[id]（components/FeatureClient.tsx）と同じ中身を、暖簾の組みで出す」ところだけ。
// 組み方は「暖簾の並ぶ横丁を、はしごする」: 載っている店・場所の数だけ暖簾が掛かる巻頭 → 店ごとに暖簾をくぐって、中の品書きを読む。
const usable = (u: string) => !isUnusableImage(u) && !isBlockedImage(u);

export type FeaturePageProps = {
  article: FeatureArticle;
  /** 特集の一覧（タブ）。lib/data の FEATURES（サーバーのページで取って渡す） */
  features: Feature[];
  /** 記事と対になる店のID（ARTICLE_STORE_ID_BY_FEATURE）。あれば「店舗情報（営業時間・地図）」を出す */
  storeId?: string;
  /** 店を地図でまとめて見る区画のデータ（座標のある店が 2 軒以上の記事だけ） */
  fmap: FmapData | null;
  /** トップ・特集・店ページの行き先（見本は /proto-noren/…、本番は /gourmet・/feature/<id>・/restaurant/<id>） */
  links: NorenLinks;
  /** データの中の行き先（/restaurant/…・/feature/…）を、この画面の行き先に付け替える（本番は変えない） */
  href: (h: string) => string;
};

export default function FeaturePage({ article: A, features, storeId, fmap, links, href }: FeaturePageProps) {
  const storeHref = storeId ? `${links.shopBase}/${storeId}` : undefined;
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
  const tabs = features.map((t) => ({ id: t.id, no: t.no, title: t.title, href: links.feature(t.id) }));

  // 暖簾（1 軒・1 か所 = 1 枚）。漢数字と、データにある名前だけを染める
  const street: StreetItem[] = A.ranking.map((r, i) => {
    const core = clothName(r.name);
    const em = emOf(core);
    return { num: kanjiNo(i + 1), name: core, full: r.name, href: `#spot-${i + 1}`, em, cols: colsOf(em) };
  });
  const index = A.ranking.map((r, i) => ({ id: `spot-${i + 1}`, no: kanjiNo(i + 1), name: r.name }));

  return (
    <>
      <DoorLift />

      {/* 巻頭: 載っている店・場所の数だけ、暖簾が掛かる */}
      <FeatureHero items={street} photo={heroSrc}>
        <nav className="vF-crumbs" aria-label="パンくず">
          <ol>
            <li>
              <Link href={links.top} data-cursor="BACK">トップ</Link>
            </li>
            <li>
              <Link href="/feature" data-cursor="BACK">特集</Link>
            </li>
            <li>
              <span aria-current="page">{A.title}</span>
            </li>
          </ol>
        </nav>
        <div className="vF-hd-main">
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
          <h1 className="vF-title" style={{ ["--tfs" as string]: `${tfs}px` }} dangerouslySetInnerHTML={{ __html: A.titleHTML }} />
        </div>
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
              <Link href={links.top} data-cursor="BACK">← トップへ戻る</Link>
            </dd>
          </div>
        </dl>
      </FeatureHero>

      {/* 帯（今のページの流れる文字） */}
      <div className="vF-tick" aria-hidden="true">
        <div className="vF-tick-in">
          {[0, 1].flatMap((k) => tickerItems.map((t, i) => <span key={`${k}-${i}`}>{t}</span>))}
        </div>
      </div>

      <div id="vF-body" className="vF-body">
        {A.ranking.length > 0 && <FeatureIndex items={index} bodyId="vF-body" />}

        {/* 導入 */}
        <section className="vH-paper vN-paper vF-intro-s" aria-label="導入">
          <div className="vF-intro-in vN-rv">
            <div className="vF-intro">
              <div className="vF-count">
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
          {fmap && (
            <div className="vF-map vN-rv">
              <FeatureMap data={fmap} />
            </div>
          )}
        </section>

        {/* 店・スポット: 暖簾をくぐって、中の品書きを読む */}
        {A.ranking.map((r, i) => {
          const sr = splitRank(r.rank);
          const imgs = r.images.filter(usable);
          const door = imgs[0];
          const rest = imgs.slice(1, 7);
          const spans = photoSpans(rest.length);
          const mapUrl = mapsUrlForRankItem(r);
          const num = kanjiNo(i + 1);
          const em = emOf(clothName(r.name));
          const pc = bandPlan(r.name, false);
          const sp = bandPlan(r.name, true);
          const sid = `spot-${i + 1}`;
          const plans: [string, typeof pc][] = [
            ["pc", pc],
            ["sp", sp],
          ];
          return (
            <div key={i} className="vH-itemw">
              <article id={sid} tabIndex={-1} className="vH-shop" aria-labelledby={`${sid}-n`}>
                {/* 店の入口: 暖簾が掛かっている。スクロールで上がり、写真が現れる */}
                <div className="vH-door" style={{ ["--np" as string]: pc.length, ["--ns" as string]: sp.length, ["--nfs" as string]: `${bandNameSize(em)}px` }}>
                  <div className="vH-wall" aria-hidden="true" />
                  <Lantern className="vH-lan vH-lan--l" mark="灯" />
                  <Lantern className="vH-lan vH-lan--r" mark="宵" />
                  <div className="vH-win">
                    {door && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="vH-photo" src={sized(door, 1600)} alt={`${r.name} 写真 1`} loading="lazy" decoding="async" />
                    )}
                    <div className="vH-shade" aria-hidden="true" />
                  </div>
                  {plans.map(([k, plan]) => (
                    <div key={k} className={`vH-nr ${k}`} aria-hidden="true">
                      {plan.map((p, j) => {
                        const mid = (plan.length - 1) / 2;
                        const side = j === mid ? "c" : j < mid ? "l" : "r";
                        return (
                          <span key={j} className="vH-p" data-side={side} style={{ ["--em" as string]: Math.max(1, p.em), ["--j" as string]: Math.ceil(Math.abs(j - mid)) }}>
                            <span className="vH-pc">
                              <b>{p.text}</b>
                              <i className="vN-seal">輪</i>
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  ))}
                  <div className="vH-roll" aria-hidden="true" />
                  <div className="vH-rodbar" aria-hidden="true" />
                  <div className="vH-no" aria-hidden="true">
                    <i>{num}</i>
                  </div>
                  <div className="vH-head">
                    <h3 id={`${sid}-n`} className="vH-name">{r.name}</h3>
                    <p className="vH-eye">
                      {r.cuisine && <span>{r.cuisine}</span>}
                      {r.area && <span>{r.area}</span>}
                    </p>
                  </div>
                </div>

                {/* 暖簾をくぐった先: 店の中の品書き */}
                <div className="vH-paper vN-paper vH-in">
                  <div className="vF-item vN-rv">
                    <div className="vF-rank">
                      <span className="vF-stamp" aria-hidden="true" />
                      {sr.label && <small>{sr.label}</small>}
                      <em>{sr.num}</em>
                    </div>
                    <div className="vF-body-c">
                      {isCourse && (r.time || r.purpose) && (
                        <p className="vF-badges">
                          {r.time && <span className="t">{r.time}</span>}
                          {r.purpose && <span className="p">{r.purpose}</span>}
                        </p>
                      )}
                      <p className="vF-cu">
                        {r.cuisine} · {r.area}
                      </p>
                      {!isCourse && r.heading && <p className="vF-hd">{r.heading}</p>}
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
                          <Link href={href(r.href)} className="go" data-cursor="VIEW">
                            店舗詳細を見る →
                          </Link>
                        )}
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="map" data-cursor="MAP">
                          Google マップで開く ↗<span className="vN-vh">（外部サイトが新しいタブで開きます）</span>
                        </a>
                      </p>
                    </div>
                    {rest.length > 0 && (
                      <ul className={`vF-ph n${Math.min(rest.length, 6)}`}>
                        {rest.map((im, j) => (
                          <li key={im + j} style={{ gridColumn: `span ${spans[j] ?? 2}` }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={sized(im, spans[j] >= 3 ? 1000 : 700)} alt={`${r.name} 写真 ${j + 2}`} loading="lazy" decoding="async" />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>

              {/* course 型: 暖簾と暖簾のあいだは、データにある言葉の道（横丁を歩く） */}
              {isCourse && r.transit && (
                <div className="vH-road">
                  <span className="ln" />
                  <span className="tx">↓ {r.transit}</span>
                  <span className="ln" />
                </div>
              )}
            </div>
          );
        })}

        {/* 店の外へ出て、編集部の言葉 */}
        <section className="vH-paper vN-paper vF-tail" aria-label="編集部の言葉">
          <div className="vF-tail-in">
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
        </section>
      </div>

      {/* 次の横丁（関連記事）: 暖簾で見せる。押す・触れると暖簾が上がり、写真が見える */}
      {A.sideArticles.length > 0 && (
        <section className="vF-rel" aria-labelledby="vF-rel-h">
          <div className="vF-rel-in">
            <div className="vF-rel-hd vN-rv">
              <p className="k">関連記事</p>
              <h2 id="vF-rel-h" className="vF-h2d">
                次に読む、<em>{isGuide ? "街ガイド" : "利用シーン"}。</em>
              </h2>
            </div>
            <ul className="vH-al">
              {A.sideArticles.map((s, i) => {
                const em = emOf(s.t);
                const cols = colsOf(em);
                const fs = Math.max(17, Math.min(30, Math.floor(250 / Math.ceil(Math.max(em, 1) / cols))));
                return (
                  <li key={i} className="vN-rv" style={{ ["--d" as string]: i }}>
                    <Link href={href(s.h)} className="vH-ac" data-cursor="READ" style={{ ["--fs" as string]: `${fs}px`, ["--cols" as string]: cols }}>
                      <span className="vH-ac-ph">
                        {s.img && usable(s.img) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sized(s.img, 640)} alt="" loading="lazy" decoding="async" />
                        )}
                      </span>
                      <span className="vH-ac-rod" aria-hidden="true" />
                      <span className="vH-ac-cloth">
                        <b>{s.t}</b>
                        <i className="vN-seal" aria-hidden="true">輪</i>
                      </span>
                      <span className="vH-ac-go">記事を読む →</span>
                    </Link>
                  </li>
                );
              })}
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
