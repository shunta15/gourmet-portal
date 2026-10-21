import Link from "next/link";
import "./feature.css";
import "./feature-single.css";
import FeatureIndex from "@/components/portal/noren/FeatureIndex";
import DoorLift from "@/components/portal/noren/DoorLift";
import PairSwitch from "@/components/portal/noren/PairSwitch";
import type { PairNote } from "@/lib/portal/noren/pair";
import Lantern from "@/components/portal/noren/Lantern";
import LanternInner from "@/components/portal/noren-real/LanternInner";
import { NOREN_REAL_INNER } from "@/lib/portal/noren/realTop";
import type { FeatureArticle } from "@/lib/regions";
import { isGoogleMapsUrl } from "@/lib/maps";
import { sized } from "@/lib/imageUrl";
import { isUsableFeatureImage } from "@/lib/portal/noren/usableImage";
import type { NorenLinks } from "@/lib/portal/noren/nav";
import { isDummyFeatureImage } from "@/lib/portal/noren/featureSingle";
import { FEATURE_KIND_SINGLE, FEATURE_SINGLE_HREF } from "@/lib/portal/noren/featureKinds";
import { bandNameSize, bandPlan, clothName, colsOf, emOf, photoSpans, plainLen, titleSize } from "@/lib/portal/noren/feature";
import { stripTabelogScore } from "@/lib/portal/noren/tabelogScore";

// 店 1 軒の特集記事ページの中身（サーバーコンポーネント）。切り替えは lib/portal/noren/featureSingle.ts（NOREN_FEATURE_SINGLE / isSingleShopFeature）。
// 記事は「POINT 01〜05」という視点の並びなので、暖簾は店の入口として 1 回だけ掛ける（視点ごとには掛けない）。
// 組み方: 巻頭（墨）→ 入口の暖簾（店の屋号。スクロールで上がり、主役の写真が出る）→ 導入と視点の目次（紙）→ 視点 ×N（紙と墨を交互）
//   → この店へ（墨。店ページへの行き先）→ 編集部の言葉（紙）→ 関連記事。
// 屋号は、対の店ページ（ARTICLE_STORE_ID_BY_FEATURE → 店のデータ）の店名だけを使う。記事の題名からの切り出し・推測・部分一致はしない。
const usable = isUsableFeatureImage;
// 記事の主役の写真・視点の写真は、使えない写真（usableImage.ts）に加えて、中身が真っ黒な仮の画像（featureSingle.ts の isDummyFeatureImage）も「写真なし」にする
const usableShot = (u: string | undefined | null) => usable(u) && !isDummyFeatureImage(u);

/** 対の店ページ（店のデータ）から、この枠が使う項目だけ */
export type SingleShop = { id: string; name: string; cuisine: string; area: string; nearest: string; address: string };

export type FeatureSinglePageProps = {
  article: FeatureArticle;
  /** 記事と対になる店（ARTICLE_STORE_ID_BY_FEATURE の店）。無い記事は null（入口の暖簾を掛けず、主役の写真をそのまま見せる） */
  store: SingleShop | null;
  /**
   * 対の店ページとの切り替えの帯（巻頭のすぐ下）。対の店ページがある記事だけ渡す（lib/portal/noren/pair.ts の pairedShopOfFeature が店を返す記事）。
   * 無ければ帯は出さない。
   */
  pair?: { shopNote: PairNote; featureNote: PairNote } | null;
  links: NorenLinks;
  /** データの中の行き先（/feature/…）を、この画面の行き先に付け替える（本番は変えない） */
  href: (h: string) => string;
};

export default function FeatureSinglePage({ article: A, store, pair, links, href }: FeatureSinglePageProps) {
  const isGuide = A.articleType === "guide";
  const tfs = titleSize(plainLen(A.titleHTML));

  // 主役の写真: heroImage → 使えなければ視点の写真の 1 枚目（そのとき、その視点では同じ写真を 2 度出さない）
  const viewImgs = A.ranking.map((r) => r.images.filter(usableShot));
  const hero = usableShot(A.heroImage) ? A.heroImage : "";
  const fallbackAt = hero ? -1 : viewImgs.findIndex((l) => l.length > 0);
  const lead = hero || (fallbackAt >= 0 ? viewImgs[fallbackAt][0] : "");

  const pad = (i: number) => String(i + 1).padStart(2, "0");
  const index = A.ranking.map((r, i) => ({ id: `view-${i + 1}`, no: pad(i), name: r.name }));

  // 屋号の暖簾（店のデータの店名だけを染める）
  const shopName = store?.name ?? "";
  const em = emOf(clothName(shopName));
  const pc = store ? bandPlan(shopName, false) : [];
  const sp = store ? bandPlan(shopName, true) : [];
  const plans: [string, typeof pc][] = [
    ["pc", pc],
    ["sp", sp],
  ];

  // 記事の視点に Google マップの実 URL があれば、「この店へ」に出す（無ければ出さない。店名＋題名からの検索リンクは作らない）
  let mapsUrl = "";
  for (const r of A.ranking) {
    const cand = [r.href, ...r.specs.map((s) => s.v)].find((v) => isGoogleMapsUrl(v));
    if (cand) {
      mapsUrl = cand;
      break;
    }
  }

  const shopRows = store
    ? ([
        ["店名", store.name],
        ["業種", store.cuisine],
        ["最寄り", store.nearest],
        ["住所", store.address],
      ] as const).filter(([, v]) => v && v.trim() && !/^[-—－\s]+$/.test(v))
    : [];

  return (
    <>
      {store && <DoorLift />}

      {/* 巻頭（墨の地）。小さな暖簾の横一列も、流れる文字の帯も出さない */}
      <header className="vK-hd">
        <div className="vK-hd-in">
          <nav className="vK-crumbs" aria-label="パンくず">
            <ol>
              <li>
                <Link href={links.top} data-cursor="BACK">トップ</Link>
              </li>
              <li>
                <Link href={FEATURE_SINGLE_HREF} data-cursor="BACK">{FEATURE_KIND_SINGLE}</Link>
              </li>
              <li>
                <span aria-current="page">{A.title}</span>
              </li>
            </ol>
          </nav>
          <p className="vN-eyebrow vK-label">
            <b>{FEATURE_KIND_SINGLE}</b>
            <em>Shop Story</em>
          </p>
          <h1 className="vF-title vK-title" style={{ ["--tfs" as string]: `${tfs}px` }} dangerouslySetInnerHTML={{ __html: A.titleHTML }} />
          <p className="vF-meta vK-meta">
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
          {A.subtitle && <p className="vK-sub">{A.subtitle}</p>}
        </div>
      </header>

      {/* 店の紹介 ⇄ この店の特集（対の店ページがある記事だけ。上端のヘッダーの下に残る） */}
      {store && pair && (
        <PairSwitch
          current="feature"
          shopName={store.name}
          shopHref={`${links.shopBase}/${store.id}`}
          featureHref={href(links.feature(A.id))}
          shopNote={pair.shopNote}
          featureNote={pair.featureNote}
        />
      )}

      {/* 入口（1 回だけ）: 店の屋号を染めた暖簾が掛かり、スクロールで上がって主役の写真が出る。対の店が無い記事は、写真をそのまま大きく */}
      {store ? (
        <section className={`vK-entry${lead ? "" : " vK-entry--nophoto"}`} aria-label={`${shopName} の入口`}>
          <div className="vH-door" style={{ ["--np" as string]: pc.length, ["--ns" as string]: sp.length, ["--nfs" as string]: `${bandNameSize(em)}px` }}>
            <div className="vH-wall" aria-hidden="true" />
            {NOREN_REAL_INNER ? <LanternInner className="vH-lan vH-lan--l" mark="灯" /> : <Lantern className="vH-lan vH-lan--l" mark="灯" />}
            {NOREN_REAL_INNER ? <LanternInner className="vH-lan vH-lan--r" mark="宵" /> : <Lantern className="vH-lan vH-lan--r" mark="宵" />}
            <div className="vH-win">
              {lead && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="vH-photo" src={sized(lead, 1800)} alt={`${shopName} の写真`} decoding="async" />
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
            <div className="vH-head">
              <h2 className="vH-name">{shopName}</h2>
              <p className="vH-eye">
                {store.cuisine && <span>{store.cuisine}</span>}
                {store.area && <span>{store.area}</span>}
              </p>
            </div>
          </div>
        </section>
      ) : (
        lead && (
          <figure className="vK-big">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sized(lead, 1800)} alt={`${A.title} の写真`} decoding="async" />
          </figure>
        )
      )}

      <div id="vF-body" className="vF-body">
        {A.ranking.length > 0 && <FeatureIndex items={index} bodyId="vF-body" />}

        {/* 導入（紙）と、この記事の視点の目次 */}
        <section className="vH-paper vN-paper vK-intro" aria-label="導入">
          <div className={`vK-intro-in${A.ranking.length > 1 ? "" : " solo"}`}>
            <p className="vK-lede vN-rv">{stripTabelogScore(A.lede)}</p>
            {A.ranking.length > 1 && (
              <nav className="vK-toc vN-rv" aria-labelledby="vK-toc-h">
                <p id="vK-toc-h" className="vK-toc-k">この記事の視点</p>
                <ol>
                  {A.ranking.map((r, i) => (
                    <li key={i}>
                      <a href={`#view-${i + 1}`} data-cursor="JUMP">
                        <b>{pad(i)}</b>
                        <span>{r.name}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </section>

        {/* 視点（紙と墨を交互に）。暖簾は付けない */}
        {A.ranking.map((r, i) => {
          const ink = i % 2 === 0;
          const imgs = viewImgs[i].filter((_, k) => !(fallbackAt === i && k === 0)).slice(0, 6);
          const spans = photoSpans(imgs.length);
          const sid = `view-${i + 1}`;
          return (
            <section key={i} id={sid} tabIndex={-1} className={`vK-pt ${ink ? "vK-pt--ink" : "vH-paper vN-paper"}`} aria-labelledby={`${sid}-h`}>
              <div className="vK-pt-in vN-rv">
                <p className="vK-pt-no" aria-hidden="true">{pad(i)}</p>
                <div className="vK-pt-c">
                  {r.cuisine && <p className="vK-pt-cu">{r.cuisine}</p>}
                  <h2 id={`${sid}-h`} className="vK-pt-h">{r.name}</h2>
                  {r.heading && <p className="vK-pt-hd">{r.heading}</p>}
                  <p className="vK-pt-desc">{stripTabelogScore(r.desc)}</p>
                  {r.specs.length > 0 && (
                    <dl className="vK-specs">
                      {r.specs.map((s, j) => (
                        <div key={j}>
                          <dt>{s.k}</dt>
                          <dd>{s.v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
                {imgs.length > 0 && (
                  <ul className={`vK-ph n${Math.min(imgs.length, 6)}`}>
                    {imgs.map((im, j) => (
                      <li key={im + j} style={{ gridColumn: `span ${spans[j] ?? 2}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sized(im, spans[j] >= 3 ? 1000 : 700)} alt={`${r.name} の写真${imgs.length > 1 ? ` ${j + 1}` : ""}`} loading="lazy" decoding="async" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}

        {/* この店へ（墨）。対の店が無い記事は出さない */}
        {store && (
          <section className="vK-go" aria-labelledby="vK-go-h">
            <div className="vK-go-in vN-rv">
              <h2 id="vK-go-h" className="vF-h2d">
                この店へ、<em>行く。</em>
              </h2>
              {shopRows.length > 0 && (
                <dl className="vK-shop">
                  {shopRows.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="vK-acts">
                <Link href={`${links.shopBase}/${store.id}`} className="vK-btn" data-cursor="VIEW">
                  店のページを見る →
                </Link>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="vK-btn vK-btn--ghost" data-cursor="MAP">
                    Google マップで開く ↗<span className="vN-vh">（外部サイトが新しいタブで開きます）</span>
                  </a>
                )}
              </p>
            </div>
          </section>
        )}

        {/* 編集部の言葉（紙） */}
        <section className="vH-paper vN-paper vF-tail vK-tail" aria-label="編集部の言葉">
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

      {/* 特集の一覧へ（店 1 軒の記事は一覧に載っていないので、レールは出さずリンクだけ） */}
      <section className="vF-tabs vK-all" aria-label="特集の一覧">
        <div className="vF-tabs-in">
          <Link href="/feature" className="vK-btn vK-btn--ghost" data-cursor="VIEW">
            特集の一覧へ →
          </Link>
        </div>
      </section>
    </>
  );
}
