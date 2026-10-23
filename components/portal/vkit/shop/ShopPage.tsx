import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import Nm from "../common/Nm";
import { IconArrow, IconExternal } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { vkLinks, type VkConfig } from "../config";
import { IconNoPhoto, TagIcon } from "../search/VkIcons";
import { searchHref } from "../search/data";
import TrackedA from "./Track";
import ShopTabs, { type ShopTab } from "./ShopTabs";
import PhotoRail from "./PhotoRail";
import { ShareButton } from "./Actions";
import { FacIcon, RowIconEl } from "./FacIcons";
import { loadShopDetail, type Sec, type SPhoto, type ShopDetail } from "./data";
import { localBusiness, breadcrumb } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { shareTarget } from "@/lib/portal/share";
import { VERTICALS } from "@/lib/verticals";
import { visualLen } from "../common/live";
import "./shop.css";

/**
 * 店の紹介ページ(本番 /activity/shop/{id}・/sports/shop/{id}・/life/shop/{id})。ステイの決定デザイン「店舗紹介」と同じ組み立て・大きさ・余白で、中身は実在の店(getPlaces(業種))。
 *   濃い面の帯 → パンくず → 写真 3 枚+右の箱(種類・事実の欄・「公式サイトで確認」・シェア)→ 追従タブ →
 *   「ご案内」(横長の大きな写真に見出し 2 行+文を重ねる)→ 紹介記事の節 3 つ(1 つめは左に文・右に写真の横送り、2・3 つめは左に文・右に大 1+小 2)→
 *   設備・サービス(アイコンが横に並ぶ)→ 基本情報・アクセス・Google マップ → 紹介記事。
 * 文は紹介記事(Place.article)の事実だけ(data.ts)。長い説明は各節の「〇〇の詳細を見る」で開く。CSS は shop.css(接頭辞 vs-)。
 * 値が無い欄・節は出さない(空の枠・空の見出しを出さない)。写真が少ない店でも、節の写真の枚数が減るだけで形は崩れない。
 *
 * ステイの見本から置き換えた・外した欄(規約: 料金・星・評価・口コミ・おすすめ・架空の店名・体験した言い回し・仮の値は出さない):
 *  - 右の箱の料金・日付と人数の選択 → 種類・札・事実の欄(最寄り駅・所在地・営業時間・定休日・電話。選べない表示)と「公式サイトで確認」の外部リンク
 *  - 「口コミ」のタブと節 → 外した / 「特集記事」→「紹介記事」(その店の記事のページへ)
 *  - 客室・温泉・お食事の節(宿の紹介) → 紹介記事の節(場所・時間・アクセスの節を除いた先頭の 3 つ)。見出しは記事の見出しのまま
 */

const nameSize = (n: number) => (n <= 10 ? "xl" : n <= 18 ? "l" : n <= 30 ? "m" : "s");
const bigSize = (t: string) => (visualLen(t) <= 5 ? "xl" : visualLen(t) <= 7 ? "l" : visualLen(t) <= 9 ? "m" : "s");
const u = (n: number) => ({ ["--d" as string]: `${n}ms` }) as CSSProperties;

function Photo({ p, eager, className = "" }: { p: SPhoto; eager?: boolean; className?: string }) {
  return <img className={className} src={p.src} width={p.w} height={p.h} alt={p.alt} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchPriority: "high" as const } : {})} />;
}

// ------------------------------------------------------------------ ヒーロー
function Hero({ cfg, d }: { cfg: VkConfig; d: ShopDetail }) {
  const s = d.shop;
  const [p0, p1, p2] = d.hero;
  const kick = [s.prefName, s.city].filter(Boolean).join("・");
  const primary = s.officialUrl ? { href: s.officialUrl, kind: "website" as const, label: cfg.shop.official, ext: true } : s.phone ? { href: `tel:${s.phone.replace(/[^\d+]/g, "")}`, kind: "phone" as const, label: "電話で問い合わせる", ext: false } : { href: d.mapHref, kind: "map" as const, label: "Googleマップで見る", ext: true };
  const pn = d.panel;
  return (
    <section className="vs-hero" data-n={d.hero.length} aria-label={s.name}>
      <div className={`vs-hero-main vk-live ${p0 ? "" : "vs-hero-main--none"}`}>
        {p0 ? <Photo p={p0} eager className="vs-hero-img vk-kb" /> : null}
        {!p0 ? (
          <span className="vs-nophoto" aria-hidden="true">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        ) : null}
        <span className="vs-hero-shade" aria-hidden="true" />
        <div className="vs-hero-cap">
          {kick ? <p className="vs-hero-kick">{kick}</p> : null}
          <h1 className={`vs-hero-name vs-hero-name--${nameSize(s.name.length)}`}>
            <MaskLines lines={[<Nm key="n" text={s.name} />]} delay={120} />
          </h1>
          {d.tagline ? (
            <Reveal as="p" variant="fade" className="vs-hero-tag" delay={520}>
              <Nm text={d.tagline} />
            </Reveal>
          ) : null}
        </div>
      </div>
      {p1 ? (
        <div className="vs-hero-s1 vk-zoom">
          <Photo p={p1} eager />
        </div>
      ) : null}
      {p2 ? (
        <div className="vs-hero-s2 vk-zoom">
          <Photo p={p2} eager />
        </div>
      ) : null}
      <aside className="vs-panel io" data-io="right" aria-label={`${cfg.noun}のご案内`}>
        {pn.cap ? <p className="vs-panel-cap">{pn.cap}</p> : null}
        {pn.big ? <p className={`vs-panel-big vs-panel-big--${bigSize(pn.big)}`}>{pn.big}</p> : null}
        {pn.pills.length > 0 ? (
          <ul className="vs-tags" aria-label="特徴">
            {pn.pills.map((t) => (
              <li key={t} className="vs-tag">
                <TagIcon label={t} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {pn.boxes.length > 0 ? (
          <ul className="vs-boxes">
            {pn.boxes.map((b) => (
              <li key={b.l} className="vs-box">
                <RowIconEl k={b.icon} />
                <span className="vs-box-t">
                  <span className="vs-box-l">{b.l}</span>
                  <span className="vs-box-v">{b.v}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <TrackedA href={primary.href} kind={primary.kind} storeId={s.id} page={d.path} external={primary.ext} className="vk-btn vs-official">
          <span>{primary.label}</span>
          {primary.ext ? <IconExternal /> : <IconArrow />}
        </TrackedA>
        <div className="vs-acts">
          <ShareButton noun={cfg.noun} url={shareTarget(d.path)} title={`${s.name}｜${cfg.brand}`} storeId={s.id} page={d.path} />
        </div>
      </aside>
    </section>
  );
}

// ------------------------------------------------------------------ ご案内(横長の写真に見出し 2 行+文を重ねる)
function Intro({ d }: { d: ShopDetail }) {
  const bg = d.banner;
  if (d.intro.h.length === 0 && d.intro.p.length === 0) return <span id="vs-top" />;
  return (
    <section className={`vs-intro ${bg ? "vs-intro--ph" : ""}`} id="vs-top" aria-labelledby="vs-intro-h">
      {bg ? (
        <div className="vs-intro-bg" aria-hidden="true">
          <Photo p={{ ...bg, alt: "" }} className="vs-intro-img vk-scroll-zoom" />
          <span className="vs-intro-wash" />
        </div>
      ) : null}
      <div className="vs-intro-in">
        <h2 id="vs-intro-h" className="vs-intro-h">
          <MaskLines lines={(d.intro.h.length ? d.intro.h : [d.shop.name]).map((t) => <Nm key={t} text={t} />)} step={120} />
        </h2>
        <div className="vs-intro-ps">
          {d.intro.p.map((t, i) => (
            <Reveal as="p" key={i} variant="fade" className="vs-intro-p" delay={260 + i * 90}>
              {t}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 紹介記事の節(3 つまで)
/** 「〇〇の詳細を見る」(押すと、記事の節の全文がその場で開く) */
function More({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="vs-more">
      <summary className="vs-pill">
        <span>{label}</span>
        <IconArrow />
      </summary>
      <div className="vs-more-b">{children}</div>
    </details>
  );
}

function MoreLinks({ d }: { d: ShopDetail }) {
  const s = d.shop;
  return (
    <p className="vs-more-l">
      {d.article ? (
        <a href={d.article.href} className="vs-link">
          紹介記事で読む
        </a>
      ) : null}
      {s.officialUrl ? (
        <TrackedA href={s.officialUrl} kind="website" storeId={s.id} page={d.path} className="vs-link">
          公式サイトで見る
          <IconExternal />
        </TrackedA>
      ) : null}
    </p>
  );
}

function Head({ label, en }: { label: string; en: string }) {
  return (
    <>
      <h2 className="vs-ttl">{label}</h2>
      <p className="vs-en">{en}</p>
    </>
  );
}

function Section({ d, s }: { d: ShopDetail; s: Sec }) {
  const hasPh = s.photos.length > 0;
  return (
    <section className={`vs-sec ${s.slot === "a" ? "vs-rooms" : "vs-mos-sec"} io`} id={s.id} aria-label={s.label}>
      <div className="vs-st">
        <Head label={s.label} en={s.en} />
        {s.h.length > 0 ? (
          <h3 className="vs-blk-h">
            {s.h.map((t, i) => (
              <span key={i} className="vs-blk-hl">
                <Nm text={t} />
              </span>
            ))}
          </h3>
        ) : null}
        <div className="vs-blk-ps">
          <p className="vs-blk-p">{s.p.join("")}</p>
        </div>
        <More label={s.btn}>
          {s.detail.length > 0 ? s.detail.map((t, i) => <p key={i}>{t}</p>) : <p>{s.p.join("")}</p>}
          <MoreLinks d={d} />
        </More>
      </div>
      {hasPh ? (
        <div className="vs-sm">
          {s.slot === "a" ? (
            <PhotoRail photos={s.photos} name={d.shop.name} label={s.label} />
          ) : (
            <div className="vs-mos" data-n={s.photos.length}>
              {s.photos.map((p, i) => (
                <div key={p.src} className={`vs-mos-i vs-mos-i--${i} vk-zoom`}>
                  <Photo p={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

// ------------------------------------------------------------------ 施設・サービス
function Facility({ d }: { d: ShopDetail }) {
  if (d.facilities.length === 0) return null;
  return (
    <section className="vs-fac io" id="vs-facility" aria-label="設備・サービス">
      <div className="vs-fac-h">
        <Head label="設備・サービス" en="FACILITY" />
      </div>
      <ul className="vs-fac-l" data-n={d.facilities.length} data-io-group>
        {d.facilities.map((f) => (
          <li key={f.t} className="vs-fac-i io">
            <FacIcon k={f.k} />
            <span>{f.t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------------ 基本情報・アクセス・地図
function Info({ d }: { d: ShopDetail }) {
  const s = d.shop;
  return (
    <section className="vs-info" id="vs-access" aria-label="基本情報とアクセス">
      <div className="vs-basic io" data-io="left">
        <h2 className="vs-info-h">基本情報</h2>
        <dl className="vs-dl">
          {d.rows.map((r) => (
            <div key={r.k} className="vs-dl-r">
              <dt>{r.k}</dt>
              <dd>
                {r.kind === "tel" ? (
                  <TrackedA href={`tel:${r.v.replace(/[^\d+]/g, "")}`} kind="phone" storeId={s.id} page={d.path} external={false} className="vs-link">
                    {r.v}
                  </TrackedA>
                ) : r.kind === "url" && r.href ? (
                  <TrackedA href={r.href} kind="website" storeId={s.id} page={d.path} className="vs-link">
                    {r.v}
                    <IconExternal />
                  </TrackedA>
                ) : (
                  r.v
                )}
                {r.note ? <span className="vs-dl-n">{r.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="vs-acc io" data-io="fade" style={u(100)}>
        <h2 className="vs-info-h">アクセス</h2>
        <ul className="vs-acc-l">
          {d.access.map((a, i) => (
            <li key={`${a.label}-${i}`}>
              <RowIconEl k={a.icon} className="vs-acc-i" />
              <div>
                <p className="vs-acc-lab">{a.label}</p>
                <p className="vs-acc-t">{a.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {d.accessDetail.length > 0 ? (
          <More label="詳しいアクセス情報を見る">
            {d.accessDetail.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            <p className="vs-more-l">
              <TrackedA href={d.mapHref} kind="map" storeId={s.id} page={d.path} className="vs-link">
                Googleマップで見る
                <IconExternal />
              </TrackedA>
            </p>
          </More>
        ) : (
          <TrackedA href={d.mapHref} kind="map" storeId={s.id} page={d.path} className="vs-pill vs-pill--wide">
            <span>Googleマップで見る</span>
            <IconExternal />
          </TrackedA>
        )}
      </div>
      <div className="vs-map io" style={u(180)}>
        <iframe src={d.mapSrc} title={`${s.name}の地図(Googleマップ)`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 紹介記事
function Special({ d, noun }: { d: ShopDetail; noun: string }) {
  const a = d.article;
  if (!a) return null;
  return (
    <section className="vs-sp io" aria-label="紹介記事">
      <div className="vs-sp-h">
        <Head label="紹介記事" en="ARTICLE" />
      </div>
      <a href={a.href} className={`vs-sp-a vk-hov ${a.photo ? "" : "vs-sp-a--nophoto"}`}>
        {a.photo ? (
          <span className="vs-sp-ph vk-zoom">
            <Photo p={{ ...a.photo, alt: "" }} />
          </span>
        ) : null}
        <span className="vs-sp-t">
          <span className="vs-sp-k">この{noun}の紹介</span>
          <span className="vs-sp-title">
            <Nm text={a.title} />
          </span>
        </span>
        <span className="vk-arrow vs-sp-arrow" aria-hidden="true">
          <IconArrow />
        </span>
      </a>
    </section>
  );
}

// ------------------------------------------------------------------ ページ
/** 店の紹介ページの中身(サーバー)。d は loadShopDetail の結果 */
export function ShopView({ cfg, d }: { cfg: VkConfig; d: ShopDetail }) {
  const L = vkLinks(cfg);
  const v = VERTICALS[cfg.key];
  const s = d.shop;
  const ph = s.photo?.src;
  const ld: Record<string, unknown> = {
    ...localBusiness(d.place, d.schemaType),
    ...(s.article?.headline ? { description: s.article.headline } : {}),
    // 画像は絶対URL(自サイトの画像は日本語を percent-encode する)
    ...(ph ? { image: ph.startsWith("/") ? absUrl(encodeURI(ph)) : ph } : {}),
  };
  if (!ld.url) ld.url = `${SITE_URL}${d.path}`;
  const crumbItems = [
    { label: "トップ", href: L.home },
    ...(s.prefName ? [{ label: s.prefName, href: searchHref(cfg, { pref: s.pref }) }] : []),
    ...(s.city ? [{ label: s.city }] : []),
    { label: s.name },
  ];
  const crumbLd = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    ...(s.prefName ? [{ name: s.prefName, url: absUrl(searchHref(cfg, { pref: s.pref })) }] : []),
    { name: s.name, url: absUrl(d.path) },
  ]);
  const tabs: ShopTab[] = [
    { id: "vs-top", label: "トップ" },
    ...d.secs.map((x) => ({ id: x.id, label: x.label })),
    ...(d.facilities.length ? [{ id: "vs-facility", label: "設備・サービス" }] : []),
    { id: "vs-access", label: "アクセス" },
  ];
  return (
    <Shell cfg={cfg} page="shop">
      <JsonLd data={ld} />
      <JsonLd data={crumbLd} />
      <div className="vs">
        <div className="vs-crumbs-w">
          <Crumbs items={crumbItems} className="vs-crumbs" />
        </div>
        <Hero cfg={cfg} d={d} />
        <ShopTabs tabs={tabs} />
        <Intro d={d} />
        {d.secs.map((x) => (
          <Section key={x.id} d={d} s={x} />
        ))}
        <Facility d={d} />
        <Info d={d} />
        <Special d={d} noun={cfg.noun} />
        <p className="vs-note">{cfg.shop.note}</p>
      </div>
    </Shell>
  );
}

export function vkShopPage(cfg: VkConfig) {
  async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const d = await loadShopDetail(cfg, id);
    if (!d) notFound();
    return <ShopView cfg={cfg} d={d} />;
  }
  return { Page };
}
