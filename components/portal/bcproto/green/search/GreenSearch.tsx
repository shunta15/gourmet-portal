import Link from "next/link";
import type { CSSProperties } from "react";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { greenFacets, loadGreenShops } from "@/lib/portal/vert/bodygreen/shops";
import { PAGE_SIZE, countGreen, filterGreenShops, parseGreenFilters } from "@/lib/portal/vert/bodygreen/filter";
import type { GreenShop } from "@/lib/portal/vert/bodygreen/types";
import { CountUp, MaskLines, Write } from "../common/Motion";
import { ShopPhoto } from "../common/ShopCard";
import { BASE, IMG, SEARCH_HREF, searchHref, shopHref } from "../common/site";
import Filters, { type FilterOpt } from "./Filters";
import { loadSubPhotos, type SubPhoto } from "./subs";
import "./search.css";

/**
 * 探す(/bodycare/search)。見本 mock-search の見た目のまま、本番のデータ(111 店)・本番の絞り込み(kind・pref・tag(1 つ)・q・sort・n)で出す。
 * 星・点数・口コミ・料金・「おすすめ」・順位・お気に入り・地図一覧は出さない(データ・機能が無い)。番号のページ送りは「さらに 20 件を見る」(n を増やす)。
 * 構造化データ(BreadcrumbList)・metadata は app/bodycare/(cp)/search/page.tsx が出す(ここでは出さない)。
 * 状態はすべて URL の引数。ヒーローの検索・左の条件は GET フォーム、キーワード・並び・さらに見るはリンク(Filters の選択だけクライアント)。
 */
type SP = Record<string, string | string[] | undefined>;
const S = `${IMG}/search`;
const HOURS_TAGS = ["土日営業", "夜遅くまで営業"]; // こだわりのうち「営業時間」の枠に出す物(データのタグ名のまま)

const Pin = ({ w = 11 }: { w?: number }) => (
  <svg className="gs-pin" viewBox="4 1 16 22" width={w} height={(w * 22) / 16} aria-hidden="true">
    <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill="#2f7a4d" />
    <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
  </svg>
);
const Arrow = ({ w = 16 }: { w?: number }) => (
  <svg viewBox="0 0 22 10" width={w} height={(w * 10) / 22} aria-hidden="true">
    <path d="M1 5h19M16 1l4.4 4L16 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ResultCard({ shop: s, subs, eager }: { shop: GreenShop; subs: SubPhoto[]; eager: boolean }) {
  return (
    <article className="gs-card gr-lift gr-hov">
      <div className="gs-ph">
        <ShopPhoto shop={s} eager={eager} sizes="(min-width: 1081px) 300px, 92vw" />
      </div>
      <div className="gs-bd">
        <h3 className="gs-nm">
          <Link href={shopHref(s.id)} className="gs-nm-a">
            {s.name}
          </Link>
        </h3>
        <p className="gs-ac">
          <Pin />
          <span>{s.area}</span>
        </p>
        <ul className="gs-tg">
          <li className="gs-tg-k">{s.kindName}</li>
          {s.tags.slice(0, 3).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {s.blurb && <p className="gs-ds">{s.blurb}</p>}
      </div>
      <div className="gs-rp">
        {subs.length > 0 && (
          <div className={`gs-th gs-th--${subs.length}`} aria-hidden="true">
            {subs.map((p) => (
              <span key={p.src} className="gr-zoom">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" width={p.w} height={p.h} loading="lazy" decoding="async" />
              </span>
            ))}
          </div>
        )}
        <div className="gs-bx">
          {(s.hours || s.holidays) && (
            <dl className="gs-info">
              {s.hours && (
                <div>
                  <dt>営業時間</dt>
                  <dd>
                    {s.hours}
                    {s.hoursMore ? " ほか" : ""}
                  </dd>
                </div>
              )}
              {s.holidays && (
                <div>
                  <dt>定休日</dt>
                  <dd>{s.holidays}</dd>
                </div>
              )}
            </dl>
          )}
          <span className="gs-bk gr-press gr-shimmer">
            店のページを見る
            <span className="gs-bk-a">
              <Arrow w={15} />
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function GreenSearch({ sp }: { sp: SP }) {
  const [shops, subMap] = await Promise.all([loadGreenShops(), loadSubPhotos()]);
  const facets = greenFacets(shops);
  const f = parseGreenFilters(sp, facets);
  const list = filterGreenShops(shops, f);
  const shown = list.slice(0, f.n);
  // 丸い札の「○都道府県から探す」の数: いま出ている店が載っている都道府県の数(条件なしなら掲載のある都道府県の数)
  const listPrefCount = new Set(list.map((x) => x.pref)).size;
  const left = list.length - shown.length;

  const prefShort = f.pref ? (facets.prefs.find((p) => p.slug === f.pref)?.short ?? "") : "";
  const prefName = f.pref ? (facets.prefs.find((p) => p.slug === f.pref)?.name ?? "") : "";
  const kindName = f.kind ? (facets.kinds.find((k) => k.slug === f.kind)?.name ?? "") : "";
  const front = `${f.tag ? `${f.tag}の` : ""}${prefShort ? `${prefShort}の` : ""}`;
  // 見出し(2 行)・リード
  const h1: [string, string] = front ? [front, kindName || "ボディケアの店"] : ["ボディケアの", kindName || "店をさがす"];
  const what = `${front}${kindName || "ボディケアの店"}`;
  const filtered = !!(f.kind || f.pref || f.tag || f.q);
  const lead2 = filtered ? `掲載中の店 ${facets.total} 件のうち、条件に合うのは ${list.length} 件です。` : `掲載中の店は ${facets.total} 件です。並びは順位ではありません。`;

  // パンくず(トップ > 県 > 種類 > こだわり。条件が無いときは「店をさがす」)
  const crumbs: Array<{ label: string; href?: string }> = [{ label: "トップ", href: BASE }];
  if (f.pref) crumbs.push({ label: prefName, href: searchHref({ pref: f.pref }) });
  if (f.kind) crumbs.push({ label: kindName, href: searchHref({ pref: f.pref, kind: f.kind }) });
  if (f.tag) crumbs.push({ label: f.tag, href: searchHref({ pref: f.pref, kind: f.kind, tag: f.tag }) });
  if (crumbs.length === 1) crumbs.push({ label: "店をさがす" });
  crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };

  // 左の条件(件数は、ほかの 2 つの条件を掛けたときの件数。本番の BodySearch と同じ数え方)
  const opt = (value: string, label: string, n: number): FilterOpt => ({ value, label, n });
  const kinds = facets.kinds.map((k) => opt(k.slug, k.name, countGreen(shops, { kind: k.slug, pref: f.pref, tag: f.tag })));
  const prefCnt = (slug: string) => countGreen(shops, { kind: f.kind, pref: slug, tag: f.tag });
  const prefTop = facets.prefs.slice(0, 8).map((p) => opt(p.slug, p.short, prefCnt(p.slug)));
  const prefRest = facets.prefs.slice(8).map((p) => opt(p.slug, p.short, prefCnt(p.slug)));
  const present = new Set(facets.prefs.map((p) => p.slug));
  const prefAll = PREFECTURES.filter((p) => present.has(p.slug)).map((p) => opt(p.slug, p.name, prefCnt(p.slug)));
  const tagOpt = (name: string) => opt(name, name, countGreen(shops, { kind: f.kind, pref: f.pref, tag: name }));
  const hoursTags = HOURS_TAGS.filter((t) => facets.tags.some((x) => x.name === t)).map(tagOpt);
  const etcTags = facets.tags.filter((t) => !HOURS_TAGS.includes(t.name)).map((t) => tagOpt(t.name));
  // ヒーロー下のキーワード(こだわり + 件数のある種類)
  const keywords: Array<{ label: string; href: string }> = [
    ...facets.tags.map((t) => ({ label: t.name, href: searchHref({ tag: t.name }) })),
    ...facets.kinds.map((k) => ({ label: k.name, href: searchHref({ kind: k.slug }) })),
  ];
  const sortHref = (sort: "area" | "name") => searchHref({ kind: f.kind, pref: f.pref, tag: f.tag, q: f.q, sort });

  return (
    <div data-gr-page="search" className="gs-page">
      <div className="gs-w">
        {/* 端の若葉(見本から切り出した飾り。スクロールと一緒に動く) */}
        <div className="gs-eg gs-eg-l gr-sway" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${S}/edge-l2.webp`} alt="" width={44} height={330} />
        </div>
        <div className="gs-eg gs-eg-r gr-sway" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${S}/edge-r2.webp`} alt="" width={52} height={300} />
        </div>

        {/* ---------- ヒーロー ---------- */}
        <section className="gs-hero" aria-labelledby="gs-h1">
          <div className="gs-hero-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${S}/hero.webp`} alt="" width={1448} height={356} className="gs-kb" fetchPriority="high" />
          </div>
          <div className="gs-sprig gs-sprig-a gr-sway" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${S}/sprig-a.webp`} alt="" width={104} height={90} />
          </div>
          <div className="gs-sprig gs-sprig-b gr-sway" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${S}/sprig-b.webp`} alt="" width={80} height={92} />
          </div>

          <nav className="gs-crumb" aria-label="パンくず">
            {crumbs.map((c, i) =>
              c.href ? (
                <Link key={`${i}-${c.label}`} href={c.href}>
                  {c.label}
                </Link>
              ) : (
                <span key={`${i}-${c.label}`} aria-current="page">
                  {c.label}
                </span>
              ),
            )}
          </nav>
          <h1 id="gs-h1" className="gs-h1">
            <MaskLines lines={[h1[0], h1[1]]} as="span" step={140} delay={120} />
          </h1>
          <p className="gs-lead">
            <span data-rv="fade" style={{ ["--d" as string]: "700ms" } as CSSProperties}>
              <span className="gs-l1">{what}を、種類・エリア・こだわり・キーワードで探せます。</span>
              <br />
              <span className="gs-l2">
                {f.q ? `「${f.q}」を含む店に絞っています。` : ""}
                {lead2}
              </span>
            </span>
          </p>
          <Write className="gr-hand gs-hand" lines={["こころも、", "からだも、", "軽やかに。"]} delay={900} step={520} as="p" />
          <div className="gs-badge gr-pop gr-float" aria-hidden="true">
            <span>
              {prefShort ? `${prefShort}で` : `${listPrefCount}都道府県`}
              <br />
              {prefShort ? "見つける" : "から探す"}
              <br />
              掲載 {list.length} 件
            </span>
          </div>

          <form className="gs-panel" action={SEARCH_HREF} method="get" role="search">
            {f.kind && <input type="hidden" name="kind" value={f.kind} />}
            {f.tag && <input type="hidden" name="tag" value={f.tag} />}
            {f.sort === "name" && <input type="hidden" name="sort" value="name" />}
            <label className="gs-area">
              <svg viewBox="0 0 24 24" width="19" height="22" aria-hidden="true" className="gs-area-pin">
                <path d="M12 22.5s-7.2-6.3-7.2-12A7.2 7.2 0 0 1 19.2 10.5c0 5.7-7.2 12-7.2 12z" fill="#26324b" />
                <circle cx="12" cy="10.2" r="2.7" fill="#fff" />
              </svg>
              <select name="pref" defaultValue={f.pref} aria-label="都道府県">
                <option value="">すべてのエリア</option>
                {PREFECTURES.filter((p) => present.has(p.slug)).map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}({facets.prefs.find((x) => x.slug === p.slug)?.count ?? 0})
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 10 6" width="11" height="7" aria-hidden="true" className="gs-area-ch">
                <path d="m1 1 4 4 4-4" fill="none" stroke="#26324b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
            <div className="gs-find">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="gs-find-ic">
                <circle cx="10.4" cy="10.4" r="7" fill="none" stroke="#26324b" strokeWidth="2" />
                <path d="m15.6 15.6 5.2 5.2" stroke="#26324b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input type="text" name="q" defaultValue={f.q} maxLength={40} placeholder="エリア・店名で検索" aria-label="キーワード" />
              <button type="submit" className="gs-go gr-press gr-shimmer">
                <span>検索する</span>
                <Arrow w={22} />
              </button>
            </div>
          </form>

          <div className="gs-kw">
            <span className="gs-kw-l">条件から探す</span>
            <ul>
              {keywords.map((k) => (
                <li key={k.label}>
                  <Link href={k.href} className="gr-chip">
                    {k.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 本体 ---------- */}
        <div className="gs-body">
          <Filters
            key={`${f.kind}|${f.pref}|${f.tag}`}
            action={SEARCH_HREF}
            clearHref={SEARCH_HREF}
            initial={{ kind: f.kind, pref: f.pref, tag: f.tag }}
            carry={{ q: f.q, sort: f.sort }}
            kinds={kinds}
            prefTop={prefTop}
            prefRest={prefRest}
            prefAll={prefAll}
            hoursTags={hoursTags}
            etcTags={etcTags}
          />

          <section className="gs-res" aria-label="検索結果">
            <div className="gs-rh" data-rv="fade">
              <h2 className="gs-count" aria-live="polite">
                <span className="gs-count-t">検索結果</span>
                <CountUp to={list.length} className="gs-count-n" />
                <span className="gs-count-u">件</span>
              </h2>
              <div className="gs-rh-r">
                <span className="gs-sort-l" id="gs-sort-l">
                  並び替え
                </span>
                <div className="gs-sort" role="group" aria-labelledby="gs-sort-l">
                  <Link href={sortHref("area")} className={f.sort === "area" ? "is-on" : ""} aria-current={f.sort === "area" ? "true" : undefined}>
                    都道府県順
                  </Link>
                  <Link href={sortHref("name")} className={f.sort === "name" ? "is-on" : ""} aria-current={f.sort === "name" ? "true" : undefined}>
                    店名順
                  </Link>
                </div>
              </div>
            </div>

            {shown.length > 0 ? (
              <ul className="gs-cards" data-rv-group>
                {shown.map((s, i) => (
                  <li key={s.id} data-rv>
                    <ResultCard shop={s} subs={subMap.get(s.id) ?? []} eager={i < 2} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="gs-empty">
                条件に合う店はありません。条件を変えてみてください。
                <Link href={SEARCH_HREF} className="gs-fb gs-fb--line gr-press">
                  条件をクリア
                </Link>
              </p>
            )}

            {left > 0 && (
              <nav className="gs-pager" aria-label="続きを見る" data-rv="fade">
                <Link href={searchHref({ ...f, n: f.n + PAGE_SIZE })} scroll={false} className="gs-pg gs-pg--more gr-press">
                  さらに {Math.min(PAGE_SIZE, left)} 件を見る
                  <Arrow w={14} />
                </Link>
                <span className="gs-pg-note">
                  {shown.length} / {list.length} 件を表示
                </span>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
