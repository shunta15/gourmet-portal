import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../../common/Shell";
import { MaskLines, Write, FillHeading, PawTrail } from "../../common/Motion";
import { IconArrow, IconChevron, IconFacebook, IconPin, IconX, Paw } from "../../common/Icons";
import { IMG_SHOP, ptLinks } from "../../common/site";
import HeroScroll from "../../search/HeroScroll";
import { IconCatFace, IconMoon, IconPawLine } from "../../search/live/LiveIcons";
import { IconCar, IconDogFace } from "../../search/SearchIcons";
import { IcCalendar, IcClock, IcExternal, IcInstagramColor, IcLink, IcPhone, IcSns } from "../ShopIcons";
import TrackedA from "./LiveTrack";
import LiveShopTabs, { type ShopTab } from "./LiveShopTabs";
import { japaneseDate, loadPetShopDetail, type FacIcon, type Facility, type HeroTag, type ShopDetail } from "./liveShopData";
import { searchHref, shopHref, type PetShop } from "../../search/live/liveData";
import { sized } from "@/lib/imageUrl";
import { breadcrumb, localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { getVertical } from "@/lib/verticals";
import type { ShopLink } from "@/lib/portal/sns";
import "./shop-live.css";

/**
 * 店舗紹介ページ(本番 /pet/shop/{id})。見本「店舗紹介」(../Hero.tsx ほか・../shop.css)と同じ見た目・動きで、中身は実在の店(getPlaces('pet'))。
 * 見本は触らない(試作 /proto-pet/decided/shop/sample は仮の内容のまま残す)。本番の CSS は shop-live.css(接頭辞 lsp-)。
 * 値が無い欄は出さない(空の枠・空の見出しを出さない)。写真が無い店は、ストック写真で埋めず「写真なし」の面。
 *
 * 見本から外した・替えた欄:
 *  - 口コミ(★・名前・日付)は外した(口コミ・評価は載せない)
 *  - メニューの料金・写真は外した(名前と所要時間だけ。写真は無い)
 *  - おすすめのシーン(4 つの写真)は外した(実在の根拠・素材が無い)
 *  - 地図の写真と電車・車のアクセス文は、住所・最寄り駅(あれば)と「Google マップで見る」に替えた(地図の素材が無い)
 *  - 関連記事は「ほかのお店」(同じエリア・同じ種類の店)に替えた
 *  - 「すべての写真を見る(24枚)」は外した。ヒーロー写真の手書きの文は、見本の文句(料理の話)から、ブランドの言葉「ペットと、この街で。」に替えた(写真があるときだけ出す)
 */

const IMG_ICON = `${IMG_SHOP}`;
const FAC_PNG: Partial<Record<FacIcon, { f: string; w: number; h: number }>> = {
  "dog-s": { f: "ic-dog-s.png", w: 32.8, h: 28.7 },
  "dog-l": { f: "ic-dog-l.png", w: 32.5, h: 28.7 },
  car: { f: "ic-car.png", w: 29.8, h: 23 },
};

const nameSize = (n: number) => (n <= 10 ? "xl" : n <= 18 ? "l" : n <= 30 ? "m" : "s");

function TagIcon({ icon }: { icon: HeroTag["icon"] }) {
  const P = { "aria-hidden": true } as const;
  if (icon === "dog") return <IconDogFace {...P} />;
  if (icon === "cat") return <IconCatFace {...P} />;
  if (icon === "moon") return <IconMoon {...P} />;
  if (icon === "car") return <IconCar {...P} />;
  return <IconPawLine {...P} />;
}

function FacIconView({ icon }: { icon: FacIcon }) {
  const png = FAC_PNG[icon];
  if (png) return <span className="lsp-fi-ic pt-bounce" style={{ ["--w" as string]: png.w, ["--h" as string]: png.h, ["--m" as string]: `url(${IMG_ICON}/${png.f})` }} aria-hidden="true" />;
  const I = icon === "cat" ? IconCatFace : icon === "moon" ? IconMoon : IconPawLine;
  return (
    <span className="lsp-fi-ic lsp-fi-ic--svg pt-bounce" aria-hidden="true">
      <I className="pt-draw" />
    </span>
  );
}

// ------------------------------------------------------------------ 部品
function Breadcrumb({ d }: { d: ShopDetail }) {
  const L = ptLinks("live");
  return (
    <nav className="lsp-bc" aria-label="パンくず">
      <Link href={L.home}>ホーム</Link>
      <IconChevron aria-hidden="true" />
      <Link href={searchHref({ kind: d.shop.kind })} prefetch={false}>
        {d.shop.kindName}
      </Link>
      <IconChevron aria-hidden="true" />
      <span aria-current="page">{d.shop.name}</span>
    </nav>
  );
}

function CtaIcon({ l }: { l: ShopLink }) {
  if (l.kind === "reserve") return <IcCalendar aria-hidden="true" />;
  if (l.kind === "phone") return <IcPhone aria-hidden="true" />;
  if (l.kind === "map") return <IconPin aria-hidden="true" />;
  return <IcLink aria-hidden="true" />;
}
const ctaLabel = (l: ShopLink) => (l.kind === "reserve" ? "予約ページを開く" : l.kind === "website" ? "公式サイトを見る" : l.kind === "phone" ? "電話する" : "地図を開く");

function Hero({ d }: { d: ShopDetail }) {
  const s = d.shop;
  const ph = d.photos[0];
  return (
    <section className="lsp-hero" aria-label={s.name}>
      <div className={`lsp-hero-ph pt-live pt-shine ${ph ? "" : "lsp-hero-ph--none"}`}>
        {ph ? (
          <>
            {/* 写真は 2 層: 外側 = スクロールで寄りながら遅れて動く(視差。先頭では見本どおり)/ 内側 = ゆっくり寄り続ける(pt-kb) */}
            <div className="lsp-hero-zoom">
              <img className="lsp-hero-img pt-kb" src={sized(ph.src, 1024)} width={ph.w ?? 1200} height={ph.h ?? 800} alt={ph.alt} fetchPriority="high" decoding="async" />
            </div>
            <div className="lsp-hero-wr">
              <Write as="p" className="pt-hand lsp-hero-write" lines={["ペットと、", "この街で。"]} delay={900} step={900} />
            </div>
          </>
        ) : (
          <div className="lsp-nophoto" role="img" aria-label="この店の写真はまだありません">
            <Paw className="lsp-nophoto-paw" />
            <span>写真なし</span>
          </div>
        )}
      </div>
      {ph ? <HeroScroll target=".lsp-hero-ph" /> : null}
      <div className="lsp-hero-info">
        <span className="lsp-cat pt-tag pt-pop">{s.kindName}</span>
        <h1 className={`lsp-name lsp-name--${nameSize(s.name.length)}`}>
          <MaskLines lines={[s.name]} delay={150} />
        </h1>
        {d.nameKana ? (
          <p className="lsp-kana io" data-io="fade" style={{ ["--d" as string]: "500ms" }}>
            {d.nameKana}
          </p>
        ) : null}
        {d.headline ? (
          <h2 className="lsp-catch">
            <MaskLines lines={[d.headline]} delay={320} step={160} />
          </h2>
        ) : null}
        {d.heroTags.length > 0 ? (
          <ul className="lsp-tags">
            {d.heroTags.map((t, i) => (
              <li key={t.label} className="lsp-tagp pt-popin" style={{ ["--d" as string]: `${760 + i * 110}ms` }}>
                <TagIcon icon={t.icon} />
                {t.label}
              </li>
            ))}
          </ul>
        ) : null}
        {d.cta.length > 0 ? (
          <div className="lsp-ctas">
            {d.cta.map((l, i) => (
              <TrackedA
                key={l.kind}
                href={l.href}
                kind={l.kind}
                storeId={d.place.id}
                page={d.path}
                external={l.external}
                className={`lsp-cta ${i === 0 ? "lsp-cta--main pt-btn pt-shimmer" : "lsp-cta--sub pt-btn pt-btn--line"} pt-press pt-hov pt-magnet io`}
                style={{ ["--d" as string]: `${900 + i * 100}ms` }}
              >
                <span className="lsp-cta-in">
                  <CtaIcon l={l} />
                  {ctaLabel(l)}
                </span>
                <IconArrow className="lsp-cta-a" aria-hidden="true" />
              </TrackedA>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** 写真の並び(ヒーローの次の写真。横幅に収まる分)。触ると持ち上がって写真がズーム。スマホは横スクロール */
function Gallery({ d }: { d: ShopDetail }) {
  if (d.strip.length === 0) return null;
  return (
    <section className="lsp-strip" aria-label="写真" data-io-group>
      <ul className="lsp-strip-in">
        {d.strip.map((p, i) => (
          <li key={p.src} className="lsp-ph pt-lift pt-zoom pt-tilt" data-tilt="6" style={{ ["--w" as string]: p.sw }}>
            <div className="lsp-ph-w pt-wipe" data-wipe={i % 2 ? "up" : "left"}>
              <img src={sized(p.src, 480)} width={p.w ?? p.sw * 2} height={p.h ?? 220} alt={p.alt} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
            </div>
            <i className="pt-tilt-glare" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SocialIcon({ l }: { l: ShopLink }) {
  if (l.kind === "instagram") return <IcInstagramColor />;
  if (l.kind === "x") return <IconX />;
  if (l.kind === "facebook") return <IconFacebook />;
  return <IcLink />;
}

function AboutInfo({ d }: { d: ShopDetail }) {
  const rows: Array<{ id: string; icon: "pin" | "clock" | "calendar" | "phone" | "link" | "sns"; label: string }> = [{ id: "address", icon: "pin", label: "住所" }];
  if (d.hours.length > 0) rows.push({ id: "hours", icon: "clock", label: "営業時間" });
  if (d.holidays) rows.push({ id: "closed", icon: "calendar", label: "定休日" });
  if (d.phone) rows.push({ id: "tel", icon: "phone", label: "電話番号" });
  if (d.website) rows.push({ id: "site", icon: "link", label: "公式サイト" });
  if (d.socials.length > 0) rows.push({ id: "sns", icon: "sns", label: "SNS" });
  const ICON = { pin: IconPin, clock: IcClock, calendar: IcCalendar, phone: IcPhone, link: IcLink, sns: IcSns } as const;
  const hasAbout = d.about.length > 0;
  return (
    <section className={`lsp-ai ${hasAbout ? "" : "lsp-ai--solo"}`} id="about" aria-label="お店について" data-io-group>
      {hasAbout ? (
        <div className="lsp-card lsp-about io" data-io="left">
          <p className="lsp-lab">about</p>
          <FillHeading as="h2" className="lsp-ttl">
            お店について
          </FillHeading>
          <MaskLines as="div" className="lsp-about-p" lines={d.about} step={140} delay={350} />
        </div>
      ) : null}
      <div className="lsp-card lsp-info io" data-io="right">
        <dl>
          {rows.map((r, i) => {
            const I = ICON[r.icon];
            return (
              <div key={r.id} className={`lsp-ir lsp-ir--${r.id} io`} data-io="fade" style={{ ["--d" as string]: `${380 + i * 90}ms` }}>
                <dt>
                  <I className="lsp-ir-i" aria-hidden="true" />
                  <span>{r.label}</span>
                </dt>
                <dd>
                  {r.id === "address" ? (
                    <span>{d.address}</span>
                  ) : r.id === "hours" ? (
                    d.hours.map((h, k) => <span key={k}>{h}</span>)
                  ) : r.id === "closed" ? (
                    <span>{d.holidays}</span>
                  ) : r.id === "tel" ? (
                    <a href={`tel:${(d.phone ?? "").replace(/[^\d+]/g, "")}`} className="lsp-tel">
                      {d.phone}
                    </a>
                  ) : r.id === "site" ? (
                    <TrackedA href={d.website!} kind="website" storeId={d.place.id} page={d.path} className="lsp-link">
                      {prettyUrl(d.website!)}
                      <IcExternal aria-hidden="true" />
                    </TrackedA>
                  ) : (
                    <span className="lsp-sns">
                      {d.socials.map((l) => (
                        <TrackedA key={l.kind} href={l.href} kind={l.kind} storeId={d.place.id} page={d.path} ariaLabel={l.label} className="pt-press pt-magnet">
                          <SocialIcon l={l} />
                        </TrackedA>
                      ))}
                    </span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function prettyUrl(u: string): string {
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** メニュー(名前と所要時間だけ。料金・写真は出さない) */
function Menu({ d }: { d: ShopDetail }) {
  if (d.menus.length === 0) return null;
  return (
    <section className="lsp-card lsp-menu pt-bgshift pt-skew" data-skew="0.5" id="menu" aria-label="メニュー" data-io-group style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f6f0e6" }}>
      <div className="lsp-lcol">
        <p className="lsp-lab">Menu</p>
        <FillHeading as="h2" className="lsp-ttl">
          メニュー
        </FillHeading>
        <p className="lsp-ldesc">
          <span>お店のメニューです。</span>
          <span>内容は変わることがあります。</span>
        </p>
        {d.website ? (
          <TrackedA href={d.website} kind="website" storeId={d.place.id} page={d.path} className="lsp-ghost pt-press pt-hov pt-magnet">
            <span>公式サイトで見る</span>
            <IconArrow aria-hidden="true" />
          </TrackedA>
        ) : null}
      </div>
      <div className="lsp-items">
        {d.menus.map((m, i) => (
          <article key={`${m.name}-${i}`} className="lsp-mi pt-lift pt-tilt pt-popin" data-tilt="6">
            <h3 className="lsp-mi-t">{m.name}</h3>
            {m.minutes ? <p className="lsp-mi-p">所要時間 {m.minutes}分</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Facility({ d }: { d: ShopDetail }) {
  if (d.facilities.length === 0) return null;
  return (
    <section className="lsp-card lsp-fac pt-bgshift pt-skew" data-skew="0.5" id="facility" aria-label="施設・サービス" data-io-group style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f6f0e6" }}>
      <div className="lsp-lcol">
        <p className="lsp-lab">Facility</p>
        <FillHeading as="h2" className="lsp-ttl">
          施設・サービス
        </FillHeading>
        <p className="lsp-ldesc">
          <span>お店の対応・サービスです。</span>
        </p>
      </div>
      <div className="lsp-items">
        {d.facilities.map((f: Facility, i) => (
          <div key={`${f.label}-${i}`} className="lsp-fi pt-hov pt-lift pt-popin">
            <FacIconView icon={f.icon} />
            <span className={`lsp-fi-l ${f.label.length > 9 ? "lsp-fi-l--long" : ""}`}>{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 紹介(特集のある店は特集の本文。無い店は紹介記事の見出しつき本文) */
function Story({ d }: { d: ShopDetail }) {
  const st = d.story;
  if (!st && d.sections.length === 0) return null;
  const blocks = st ? st.points.map((p) => ({ heading: p.name, sub: p.purpose, body: p.body, specs: p.specs })) : d.sections.map((s) => ({ heading: s.heading, sub: "", body: s.body, specs: [] as { k: string; v: string }[] }));
  return (
    <section className="lsp-card lsp-art pt-bgshift pt-skew" data-skew="0.4" id="story" aria-label={st ? "特集記事" : "紹介"} style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f6f0e6" }}>
      <div className="lsp-art-hd io" data-io="left">
        <p className="lsp-lab">{st ? "Story" : "Article"}</p>
        <FillHeading as="h2" className="lsp-ttl lsp-ttl--art">
          {st ? st.title || "特集記事" : "お店の紹介"}
        </FillHeading>
        {st?.subtitle ? <p className="lsp-art-sub">{st.subtitle}</p> : null}
      </div>
      <div className="lsp-art-body">
        {st && st.lede.length > 0 ? (
          <div className="lsp-art-lede io">
            {st.lede.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        ) : null}
        {blocks.map((b, i) => (
          <section key={i} className="lsp-art-sec io" aria-labelledby={`lsp-art-${i}`}>
            <h3 id={`lsp-art-${i}`} className="lsp-art-h">
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
        <PawTrail count={6} direction="right" size={13} gap="calc(9 * var(--u))" className="lsp-paws-art" />
      </div>
    </section>
  );
}

/** アクセス(住所・最寄り駅・Google マップ)+ 地図のかわりの面 + 店舗情報の表 */
function Access({ d }: { d: ShopDetail }) {
  const s = d.shop;
  return (
    <section className={`lsp-acc pt-bgshift pt-skew ${d.rows.length > 0 ? "" : "lsp-acc--solo"}`} data-skew="0.4" data-from="0.99" data-to="0.62" id="access" aria-label="アクセスと店舗情報" style={{ ["--bg-to" as string]: "#f8f8f6", ["--bg-from" as string]: "#efe8dc" }}>
      <div className="lsp-acc-l io" data-io="left">
        <p className="lsp-lab">Access</p>
        <FillHeading as="h2" className="lsp-ttl lsp-ttl--acc" start={1.0} end={0.6}>
          アクセス
        </FillHeading>
        <div className="lsp-way lsp-way--addr pt-hov">
          <span className="lsp-way-ic pt-bounce" aria-hidden="true">
            <IconPin />
          </span>
          <h3>所在地</h3>
          <p>{d.address}</p>
        </div>
        {d.station ? (
          <div className="lsp-way lsp-way--train pt-hov">
            <span className="lsp-way-ic pt-bounce" aria-hidden="true">
              <i style={{ ["--m" as string]: `url(${IMG_ICON}/ic-train.png)`, ["--w" as string]: 18.2, ["--h" as string]: 23.8 }} />
            </span>
            <h3>最寄り駅</h3>
            <p>{d.station}</p>
          </div>
        ) : null}
        <TrackedA href={d.map.href} kind="map" storeId={d.place.id} page={d.path} className="lsp-ghost lsp-ghost--map pt-press pt-hov pt-magnet">
          <span>Googleマップで見る</span>
          <IconArrow aria-hidden="true" />
        </TrackedA>
      </div>

      {/* 地図の写真は使わない(素材が無い)。住所を載せた面に、ピンと「Google マップで見る」 */}
      <div className="lsp-map io" data-io="zoom">
        <div className="lsp-map-clip">
          <span className="lsp-map-grid" aria-hidden="true" />
          <p className="lsp-map-addr">{areaTextOf(s)}</p>
        </div>
        <span className="lsp-pin pt-live" aria-hidden="true">
          <i className="lsp-pin-ring" />
          <svg className="lsp-pin-svg" viewBox="0 0 28 40">
            <path d="M14 1C7 1 1.600 6.300 1.600 13c0 8.200 12.400 26 12.400 26s12.400-17.800 12.400-26C26.400 6.300 21 1 14 1z" fill="#d93a3a" />
            <circle cx="14" cy="13.200" r="4.600" fill="#fff" />
            <circle cx="14" cy="13.200" r="1.700" fill="#d93a3a" />
          </svg>
          <span className="lsp-pin-bub">{s.name}</span>
        </span>
      </div>

      {d.rows.length > 0 ? (
        <div className="lsp-acc-r io" data-io="right">
          <p className="lsp-lab">Information</p>
          <FillHeading as="h2" className="lsp-ttl lsp-ttl--info" start={1.0} end={0.6}>
            店舗情報
          </FillHeading>
          <dl className="lsp-tbl">
            {d.rows.map((r) => (
              <div key={r.k} className="lsp-tr">
                <dt>{r.k}</dt>
                <dd>
                  {r.href ? (
                    <TrackedA href={r.href} kind="reserve" storeId={d.place.id} page={d.path} className="lsp-link">
                      {r.v}
                    </TrackedA>
                  ) : (
                    r.v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="lsp-src">
        {d.sources.length > 0 ? (
          <p>
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
            {d.checkedAt ? <span className="lsp-src-d">　確認日 {japaneseDate(d.checkedAt)}</span> : null}
          </p>
        ) : null}
        <p>営業時間やメニューは変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
      </div>
    </section>
  );
}

function areaTextOf(s: PetShop): string {
  return s.place || s.address;
}

/** ほかのお店(同じエリア・同じ種類)。写真が無い店は「写真なし」の面 */
function Related({ d }: { d: ShopDetail }) {
  if (d.related.length === 0) return null;
  return (
    <section className="lsp-rel pt-bgshift pt-skew" data-skew="0.4" data-from="1.02" data-to="0.78" id="related" aria-label="ほかのお店" data-io-group style={{ ["--bg-to" as string]: "#f8f8f6", ["--bg-from" as string]: "#efe8dc" }}>
      <div className="lsp-rel-l io">
        <p className="lsp-lab">Related</p>
        <FillHeading as="h2" className="lsp-ttl lsp-ttl--rel" start={1.02} end={0.84}>
          ほかのお店
        </FillHeading>
      </div>
      <div className="lsp-items">
        {d.related.map((r) => (
          <Link key={r.id} href={shopHref(r.id)} prefetch={false} className="lsp-ra pt-lift pt-tilt io" data-tilt="6">
            <div className={`lsp-ra-ph pt-zoom pt-wipe ${r.photo ? "" : "lsp-ra-ph--none"}`} data-wipe="right">
              {r.photo ? <img src={sized(r.photo.src, 480)} width={r.photo.w ?? 350} height={r.photo.h ?? 233} alt={r.photo.alt} loading="lazy" decoding="async" /> : <span className="lsp-ra-none"><IconPawLine aria-hidden="true" />写真なし</span>}
            </div>
            <h3 className="lsp-ra-t">{r.name}</h3>
            <p className="lsp-ra-d">
              {r.kindName}
              {r.place ? `　${r.place}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** スマホだけ:予約・問い合わせを下に固定する細い帯(ボタンがあるときだけ) */
function MobileBar({ d }: { d: ShopDetail }) {
  if (d.cta.length === 0) return null;
  return (
    <div className="lsp-mbar" role="region" aria-label="予約・お問い合わせ">
      {d.cta.map((l, i) => (
        <TrackedA key={l.kind} href={l.href} kind={l.kind} storeId={d.place.id} page={d.path} external={l.external} className={`lsp-mbar-b ${i === 0 ? "lsp-mbar-b--main" : "lsp-mbar-b--sub"} pt-press`}>
          <CtaIcon l={l} />
          {ctaLabel(l)}
        </TrackedA>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ ページ
export function petShopPage() {
  async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const d = await loadPetShopDetail(id);
    if (!d) notFound();
    const v = getVertical("pet");
    const p = d.place;
    const ph = d.photos[0]?.src;
    const ld: Record<string, unknown> = {
      ...localBusiness(p, d.schemaType),
      ...(p.article ? { description: p.article.headline } : {}),
      // 画像は絶対URL(自サイトの画像は日本語を percent-encode する)
      ...(ph ? { image: ph.startsWith("/") ? absUrl(encodeURI(ph)) : ph } : {}),
      ...(d.socials.length > 0 ? { sameAs: d.socials.map((s) => s.href) } : {}),
    };
    if (!ld.url) ld.url = `${SITE_URL}${d.path}`;
    const crumbLd = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
      { name: d.shop.kindName, url: absUrl(searchHref({ kind: d.shop.kind })) },
      { name: p.name, url: absUrl(d.path) },
    ]);

    const tabs: ShopTab[] = [
      { id: "about", label: "about", sub: "お店について" },
      ...(d.menus.length > 0 ? [{ id: "menu", label: "Menu", sub: "メニュー" }] : []),
      ...(d.facilities.length > 0 ? [{ id: "facility", label: "Facility", sub: "施設・サービス" }] : []),
      ...(d.story || d.sections.length > 0 ? [{ id: "story", label: "Story", sub: d.story ? "特集記事" : "紹介" }] : []),
      { id: "access", label: "Access", sub: "アクセス" },
      ...(d.related.length > 0 ? [{ id: "related", label: "Related", sub: "ほかのお店" }] : []),
    ];

    return (
      <Shell page="shop" mode="live">
        <JsonLd data={ld} />
        <JsonLd data={crumbLd} />
        <div className="lsp-bg">
          <div className="lsp">
            <Breadcrumb d={d} />
            <Hero d={d} />
            <Gallery d={d} />
            <div className="lsp-body">
              <LiveShopTabs tabs={tabs} />
              <AboutInfo d={d} />
              <Menu d={d} />
              <Facility d={d} />
              <Story d={d} />
              <Access d={d} />
              <Related d={d} />
            </div>
            <MobileBar d={d} />
          </div>
        </div>
      </Shell>
    );
  }
  return { Page };
}

