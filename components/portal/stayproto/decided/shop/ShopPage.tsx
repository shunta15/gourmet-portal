import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import { IconArrow, IconExternal, IconPin, StayTypeIcon } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { syLinks } from "../common/site";
import { IconCalendar, IconCar, IconNoPhoto, IconTrain, TagIcon } from "../search/StayIcons";
import { searchHref } from "../search/data";
import TrackedA from "./Track";
import ShopTabs, { type ShopTab } from "./ShopTabs";
import PhotoRail from "./PhotoRail";
import { FavButton, ShareButton } from "./Actions";
import { loadStayShopDetail, type Block, type Group, type SPhoto, type ShopDetail } from "./data";
import { localBusiness, breadcrumb } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { shareTarget } from "@/lib/portal/share";
import { VERTICALS } from "@/lib/verticals";
import "./shop.css";

/**
 * 宿の紹介ページ(本番 /stay/shop/{id})。オーナーの見本「2_店舗紹介」と同じ組み立て(濃紺の帯 → パンくず → 写真 3 枚+右の箱 → 追従タブ →
 * この宿について → 客室 → 温泉 → お食事 → 施設・サービス → 基本情報・アクセス・地図 → 紹介記事)で、中身は実在の宿(getPlaces('stay'))。
 * CSS は shop.css(接頭辞 sh-)。値が無い欄・節は出さない(空の枠・空の見出しを出さない)。写真が無い宿でも壊れない。
 *
 * 見本から置き換えた・外した欄(規約: 料金・星・評価・口コミ・おすすめ・架空の宿名・泊まった体験・仮の値は出さない):
 *  - 右の箱の「28,000円〜」「ベストレート」・チェックイン/アウトの日付と人数の選択 → 「公式サイトで空室・料金を確認」の外部リンクだけ
 *    (チェックイン・チェックアウトの時刻は、宿のデータにあるときだけ、選べない表示として載せる)
 *  - 「口コミ」のタブと節 → 外した
 *  - 「この宿で過ごす時間」(景色の情景の文)→ 「この宿について」。宿の紹介の事実の文だけ
 *  - 客室・温泉・お食事の詩的な見出しと文 → 紹介記事の見出し・本文(点検済みの事実の文)。「客室の詳細を見る」などのボタン → 「公式サイトで見る」(公式サイトがある宿だけ)
 *  - 客室の写真の下の 2 行 → 写真の説明(あるときだけ)。温泉・お食事の写真は、説明の言葉で振り分けた宿の写真だけ
 *  - 施設・サービスの 8 つのアイコン(Wi-Fi・レストランなど)→ 宿のタグ(温泉・ペット同伴など。データにあるものだけ)
 *  - 基本情報の「総客室数」「館内設備」「支払い方法」→ 外した(データに無い)。種類・所在地・最寄り駅・電話・チェックイン/アウト・客室タイプ・公式サイトを、あるものだけ
 *  - アクセスの「電車でお越しの方」「周辺観光」→ 宿のデータにある最寄り駅・記事の交通の文・所在地。地図の画像は使わず、住所を載せた面+「Googleマップで見る」
 *  - 「特集記事」→ 「紹介記事」(その宿の記事のページへ。特集のデータは未整備)
 *  - 「閲覧履歴」(ヘッダー)は共通部品の帯のまま(検索・お気に入り・メニュー)
 */

const nameSize = (n: number) => (n <= 10 ? "xl" : n <= 18 ? "l" : n <= 30 ? "m" : "s");
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
      <aside className="sh-panel io" data-io="right" aria-label="空室・料金の確認">
        <p className="sh-panel-cap">宿泊のご案内</p>
        <p className="sh-panel-h">
          空室・料金は、
          <br />
          公式サイトでご確認ください。
        </p>
        {s.checkIn || s.checkOut ? (
          <ul className="sh-times">
            {s.checkIn ? (
              <li>
                <IconCalendar />
                <span className="sh-times-t">
                  <span className="sh-times-l">チェックイン</span>
                  <span className="sh-times-v">{s.checkIn}</span>
                </span>
              </li>
            ) : null}
            {s.checkOut ? (
              <li>
                <IconCalendar />
                <span className="sh-times-t">
                  <span className="sh-times-l">チェックアウト</span>
                  <span className="sh-times-v">{s.checkOut}</span>
                </span>
              </li>
            ) : null}
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

// ------------------------------------------------------------------ この宿について
function Intro({ d }: { d: ShopDetail }) {
  const bg = d.banner;
  if (d.intro.length === 0) return <span id="sh-top" />;
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
          <MaskLines lines={["この宿について"]} step={120} />
        </h2>
        {d.intro.map((t, i) => (
          <Reveal as="p" key={i} variant="fade" className="sh-intro-p" delay={260 + i * 90}>
            {t}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ 客室・温泉・お食事
function Official({ d, label }: { d: ShopDetail; label: string }) {
  const s = d.shop;
  if (!s.officialUrl) return null;
  return (
    <TrackedA href={s.officialUrl} kind="website" storeId={s.id} page={d.path} className="sh-pill">
      <span>{label}</span>
      <IconExternal />
    </TrackedA>
  );
}

/** 節の本文(見出し+文。記事のページがあるときは各節の最初の 2 文まで、続きは記事へ) */
function Blocks({ blocks, d }: { blocks: Block[]; d: ShopDetail }) {
  const shown = blocks.slice(0, 2);
  return (
    <>
      {shown.map((b, i) => {
        const sents = b.text.flatMap((t) => t.match(/[^。]+。?/g) ?? []).map((x) => x.trim()).filter(Boolean);
        const cut = d.excerpt && sents.length > 2;
        const text = (cut ? sents.slice(0, 2) : sents).join("");
        return (
          <div key={`${b.heading}-${i}`} className="sh-blk">
            <h3 className="sh-blk-h">{b.heading}</h3>
            <p className="sh-blk-p">{text}</p>
            {cut && d.article ? (
              <a href={d.article.href} className="sh-blk-more">
                記事で続きを読む
              </a>
            ) : null}
          </div>
        );
      })}
    </>
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

function Rooms({ d }: { d: ShopDetail }) {
  const g = d.rooms;
  if (g.blocks.length === 0 && g.photos.length === 0 && d.roomTypes.length === 0) return null;
  return (
    <section className="sh-sec sh-rooms io" id="sh-rooms" aria-label="客室">
      <div className="sh-st">
        <Head label="客室" en="ROOMS" />
        <Blocks blocks={g.blocks} d={d} />
        {d.roomTypes.length > 0 ? (
          <ul className="sh-chips" aria-label="客室タイプ">
            {d.roomTypes.map((t) => (
              <li key={t} className="sy-chip">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        <Official d={d} label="公式サイトで見る" />
      </div>
      {g.photos.length > 0 ? (
        <div className="sh-sm">
          <PhotoRail photos={g.photos} name={d.shop.name} />
        </div>
      ) : null}
    </section>
  );
}

function Mosaic({ d, g, id, label, en, alt }: { d: ShopDetail; g: Group; id: string; label: string; en: string; alt: string }) {
  if (g.blocks.length === 0 && g.photos.length === 0) return null;
  return (
    <section className={`sh-sec sh-mos-sec io`} id={id} aria-label={alt}>
      <div className="sh-st">
        <Head label={label} en={en} />
        <Blocks blocks={g.blocks} d={d} />
        <Official d={d} label="公式サイトで見る" />
      </div>
      {g.photos.length > 0 ? (
        <div className="sh-sm">
          <div className="sh-mos" data-n={g.photos.length}>
            {g.photos.map((p, i) => (
              <div key={p.src} className={`sh-mos-i sh-mos-i--${i} sy-zoom`}>
                <Photo p={p} />
              </div>
            ))}
          </div>
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
      <ul className="sh-fac-l" data-io-group>
        {d.facilities.map((t) => (
          <li key={t} className="sh-fac-i io">
            <TagIcon label={t} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------------ 基本情報・アクセス・地図
function Info({ d }: { d: ShopDetail }) {
  const s = d.shop;
  const ICON = { train: IconTrain, car: IconCar, pin: IconPin } as const;
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
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="sh-acc io" data-io="fade" style={u(100)}>
        <h2 className="sh-info-h">アクセス</h2>
        <ul className="sh-acc-l">
          {d.access.map((a, i) => {
            const I = ICON[a.icon];
            return (
              <li key={`${a.label}-${i}`}>
                <I className="sh-acc-i" />
                <div>
                  <p className="sh-acc-lab">{a.label}</p>
                  <p className="sh-acc-t">{a.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <TrackedA href={d.mapHref} kind="map" storeId={s.id} page={d.path} className="sh-pill sh-pill--wide">
          <span>Googleマップで見る</span>
          <IconExternal />
        </TrackedA>
      </div>
      <TrackedA href={d.mapHref} kind="map" storeId={s.id} page={d.path} ariaLabel={`${s.name}をGoogleマップで見る`} className="sh-map io" style={u(180)}>
        <span className="sh-map-grid" aria-hidden="true" />
        <span className="sh-map-pin" aria-hidden="true">
          <svg viewBox="0 0 28 40">
            <path d="M14 1C7 1 1.6 6.3 1.6 13c0 8.2 12.4 26 12.4 26s12.4-17.8 12.4-26C26.4 6.3 21 1 14 1z" fill="#b6523f" />
            <circle cx="14" cy="13.2" r="4.6" fill="#fff" />
          </svg>
          <span className="sh-map-bub">{s.name}</span>
        </span>
        <span className="sh-map-addr">{s.address || s.area}</span>
      </TrackedA>
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
      <a href={a.href} className="sh-sp-a sy-hov">
        <span className="sh-sp-ph sy-zoom">
          <Photo p={{ ...a.photo, alt: "" }} />
        </span>
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
    ...(d.rooms.blocks.length || d.rooms.photos.length || d.roomTypes.length ? [{ id: "sh-rooms", label: "客室" }] : []),
    ...(d.onsen.blocks.length || d.onsen.photos.length ? [{ id: "sh-onsen", label: "温泉" }] : []),
    ...(d.dining.blocks.length || d.dining.photos.length ? [{ id: "sh-dining", label: "お食事" }] : []),
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
        <Rooms d={d} />
        <Mosaic d={d} g={d.onsen} id="sh-onsen" label="温泉" en="ONSEN" alt="温泉" />
        <Mosaic d={d} g={d.dining} id="sh-dining" label="お食事" en="DINING" alt="お食事" />
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
