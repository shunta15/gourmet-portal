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
import { kindEn, loadShops, type LiveShop } from "../common/live";
import { IconAreaHead, IconCondHead, IconNoPhoto, IconTypeHead, TagIcon } from "./VkIcons";
import SideShell from "./SideShell";
import { PAGE_SIZE, facetsOf, filterShops, parseFilters, scopeOf, searchHref, type Facets, type SearchFilters } from "./data";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./search.css";

/**
 * 探すページ(本番 /activity/search・/sports/search・/life/search)。ステイの決定デザイン「探す」と同じ組み立て(ヒーロー+検索の箱 → 左に絞り込み・右に 01 02 … の一覧)で、
 * 中身は実在の店(getPlaces(業種) = common/live.ts の loadShops)。CSS は search.css(接頭辞 vq-)。
 * 状態は URL の引数(data.ts の冒頭)。サーバーが絞り込んで描くので、JS が無くても、リンクとフォーム(GET)で絞れる。
 * 店が 0 件でも壊れない(空の欄を出さない): 絞り込み・並べ替え・ページ送りは、データがあるものだけ出す。
 *
 * ステイの見本から置き換えた・外した欄(規約: 料金・評価・おすすめ・人気・架空の店名・体験した言い回しは出さない):
 *  - 検索の箱のチェックイン・チェックアウト・人数/部屋数 → キーワード・エリア(都道府県)・種類・こだわり条件(データにあるものだけ)
 *  - 「予算」のスライダー → 外した(料金は載せない)
 *  - 「おすすめ順 人気順 料金が安い順 新着順」 → 「エリア順 新着順」(中立の 2 つだけ)
 *  - こだわり条件 → lib/verticals/{業種}.ts の scenes(公式サイトなどで確かめられた事実のタグだけ)
 *  - 一覧の各行の見出し → 店の名前。説明文は店の紹介の 1 行(事実だけ)
 *  - 一覧の小さな札 → 所在地・種類・タグ(データにあるもの)
 *  - 「01 02 …」は、表示している順の連番(順位ではない。2 ページ目以降は続き番号)
 */

type SP = Record<string, string | string[] | undefined>;

// ------------------------------------------------------------------ 部品
function Hero({ cfg, f, facets, scope, total }: { cfg: VkConfig; f: SearchFilters; facets: Facets; scope: string; total: number }) {
  const L = vkLinks(cfg);
  const c = cfg.search;
  const crumbs = [{ label: "ホーム", href: L.home }, scope ? { label: `${cfg.noun}を探す`, href: L.search } : { label: `${cfg.noun}を探す` }, ...(scope ? [{ label: scope }] : [])];
  return (
    <section className="vq-hero" aria-label={`${cfg.noun}を探す`}>
      <div className="vq-hero-clip vk-live" aria-hidden="true">
        {/* 飾りの写真(Wikimedia Commons の CC0・パブリックドメイン。店そのものではない。出典は configs/credits.json)。ゆっくり寄り続ける */}
        <img className="vq-hero-img vk-kb" src={`${vkImg(cfg).search}/hero.webp`} width={2400} height={880} alt="" fetchPriority="high" decoding="async" style={{ objectPosition: `50% ${c.heroFocus}%` }} />
        <span className="vq-hero-wash" />
      </div>
      <div className="vq-hero-in">
        <Crumbs items={crumbs} className="vq-crumbs" />
        <h1 className="vq-h1">
          <MaskLines lines={c.h1} step={170} delay={100} />
        </h1>
        <Reveal as="p" variant="fade" className="vq-sub" delay={600}>
          {c.sub}
        </Reveal>
      </div>
      <Reveal as="p" variant="fade" className="vq-hero-note" delay={800}>
        {c.note[0]}
        <br />
        {c.note[1]}
      </Reveal>
      {total > 0 ? <SearchBox cfg={cfg} f={f} facets={facets} /> : null}
    </section>
  );
}

/** 検索の箱(エリア・種類・こだわり条件・キーワード。GET のフォーム) */
function SearchBox({ cfg, f, facets }: { cfg: VkConfig; f: SearchFilters; facets: Facets }) {
  const L = vkLinks(cfg);
  const c = cfg.search;
  const kind = f.kinds.length === 1 ? f.kinds[0] : "";
  const scene = f.scenes.length === 1 ? f.scenes[0] : "";
  return (
    <form className="vq-box" action={L.search} method="get" role="search" aria-label={`${cfg.noun}を検索`}>
      <label className="vq-cell vq-cell--q">
        <IconSearch className="vq-cell-i" />
        <span className="vq-sr">{c.boxQ}</span>
        <input type="search" name="q" defaultValue={f.q} maxLength={40} placeholder={`${c.boxQ}で探す`} autoComplete="off" />
      </label>
      {facets.prefs.length > 0 ? (
        <label className="vq-cell">
          <IconPin className="vq-cell-i" />
          <span className="vq-cell-t">
            <span className="vq-cell-l">エリア</span>
            <select name="pref" defaultValue={f.pref}>
              <option value="">指定なし</option>
              {facets.prefs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="vq-cell-c" />
        </label>
      ) : null}
      {facets.kinds.length > 0 ? (
        <label className="vq-cell">
          <KindIcon icon={iconOf(cfg, kind)} className="vq-cell-i" />
          <span className="vq-cell-t">
            <span className="vq-cell-l">{cfg.noun}の種類</span>
            <select name="kind" defaultValue={kind}>
              <option value="">指定なし</option>
              {facets.kinds.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="vq-cell-c" />
        </label>
      ) : null}
      {facets.scenes.length > 0 ? (
        <label className="vq-cell">
          <TagIcon label={facets.scenes.find((s) => s.slug === scene)?.name ?? "条件"} className="vq-cell-i" />
          <span className="vq-cell-t">
            <span className="vq-cell-l">こだわり条件</span>
            <select name="scene" defaultValue={scene}>
              <option value="">指定なし</option>
              {facets.scenes.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="vq-cell-c" />
        </label>
      ) : null}
      <button type="submit" className="vq-go">
        <IconSearch />
        <span>検索する</span>
      </button>
    </form>
  );
}

/** 左の絞り込み。エリア(地方の札はリンク)・種類・こだわり条件(チェックボックス+ボタンの GET フォーム) */
function Sidebar({ cfg, f, facets }: { cfg: VkConfig; f: SearchFilters; facets: Facets }) {
  const L = vkLinks(cfg);
  const c = cfg.search;
  const to = (patch: Partial<SearchFilters>) => searchHref(cfg, { ...f, ...patch, page: 1 }, "#vq-results");
  const region = facets.regions.find((r) => r.slug === f.region);
  return (
    <SideShell summary={scopeOf(f, facets)}>
      {facets.regions.length > 0 ? (
        <details className="vq-sec" open>
          <summary>
            <IconAreaHead className="vq-sec-i" />
            <span className="vq-sec-t">エリアから探す</span>
            <IconPlus className="vq-sec-pm vq-sec-plus" />
            <IconMinus className="vq-sec-pm vq-sec-minus" />
          </summary>
          <ul className="vq-regions">
            {facets.regions.map((r) => (
              <li key={r.slug}>
                <Link href={to({ region: r.slug, pref: "" })} prefetch={false} className={`vq-region ${f.region === r.slug ? "is-on" : ""}`} aria-current={f.region === r.slug ? "true" : undefined}>
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
          {region && region.prefs.length > 0 ? (
            <ul className="vq-prefs" aria-label={`${region.name}の都道府県`}>
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
            <p className="vq-areaclear">
              <Link href={to({ region: "", pref: "" })} prefetch={false}>
                エリアをはずす
              </Link>
            </p>
          ) : null}
        </details>
      ) : null}

      <form action={L.search} method="get" className="vq-form">
        {f.region && !f.pref ? <input type="hidden" name="region" value={f.region} /> : null}
        {f.pref ? <input type="hidden" name="pref" value={f.pref} /> : null}
        {f.sort !== "area" ? <input type="hidden" name="sort" value={f.sort} /> : null}

        {facets.kinds.length > 0 ? (
          <details className="vq-sec" open>
            <summary>
              <IconTypeHead className="vq-sec-i" />
              <span className="vq-sec-t">{cfg.noun}の種類</span>
              <IconPlus className="vq-sec-pm vq-sec-plus" />
              <IconMinus className="vq-sec-pm vq-sec-minus" />
            </summary>
            <ul className="vq-opts">
              {facets.kinds.map((k) => (
                <li key={k.slug}>
                  <label className="vq-opt">
                    <input type="checkbox" name="kind" value={k.slug} defaultChecked={f.kinds.includes(k.slug)} />
                    <KindIcon icon={iconOf(cfg, k.slug)} className="vq-opt-i" />
                    <span className="vq-opt-l">
                      <KindName name={k.name} />
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {facets.scenes.length > 0 ? (
          <details className="vq-sec" open>
            <summary>
              <IconCondHead className="vq-sec-i" />
              <span className="vq-sec-t">こだわり条件</span>
              <IconPlus className="vq-sec-pm vq-sec-plus" />
              <IconMinus className="vq-sec-pm vq-sec-minus" />
            </summary>
            <ul className="vq-opts">
              {facets.scenes.map((s) => (
                <li key={s.slug}>
                  <label className="vq-opt">
                    <input type="checkbox" name="scene" value={s.slug} defaultChecked={f.scenes.includes(s.slug)} />
                    <TagIcon label={s.name} className="vq-opt-i" />
                    <span className="vq-opt-l">{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="vq-kw">
          <label htmlFor="vq-kw-in" className="vq-kw-l">
            キーワード
          </label>
          <input id="vq-kw-in" type="search" name="q" defaultValue={f.q} maxLength={40} placeholder={c.kwEx} autoComplete="off" />
        </div>
        <button type="submit" className="vq-apply">
          この条件で検索する
        </button>
        <p className="vq-clear">
          <Link href={L.search} prefetch={false}>
            条件をクリア
          </Link>
        </p>
      </form>
    </SideShell>
  );
}

function ResultHead({ cfg, f, count }: { cfg: VkConfig; f: SearchFilters; count: number }) {
  const opt = (sort: "area" | "new", label: string) => (
    <Link href={searchHref(cfg, { ...f, sort, page: 1 }, "#vq-results")} prefetch={false} className={f.sort === sort ? "is-on" : ""} aria-current={f.sort === sort ? "true" : undefined}>
      {label}
    </Link>
  );
  return (
    <div className="vq-rh" id="vq-results">
      <h2 className="vq-rh-t">
        <span className="vq-rh-l">検索結果</span>
        <span className="vq-rh-n">{count}</span>
        <span className="vq-rh-u">件</span>
      </h2>
      {count > 1 ? (
        <nav className="vq-sort" aria-label="並べ替え">
          {opt("area", "エリア順")}
          {opt("new", "新着順")}
        </nav>
      ) : null}
    </div>
  );
}

/** 一覧の 1 行(見本は 01 02 … の連番・種類の英字・見出し・説明・小さな札 4 つ・「詳細を見る」。写真は左右交互) */
function Row({ cfg, s, n, i }: { cfg: VkConfig; s: LiveShop; n: number; i: number }) {
  const L = vkLinks(cfg);
  const desc = s.article?.headline || s.article?.lede || "";
  const tags: Array<{ key: string; label: string; kind: "pin" | "type" | "tag" }> = [
    ...(s.area ? [{ key: "area", label: s.area, kind: "pin" as const }] : []),
    ...(s.kindName ? [{ key: "kind", label: s.kindName, kind: "type" as const }] : []),
    ...s.tags.slice(0, 2).map((t) => ({ key: `t-${t}`, label: t, kind: "tag" as const })),
  ].slice(0, 4);
  const ph = s.photo;
  return (
    <article className={`vq-row vk-hov io ${i % 2 === 1 ? "is-flip" : ""}`} data-io={i % 2 === 1 ? "left" : "right"} data-v={i % 5}>
      <div className="vq-txt">
        <p className="vq-head">
          <span className="vk-num vq-n">{String(n).padStart(2, "0")}</span>
          {kindEn(cfg, s.kind) ? <span className="vk-kind vq-kind">{kindEn(cfg, s.kind)}</span> : null}
        </p>
        <h3 className="vq-name">
          <Link href={L.shop(s.id)} prefetch={false}>
            <Nm text={s.name} />
          </Link>
        </h3>
        {desc ? (
          <p className="vq-desc">
            <Nm text={desc} />
          </p>
        ) : null}
        {tags.length > 0 ? (
          <ul className="vq-tags">
            {tags.map((t) => (
              <li key={t.key} className="vk-tag">
                {t.kind === "pin" ? <IconPin /> : t.kind === "type" ? <KindIcon icon={iconOf(cfg, s.kind)} /> : <TagIcon label={t.label} />}
                <span>{t.kind === "type" ? <KindName name={t.label} /> : t.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="vk-more vq-more">
          <span>詳細を見る</span>
          <IconArrow />
        </span>
      </div>
      <div className={`vq-ph vk-zoom ${ph ? "" : "vq-ph--none"}`}>
        {ph ? (
          <img src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="vq-nophoto">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        )}
      </div>
    </article>
  );
}

/** ページ送り(リンク)。7 ページまでは全部、それ以上は 先頭・今のページの前後・最後 */
function Pager({ cfg, f, pages }: { cfg: VkConfig; f: SearchFilters; pages: number }) {
  if (pages <= 1) return null;
  const hrefOf = (n: number) => searchHref(cfg, { ...f, page: n }, "#vq-results");
  const nums: Array<number | "…"> = [];
  if (pages <= 7) for (let n = 1; n <= pages; n++) nums.push(n);
  else {
    const sorted = [...new Set([1, pages, f.page - 1, f.page, f.page + 1].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) nums.push("…");
      nums.push(n);
    });
  }
  return (
    <nav className="vq-pager" aria-label="ページ送り">
      {f.page > 1 ? (
        <Link href={hrefOf(f.page - 1)} prefetch={false} className="vq-pg vq-pg--arrow" aria-label="前のページ" rel="prev">
          <IconChevronLeft />
        </Link>
      ) : (
        <span className="vq-pg vq-pg--arrow is-off" aria-hidden="true">
          <IconChevronLeft />
        </span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`d${i}`} className="vq-pg-dots" aria-hidden="true">
            …
          </span>
        ) : (
          <Link key={n} href={hrefOf(n)} prefetch={false} className={`vq-pg ${f.page === n ? "is-on" : ""}`} aria-label={`${n}ページ`} aria-current={f.page === n ? "page" : undefined}>
            {n}
          </Link>
        ),
      )}
      {f.page < pages ? (
        <Link href={hrefOf(f.page + 1)} prefetch={false} className="vq-pg vq-pg--arrow" aria-label="次のページ" rel="next">
          <IconChevron />
        </Link>
      ) : (
        <span className="vq-pg vq-pg--arrow is-off" aria-hidden="true">
          <IconChevron />
        </span>
      )}
    </nav>
  );
}

function Empty({ cfg, total }: { cfg: VkConfig; total: number }) {
  const L = vkLinks(cfg);
  const c = cfg.search;
  return (
    <div className="vq-empty">
      {total === 0 ? (
        <>
          <p className="vq-empty-t">{c.emptyNone[0]}</p>
          <p className="vq-empty-d">{c.emptyNone[1]}</p>
          <Link href={L.home} className="vk-more">
            <span>{cfg.brand}のトップへ</span>
            <IconArrow />
          </Link>
        </>
      ) : (
        <>
          <p className="vq-empty-t">条件に合う{cfg.noun}はありません。</p>
          <p className="vq-empty-d">条件をゆるめて、もう一度探してみてください。</p>
          <Link href={L.search} prefetch={false} className="vk-more">
            <span>条件をはずして探す</span>
            <IconArrow />
          </Link>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ ページ
/** 探すページの中身(サーバー)。shops と URL の引数を渡す(本番は vkSearchPage(cfg).Page が loadShops(cfg) で渡す) */
export function SearchView({ cfg, shops, sp }: { cfg: VkConfig; shops: LiveShop[]; sp: SP }) {
  const L = vkLinks(cfg);
  const v = VERTICALS[cfg.key];
  const facets = facetsOf(cfg, shops);
  const f0 = parseFilters(sp, facets);
  const list = filterShops(cfg, shops, f0);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(f0.page, pages);
  const f: SearchFilters = { ...f0, page: cur };
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const scope = scopeOf(f, facets);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: `${cfg.noun}を探す`, url: absUrl(L.search) },
  ]);
  return (
    <Shell cfg={cfg} page="search">
      <JsonLd data={ld} />
      <div className="vq">
        <Hero cfg={cfg} f={f} facets={facets} scope={scope} total={shops.length} />
        <div className="vq-body" data-side={shops.length > 0 ? "1" : "0"}>
          {shops.length > 0 ? <Sidebar cfg={cfg} f={f} facets={facets} /> : null}
          <div className="vq-main">
            {shops.length > 0 ? <ResultHead cfg={cfg} f={f} count={list.length} /> : null}
            {shown.length > 0 ? (
              <div className="vq-rows" data-io-group>
                {shown.map((s, i) => (
                  <Row key={s.id} cfg={cfg} s={s} n={(cur - 1) * PAGE_SIZE + i + 1} i={i} />
                ))}
              </div>
            ) : (
              <Empty cfg={cfg} total={shops.length} />
            )}
            <Pager cfg={cfg} f={f} pages={pages} />
            {shown.length > 0 ? <p className="vq-note">{cfg.search.foot}</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}

type Props = { searchParams: Promise<SP> };

export function vkSearchPage(cfg: VkConfig) {
  async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const sp = await searchParams;
    const shops = await loadShops(cfg);
    const facets = facetsOf(cfg, shops);
    const f = parseFilters(sp, facets);
    const list = filterShops(cfg, shops, f);
    const v = VERTICALS[cfg.key];
    const scope = scopeOf(f, facets);
    // 種類 1 つ・都道府県 1 つだけの絞り込みなら、その URL が正本。それ以外(文字・こだわり条件・複数の種類・地方・並べ替え・2 ページ目以降)は noindex(件数 0 を渡す)で、正本は種類・都道府県だけの URL
    const plain = f.kinds.length <= 1 && f.scenes.length === 0 && !f.q && !(f.region && !f.pref) && f.sort === "area" && f.page === 1;
    return buildMetadata({
      vertical: cfg.key,
      title: `${scope ? `${scope}の` : ""}${cfg.noun}を探す｜${v.brand}`,
      description: `${scope ? `${scope}の` : ""}${cfg.noun}を、エリア・${cfg.noun}の種類・こだわり条件から探せます。${list.length > 0 ? `掲載${list.length}件。` : ""}`,
      path: searchHref(cfg, { kinds: f.kinds.slice(0, 1), pref: f.pref }),
      count: plain ? list.length : 0,
    });
  }

  async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const shops = await loadShops(cfg);
    return <SearchView cfg={cfg} shops={shops} sp={sp} />;
  }

  return { generateMetadata, Page };
}
