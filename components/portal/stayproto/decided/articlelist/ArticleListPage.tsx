import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import { IconArrow, IconChevron, IconChevronDown, IconChevronLeft, IconMinus, IconPin, IconPlus, IconSearch, StayTypeIcon } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { IMG, syLinks } from "../common/site";
import { countPlaces } from "@/lib/places";
import type { LiveShop } from "../common/live";
import { IconAreaHead, IconCondHead, IconNoPhoto, IconTypeHead, TagIcon } from "./ListIcons";
import SideShell from "./SideShell";
import { cardCopyOf } from "./copy";
import { KIND_EN, PAGE_SIZE, articleShops, facetsOf, filterShops, listHref, loadListShops, parseFilters, scopeOf, type Facets, type ListFilters } from "./data";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./articlelist.css";

/* eslint-disable @next/next/no-img-element */

/**
 * 宿の記事の一覧(本番 /stay/article)。オーナーの見本「3_探す」と同じ組み立て(ヒーロー+検索の帯 → 左に絞り込み・右に 01 02 … の記事の一覧)で、
 * 中身は実在の宿の紹介記事(紹介記事と実物の写真のある宿。common/live.ts の loadStayShops → data.ts の articleShops)。カードは各宿の記事 /stay/article/{id} へ。
 * /stay/search(search/SearchPage.tsx。別の係の持ち物)の部品と CSS を写して直したもの。CSS は articlelist.css(接頭辞 sal-)。
 * 状態は URL の引数(data.ts の冒頭)。サーバーが絞り込んで描くので、JS が無くても、リンクとフォーム(GET)で絞れる。
 * 記事が 0 本でも壊れない(空の欄を出さない): 絞り込み・並べ替え・ページ送りは、データがあるものだけ出す。
 *
 * 見本から置き換えた・外した欄(理由は規約: 料金・評価・おすすめ・人気・架空の宿名・泊まった体験・日付と人数の箱は出さない):
 *  - 見出し「宿を探す。旅を見つける。」 → 「宿の記事を読む。旅を見つける。」/ 副題・右の一言は、記事の一覧にあわせた文
 *  - 検索の箱のチェックイン・チェックアウト・人数/部屋数 → キーワード・エリア(都道府県)・宿のタイプ・こだわり条件(データにあるものだけ)
 *  - 「1泊の予算」のスライダー → 外した(料金は載せない)
 *  - 「おすすめ順 人気順 料金が安い順 新着順」 → 「エリア順 新着順」(中立の 2 つだけ)
 *  - 「検索結果 128 件」 → 「宿の記事 〇 件」
 *  - 宿のこだわり条件の 10 項目 → lib/verticals/stay.ts の scenes(温泉・ペット同伴・一人旅・記念日・素泊まり)のうち、記事のある宿にあるもの
 *  - エリアから探す 11 の地方の札 → データに記事のある宿がある地方だけ。地方を選ぶと、その地方の県が下に出る
 *  - 各行の見出し(「海と空がつながる、絶景のプライベートステイ」など)→ 「その宿の事実の句、/宿の名前」の 2 行(copy.ts。記事の事実だけ)
 *  - 3 行の文 → 記事に書いてある事実(copy.ts)/ 小さな札(海が見える 等)→ 所在地・宿の種類・宿ごとの事実 2 つ(copy.ts)
 *  - 「01 02 …」は、表示している順の連番(順位ではない。2 ページ目以降は続き番号)
 *  - 見本の最後の「空室・料金は…」の注記 → 「最新の情報は、各宿の公式サイトでご確認ください」(料金の語を出さない)
 *  - 古い一覧の「利用シーンから探す」「エリアから探す」の札の並び → 左の絞り込みに移した(見本に無い欄は置かない)
 */

type SP = Record<string, string | string[] | undefined>;

// ------------------------------------------------------------------ 部品
function Hero({ f, facets, scope, total }: { f: ListFilters; facets: Facets; scope: string; total: number }) {
  const L = syLinks("live");
  const crumbs = [{ label: "ホーム", href: L.home }, scope ? { label: "宿の記事", href: L.articles } : { label: "宿の記事" }, ...(scope ? [{ label: scope }] : [])];
  return (
    <section className="sal-hero" aria-label="宿の記事">
      <div className="sal-hero-clip sy-live" aria-hidden="true">
        {/* 飾りの写真(伊豆・白浜海岸の海と山。Wikimedia Commons の CC0。宿そのものではない。出典は common/credits.json)。ゆっくり寄り続ける */}
        <img className="sal-hero-img sy-kb" src={`${IMG}/articlelist/hero.webp`} width={2400} height={880} alt="" fetchPriority="high" decoding="async" />
        <span className="sal-hero-wash" />
      </div>
      <div className="sal-hero-in">
        <Crumbs items={crumbs} className="sal-crumbs" />
        <h1 className="sal-h1">
          <MaskLines lines={["宿の記事を読む。", "旅を見つける。"]} step={170} delay={100} />
        </h1>
        <Reveal as="p" variant="fade" className="sal-sub" delay={600}>
          実在の宿を、一軒ずつ紹介します。
        </Reveal>
      </div>
      <Reveal as="p" variant="fade" className="sal-hero-note" delay={800}>
        公式サイトなどで確認できた
        <br />
        情報をまとめた記事です。
      </Reveal>
      {total > 0 ? <SearchBox f={f} facets={facets} /> : null}
    </section>
  );
}

/** 検索の帯(見本はチェックイン・チェックアウト・人数。ここは キーワード・エリア・宿のタイプ・こだわり条件。GET のフォーム) */
function SearchBox({ f, facets }: { f: ListFilters; facets: Facets }) {
  const L = syLinks("live");
  const kind = f.kinds.length === 1 ? f.kinds[0] : "";
  const scene = f.scenes.length === 1 ? f.scenes[0] : "";
  return (
    <form className="sal-box" action={L.articles} method="get" role="search" aria-label="宿の記事を検索">
      <label className="sal-cell sal-cell--q">
        <IconSearch className="sal-cell-i" />
        <span className="sal-sr">エリア・宿名・キーワード</span>
        <input type="search" name="q" defaultValue={f.q} maxLength={40} placeholder="エリア・宿名・キーワードで探す" autoComplete="off" />
      </label>
      {facets.prefs.length > 0 ? (
        <label className="sal-cell">
          <IconPin className="sal-cell-i" />
          <span className="sal-cell-t">
            <span className="sal-cell-l">エリア</span>
            <select name="pref" defaultValue={f.pref}>
              <option value="">指定なし</option>
              {facets.prefs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="sal-cell-c" />
        </label>
      ) : null}
      {facets.kinds.length > 0 ? (
        <label className="sal-cell">
          <StayTypeIcon slug={kind || "hotel"} className="sal-cell-i" />
          <span className="sal-cell-t">
            <span className="sal-cell-l">宿のタイプ</span>
            <select name="kind" defaultValue={kind}>
              <option value="">指定なし</option>
              {facets.kinds.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="sal-cell-c" />
        </label>
      ) : null}
      {facets.scenes.length > 0 ? (
        <label className="sal-cell">
          <TagIcon label={facets.scenes.find((s) => s.slug === scene)?.name ?? "条件"} className="sal-cell-i" />
          <span className="sal-cell-t">
            <span className="sal-cell-l">こだわり条件</span>
            <select name="scene" defaultValue={scene}>
              <option value="">指定なし</option>
              {facets.scenes.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="sal-cell-c" />
        </label>
      ) : null}
      <button type="submit" className="sal-go">
        <IconSearch />
        <span>検索する</span>
      </button>
    </form>
  );
}

/** 左の絞り込み。エリア(地方の札はリンク)・宿のタイプ・こだわり条件(チェックボックス+ボタンの GET フォーム)・キーワード */
function Sidebar({ f, facets }: { f: ListFilters; facets: Facets }) {
  const L = syLinks("live");
  const to = (patch: Partial<ListFilters>) => listHref({ ...f, ...patch, page: 1 }, "#sal-results");
  const region = facets.regions.find((r) => r.slug === f.region);
  return (
    <SideShell summary={scopeOf(f, facets)}>
      {facets.regions.length > 0 ? (
        <details className="sal-sec" open>
          <summary>
            <IconAreaHead className="sal-sec-i" />
            <span className="sal-sec-t">エリアから探す</span>
            <IconPlus className="sal-sec-pm sal-sec-plus" />
            <IconMinus className="sal-sec-pm sal-sec-minus" />
          </summary>
          <ul className="sal-regions">
            {facets.regions.map((r) => (
              <li key={r.slug}>
                <Link href={to({ region: r.slug, pref: "" })} prefetch={false} className={`sal-region ${f.region === r.slug ? "is-on" : ""}`} aria-current={f.region === r.slug ? "true" : undefined}>
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
          {region && region.prefs.length > 0 ? (
            <ul className="sal-prefs" aria-label={`${region.name}の都道府県`}>
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
            <p className="sal-areaclear">
              <Link href={to({ region: "", pref: "" })} prefetch={false}>
                エリアをはずす
              </Link>
            </p>
          ) : null}
        </details>
      ) : null}

      <form action={L.articles} method="get" className="sal-form">
        {f.region && !f.pref ? <input type="hidden" name="region" value={f.region} /> : null}
        {f.pref ? <input type="hidden" name="pref" value={f.pref} /> : null}
        {f.sort !== "area" ? <input type="hidden" name="sort" value={f.sort} /> : null}

        {facets.kinds.length > 0 ? (
          <details className="sal-sec" open>
            <summary>
              <IconTypeHead className="sal-sec-i" />
              <span className="sal-sec-t">宿のタイプ</span>
              <IconPlus className="sal-sec-pm sal-sec-plus" />
              <IconMinus className="sal-sec-pm sal-sec-minus" />
            </summary>
            <ul className="sal-opts">
              {facets.kinds.map((k) => (
                <li key={k.slug}>
                  <label className="sal-opt">
                    <input type="checkbox" name="kind" value={k.slug} defaultChecked={f.kinds.includes(k.slug)} />
                    <StayTypeIcon slug={k.slug} className="sal-opt-i" />
                    <span className="sal-opt-l">{k.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {facets.scenes.length > 0 ? (
          <details className="sal-sec" open>
            <summary>
              <IconCondHead className="sal-sec-i" />
              <span className="sal-sec-t">宿のこだわり条件</span>
              <IconPlus className="sal-sec-pm sal-sec-plus" />
              <IconMinus className="sal-sec-pm sal-sec-minus" />
            </summary>
            <ul className="sal-opts">
              {facets.scenes.map((s) => (
                <li key={s.slug}>
                  <label className="sal-opt">
                    <input type="checkbox" name="scene" value={s.slug} defaultChecked={f.scenes.includes(s.slug)} />
                    <TagIcon label={s.name} className="sal-opt-i" />
                    <span className="sal-opt-l">{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="sal-kw">
          <label htmlFor="sal-kw-in" className="sal-kw-l">
            キーワード
          </label>
          <input id="sal-kw-in" type="search" name="q" defaultValue={f.q} maxLength={40} placeholder="例：宿の名前・地名・古民家" autoComplete="off" />
        </div>
        <button type="submit" className="sal-apply">
          この条件で検索する
        </button>
        <p className="sal-clear">
          <Link href={L.articles} prefetch={false}>
            条件をクリア
          </Link>
        </p>
      </form>
    </SideShell>
  );
}

function ResultHead({ f, count }: { f: ListFilters; count: number }) {
  const opt = (sort: "area" | "new", label: string) => (
    <Link href={listHref({ ...f, sort, page: 1 }, "#sal-results")} prefetch={false} className={f.sort === sort ? "is-on" : ""} aria-current={f.sort === sort ? "true" : undefined}>
      {label}
    </Link>
  );
  return (
    <div className="sal-rh" id="sal-results">
      <h2 className="sal-rh-t">
        <span className="sal-rh-l">宿の記事</span>
        <span className="sal-rh-n">{count}</span>
        <span className="sal-rh-u">件</span>
      </h2>
      {count > 1 ? (
        <nav className="sal-sort" aria-label="並べ替え">
          {opt("area", "エリア順")}
          {opt("new", "新着順")}
        </nav>
      ) : null}
    </div>
  );
}

/** 一覧の 1 行 = 1 本の記事(見本は 01 02 … の連番・種類の英字・2 行の見出し・3 行の文・小さな札 4 つ・「詳細を見る」。写真は左右交互。リンク先は宿の記事) */
function Card({ s, n, i }: { s: LiveShop; n: number; i: number }) {
  const L = syLinks("live");
  const c = cardCopyOf(s);
  const ph = s.photo;
  return (
    <article className={`sal-row sy-hov io ${i % 2 === 1 ? "is-flip" : ""}`} data-io={i % 2 === 1 ? "left" : "right"} data-v={i % 5}>
      <div className="sal-txt">
        <p className="sal-head">
          <span className="sy-num sal-n">{String(n).padStart(2, "0")}</span>
          {KIND_EN[s.kind] ? <span className="sy-kind sal-kind">{KIND_EN[s.kind]}</span> : null}
        </p>
        <h3 className="sal-name">
          <Link href={L.article(s.id)} prefetch={false}>
            <span className="sal-l1">{c.l1}</span>
            <span className="sal-l2">{c.l2}</span>
          </Link>
        </h3>
        {c.text ? <p className="sal-desc">{c.text}</p> : null}
        {c.feats.length > 0 ? (
          <ul className="sal-tags">
            {c.feats.map((t) => (
              <li key={t.key} className="sy-tag">
                {t.kind === "pin" ? <IconPin /> : t.kind === "type" ? <StayTypeIcon slug={s.kind} /> : <TagIcon label={t.label} />}
                <span>{t.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="sy-more sal-more">
          <span>詳細を見る</span>
          <IconArrow />
        </span>
      </div>
      <div className={`sal-ph sy-zoom ${ph ? "" : "sal-ph--none"}`}>
        {ph ? (
          <img src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} style={{ objectPosition: `50% ${c.focusY}%` }} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="sal-nophoto">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        )}
      </div>
    </article>
  );
}

/** ページ送り(リンク)。7 ページまでは全部、それ以上は 先頭・今のページの前後・最後 */
function Pager({ f, pages }: { f: ListFilters; pages: number }) {
  if (pages <= 1) return null;
  const hrefOf = (n: number) => listHref({ ...f, page: n }, "#sal-results");
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
    <nav className="sal-pager" aria-label="ページ送り">
      {f.page > 1 ? (
        <Link href={hrefOf(f.page - 1)} prefetch={false} className="sal-pg sal-pg--arrow" aria-label="前のページ" rel="prev">
          <IconChevronLeft />
        </Link>
      ) : (
        <span className="sal-pg sal-pg--arrow is-off" aria-hidden="true">
          <IconChevronLeft />
        </span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`d${i}`} className="sal-pg-dots" aria-hidden="true">
            …
          </span>
        ) : (
          <Link key={n} href={hrefOf(n)} prefetch={false} className={`sal-pg ${f.page === n ? "is-on" : ""}`} aria-label={`${n}ページ`} aria-current={f.page === n ? "page" : undefined}>
            {n}
          </Link>
        ),
      )}
      {f.page < pages ? (
        <Link href={hrefOf(f.page + 1)} prefetch={false} className="sal-pg sal-pg--arrow" aria-label="次のページ" rel="next">
          <IconChevron />
        </Link>
      ) : (
        <span className="sal-pg sal-pg--arrow is-off" aria-hidden="true">
          <IconChevron />
        </span>
      )}
    </nav>
  );
}

function Empty({ total }: { total: number }) {
  const L = syLinks("live");
  return (
    <div className="sal-empty">
      {total === 0 ? (
        <>
          <p className="sal-empty-t">宿の記事は、いま準備をしています。</p>
          <p className="sal-empty-d">公式サイトなどで確認できた宿から、順に載せていきます。</p>
          <Link href={L.search} className="sy-more">
            <span>宿を探す</span>
            <IconArrow />
          </Link>
        </>
      ) : (
        <>
          <p className="sal-empty-t">条件に合う記事はありません。</p>
          <p className="sal-empty-d">条件をゆるめて、もう一度探してみてください。</p>
          <Link href={L.articles} prefetch={false} className="sy-more">
            <span>条件をはずして見る</span>
            <IconArrow />
          </Link>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ ページ
/** 記事の一覧の中身(サーバー)。shops(loadStayShops の全部でも、articleShops で絞った後でもよい)と URL の引数を渡す */
export function ArticleListView({ shops: all, sp }: { shops: LiveShop[]; sp: SP }) {
  const L = syLinks("live");
  const v = VERTICALS.stay;
  const shops = articleShops(all);
  const facets = facetsOf(shops);
  const f0 = parseFilters(sp, facets);
  const list = filterShops(shops, f0);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(f0.page, pages);
  const f: ListFilters = { ...f0, page: cur };
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const scope = scopeOf(f, facets);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "宿の記事", url: absUrl(L.articles) },
  ]);
  return (
    <Shell page="search" mode="live">
      <JsonLd data={ld} />
      <div className="sal">
        <Hero f={f} facets={facets} scope={scope} total={shops.length} />
        <div className="sal-body" data-side={shops.length > 0 ? "1" : "0"}>
          {shops.length > 0 ? <Sidebar f={f} facets={facets} /> : null}
          <div className="sal-main">
            {shops.length > 0 ? <ResultHead f={f} count={list.length} /> : null}
            {shown.length > 0 ? (
              <div className="sal-rows" data-io-group>
                {shown.map((s, i) => (
                  <Card key={s.id} s={s} n={(cur - 1) * PAGE_SIZE + i + 1} i={i} />
                ))}
              </div>
            ) : (
              <Empty total={shops.length} />
            )}
            <Pager f={f} pages={pages} />
            {shown.length > 0 ? <p className="sal-note">宿の情報は変わることがあります。最新の情報は、各宿の公式サイトでご確認ください。</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}

type Props = { searchParams: Promise<SP> };

/** app/stay/article/page.tsx が使う。generateMetadata と Page(中身)を返す。外枠(StayFrame・公開スイッチ・決定デザインの切り替え)は page.tsx が持つ */
export function stayArticleListPage() {
  async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const sp = await searchParams;
    const shops = articleShops(await loadListShops());
    const facets = facetsOf(shops);
    const f = parseFilters(sp, facets);
    const v = VERTICALS.stay;
    const scope = scopeOf(f, facets);
    // 絞り込み・並べ替え・2 ページ目以降の URL は noindex(件数 0 を渡す)で、正本は引数なしの /stay/article
    const plain = f.kinds.length === 0 && f.scenes.length === 0 && !f.q && !f.region && !f.pref && f.sort === "area" && f.page === 1;
    return buildMetadata({
      vertical: "stay",
      title: `${scope ? `${scope}の` : ""}宿の記事｜${v.brand}`,
      description: "実在の宿を一軒ずつ紹介する記事の一覧です。所在地やチェックイン・チェックアウトなど、公式サイトなどで確認できた情報をまとめています。",
      path: syLinks("live").articles,
      count: plain ? await countPlaces("stay") : 0,
    });
  }

  async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const shops = await loadListShops();
    return <ArticleListView shops={shops} sp={sp} />;
  }

  return { generateMetadata, Page };
}
