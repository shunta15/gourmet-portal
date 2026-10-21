import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import { IconArrow, IconExternal } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { syLinks } from "../common/site";
import { IconNoPhoto, TagIcon } from "../search/StayIcons";
import { searchHref } from "../search/data";
import TrackedA from "./Track";
import ShopTabs, { type ShopTab } from "./ShopTabs";
import PhotoRail from "./PhotoRail";
import { FavButton, ShareButton } from "./Actions";
import { FacIcon, RowIconEl } from "./FacIcons";
import { loadStayShopDetail, type Sec, type SPhoto, type ShopDetail } from "./data";
import { localBusiness, breadcrumb } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { shareTarget } from "@/lib/portal/share";
import { VERTICALS } from "@/lib/verticals";
import { visualLen } from "../common/live";
import "./shop.css";

/**
 * 宿の紹介ページ(本番 /stay/shop/{id})。オーナーの見本「2_店舗紹介」と同じ組み立て・大きさ・余白で、中身は実在の宿(getPlaces('stay'))。
 *   濃紺の帯 → パンくず → 写真 3 枚+右の箱(種類・事実の欄・「公式サイトで空室・料金を確認」・お気に入り・シェア)→ 追従タブ →
 *   「この宿で過ごす時間」(横長の大きな写真に見出し 2 行+文を重ねる)→ 客室(左に文・右に写真の横送り)→ 温泉(左に文・右に大 1+小 2)→ お食事(同)→
 *   施設・サービス(アイコンが横に並ぶ)→ 基本情報・アクセス・Google マップ → 紹介記事。
 * 文は copy.ts(宿ごとに記事の事実から書いた短い文)。長い説明は各節の「〇〇の詳細を見る」で開く。CSS は shop.css(接頭辞 sh-)。
 * 値が無い欄・節は出さない(空の枠・空の見出しを出さない)。写真が少ない宿でも、節の写真の枚数が減るだけで形は崩れない。
 *
 * 見本から置き換えた・外した欄(規約: 料金・星・評価・口コミ・おすすめ・架空の宿名・泊まった体験・仮の値は出さない):
 *  - 右の箱の「28,000円〜」「ベストレート」・日付と人数の選択 → 宿の種類・札・事実の欄(チェックイン/アウトの時刻・所在地・客室など。選べない表示)と「公式サイトで空室・料金を確認」の外部リンク
 *  - 「口コミ」のタブと節 → 外した / 「特集記事」→「紹介記事」(その宿の記事のページへ。特集のデータは未整備)
 *  - 客室・温泉・お食事の詩的な見出しと文 → 紹介記事の事実だけで書いた短い見出しと文。温泉の札が無い宿は「お風呂」、お風呂が無ければ共用スペース・庭など、食事を出さない宿はキッチン・BBQ など事実のある節
 *  - 「閲覧履歴」(ヘッダー)は共通部品の帯のまま(検索・お気に入り・メニュー)
 */

const nameSize = (n: number) => (n <= 10 ? "xl" : n <= 18 ? "l" : n <= 30 ? "m" : "s");
const bigSize = (t: string) => (visualLen(t) <= 5 ? "xl" : visualLen(t) <= 7 ? "l" : visualLen(t) <= 9 ? "m" : "s");
const u = (n: number) => ({ ["--d" as string]: `${n}ms` }) as CSSProperties;

function Photo({ p, eager, className = "" }: { p: SPhoto; eager?: boolean; className?: string }) {
  return <img className={className} src={p.src} width={p.w} height={p.h} alt={p.alt} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchPriority: "high" as const } : {})} />;
}

// ------------------------------------------------------------------ ヒーロー
function Hero({ d }: { d: ShopDetail }) {
  const s = d.shop;
  const [p0, p1, p2] = d.hero;
  const kick = [s.prefName, s.city].filter(Boolean).join("・");
  const primary = s.officialUrl ? { href: s.officialUrl, kind: "website" as const, label: "公式サイトで空室・料金を確認", ext: true } : s.phone ? { href: `tel:${s.phone.replace(/[^\d+]/g, "")}`, kind: "phone" as const, label: "電話で問い合わせる", ext: false } : { href: d.mapHref, kind: "map" as const, label: "Googleマップで見る", ext: true };
  const pn = d.panel;
  return (
    <section className="sh-hero" data-n={d.hero.length} aria-label={s.name}>
      <div className={`sh-hero-main sy-live ${p0 ? "" : "sh-hero-main--none"}`}>
        {p0 ? <Photo p={p0} eager className="sh-hero-img sy-kb" /> : null}
        {!p0 ? (
          <span className="sh-nophoto" aria-hidden="true">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        ) : null}
        <span className="sh-hero-shade" aria-hidden="true" />
        <div className="sh-hero-cap">
          {kick ? <p className="sh-hero-kick">{kick}</p> : null}
          <h1 className={`sh-hero-name sh-hero-name--${nameSize(s.name.length)}`}>
            <MaskLines lines={[s.name]} delay={120} />
          </h1>
          {d.tagline ? (
            <Reveal as="p" variant="fade" className="sh-hero-tag" delay={520}>
              {d.tagline}
            </Reveal>
          ) : null}
        </div>
      </div>
      {p1 ? (
        <div className="sh-hero-s1 sy-zoom">
          <Photo p={p1} eager />
        </div>
      ) : null}
      {p2 ? (
        <div className="sh-hero-s2 sy-zoom">
          <Photo p={p2} eager />
        </div>
      ) : null}
      <aside className="sh-panel io" data-io="right" aria-label="宿のご案内と空室・料金の確認">
        {pn.cap ? <p className="sh-panel-cap">{pn.cap}</p> : null}
        {pn.big ? <p className={`sh-panel-big sh-panel-big--${bigSize(pn.big)}`}>{pn.big}</p> : null}
        {pn.pills.length > 0 ? (
          <ul className="sh-tags" aria-label="特徴">
            {pn.pills.map((t) => (
              <li key={t} className="sh-tag">
                <TagIcon label={t} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {pn.boxes.length > 0 ? (
          <ul className="sh-boxes">
            {pn.boxes.map((b) => (
              <li key={b.l} className="sh-box">
                <RowIconEl k={b.icon} />
                <span className="sh-box-t">
                  <span className="sh-box-l">{b.l}</span>
                  <span className="sh-box-v">{b.v}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <TrackedA href={primary.href} kind={primary.kind} storeId={s.id} page={d.path} external={primary.ext} className="sy-btn sh-official">
          <span>{primary.label}</span>
          {primary.ext ? <IconExternal /> : <IconArrow />}
        </TrackedA>
        <div className="sh-acts">
          <FavButton name={s.name} />
          <ShareButton url={shareTarget(d.path)} title={`${s.name}｜${VERTICALS.stay.brand}`} storeId={s.id} page={d.path} />
        </div>
      </aside>
    </section>
  );
}

// ------------------------------------------------------------------ この宿で過ごす時間(横長の写真に見出し 2 行+文を重ねる)
function Intro({ d }: { d: ShopDetail }) {
  const bg = d.banner;
  if (d.intro.h.length === 0 && d.intro.p.length === 0) return <span id="sh-top" />;
  return (
    <section className={`sh-intro ${bg ? "sh-intro--ph" : ""}`} id="sh-top" aria-labelledby="sh-intro-h">
      {bg ? (
        <div className="sh-intro-bg" aria-hidden="true">
          <Photo p={{ ...bg, alt: "" }} className="sh-intro-img sy-scroll-zoom" />
          <span className="sh-intro-wash" />
        </div>
      ) : null}
      <div className="sh-intro-in">
        <h2 id="sh-intro-h" className="sh-intro-h">
          <MaskLines lines={d.intro.h.length ? d.intro.h : [d.shop.name]} step={120} />
        </h2>
        <div className="sh-intro-ps">
          {d.intro.p.map((t, i) => (
            <Reveal as="p" key={i} variant="fade" className="sh-intro-p" delay={260 + i * 90}>
              {t}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 客室・温泉・お食事
/** 「〇〇の詳細を見る」(押すと、記事の節の全文がその場で開く) */
function More({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="sh-more">
      <summary className="sh-pill">
        <span>{label}</span>
        <IconArrow />
      </summary>
      <div className="sh-more-b">{children}</div>
    </details>
  );
}

function MoreLinks({ d }: { d: ShopDetail }) {
  const s = d.shop;
  return (
    <p className="sh-more-l">
      {d.article ? (
        <a href={d.article.href} className="sh-link">
          紹介記事で読む
        </a>
      ) : null}
      {s.officialUrl ? (
        <TrackedA href={s.officialUrl} kind="website" storeId={s.id} page={d.path} className="sh-link">
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
      <h2 className="sh-ttl">{label}</h2>
      <p className="sh-en">{en}</p>
    </>
  );
}

function Section({ d, s }: { d: ShopDetail; s: Sec }) {
  const hasPh = s.photos.length > 0;
  return (
    <section className={`sh-sec ${s.slot === "a" ? "sh-rooms" : "sh-mos-sec"} io`} id={s.id} aria-label={s.label}>
      <div className="sh-st">
        <Head label={s.label} en={s.en} />
        {s.h.length > 0 ? (
          <h3 className="sh-blk-h">
            {s.h.map((t, i) => (
              <span key={i} className="sh-blk-hl">
                {t}
              </span>
            ))}
          </h3>
        ) : null}
        <div className="sh-blk-ps">
          <p className="sh-blk-p">{s.p.join("")}</p>
        </div>
        <More label={s.btn}>
          {s.detail.length > 0 ? s.detail.map((t, i) => <p key={i}>{t}</p>) : <p>{s.p.join("")}</p>}
          <MoreLinks d={d} />
        </More>
      </div>
      {hasPh ? (
        <div className="sh-sm">
          {s.slot === "a" ? (
            <PhotoRail photos={s.photos} name={d.shop.name} label={s.label} />
          ) : (
            <div className="sh-mos" data-n={s.photos.length}>
              {s.photos.map((p, i) => (
                <div key={p.src} className={`sh-mos-i sh-mos-i--${i} sy-zoom`}>
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
    <section className="sh-fac io" id="sh-facility" aria-label="施設・サービス">
      <div className="sh-fac-h">
        <Head label="施設・サービス" en="FACILITY" />
      </div>
      <ul className="sh-fac-l" data-n={d.facilities.length} data-io-group>
        {d.facilities.map((f) => (
          <li key={f.t} className="sh-fac-i io">
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
    <section className="sh-info" id="sh-access" aria-label="基本情報とアクセス">
      <div className="sh-basic io" data-io="left">
        <h2 className="sh-info-h">基本情報</h2>
        <dl className="sh-dl">
          {d.rows.map((r) => (
            <div key={r.k} className="sh-dl-r">
              <dt>{r.k}</dt>
              <dd>
                {r.kind === "tel" ? (
                  <TrackedA href={`tel:${r.v.replace(/[^\d+]/g, "")}`} kind="phone" storeId={s.id} page={d.path} external={false} className="sh-link">
                    {r.v}
                  </TrackedA>
                ) : r.kind === "url" && r.href ? (
                  <TrackedA href={r.href} kind="website" storeId={s.id} page={d.path} className="sh-link">
                    {r.v}
                    <IconExternal />
                  </TrackedA>
                ) : (
                  r.v
                )}
                {r.note ? <span className="sh-dl-n">{r.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="sh-acc io" data-io="fade" style={u(100)}>
        <h2 className="sh-info-h">アクセス</h2>
        <ul className="sh-acc-l">
          {d.access.map((a, i) => (
            <li key={`${a.label}-${i}`}>
              <RowIconEl k={a.icon} className="sh-acc-i" />
              <div>
                <p className="sh-acc-lab">{a.label}</p>
                <p className="sh-acc-t">{a.text}</p>
              </div>
            </li>
          ))}
        </ul>
        {d.accessDetail.length > 0 ? (
          <More label="詳しいアクセス情報を見る">
            {d.accessDetail.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            <p className="sh-more-l">
              <TrackedA href={d.mapHref} kind="map" storeId={s.id} page={d.path} className="sh-link">
                Googleマップで見る
                <IconExternal />
              </TrackedA>
            </p>
          </More>
        ) : (
          <TrackedA href={d.mapHref} kind="map" storeId={s.id} page={d.path} className="sh-pill sh-pill--wide">
            <span>Googleマップで見る</span>
            <IconExternal />
          </TrackedA>
        )}
      </div>
      <div className="sh-map io" style={u(180)}>
        <iframe src={d.mapSrc} title={`${s.name}の地図(Googleマップ)`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 紹介記事
function Special({ d }: { d: ShopDetail }) {
  const a = d.article;
  if (!a) return null;
  return (
    <section className="sh-sp io" aria-label="紹介記事">
      <div className="sh-sp-h">
        <Head label="紹介記事" en="ARTICLE" />
      </div>
      <a href={a.href} className={`sh-sp-a sy-hov ${a.photo ? "" : "sh-sp-a--nophoto"}`}>
        {a.photo ? (
          <span className="sh-sp-ph sy-zoom">
            <Photo p={{ ...a.photo, alt: "" }} />
          </span>
        ) : null}
        <span className="sh-sp-t">
          <span className="sh-sp-k">この宿の紹介</span>
          <span className="sh-sp-title">{a.title}</span>
        </span>
        <span className="sy-arrow sh-sp-arrow" aria-hidden="true">
          <IconArrow />
        </span>
      </a>
    </section>
  );
}

// ------------------------------------------------------------------ ページ
/** 宿の紹介ページの中身(サーバー)。d は loadStayShopDetail の結果 */
export function ShopView({ d }: { d: ShopDetail }) {
  const L = syLinks("live");
  const v = VERTICALS.stay;
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
    ...(s.prefName ? [{ label: s.prefName, href: searchHref({ pref: s.pref }) }] : []),
    ...(s.city ? [{ label: s.city }] : []),
    { label: s.name },
  ];
  const crumbLd = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    ...(s.prefName ? [{ name: s.prefName, url: absUrl(searchHref({ pref: s.pref })) }] : []),
    { name: s.name, url: absUrl(d.path) },
  ]);
  const tabs: ShopTab[] = [
    { id: "sh-top", label: "トップ" },
    ...d.secs.map((x) => ({ id: x.id, label: x.label })),
    ...(d.facilities.length ? [{ id: "sh-facility", label: "施設・サービス" }] : []),
    { id: "sh-access", label: "アクセス" },
  ];
  return (
    <Shell page="shop" mode="live">
      <JsonLd data={ld} />
      <JsonLd data={crumbLd} />
      <div className="sh">
        <div className="sh-crumbs-w">
          <Crumbs items={crumbItems} className="sh-crumbs" />
        </div>
        <Hero d={d} />
        <ShopTabs tabs={tabs} />
        <Intro d={d} />
        {d.secs.map((x) => (
          <Section key={x.id} d={d} s={x} />
        ))}
        <Facility d={d} />
        <Info d={d} />
        <Special d={d} />
        <p className="sh-note">宿の情報は変わることがあります。空室・料金・最新の案内は、公式サイトなどでご確認ください。</p>
      </div>
    </Shell>
  );
}

export function stayShopPage() {
  async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const d = await loadStayShopDetail(id);
    if (!d) notFound();
    return <ShopView d={d} />;
  }
  return { Page };
}
