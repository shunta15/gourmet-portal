import Link from "next/link";
import type { CSSProperties } from "react";
import type { BsShop } from "@/lib/portal/vert/bodyshop/model";
import type { GreenShop } from "@/lib/portal/vert/bodygreen/types";
import { BASE, IMG, searchHref } from "../common/site";
import { MaskLines, Write } from "../common/Motion";
import ShopCard from "../common/ShopCard";
import ShopTabs from "./ShopTabs";
import TapLink from "./TapLink";
import "./shop.css";

/**
 * 店の詳細 + 特集記事(1 店 1 ページ。見本 mock-shop の見た目を、本番のデータ loadBsShop の中身で出す)。
 * 店の詳細と店の特集記事は同じページ: 「特集記事」の節に、店の記事(panels)をそのまま回して出す。記事の無い店は節とタブごと出さない。
 * データに無い物(星・点数・口コミ・料金・スタッフ・設備・徒歩分・支払い方法・〒)は出さない。写真は実在の店の写真だけ(0 枚の店は種類の色の面+店名)。
 * 画像: 飾り(端の若葉・葉)だけ public/_portal/bcproto/green/shop/ の AI 画像。店の写真は shop.photos(本番の写真)。
 */
const P = `${IMG}/shop`;

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PinSvg = ({ w = 12, h = 16 }: { w?: number; h?: number }) => (
  <svg viewBox="0 0 24 32" width={w} height={h} aria-hidden="true">
    <path d="M12 1.5C6.2 1.5 2 5.8 2 11.3c0 7.2 10 18.7 10 18.7s10-11.5 10-18.7C22 5.8 17.8 1.5 12 1.5z" fill="#2f5a3d" />
    <circle cx="12" cy="11.2" r="4" fill="#fff" />
  </svg>
);
const PhoneSvg = ({ s = 20, c = "currentColor" }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1z" fill={c} />
  </svg>
);
const CalSvg = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M8 13.5h1.5M11.3 13.5h1.5M14.6 13.5h1.5M8 16.8h1.5M11.3 16.8h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const GlobeSvg = () => (
  <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5S9.4 5.9 12 3.5z" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const LeafSvg = ({ s = 24 }: { s?: number }) => (
  <svg viewBox="0 0 28 28" width={s} height={s} aria-hidden="true" className="gr-sway">
    <path d="M4 24C5 13 12 5 24 4c0 11-6 19-17 20" fill="#7fae86" opacity=".85" />
    <path d="M4 24C9 17 14 12 21 8" stroke="#2f5a3d" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    <path d="M8 18c-2.2-.2-3.6.6-4.4 1.8M12 14c-.2-2.2.3-3.6 1.4-4.6" stroke="#2f5a3d" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
);
const CheckSvg = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="#eaf1e5" />
    <path d="M7.5 12.4l3 3 6-6.6" fill="none" stroke="#2f5a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 「2026-10-09」→「2026.10.09」 */
const dotDate = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.replace(/-/g, ".") : "");
const httpOnly = (u: string) => /^https?:\/\//i.test(u);

export default function ShopPage({ shop, gs, sameArea, sameKind }: { shop: BsShop; gs?: GreenShop; sameArea: GreenShop[]; sameKind: GreenShop[] }) {
  const photos = shop.photos;
  const hero = photos[0] ?? null;
  const gal = photos.slice(1, 6);
  const link = (k: string) => shop.links.find((l) => l.kind === k);
  const phoneLink = link("phone");
  const mapLink = link("map");
  const reserveLink = link("reserve");
  const siteLink = link("website");
  const snsLinks = shop.links.filter((l) => ["instagram", "tiktok", "x", "facebook", "line"].includes(l.kind));
  const phoneText = shop.facts.find((f) => f.k === "電話")?.v[0] ?? "";
  const hoursLines = shop.facts.find((f) => f.k === "営業時間")?.v ?? [];
  const tags = gs?.tags ?? [];
  const second = reserveLink ?? siteLink ?? null;

  // 記事: panels[0] = 店の紹介(紹介文)。panels[1..] = 特集記事の本文(特集のある店は引用・結びも)
  const intro = shop.panels[0];
  const body = shop.panels.slice(1);
  const hasArticle = body.length > 0 || !!shop.quote || shop.closing.length > 0;
  const checked = dotDate(shop.checkedAt);
  const sources = shop.sources.filter((s) => httpOnly(s.url));

  const hasLeft = !!intro || shop.menus.length > 0 || hasArticle;

  const TABS = [
    { id: "sh-top", label: "トップ" },
    ...(intro ? [{ id: "sh-intro", label: "店の紹介" }] : []),
    ...(shop.menus.length > 0 ? [{ id: "sh-menu", label: "メニュー" }] : []),
    ...(hasArticle ? [{ id: "sh-article", label: "特集記事" }] : []),
    { id: "sh-access", label: "店舗情報" },
  ];

  const area = shop.city || shop.prefName;
  const nameSize = shop.name.length <= 13 ? "l" : shop.name.length <= 21 ? "m" : "s";
  const galN = gal.length;
  const darkFace = gs?.kindDark ?? false;

  return (
    <div data-gr-page="shop" className="sh">
      {/* ========== ヒーロー ========== */}
      <section className="sh-hero" id="sh-top">
        <div className="sh-hero-bg" aria-hidden="true" />
        <div className={`sh-w sh-hero-grid${galN > 0 ? " has-gal" : ""}`}>
          <div className="sh-hero-txt">
            <nav className="sh-crumb" aria-label="パンくず" data-rv="fade">
              <Link href={BASE}>TOP</Link>
              <i />
              <Link href={searchHref({ pref: shop.prefSlug })}>{shop.prefName}</Link>
              {shop.city && (
                <>
                  <i />
                  <span>{shop.city}</span>
                </>
              )}
              <i />
              <span aria-current="page">{shop.name}</span>
            </nav>
            <ul className="sh-tags" data-rv-group>
              <li data-rv="fade">
                <Link href={searchHref({ kind: shop.kindSlug })} className="gr-chip sh-tag">
                  {shop.kindName}
                </Link>
              </li>
              <li data-rv="fade">
                <Link href={searchHref({ pref: shop.prefSlug })} className="gr-chip sh-tag">
                  {shop.prefName}
                </Link>
              </li>
            </ul>
            <MaskLines as="h1" className={`sh-h1 sh-h1--${nameSize}`} lines={[shop.name]} delay={80} />
            {shop.headline && <MaskLines as="p" className="sh-sub" lines={[shop.headline]} delay={260} />}
            <p className="sh-addr" data-rv="fade" style={{ ["--d" as string]: "700ms" } as CSSProperties}>
              <PinSvg />
              <span>{shop.address}</span>
            </p>
            <p className="sh-badge gr-pop gr-float">
              <LeafSvg s={18} />
              <span>
                {shop.prefName} / {shop.kindName}
              </span>
            </p>
          </div>

          <div className="sh-hero-ph">
            {hero ? (
              <div className="sh-heroimg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="gr-kb" src={hero.src} alt={hero.alt} width={hero.w} height={hero.h} fetchPriority="high" decoding="async" />
              </div>
            ) : (
              <div className={`sh-noph${darkFace ? " is-dark" : ""}`} style={{ ["--kc" as string]: gs?.kindColor ?? shop.color } as CSSProperties} role="img" aria-label={`${shop.name}(写真なし)`}>
                <span className="sh-noph-n">{shop.name}</span>
                <span className="sh-noph-k">{shop.kindName}</span>
              </div>
            )}
            {hero && (
              <div className="sh-hand-wrap">
                <Write lines={[`${area}の`, shop.kindName]} className="gr-hand sh-hand" delay={900} step={700} />
              </div>
            )}
          </div>

          {galN > 0 && (
            <div className={`sh-gal sh-gal--${galN}`} data-rv-group>
              {gal.map((ph, i) => (
                <figure key={ph.src} className={`sh-g sh-g${i + 1}`} data-rv="zoom">
                  <div className="gr-zoom sh-gin">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} loading="lazy" decoding="async" />
                  </div>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== 本体 ========== */}
      <div className="sh-w sh-bodyw">
        <ShopTabs items={TABS} />
        <div className={`sh-grid${hasLeft ? "" : " sh-grid--solo"}`}>
          {/* ----- 左の大きな白い箱(紹介・メニュー・記事のどれも無い店は出さない) ----- */}
          {hasLeft && <div className="sh-left">
            {intro && (
              <section className="sh-intro" id="sh-intro">
                <h2 className="sh-hd" data-rv>
                  店の紹介
                </h2>
                {shop.hasStory && intro.heading && (
                  <p className="sh-h2" data-rv style={{ ["--d" as string]: "80ms" } as CSSProperties}>
                    {intro.heading}
                  </p>
                )}
                {intro.sub && (
                  <p className="sh-isub" data-rv>
                    {intro.sub}
                  </p>
                )}
                <div className="sh-cp" data-rv style={{ ["--d" as string]: "120ms" } as CSSProperties}>
                  {[...intro.open, ...intro.rest].map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </section>
            )}

            {shop.menus.length > 0 && (
              <section className="sh-menus" id="sh-menu">
                <div className="sh-mhead" data-rv>
                  <h2 className="sh-hd">メニュー</h2>
                  <img className="sh-leaf gr-sway" src={`${P}/leaf-menu.webp`} alt="" width={50} height={40} />
                </div>
                <ul className="sh-mlist" data-rv-group>
                  {shop.menus.slice(0, 8).map((m, i) => (
                    <li key={`${m}-${i}`} data-rv>
                      <span className="sh-mcard gr-lift">
                        <i className="sh-mno">{String(i + 1).padStart(2, "0")}</i>
                        <span className="sh-mt">{m}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasArticle && (
              <section className="sh-articles" id="sh-article">
                <div className="sh-mhead" data-rv>
                  <h2 className="sh-hd">
                    特集記事<s>|</s>
                    {shop.headline || `${shop.name}について`}
                  </h2>
                </div>
                <div className="sh-art">
                  <div className="sh-art-main">
                    {body.map((pn, bi) => (
                      <article key={pn.no} className="sh-pn" id={`sh-p-${pn.no}`} data-rv>
                        <h3 className="sh-pn-h">
                          <em>{String(bi + 1).padStart(2, "0")}</em>
                          <span>{pn.heading}</span>
                        </h3>
                        {pn.sub && <p className="sh-pn-sub">{pn.sub}</p>}
                        {pn.open.map((t, i) => (
                          <p key={i} className="sh-pn-p">
                            {t}
                          </p>
                        ))}
                        {pn.rest.length > 0 && (
                          <details className="sh-more-d">
                            <summary>
                              <span className="sh-more-open">続きを読む</span>
                              <span className="sh-more-close">閉じる</span>
                            </summary>
                            {pn.rest.map((t, i) => (
                              <p key={i} className="sh-pn-p">
                                {t}
                              </p>
                            ))}
                          </details>
                        )}
                        {pn.specs.length > 0 && (
                          <dl className="sh-specs">
                            {pn.specs.map((sp) => (
                              <div key={sp.k}>
                                <dt>{sp.k}</dt>
                                <dd>{sp.v}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </article>
                    ))}
                    {shop.quote && (
                      <blockquote className="sh-quote" data-rv>
                        <p>{shop.quote}</p>
                        {shop.quoteCite && <cite>{shop.quoteCite}</cite>}
                      </blockquote>
                    )}
                    {shop.closing.length > 0 && (
                      <div className="sh-closing" data-rv>
                        {shop.closing.map((t, i) => (
                          <p key={i} className="sh-pn-p">
                            {t}
                          </p>
                        ))}
                      </div>
                    )}
                    {checked && <p className="sh-checked">情報の確認日 {checked}</p>}
                  </div>
                  {body.length > 0 && (
                    <aside className="sh-toc" aria-label="この記事の内容">
                      <p className="sh-toc-h">
                        <LeafSvg />
                        この記事の内容
                      </p>
                      <ol>
                        {body.map((pn, bi) => (
                          <li key={pn.no}>
                            <a href={`#sh-p-${pn.no}`} className="sh-pt">
                              <em>{String(bi + 1).padStart(2, "0")}</em>
                              <span>{pn.heading}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    </aside>
                  )}
                </div>
              </section>
            )}
          </div>}

          {/* ----- 右の列 ----- */}
          <div className="sh-right">
            <section className="sh-card sh-rsv" aria-label="電話・予約" data-rv>
              {phoneLink ? (
                <TapLink href={phoneLink.href} kind="phone" storeId={shop.id} className="sh-call gr-shimmer gr-press">
                  <PhoneSvg s={19} />
                  電話する
                </TapLink>
              ) : null}
              {phoneText && (
                <p className="sh-tel">
                  <PhoneSvg s={21} c="#1d211e" />
                  {phoneText}
                </p>
              )}
              {hoursLines[0] && <p className="sh-hours">営業時間 {hoursLines[0]}{hoursLines.length > 1 ? " ほか" : ""}</p>}
              {second && (
                <TapLink href={second.href} kind={second.kind === "reserve" ? "reserve" : "website"} storeId={shop.id} external={second.external} className="sh-web gr-press">
                  {second.kind === "reserve" ? <CalSvg /> : <GlobeSvg />}
                  {second.kind === "reserve" ? "予約ページを開く" : "公式サイトを開く"}
                  <svg viewBox="0 0 24 24" width="12" height="12" className="chev" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </TapLink>
              )}
              {tags.length > 0 && (
                <ul className="sh-mini" data-rv-group>
                  {tags.slice(0, 3).map((t) => (
                    <li key={t} className="gr-hov" data-rv="zoom">
                      <span className="gr-bounce">
                        <CheckSvg />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="sh-card sh-info" id="sh-access" data-rv>
              <h2 className="sh-hd">店舗情報</h2>
              <dl className="sh-tbl">
                <div>
                  <dt>店名</dt>
                  <dd>{shop.name}</dd>
                </div>
                {shop.facts
                  .filter((f) => f.k !== "電話")
                  .map((f) => (
                    <div key={f.k}>
                      <dt>{f.k}</dt>
                      <dd>
                        {f.v.map((line, i) => (
                          <span key={i} className="sh-ln">
                            {line}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                {phoneText && (
                  <div>
                    <dt>電話</dt>
                    <dd>{phoneText}</dd>
                  </div>
                )}
                {siteLink && (
                  <div>
                    <dt>公式サイト</dt>
                    <dd>
                      <TapLink href={siteLink.href} kind="website" storeId={shop.id} external className="sh-ext">
                        公式サイトを開く
                      </TapLink>
                    </dd>
                  </div>
                )}
                {snsLinks.length > 0 && (
                  <div>
                    <dt>SNS</dt>
                    <dd className="sh-sns">
                      {snsLinks.map((l) => (
                        <TapLink key={l.kind} href={l.href} kind={l.kind as "instagram" | "tiktok" | "x" | "facebook" | "line"} storeId={shop.id} external={l.external} className="sh-ext">
                          {l.label}
                        </TapLink>
                      ))}
                    </dd>
                  </div>
                )}
                {sources.length > 0 && (
                  <div>
                    <dt>情報の出どころ</dt>
                    <dd className="sh-sns">
                      {sources.map((s) => (
                        <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="sh-ext">
                          {s.label}
                          <span className="gr-sr">(別のタブで開きます)</span>
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
                {checked && (
                  <div>
                    <dt>確認日</dt>
                    <dd>{checked}</dd>
                  </div>
                )}
              </dl>
              {mapLink && (
                <TapLink href={mapLink.href} kind="map" storeId={shop.id} external={mapLink.external} className="sh-map gr-press">
                  <span className="sh-mapcard gr-float">
                    <PinSvg w={20} h={27} />
                    <span>
                      <b>{shop.name}</b>
                      <i>{shop.address}</i>
                    </span>
                  </span>
                  <span className="sh-mapbtn">
                    地図を開く
                    <ArrowSvg />
                  </span>
                </TapLink>
              )}
            </section>
          </div>
        </div>

        {/* ----- あわせて読む(同じ県・同じ種類の店) ----- */}
        {sameArea.length > 0 && (
          <section className="sh-rel" aria-labelledby="sh-rel-a">
            <h2 className="sh-hd" id="sh-rel-a" data-rv>
              同じ県の店<s>|</s>
              {shop.prefName}
            </h2>
            <ul className="sh-rel-g" data-rv-group>
              {sameArea.map((s) => (
                <li key={s.id} data-rv>
                  <ShopCard shop={s} hours={false} as="h3" />
                </li>
              ))}
            </ul>
            <p className="sh-rel-more" data-rv>
              <Link href={searchHref({ pref: shop.prefSlug })} className="sh-more gr-hov">
                {shop.prefName}の店をすべて見る
                <ArrowSvg />
              </Link>
            </p>
          </section>
        )}
        {sameKind.length > 0 && (
          <section className="sh-rel" aria-labelledby="sh-rel-k">
            <h2 className="sh-hd" id="sh-rel-k" data-rv>
              同じ種類の店<s>|</s>
              {shop.kindName}
            </h2>
            <ul className="sh-rel-g" data-rv-group>
              {sameKind.map((s) => (
                <li key={s.id} data-rv>
                  <ShopCard shop={s} hours={false} as="h3" />
                </li>
              ))}
            </ul>
            <p className="sh-rel-more" data-rv>
              <Link href={searchHref({ kind: shop.kindSlug })} className="sh-more gr-hov">
                {shop.kindName}の店をすべて見る
                <ArrowSvg />
              </Link>
            </p>
          </section>
        )}
      </div>

      {/* スマホ: 下に固定の細い帯(電話・予約ページ/公式サイト)。上の予約の箱と同じ出し分け */}
      {(phoneLink || second) && (
        <div className="sh-fixbar" aria-label="電話・予約">
          {phoneLink && (
            <TapLink href={phoneLink.href} kind="phone" storeId={shop.id} className="sh-fix-call gr-press">
              <PhoneSvg s={17} />
              電話する
            </TapLink>
          )}
          {second && (
            <TapLink href={second.href} kind={second.kind === "reserve" ? "reserve" : "website"} storeId={shop.id} external={second.external} className="sh-fix-web gr-press">
              {second.kind === "reserve" ? <CalSvg /> : <GlobeSvg />}
              {second.kind === "reserve" ? "予約ページ" : "公式サイト"}
            </TapLink>
          )}
        </div>
      )}
    </div>
  );
}
