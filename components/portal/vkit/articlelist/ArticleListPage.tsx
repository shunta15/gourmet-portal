import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import KindName from "../common/KindName";
import Nm from "../common/Nm";
import { IconArrow, IconChevron, IconChevronDown, IconChevronLeft, IconMinus, IconPin, IconPlus, IconSearch, KindIcon } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { iconOf, vkImg, vkLinks, type VkConfig } from "../config";
import { countPlaces } from "@/lib/places";
import { kindEn, type LiveShop } from "../common/live";
import { IconAreaHead, IconCondHead, IconNoPhoto, IconTypeHead, TagIcon } from "../search/VkIcons";
import SideShell from "./SideShell";
import { cardCopyOf } from "./copy";
import { PAGE_SIZE, articleShops, facetsOf, filterShops, listHref, loadListShops, parseFilters, scopeOf, type Facets, type ListFilters } from "./data";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./articlelist.css";

/* eslint-disable @next/next/no-img-element */

/**
 * 【2026-10-23 以降】スポーツ・くらしの /{業種}/article は店舗紹介の一覧(/{業種}/shop)へ 308 で転送するので、この一覧の画面は本番では出さない。
 * 部品の Card・Pager は店舗紹介の一覧(../shoplist/ShopListPage.tsx)が使う。アクティビティの /activity/article は A 組の特集ページ(metadata だけ vkArticleListPage を使う)。
 * 以下は転送する前の作りの説明。
 *
 * 記事の一覧(/activity/article・/sports/article・/life/article)。ステイの決定デザインの「記事の一覧」と同じ組み立て(ヒーロー+検索の帯 → 左に絞り込み・右に 01 02 … の記事の一覧)で、
 * 中身は実在の店の紹介記事(紹介記事と実物の写真のある店。common/live.ts の loadShops → data.ts の articleShops)。カードは各店の記事 /{業種}/article/{id} へ。
 * 探す(search/SearchPage.tsx)の部品と CSS を写して直したもの。CSS は articlelist.css(接頭辞 val-)。
 * 状態は URL の引数(data.ts の冒頭)。サーバーが絞り込んで描くので、JS が無くても、リンクとフォーム(GET)で絞れる。
 * 記事が 0 本でも壊れない(空の欄を出さない): 絞り込み・並べ替え・ページ送りは、データがあるものだけ出す。
 * 料金・評価・おすすめ・人気・架空の店名・体験した言い回し・日付と人数の箱は出さない。「01 02 …」は表示している順の連番(順位ではない)。
 */

type SP = Record<string, string | string[] | undefined>;

// ------------------------------------------------------------------ 部品
function Hero({ cfg, f, facets, scope, total }: { cfg: VkConfig; f: ListFilters; facets: Facets; scope: string; total: number }) {
  const L = vkLinks(cfg);
  const c = cfg.list;
  const crumbs = [{ label: "ホーム", href: L.home }, scope ? { label: `${cfg.noun}の記事`, href: L.articles } : { label: `${cfg.noun}の記事` }, ...(scope ? [{ label: scope }] : [])];
  return (
    <section className="val-hero" aria-label={`${cfg.noun}の記事`}>
      <div className="val-hero-clip vk-live" aria-hidden="true">
        {/* 飾りの写真(Wikimedia Commons の CC0・パブリックドメイン。店そのものではない。出典は configs/credits.json)。ゆっくり寄り続ける */}
        <img className={`val-hero-img vk-kb${c.heroFlip ? " val-hero-img--flip" : ""}`} src={`${vkImg(cfg).list}/hero.webp`} width={2400} height={880} alt="" fetchPriority="high" decoding="async" style={{ objectPosition: `50% ${c.heroFocus}%` }} />
        <span className="val-hero-wash" />
      </div>
      <div className="val-hero-in">
        <Crumbs items={crumbs} className="val-crumbs" />
        <h1 className="val-h1">
          <MaskLines lines={c.h1} step={170} delay={100} />
        </h1>
        <Reveal as="p" variant="fade" className="val-sub" delay={600}>
          {c.sub}
        </Reveal>
      </div>
      <Reveal as="p" variant="fade" className="val-hero-note" delay={800}>
        {c.note[0]}
        <br />
        {c.note[1]}
      </Reveal>
      {total > 0 ? <SearchBox cfg={cfg} f={f} facets={facets} /> : null}
    </section>
  );
}

/** 検索の帯(キーワード・エリア・種類・こだわり条件。GET のフォーム) */
function SearchBox({ cfg, f, facets }: { cfg: VkConfig; f: ListFilters; facets: Facets }) {
  const L = vkLinks(cfg);
  const c = cfg.list;
  const kind = f.kinds.length === 1 ? f.kinds[0] : "";
  const scene = f.scenes.length === 1 ? f.scenes[0] : "";
  return (
    <form className="val-box" action={L.articles} method="get" role="search" aria-label={`${cfg.noun}の記事を検索`}>
      <label className="val-cell val-cell--q">
        <IconSearch className="val-cell-i" />
        <span className="val-sr">{c.boxQ}</span>
        <input type="search" name="q" defaultValue={f.q} maxLength={40} placeholder={`${c.boxQ}で探す`} autoComplete="off" />
      </label>
      {facets.prefs.length > 0 ? (
        <label className="val-cell">
          <IconPin className="val-cell-i" />
          <span className="val-cell-t">
            <span className="val-cell-l">エリア</span>
            <select name="pref" defaultValue={f.pref}>
              <option value="">指定なし</option>
              {facets.prefs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="val-cell-c" />
        </label>
      ) : null}
      {facets.kinds.length > 0 ? (
        <label className="val-cell">
          <KindIcon icon={iconOf(cfg, kind)} className="val-cell-i" />
          <span className="val-cell-t">
            <span className="val-cell-l">{cfg.noun}の種類</span>
            <select name="kind" defaultValue={kind}>
              <option value="">指定なし</option>
              {facets.kinds.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="val-cell-c" />
        </label>
      ) : null}
      {facets.scenes.length > 0 ? (
        <label className="val-cell">
          <TagIcon label={facets.scenes.find((s) => s.slug === scene)?.name ?? "条件"} className="val-cell-i" />
          <span className="val-cell-t">
            <span className="val-cell-l">こだわり条件</span>
            <select name="scene" defaultValue={scene}>
              <option value="">指定なし</option>
              {facets.scenes.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="val-cell-c" />
        </label>
      ) : null}
      <button type="submit" className="val-go">
        <IconSearch />
        <span>検索する</span>
      </button>
    </form>
  );
}

/** 左の絞り込み。エリア(地方の札はリンク)・種類・こだわり条件(チェックボックス+ボタンの GET フォーム)・キーワード */
function Sidebar({ cfg, f, facets }: { cfg: VkConfig; f: ListFilters; facets: Facets }) {
  const L = vkLinks(cfg);
  const c = cfg.list;
  const to = (patch: Partial<ListFilters>) => listHref(cfg, { ...f, ...patch, page: 1 }, "#val-results");
  const region = facets.regions.find((r) => r.slug === f.region);
  return (
    <SideShell summary={scopeOf(f, facets)}>
      {facets.regions.length > 0 ? (
        <details className="val-sec" open>
          <summary>
            <IconAreaHead className="val-sec-i" />
            <span className="val-sec-t">エリアから探す</span>
            <IconPlus className="val-sec-pm val-sec-plus" />
            <IconMinus className="val-sec-pm val-sec-minus" />
          </summary>
          <ul className="val-regions">
            {facets.regions.map((r) => (
              <li key={r.slug}>
                <Link href={to({ region: r.slug, pref: "" })} prefetch={false} className={`val-region ${f.region === r.slug ? "is-on" : ""}`} aria-current={f.region === r.slug ? "true" : undefined}>
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
          {region && region.prefs.length > 0 ? (
            <ul className="val-prefs" aria-label={`${region.name}の都道府県`}>
              {region.prefs.map((p) => (
                <li key={p.slug}>
                  <Link href={to({ region: region.slug, pref: p.slug })} prefetch={false} className={f.pref === p.slug ? "is-on" : ""} aria-current={f.pref === p.slug ? "true" : undefined}>
                    {p.short}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {f.region || f.pref ? (
            <p className="val-areaclear">
              <Link href={to({ region: "", pref: "" })} prefetch={false}>
                エリアをはずす
              </Link>
            </p>
          ) : null}
        </details>
      ) : null}

      <form action={L.articles} method="get" className="val-form">
        {f.region && !f.pref ? <input type="hidden" name="region" value={f.region} /> : null}
        {f.pref ? <input type="hidden" name="pref" value={f.pref} /> : null}
        {f.sort !== "area" ? <input type="hidden" name="sort" value={f.sort} /> : null}

        {facets.kinds.length > 0 ? (
          <details className="val-sec" open>
            <summary>
              <IconTypeHead className="val-sec-i" />
              <span className="val-sec-t">{cfg.noun}の種類</span>
              <IconPlus className="val-sec-pm val-sec-plus" />
              <IconMinus className="val-sec-pm val-sec-minus" />
            </summary>
            <ul className="val-opts">
              {facets.kinds.map((k) => (
                <li key={k.slug}>
                  <label className="val-opt">
                    <input type="checkbox" name="kind" value={k.slug} defaultChecked={f.kinds.includes(k.slug)} />
                    <KindIcon icon={iconOf(cfg, k.slug)} className="val-opt-i" />
                    <span className="val-opt-l">
                      <KindName name={k.name} />
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {facets.scenes.length > 0 ? (
          <details className="val-sec" open>
            <summary>
              <IconCondHead className="val-sec-i" />
              <span className="val-sec-t">こだわり条件</span>
              <IconPlus className="val-sec-pm val-sec-plus" />
              <IconMinus className="val-sec-pm val-sec-minus" />
            </summary>
            <ul className="val-opts">
              {facets.scenes.map((s) => (
                <li key={s.slug}>
                  <label className="val-opt">
                    <input type="checkbox" name="scene" value={s.slug} defaultChecked={f.scenes.includes(s.slug)} />
                    <TagIcon label={s.name} className="val-opt-i" />
                    <span className="val-opt-l">{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="val-kw">
          <label htmlFor="val-kw-in" className="val-kw-l">
            キーワード
          </label>
          <input id="val-kw-in" type="search" name="q" defaultValue={f.q} maxLength={40} placeholder={c.kwEx} autoComplete="off" />
        </div>
        <button type="submit" className="val-apply">
          この条件で検索する
        </button>
        <p className="val-clear">
          <Link href={L.articles} prefetch={false}>
            条件をクリア
          </Link>
        </p>
      </form>
    </SideShell>
  );
}

function ResultHead({ cfg, f, count }: { cfg: VkConfig; f: ListFilters; count: number }) {
  const opt = (sort: "area" | "new", label: string) => (
    <Link href={listHref(cfg, { ...f, sort, page: 1 }, "#val-results")} prefetch={false} className={f.sort === sort ? "is-on" : ""} aria-current={f.sort === sort ? "true" : undefined}>
      {label}
    </Link>
  );
  return (
    <div className="val-rh" id="val-results">
      <h2 className="val-rh-t">
        <span className="val-rh-l">{cfg.noun}の記事</span>
        <span className="val-rh-n">{count}</span>
        <span className="val-rh-u">件</span>
      </h2>
      {count > 1 ? (
        <nav className="val-sort" aria-label="並べ替え">
          {opt("area", "エリア順")}
          {opt("new", "新着順")}
        </nav>
      ) : null}
    </div>
  );
}

/** 一覧の 1 行 = 1 本の記事(見本は 01 02 … の連番・種類の英字・2 行の見出し・3 行の文・小さな札 4 つ・「詳細を見る」。写真は左右交互。リンク先は店の記事) */
export function Card({ cfg, s, n, i, href }: { cfg: VkConfig; s: LiveShop; n: number; i: number; href?: string }) {
  const L = vkLinks(cfg);
  const c = cardCopyOf(cfg, s);
  const ph = s.photo;
  return (
    <article className={`val-row vk-hov io ${i % 2 === 1 ? "is-flip" : ""}`} data-io={i % 2 === 1 ? "left" : "right"} data-v={i % 5}>
      <div className="val-txt">
        <p className="val-head">
          <span className="vk-num val-n">{String(n).padStart(2, "0")}</span>
          {kindEn(cfg, s.kind) ? <span className="vk-kind val-kind">{kindEn(cfg, s.kind)}</span> : null}
        </p>
        <h3 className="val-name">
          <Link href={href ?? L.article(s.id)} prefetch={false}>
            <span className="val-l1">
              <Nm text={c.l1} />
            </span>
            <span className="val-l2">
              <Nm text={c.l2} />
            </span>
          </Link>
        </h3>
        {c.text ? (
          <p className="val-desc">
            <Nm text={c.text} />
          </p>
        ) : null}
        {c.feats.length > 0 ? (
          <ul className="val-tags">
            {c.feats.map((t) => (
              <li key={t.key} className="vk-tag">
                {t.kind === "pin" ? <IconPin /> : t.kind === "type" ? <KindIcon icon={iconOf(cfg, s.kind)} /> : <TagIcon label={t.label} />}
                <span>{t.kind === "type" ? <KindName name={t.label} /> : t.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="vk-more val-more">
          <span>詳細を見る</span>
          <IconArrow />
        </span>
      </div>
      <div className={`val-ph vk-zoom ${ph ? "" : "val-ph--none"}`}>
        {ph ? (
          <img src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} style={{ objectPosition: `50% ${c.focusY}%` }} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="val-nophoto">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        )}
      </div>
    </article>
  );
}

/** ページ送り(リンク)。7 ページまでは全部、それ以上は 先頭・今のページの前後・最後 */
export function Pager({ page, pages, hrefOf }: { page: number; pages: number; hrefOf: (n: number) => string }) {
  if (pages <= 1) return null;
  const nums: Array<number | "…"> = [];
  if (pages <= 7) for (let n = 1; n <= pages; n++) nums.push(n);
  else {
    const sorted = [...new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) nums.push("…");
      nums.push(n);
    });
  }
  return (
    <nav className="val-pager" aria-label="ページ送り">
      {page > 1 ? (
        <Link href={hrefOf(page - 1)} prefetch={false} className="val-pg val-pg--arrow" aria-label="前のページ" rel="prev">
          <IconChevronLeft />
        </Link>
      ) : (
        <span className="val-pg val-pg--arrow is-off" aria-hidden="true">
          <IconChevronLeft />
        </span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`d${i}`} className="val-pg-dots" aria-hidden="true">
            …
          </span>
        ) : (
          <Link key={n} href={hrefOf(n)} prefetch={false} className={`val-pg ${page === n ? "is-on" : ""}`} aria-label={`${n}ページ`} aria-current={page === n ? "page" : undefined}>
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefOf(page + 1)} prefetch={false} className="val-pg val-pg--arrow" aria-label="次のページ" rel="next">
          <IconChevron />
        </Link>
      ) : (
        <span className="val-pg val-pg--arrow is-off" aria-hidden="true">
          <IconChevron />
        </span>
      )}
    </nav>
  );
}

function Empty({ cfg, total }: { cfg: VkConfig; total: number }) {
  const L = vkLinks(cfg);
  const c = cfg.list;
  return (
    <div className="val-empty">
      {total === 0 ? (
        <>
          <p className="val-empty-t">{c.emptyNone[0]}</p>
          <p className="val-empty-d">{c.emptyNone[1]}</p>
          <Link href={L.search} className="vk-more">
            <span>{cfg.noun}を探す</span>
            <IconArrow />
          </Link>
        </>
      ) : (
        <>
          <p className="val-empty-t">条件に合う記事はありません。</p>
          <p className="val-empty-d">条件をゆるめて、もう一度探してみてください。</p>
          <Link href={L.articles} prefetch={false} className="vk-more">
            <span>条件をはずして見る</span>
            <IconArrow />
          </Link>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ ページ
/** 記事の一覧の中身(サーバー)。shops(loadShops の全部でも、articleShops で絞った後でもよい)と URL の引数を渡す */
export function ArticleListView({ cfg, shops: all, sp }: { cfg: VkConfig; shops: LiveShop[]; sp: SP }) {
  const L = vkLinks(cfg);
  const v = VERTICALS[cfg.key];
  const shops = articleShops(all);
  const facets = facetsOf(cfg, shops);
  const f0 = parseFilters(sp, facets);
  const list = filterShops(cfg, shops, f0);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(f0.page, pages);
  const f: ListFilters = { ...f0, page: cur };
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const scope = scopeOf(f, facets);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: `${cfg.noun}の記事`, url: absUrl(L.articles) },
  ]);
  return (
    <Shell cfg={cfg} page="search">
      <JsonLd data={ld} />
      <div className="val">
        <Hero cfg={cfg} f={f} facets={facets} scope={scope} total={shops.length} />
        <div className="val-body" data-side={shops.length > 0 ? "1" : "0"}>
          {shops.length > 0 ? <Sidebar cfg={cfg} f={f} facets={facets} /> : null}
          <div className="val-main">
            {shops.length > 0 ? <ResultHead cfg={cfg} f={f} count={list.length} /> : null}
            {shown.length > 0 ? (
              <div className="val-rows" data-io-group>
                {shown.map((s, i) => (
                  <Card key={s.id} cfg={cfg} s={s} n={(cur - 1) * PAGE_SIZE + i + 1} i={i} />
                ))}
              </div>
            ) : (
              <Empty cfg={cfg} total={shops.length} />
            )}
            <Pager page={f.page} pages={pages} hrefOf={(n) => listHref(cfg, { ...f, page: n }, "#val-results")} />
            {shown.length > 0 ? <p className="val-note">{cfg.shop.note}</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}

type Props = { searchParams: Promise<SP> };

/** app/{業種}/article/page.tsx が使う。generateMetadata と Page(中身)を返す。外枠(VkFrame・公開スイッチ)は page.tsx が持つ */
export function vkArticleListPage(cfg: VkConfig) {
  async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const sp = await searchParams;
    const shops = articleShops(await loadListShops(cfg));
    const facets = facetsOf(cfg, shops);
    const f = parseFilters(sp, facets);
    const v = VERTICALS[cfg.key];
    const scope = scopeOf(f, facets);
    // 絞り込み・並べ替え・2 ページ目以降の URL は noindex(件数 0 を渡す)で、正本は引数なしの /{業種}/article
    const plain = f.kinds.length === 0 && f.scenes.length === 0 && !f.q && !f.region && !f.pref && f.sort === "area" && f.page === 1;
    return buildMetadata({
      vertical: cfg.key,
      title: `${scope ? `${scope}の` : ""}${cfg.noun}の記事｜${v.brand}`,
      description: cfg.article.desc,
      path: vkLinks(cfg).articles,
      count: plain ? await countPlaces(cfg.key) : 0,
    });
  }

  async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const shops = await loadListShops(cfg);
    return <ArticleListView cfg={cfg} shops={shops} sp={sp} />;
  }

  return { generateMetadata, Page };
}
