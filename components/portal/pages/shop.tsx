/**
 * 新業種の店ページ（共通部品）。/{v}/shop/{id}
 * 各業種の app/{v}/shop/[id]/page.tsx は shopPage(key) の結果をそのまま出すだけ。
 *
 * 出すもの: 写真（事前生成の WebP）・基本情報（住所・最寄り駅・営業時間・定休日・電話・価格帯）・業種ごとの項目・紹介・
 * 電話／地図／予約／公式サイト／SNS のボタン（値がある項目だけ）・共有ボタン。数字・評価・口コミは出さない。
 * 店のデータが無い ID は 404（今は新業種の掲載が 0 件なので、どの ID も 404）。
 * 構造化データは lib/seo/jsonld.ts の localBusiness（schema.org の型は種類の schemaType）。星・口コミは入れない。
 * index の判定は他の新業種ページと同じ gate（業種の掲載が 3 件以上）。
 *
 * 紹介記事（Place.article。実在の店の記事の JSON から automation/vertical-stores/build-places.mjs が作る）がある店は、
 * 1 行の説明・導入・見出しつきの本文・メニューの表・基本情報・情報の出どころと確認日を出す。記事が無い店は基本情報だけ。
 * 記事の確認用の項目（facts・quote・notes）はデータに入れていないので、画面にも出ない。
 */
import { liveStaticParams } from "@/lib/portal/launch";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../JsonLd";
import ShareButtons from "../ShareButtons";
import ShopLinks from "../ShopLinks";
import ShopPhoto from "../ShopPhoto";
import { OpenBadge, OpenScope } from "../OpenNow";
import { getPlaces, type Place } from "@/lib/places";
import { getCategory, getVertical } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals/types";
import type { PlaceArticle } from "@/lib/places/types";
import { getPrefBySlug } from "@/lib/areas/prefectures";
import { buildMetadata } from "@/lib/seo/meta";
import { localBusiness } from "@/lib/seo/jsonld";
import { SITE_URL, absUrl } from "@/lib/seo/util";
import { mapsSearchUrl } from "@/lib/maps";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import { packWeeks } from "@/lib/portal/openNow";
import { shopPhoto } from "@/lib/portal/photos";
import { shareTarget } from "@/lib/portal/share";
import { shopLinks, socialLinks, type ShopSocial } from "@/lib/portal/sns";
import { safeDecode } from "@/lib/stations/query";
import { notFoundMetadata, type PortalVertical } from "./data";
import { Block, PageFrame, baseCrumbs, toneOf } from "./frame";

type Props = { params: Promise<{ id: string }> };

/** 業種ごとの項目の値を、表示用の文字列（またはリスト）にする。値が無い・空なら null */
export function formatAttribute(value: unknown): string[] | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return [value ? "あり" : "なし"];
  if (typeof value === "number") return [String(value)];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    const rows = value
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object") {
          const m = x as { name?: string; minutes?: number; price?: string };
          if (!m.name) return "";
          return [m.name, m.minutes ? `${m.minutes}分` : "", m.price ?? ""].filter(Boolean).join("　");
        }
        return "";
      })
      .filter(Boolean);
    return rows.length > 0 ? rows : null;
  }
  return null;
}

function socialOf(p: Place): ShopSocial {
  return { instagram: p.instagram, tiktok: p.tiktok, x: p.x, facebook: p.facebook, line: p.line, website: p.website };
}

function areaText(p: Place): string {
  const pref = getPrefBySlug(p.pref);
  // 市区町村名（「鹿児島市」「新宿区」「苅田町」）なら、都道府県は正式名で続ける（「鹿児島鹿児島市」にならないように）
  if (pref && p.cityName && /[市区町村]$/.test(p.cityName)) return `${pref.name}${p.cityName}`;
  return `${pref?.short ?? ""}${p.cityName ?? ""}`;
}

/** 店ページの説明文。ある項目だけを挙げる（無い項目を匂わせない） */
function describe(v: Vertical, p: Place, catName: string): string {
  const items = ["住所", p.hours ? "営業時間" : "", p.holidays ? "定休日" : "", p.phone ? "電話番号" : ""].filter(Boolean);
  if (p.article?.menus?.length) items.push("メニュー");
  const where = areaText(p);
  const base = `${where ? `${where}の` : ""}${catName || v.name}「${p.name}」の${items.join("・")}を掲載しています。`;
  return p.article ? `${p.article.headline}。${base}` : base;
}

/** "2026-10-09" → "2026年10月9日"（形式が違えばそのまま） */
function japaneseDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
}

/** 本文を段落に分ける（空行・改行で区切る） */
function paragraphs(body: string): string[] {
  return body.split(/\n+/).map((x) => x.trim()).filter(Boolean);
}

/** メニューの表。時間・料金の列は、1 つでも値があるときだけ出す */
function MenuTable({ menus }: { menus: NonNullable<PlaceArticle["menus"]> }) {
  const hasTime = menus.some((m) => m.minutes);
  const hasPrice = menus.some((m) => m.price);
  return (
    <table className="mp-art-menus">
      <thead>
        <tr>
          <th scope="col">メニュー</th>
          {hasTime && <th scope="col">時間</th>}
          {hasPrice && <th scope="col">料金</th>}
        </tr>
      </thead>
      <tbody>
        {menus.map((m, i) => (
          <tr key={i}>
            <th scope="row">{m.name}</th>
            {hasTime && <td data-label="時間">{m.minutes ? `${m.minutes}分` : ""}</td>}
            {hasPrice && <td data-label="料金">{m.price ?? ""}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function shopPage(key: PortalVertical) {
  async function find(params: Props["params"]): Promise<{ v: Vertical; all: Place[]; place: Place } | null> {
    const { id } = await params;
    const v = getVertical(key);
    const all = await getPlaces(key);
    const want = safeDecode(id);
    const place = all.find((p) => p.id === want);
    return place ? { v, all, place } : null;
  }

  return {
    generateStaticParams: liveStaticParams(async () => {
      return (await getPlaces(key)).map((p) => ({ id: p.id }));
    }),

    async generateMetadata({ params }: Props): Promise<Metadata> {
      const hit = await find(params);
      if (!hit) return notFoundMetadata();
      const { v, all, place: p } = hit;
      const catName = getCategory(v, p.category)?.name ?? "";
      const where = areaText(p);
      return buildMetadata({
        vertical: key,
        title: `${p.name}｜${where ? `${where}の` : ""}${catName || v.name}｜${v.brand}`,
        description: describe(v, p, catName),
        path: `${v.path}/shop/${p.id}`,
        count: all.length,
      });
    },

    async Page({ params }: Props) {
      const hit = await find(params);
      if (!hit) notFound();
      const { v, place: p } = hit;
      const cat = getCategory(v, p.category);
      const path = `${v.path}/shop/${p.id}`;
      const pref = getPrefBySlug(p.pref);
      const social = socialLinks(socialOf(p));
      const links = shopLinks({
        phone: p.phone,
        mapUrl: p.mapUrl ?? mapsSearchUrl(p.name, p.address),
        reservationUrl: p.reservationUrl,
        ...socialOf(p),
      });
      const weeks = packWeeks([{ id: p.id, hours: p.hours, closed: p.holidays }]);

      const art = p.article;
      const facts: { dt: string; dd: string[] }[] = [];
      const add = (dt: string, dd: string | undefined) => dd && facts.push({ dt, dd: [dd] });
      add("住所", p.address);
      add("最寄り駅", p.station);
      // 営業時間は曜日のまとまりごとに 1 行（「 / 」区切りで保存されている）
      if (p.hours) facts.push({ dt: "営業時間", dd: p.hours.split(" / ") });
      add("定休日", p.holidays);
      add("電話", p.phone);
      add("価格帯", p.priceRange);
      // 業種ごとの項目（lib/verticals の attributes に挙げた項目のうち、値があるものだけ）
      const attrs = (p.attributes ?? {}) as Record<string, unknown>;
      for (const a of v.attributes) {
        if (a.key === "menus" && art?.menus?.length) continue; // 記事のメニューは表で出す
        const dd = formatAttribute(attrs[a.key]);
        if (dd) facts.push({ dt: a.label, dd });
      }

      const ld = localBusiness(p, cat?.schemaType ?? "LocalBusiness");
      const img = p.image;
      const ldFull: Record<string, unknown> = {
        ...ld,
        ...(art ? { description: art.headline } : {}),
        // 画像は絶対URL（自サイトの画像は日本語を percent-encode する）
        ...(img ? { image: img.startsWith("/") ? absUrl(encodeURI(img)) : img } : {}),
        ...(social.length > 0 ? { sameAs: social.map((s) => s.href) } : {}),
      };
      // JSON-LD の url は、店の公式サイトがあればそれ、無ければこのページ
      if (!ldFull.url) ldFull.url = `${SITE_URL}${path}`;

      return (
        <PageFrame
          tone={toneOf(v)}
          crumbs={[
            ...baseCrumbs(v),
            ...(cat ? [{ name: cat.name, href: `${v.path}/${cat.slug}` }] : []),
            { name: p.name, href: path },
          ]}
          kicker={`Machinowa — ${VERTICAL_FACE[v.key].en} / Shop`}
          heading={p.name}
          lead={art ? `${art.headline}。` : `${[areaText(p), cat?.name].filter(Boolean).join("の") || `${v.name}の店`}。`}
          className={art ? "mp-shop-page mp-shop-page-art" : "mp-shop-page"}
        >
          {art ? (
            <section className="mp-pg-sec mp-art" aria-label="紹介">
              <div className="mp-wrap mp-art-grid">
                <div className="mp-art-lede">
                  <p className="mp-art-where">{[areaText(p), cat?.name].filter(Boolean).join("　/　")}</p>
                  <p className="mp-art-lede-p">{art.lede}</p>
                </div>

                <aside className="mp-art-aside" aria-label="基本情報">
                  {shopPhoto(p.image) && (
                    <div className="mp-shop-photo">
                      <ShopPhoto image={p.image} alt={`${p.name}の写真`} sizes="(max-width: 900px) 100vw, 400px" eager />
                    </div>
                  )}
                  <OpenScope weeks={weeks}>
                    <p className="mp-shop-open">
                      <OpenBadge id={p.id} />
                    </p>
                  </OpenScope>
                  <ShopLinks links={links} storeId={p.id} page={path} />
                  <h2 className="mp-art-h3">基本情報</h2>
                  <dl className="mp-shop-facts">
                    {facts.map((f) => (
                      <div key={f.dt}>
                        <dt>{f.dt}</dt>
                        <dd>
                          {f.dd.length === 1 ? (
                            f.dd[0]
                          ) : (
                            <ul>
                              {f.dd.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mp-art-note">料金・営業時間は変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
                </aside>

                <div className="mp-art-body">
                  {art.sections.map((s, i) => (
                    <section key={i} className="mp-art-sec" aria-labelledby={`mp-art-s${i}`}>
                      <h2 id={`mp-art-s${i}`} className="mp-art-h2">{s.heading}</h2>
                      {paragraphs(s.body).map((t, j) => (
                        <p key={j}>{t}</p>
                      ))}
                    </section>
                  ))}
                  {art.menus && art.menus.length > 0 && (
                    <section className="mp-art-sec" aria-labelledby="mp-art-menu">
                      <h2 id="mp-art-menu" className="mp-art-h2">メニュー</h2>
                      <MenuTable menus={art.menus} />
                    </section>
                  )}
                  <section className="mp-art-sec mp-art-src" aria-labelledby="mp-art-src-h">
                    <h2 id="mp-art-src-h" className="mp-art-h2">情報の出どころ</h2>
                    <ul>
                      {art.sources.map((src) => (
                        <li key={src.url}>
                          <a href={src.url} target="_blank" rel="noopener noreferrer">
                            {src.label}
                            <span className="mp-sr">（別のタブで開きます）</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    {art.checkedAt && (
                      <p className="mp-art-checked">
                        確認日　<time dateTime={art.checkedAt}>{japaneseDate(art.checkedAt)}</time>
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </section>
          ) : (
            <section className="mp-pg-sec mp-shop" aria-label="店の情報">
              <div className={shopPhoto(p.image) ? "mp-wrap mp-shop-grid" : "mp-wrap mp-shop-grid mp-shop-solo"}>
                {shopPhoto(p.image) && (
                  <div className="mp-shop-photo">
                    <ShopPhoto image={p.image} alt={`${p.name}の写真`} sizes="(max-width: 900px) 100vw, 560px" eager />
                  </div>
                )}
                <div className="mp-shop-info">
                  <OpenScope weeks={weeks}>
                    <p className="mp-shop-open">
                      <OpenBadge id={p.id} />
                    </p>
                  </OpenScope>
                  {p.intro && <p className="mp-note-p">{p.intro}</p>}
                  <dl className="mp-shop-facts">
                    {facts.map((f) => (
                      <div key={f.dt}>
                        <dt>{f.dt}</dt>
                        <dd>
                          {f.dd.length === 1 ? (
                            f.dd[0]
                          ) : (
                            <ul>
                              {f.dd.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <ShopLinks links={links} storeId={p.id} page={path} />
                </div>
              </div>
            </section>
          )}

          <section className="mp-pg-sec" aria-label="共有">
            <div className="mp-wrap">
              <ShareButtons url={shareTarget(path)} text={`${p.name}｜${v.brand}`} page={path} storeId={p.id} label="この店を共有" />
            </div>
          </section>

          <Block id="mp-shop-more-h" kicker="More" title="ほかの探し方">
            <ul className="mp-chips">
              {cat && (
                <li>
                  <Link href={`${v.path}/${cat.slug}`} prefetch={false} data-cursor="CATEGORY">
                    {cat.name}の一覧
                  </Link>
                </li>
              )}
              {pref && (
                <li>
                  <Link href={`${v.path}/area/${p.pref}`} prefetch={false} data-cursor="AREA">
                    {pref.short}の{v.name}
                  </Link>
                </li>
              )}
              <li>
                <Link href={v.path} prefetch={false} data-cursor={VERTICAL_FACE[v.key].en.toUpperCase()}>
                  {v.name}のトップ
                </Link>
              </li>
            </ul>
          </Block>
          <JsonLd data={ldFull} />
        </PageFrame>
      );
    },
  };
}
