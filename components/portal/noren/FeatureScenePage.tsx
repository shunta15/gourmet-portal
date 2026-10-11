import Link from "next/link";
import "@/app/proto-noren/feature.css";
import "@/app/proto-noren/feature-scene.css";
import FeatureMap from "@/components/portal/FeatureMap";
import FeatureHero, { type StreetItem } from "@/components/portal/noren/FeatureHero";
import FeatureIndex from "@/components/portal/noren/FeatureIndex";
import FeatureTabsRail from "@/components/portal/noren/FeatureTabsRail";
import DoorLift from "@/components/portal/noren/DoorLift";
import Lantern from "@/components/portal/noren/Lantern";
import LanternInner from "@/components/portal/noren-real/LanternInner";
import { NOREN_REAL_INNER } from "@/lib/portal/noren/realTop";
import type { Feature, FeatureArticle } from "@/lib/regions";
import type { FmapData } from "@/lib/portal/fmap";
import { mapsUrlForRankItem } from "@/lib/maps";
import { sized } from "@/lib/imageUrl";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import type { NorenLinks } from "@/lib/portal/noren/nav";
import { isDummyFeatureImage } from "@/lib/portal/noren/featureSingle";
import { commonSpecKeys } from "@/lib/portal/noren/featureScene";
import { bandNameSize, bandPlan, clothName, colsOf, emOf, kanjiNo, photoSpans, plainLen, splitRank, titleSize } from "@/lib/portal/noren/feature";

// 利用シーン+店舗紹介の記事ページの中身（サーバーコンポーネント）。切り替えは lib/portal/noren/featureScene.ts（NOREN_FEATURE_SCENE / isSceneShopFeature）。
// 組み方: 巻頭（墨。暖簾の横一列は FeaturePage と同じ FeatureHero）→ 導入と「店を見比べる表」（紙）→ 店ごとの節 ×N（暖簾をくぐって、紙に品書き。最後に「店のページを見る →」）
//   → 編集部の言葉（紙）→ 関連記事 → 特集の一覧。
// 表は、2 店以上に共通する項目（住所・営業時間など。lib/portal/noren/featureScene.ts の commonSpecKeys）だけを行にする。無い所は「—」。記事に無い事実・数は足さない。
// 1 店だけの項目は、その店の節で出す。「厳選」「名店」「おすすめ」「人気」・星・点数は、この枠では書かない。
const usable = isUsableFeatureImage;
const usableShot = (u: string | undefined | null) => usable(u) && !isDummyFeatureImage(u);

export type FeatureScenePageProps = {
  article: FeatureArticle;
  /** 特集の一覧（タブ）。lib/data の FEATURES（サーバーのページで取って渡す） */
  features: Feature[];
  /** 店を地図でまとめて見る区画のデータ（座標のある店が 2 軒以上の記事だけ） */
  fmap: FmapData | null;
  links: NorenLinks;
  /** データの中の行き先（/restaurant/…・/feature/…）を、この画面の行き先に付け替える（本番は変えない） */
  href: (h: string) => string;
};

export default function FeatureScenePage({ article: A, features, fmap, links, href }: FeatureScenePageProps) {
  const isGuide = A.articleType === "guide";
  const heroSrc = usableShot(A.heroImage) ? sized(A.heroImage, 1800) : "";
  const tfs = titleSize(plainLen(A.titleHTML));
  const tabs = features.map((t) => ({ id: t.id, no: t.no, title: t.title, href: links.feature(t.id) }));

  // 暖簾（店 1 軒 = 1 枚）。漢数字と、データにある店名だけを染める
  const street: StreetItem[] = A.ranking.map((r, i) => {
    const core = clothName(r.name);
    const em = emOf(core);
    return { num: kanjiNo(i + 1), name: core, full: r.name, href: `#spot-${i + 1}`, em, cols: colsOf(em) };
  });
  const index = A.ranking.map((r, i) => ({ id: `spot-${i + 1}`, no: kanjiNo(i + 1), name: r.name }));

  // 見比べる表: 2 店以上に共通する項目だけを行にする
  const keys = commonSpecKeys(A.ranking);
  const valueOf = (r: FeatureArticle["ranking"][number], k: string) => r.specs.find((s) => s.k === k)?.v?.trim() || "—";

  return (
    <>
      <DoorLift />

      {/* 巻頭（墨）: 店の数だけ暖簾が横一列に掛かる（FeaturePage と同じ部品）。流れる文字の帯は出さない */}
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
          <p className="vN-eyebrow vC-label">
            <b>利用シーン</b>
            <em>Scene</em>
          </p>
          <h1 className="vF-title" style={{ ["--tfs" as string]: `${tfs}px` }} dangerouslySetInnerHTML={{ __html: A.titleHTML }} />
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

      <div id="vF-body" className="vF-body">
        {A.ranking.length > 0 && <FeatureIndex items={index} bodyId="vF-body" />}

        {/* 導入と、店を見比べる表（紙） */}
        <section className="vH-paper vN-paper vC-cmp" aria-labelledby="vC-cmp-h">
          <div className="vC-cmp-in vN-rv">
            <p className="vC-lede">{A.lede}</p>
            <h2 id="vC-cmp-h" className="vF-h2 vC-cmp-h">
              店を、<em>見比べる。</em>
            </h2>
            {keys.length > 0 ? (
              <>
                {/* PC・タブレット: 店を横に並べた表（項目が行） */}
                <div className="vC-tw">
                  <table className="vC-tbl" style={{ ["--n" as string]: A.ranking.length }}>
                    <caption className="vN-vh">{A.title}: 店ごとの{keys.join("・")}</caption>
                    <thead>
                      <tr>
                        <td aria-hidden="true" />
                        {A.ranking.map((r, i) => (
                          <th key={i} scope="col">
                            <a href={`#spot-${i + 1}`} data-cursor="JUMP">
                              <i>{kanjiNo(i + 1)}</i>
                              <b>{r.name}</b>
                              {r.cuisine && <small>{r.cuisine}</small>}
                            </a>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((k) => (
                        <tr key={k}>
                          <th scope="row">{k}</th>
                          {A.ranking.map((r, i) => {
                            const v = valueOf(r, k);
                            return (
                              <td key={i} className={v === "—" ? "none" : undefined}>
                                {v === "—" ? <span aria-label="記載なし">—</span> : v}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* スマホ: 店を縦に並べる（店ごとに、同じ順の項目） */}
                <ul className="vC-cards">
                  {A.ranking.map((r, i) => (
                    <li key={i}>
                      <a href={`#spot-${i + 1}`} className="vC-card-h" data-cursor="JUMP">
                        <i>{kanjiNo(i + 1)}</i>
                        <b>{r.name}</b>
                        {r.cuisine && <small>{r.cuisine}</small>}
                      </a>
                      <dl>
                        {keys.map((k) => {
                          const v = valueOf(r, k);
                          return (
                            <div key={k}>
                              <dt>{k}</dt>
                              <dd>{v === "—" ? <span aria-label="記載なし">—</span> : v}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="vC-note">項目をそろえて並べられる情報が記事にないため、店ごとの節で紹介します。</p>
            )}
          </div>
          {fmap && (
            <div className="vF-map vN-rv">
              <FeatureMap data={fmap} />
            </div>
          )}
        </section>

        {/* 店ごとの節: 暖簾をくぐって、中の品書きを読む */}
        {A.ranking.map((r, i) => {
          const sr = splitRank(r.rank);
          const imgs = r.images.filter(usableShot);
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
          // 表に出した項目は、表で読める。ここには、表に出なかった項目（1 店だけの項目）を出す
          const restSpecs = r.specs.filter((s) => !keys.includes(s.k));
          return (
            <div key={i} className="vH-itemw">
              <article id={sid} tabIndex={-1} className="vH-shop" aria-labelledby={`${sid}-n`}>
                {/* 店の入口: 店名を染めた暖簾が掛かっている。スクロールで上がり、写真が現れる */}
                <div className="vH-door" style={{ ["--np" as string]: pc.length, ["--ns" as string]: sp.length, ["--nfs" as string]: `${bandNameSize(em)}px` }}>
                  <div className="vH-wall" aria-hidden="true" />
                  {NOREN_REAL_INNER ? <LanternInner className="vH-lan vH-lan--l" mark="灯" /> : <Lantern className="vH-lan vH-lan--l" mark="灯" />}
                  {NOREN_REAL_INNER ? <LanternInner className="vH-lan vH-lan--r" mark="宵" /> : <Lantern className="vH-lan vH-lan--r" mark="宵" />}
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
                      <p className="vF-cu">
                        {r.cuisine} · {r.area}
                      </p>
                      {r.heading && <p className="vF-hd">{r.heading}</p>}
                      <p className="vF-desc">{r.desc}</p>
                      {restSpecs.length > 0 && (
                        <dl className="vF-specs">
                          {restSpecs.map((s, j) => (
                            <div key={j}>
                              <dt>{s.k}</dt>
                              <dd>{s.v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <p className="vC-acts">
                        {r.href && (
                          <Link href={href(r.href)} className="vC-go" data-cursor="VIEW">
                            店のページを見る →
                          </Link>
                        )}
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="vC-map" data-cursor="MAP">
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
            </div>
          );
        })}

        {/* 編集部の言葉（紙） */}
        <section className="vH-paper vN-paper vF-tail" aria-label="編集部の言葉">
          <div className="vF-tail-in">
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

      {/* 関連記事（今の枠と同じカード）。押す・触れると暖簾が上がり、写真が見える */}
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
                const sem = emOf(s.t);
                const cols = colsOf(sem);
                const fs = Math.max(17, Math.min(30, Math.floor(250 / Math.ceil(Math.max(sem, 1) / cols))));
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

      {/* 特集の一覧（今の枠と同じタブのレール） */}
      <section className="vF-tabs" aria-labelledby="vF-tabs-h">
        <div className="vF-tabs-in">
          <h2 id="vF-tabs-h" className="vF-h2d vN-rv">特集</h2>
          <FeatureTabsRail items={tabs} activeId={A.id} />
        </div>
      </section>
    </>
  );
}
