import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import { IconArrow, IconChevron, IconChevronDown, IconChevronLeft, IconMinus, IconPin, IconPlus, IconSearch, StayTypeIcon } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { IMG_SEARCH, syLinks } from "../common/site";
import { loadStayShops, type LiveShop } from "../common/live";
import { IconAreaHead, IconCondHead, IconNoPhoto, IconTypeHead, TagIcon } from "./StayIcons";
import SideShell from "./SideShell";
import { KIND_EN, PAGE_SIZE, facetsOf, filterShops, parseFilters, scopeOf, searchHref, type Facets, type SearchFilters } from "./data";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { VERTICALS } from "@/lib/verticals";
import "./search.css";

/**
 * 探すページ(本番 /stay/search)。オーナーの見本「3_探す」と同じ組み立て(ヒーロー+検索の箱 → 左に絞り込み・右に 01 02 … の宿の一覧)で、
 * 中身は実在の宿(getPlaces('stay') = common/live.ts の loadStayShops)。CSS は search.css(接頭辞 sq-)。
 * 状態は URL の引数(data.ts の冒頭)。サーバーが絞り込んで描くので、JS が無くても、リンクとフォーム(GET)で絞れる。
 * 宿が 0 件でも壊れない(空の欄を出さない): 絞り込み・並べ替え・ページ送りは、データがあるものだけ出す。
 *
 * 見本から置き換えた・外した欄(理由は規約: 料金・評価・おすすめ・人気・架空の宿名・泊まった体験は出さない):
 *  - 検索の箱のチェックイン・チェックアウト・人数/部屋数 → エリア(都道府県)・宿のタイプ・こだわり条件(データにあるものだけ)
 *  - 「1泊の予算」のスライダー → 外した(料金は載せない)
 *  - 「おすすめ順 人気順 料金が安い順 新着順」 → 「エリア順 新着順」(中立の 2 つだけ)
 *  - 宿のこだわり条件の 10 項目 → lib/verticals/stay.ts の scenes(温泉・ペット同伴・一人旅・記念日・素泊まり)。「〇〇におすすめ」は「〇〇」に
 *  - エリアから探す 11 の地方の札 → データに宿がある地方だけ。地方を選ぶと、その地方の県が下に出る
 *  - 一覧の各行の見出し(「海と空がつながる、絶景のプライベートステイ」など)→ 宿の名前。説明文は宿の紹介の 1 行(事実だけ)
 *  - 一覧の小さな札(海が見える 等)→ 所在地・宿の種類・タグ(データにあるもの)
 *  - 「01 02 …」は、表示している順の連番(順位ではない。2 ページ目以降は続き番号)
 */

type SP = Record<string, string | string[] | undefined>;

// ------------------------------------------------------------------ 部品
function Hero({ f, facets, scope, total }: { f: SearchFilters; facets: Facets; scope: string; total: number }) {
  const L = syLinks("live");
  const crumbs = [{ label: "ホーム", href: L.home }, scope ? { label: "宿を探す", href: L.search } : { label: "宿を探す" }, ...(scope ? [{ label: scope }] : [])];
  return (
    <section className="sq-hero" aria-label="宿を探す">
      <div className="sq-hero-clip sy-live" aria-hidden="true">
        {/* 飾りの写真(河口湖と富士山。Wikimedia Commons の CC0。宿そのものではない)。ゆっくり寄り続ける */}
        <img className="sq-hero-img sy-kb" src={`${IMG_SEARCH}/hero.webp`} width={2400} height={880} alt="" fetchPriority="high" decoding="async" />
        <span className="sq-hero-wash" />
      </div>
      <div className="sq-hero-in">
        <Crumbs items={crumbs} className="sq-crumbs" />
        <h1 className="sq-h1">
          <MaskLines lines={["宿を探す。", "旅を見つける。"]} step={170} delay={100} />
        </h1>
        <Reveal as="p" variant="fade" className="sq-sub" delay={600}>
          心が動く、あの景色に出会う宿。
        </Reveal>
      </div>
      <Reveal as="p" variant="fade" className="sq-hero-note" delay={800}>
        エリア・宿の種類・こだわり条件から、
        <br />
        掲載している宿を探せます。
      </Reveal>
      {total > 0 ? <SearchBox f={f} facets={facets} /> : null}
    </section>
  );
}

/** 検索の箱(見本はチェックイン・チェックアウト・人数。ここは エリア・宿のタイプ・こだわり条件。GET のフォーム) */
function SearchBox({ f, facets }: { f: SearchFilters; facets: Facets }) {
  const L = syLinks("live");
  const kind = f.kinds.length === 1 ? f.kinds[0] : "";
  const scene = f.scenes.length === 1 ? f.scenes[0] : "";
  return (
    <form className="sq-box" action={L.search} method="get" role="search" aria-label="宿を検索">
      <label className="sq-cell sq-cell--q">
        <IconSearch className="sq-cell-i" />
        <span className="sq-sr">エリア・駅名・宿名</span>
        <input type="search" name="q" defaultValue={f.q} maxLength={40} placeholder="エリア・駅名・宿名で探す" autoComplete="off" />
      </label>
      {facets.prefs.length > 0 ? (
        <label className="sq-cell">
          <IconPin className="sq-cell-i" />
          <span className="sq-cell-t">
            <span className="sq-cell-l">エリア</span>
            <select name="pref" defaultValue={f.pref}>
              <option value="">指定なし</option>
              {facets.prefs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="sq-cell-c" />
        </label>
      ) : null}
      {facets.kinds.length > 0 ? (
        <label className="sq-cell">
          <StayTypeIcon slug={kind || "hotel"} className="sq-cell-i" />
          <span className="sq-cell-t">
            <span className="sq-cell-l">宿のタイプ</span>
            <select name="kind" defaultValue={kind}>
              <option value="">指定なし</option>
              {facets.kinds.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="sq-cell-c" />
        </label>
      ) : null}
      {facets.scenes.length > 0 ? (
        <label className="sq-cell">
          <TagIcon label={facets.scenes.find((s) => s.slug === scene)?.name ?? "条件"} className="sq-cell-i" />
          <span className="sq-cell-t">
            <span className="sq-cell-l">こだわり条件</span>
            <select name="scene" defaultValue={scene}>
              <option value="">指定なし</option>
              {facets.scenes.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </span>
          <IconChevronDown className="sq-cell-c" />
        </label>
      ) : null}
      <button type="submit" className="sq-go">
        <IconSearch />
        <span>検索する</span>
      </button>
    </form>
  );
}

/** 左の絞り込み。エリア(地方の札はリンク)・宿のタイプ・こだわり条件(チェックボックス+ボタンの GET フォーム) */
function Sidebar({ f, facets }: { f: SearchFilters; facets: Facets }) {
  const L = syLinks("live");
  const to = (patch: Partial<SearchFilters>) => searchHref({ ...f, ...patch, page: 1 }, "#sq-results");
  const region = facets.regions.find((r) => r.slug === f.region);
  return (
    <SideShell summary={scopeOf(f, facets)}>
      {facets.regions.length > 0 ? (
        <details className="sq-sec" open>
          <summary>
            <IconAreaHead className="sq-sec-i" />
            <span className="sq-sec-t">エリアから探す</span>
            <IconPlus className="sq-sec-pm sq-sec-plus" />
            <IconMinus className="sq-sec-pm sq-sec-minus" />
          </summary>
          <ul className="sq-regions">
            {facets.regions.map((r) => (
              <li key={r.slug}>
                <Link href={to({ region: r.slug, pref: "" })} prefetch={false} className={`sq-region ${f.region === r.slug ? "is-on" : ""}`} aria-current={f.region === r.slug ? "true" : undefined}>
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
          {region && region.prefs.length > 0 ? (
            <ul className="sq-prefs" aria-label={`${region.name}の都道府県`}>
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
            <p className="sq-areaclear">
              <Link href={to({ region: "", pref: "" })} prefetch={false}>
                エリアをはずす
              </Link>
            </p>
          ) : null}
        </details>
      ) : null}

      <form action={L.search} method="get" className="sq-form">
        {f.region && !f.pref ? <input type="hidden" name="region" value={f.region} /> : null}
        {f.pref ? <input type="hidden" name="pref" value={f.pref} /> : null}
        {f.sort !== "area" ? <input type="hidden" name="sort" value={f.sort} /> : null}

        {facets.kinds.length > 0 ? (
          <details className="sq-sec" open>
            <summary>
              <IconTypeHead className="sq-sec-i" />
              <span className="sq-sec-t">宿のタイプ</span>
              <IconPlus className="sq-sec-pm sq-sec-plus" />
              <IconMinus className="sq-sec-pm sq-sec-minus" />
            </summary>
            <ul className="sq-opts">
              {facets.kinds.map((k) => (
                <li key={k.slug}>
                  <label className="sq-opt">
                    <input type="checkbox" name="kind" value={k.slug} defaultChecked={f.kinds.includes(k.slug)} />
                    <StayTypeIcon slug={k.slug} className="sq-opt-i" />
                    <span className="sq-opt-l">{k.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {facets.scenes.length > 0 ? (
          <details className="sq-sec" open>
            <summary>
              <IconCondHead className="sq-sec-i" />
              <span className="sq-sec-t">宿のこだわり条件</span>
              <IconPlus className="sq-sec-pm sq-sec-plus" />
              <IconMinus className="sq-sec-pm sq-sec-minus" />
            </summary>
            <ul className="sq-opts">
              {facets.scenes.map((s) => (
                <li key={s.slug}>
                  <label className="sq-opt">
                    <input type="checkbox" name="scene" value={s.slug} defaultChecked={f.scenes.includes(s.slug)} />
                    <TagIcon label={s.name} className="sq-opt-i" />
                    <span className="sq-opt-l">{s.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="sq-kw">
          <label htmlFor="sq-kw-in" className="sq-kw-l">
            キーワード
          </label>
          <input id="sq-kw-in" type="search" name="q" defaultValue={f.q} maxLength={40} placeholder="例：宿の名前・地名・駅名" autoComplete="off" />
        </div>
        <button type="submit" className="sq-apply">
          この条件で検索する
        </button>
        <p className="sq-clear">
          <Link href={L.search} prefetch={false}>
            条件をクリア
          </Link>
        </p>
      </form>
    </SideShell>
  );
}

function ResultHead({ f, count }: { f: SearchFilters; count: number }) {
  const opt = (sort: "area" | "new", label: string) => (
    <Link href={searchHref({ ...f, sort, page: 1 }, "#sq-results")} prefetch={false} className={f.sort === sort ? "is-on" : ""} aria-current={f.sort === sort ? "true" : undefined}>
      {label}
    </Link>
  );
  return (
    <div className="sq-rh" id="sq-results">
      <h2 className="sq-rh-t">
        <span className="sq-rh-l">検索結果</span>
        <span className="sq-rh-n">{count}</span>
        <span className="sq-rh-u">件</span>
      </h2>
      {count > 1 ? (
        <nav className="sq-sort" aria-label="並べ替え">
          {opt("area", "エリア順")}
          {opt("new", "新着順")}
        </nav>
      ) : null}
    </div>
  );
}

/** 一覧の 1 行(見本は 01 02 … の連番・種類の英字・見出し・説明・小さな札 4 つ・「詳細を見る」。写真は左右交互) */
function Row({ s, n, i }: { s: LiveShop; n: number; i: number }) {
  const L = syLinks("live");
  const desc = s.article?.headline || s.article?.lede || "";
  const tags: Array<{ key: string; label: string; kind: "pin" | "type" | "tag" }> = [
    ...(s.area ? [{ key: "area", label: s.area, kind: "pin" as const }] : []),
    ...(s.kindName ? [{ key: "kind", label: s.kindName, kind: "type" as const }] : []),
    ...s.tags.slice(0, 2).map((t) => ({ key: `t-${t}`, label: t, kind: "tag" as const })),
  ].slice(0, 4);
  const ph = s.photo;
  return (
    <article className={`sq-row sy-hov io ${i % 2 === 1 ? "is-flip" : ""}`} data-io={i % 2 === 1 ? "left" : "right"} data-v={i % 5}>
      <div className="sq-txt">
        <p className="sq-head">
          <span className="sy-num sq-n">{String(n).padStart(2, "0")}</span>
          {KIND_EN[s.kind] ? <span className="sy-kind sq-kind">{KIND_EN[s.kind]}</span> : null}
        </p>
        <h3 className="sq-name">
          <Link href={L.shop(s.id)} prefetch={false}>
            {s.name}
          </Link>
        </h3>
        {desc ? <p className="sq-desc">{desc}</p> : null}
        {tags.length > 0 ? (
          <ul className="sq-tags">
            {tags.map((t) => (
              <li key={t.key} className="sy-tag">
                {t.kind === "pin" ? <IconPin /> : t.kind === "type" ? <StayTypeIcon slug={s.kind} /> : <TagIcon label={t.label} />}
                <span>{t.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <span className="sy-more sq-more">
          <span>詳細を見る</span>
          <IconArrow />
        </span>
      </div>
      <div className={`sq-ph sy-zoom ${ph ? "" : "sq-ph--none"}`}>
        {ph ? (
          <img src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="sq-nophoto">
            <IconNoPhoto />
            <span>写真は準備中です</span>
          </span>
        )}
      </div>
    </article>
  );
}

/** ページ送り(リンク)。7 ページまでは全部、それ以上は 先頭・今のページの前後・最後 */
function Pager({ f, pages }: { f: SearchFilters; pages: number }) {
  if (pages <= 1) return null;
  const hrefOf = (n: number) => searchHref({ ...f, page: n }, "#sq-results");
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
    <nav className="sq-pager" aria-label="ページ送り">
      {f.page > 1 ? (
        <Link href={hrefOf(f.page - 1)} prefetch={false} className="sq-pg sq-pg--arrow" aria-label="前のページ" rel="prev">
          <IconChevronLeft />
        </Link>
      ) : (
        <span className="sq-pg sq-pg--arrow is-off" aria-hidden="true">
          <IconChevronLeft />
        </span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`d${i}`} className="sq-pg-dots" aria-hidden="true">
            …
          </span>
        ) : (
          <Link key={n} href={hrefOf(n)} prefetch={false} className={`sq-pg ${f.page === n ? "is-on" : ""}`} aria-label={`${n}ページ`} aria-current={f.page === n ? "page" : undefined}>
            {n}
          </Link>
        ),
      )}
      {f.page < pages ? (
        <Link href={hrefOf(f.page + 1)} prefetch={false} className="sq-pg sq-pg--arrow" aria-label="次のページ" rel="next">
          <IconChevron />
        </Link>
      ) : (
        <span className="sq-pg sq-pg--arrow is-off" aria-hidden="true">
          <IconChevron />
        </span>
      )}
    </nav>
  );
}

function Empty({ total }: { total: number }) {
  const L = syLinks("live");
  return (
    <div className="sq-empty">
      {total === 0 ? (
        <>
          <p className="sq-empty-t">宿は、いま掲載の準備をしています。</p>
          <p className="sq-empty-d">掲載できるようになったら、ここから探せるようになります。</p>
          <Link href={L.home} className="sy-more">
            <span>マチノワステイのトップへ</span>
            <IconArrow />
          </Link>
        </>
      ) : (
        <>
          <p className="sq-empty-t">条件に合う宿はありません。</p>
          <p className="sq-empty-d">条件をゆるめて、もう一度探してみてください。</p>
          <Link href={L.search} prefetch={false} className="sy-more">
            <span>条件をはずして探す</span>
            <IconArrow />
          </Link>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ ページ
/** 探すページの中身(サーバー)。shops と URL の引数を渡す(本番は staySearchPage().Page が loadStayShops() で渡す) */
export function SearchView({ shops, sp }: { shops: LiveShop[]; sp: SP }) {
  const L = syLinks("live");
  const v = VERTICALS.stay;
  const facets = facetsOf(shops);
  const f0 = parseFilters(sp, facets);
  const list = filterShops(shops, f0);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(f0.page, pages);
  const f: SearchFilters = { ...f0, page: cur };
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const scope = scopeOf(f, facets);
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "宿を探す", url: absUrl(L.search) },
  ]);
  return (
    <Shell page="search" mode="live">
      <JsonLd data={ld} />
      <div className="sq">
        <Hero f={f} facets={facets} scope={scope} total={shops.length} />
        <div className="sq-body" data-side={shops.length > 0 ? "1" : "0"}>
          {shops.length > 0 ? <Sidebar f={f} facets={facets} /> : null}
          <div className="sq-main">
            {shops.length > 0 ? <ResultHead f={f} count={list.length} /> : null}
            {shown.length > 0 ? (
              <div className="sq-rows" data-io-group>
                {shown.map((s, i) => (
                  <Row key={s.id} s={s} n={(cur - 1) * PAGE_SIZE + i + 1} i={i} />
                ))}
              </div>
            ) : (
              <Empty total={shops.length} />
            )}
            <Pager f={f} pages={pages} />
            {shown.length > 0 ? <p className="sq-note">宿の情報は変わることがあります。空室・料金は、各宿の公式サイトでご確認ください。</p> : null}
          </div>
        </div>
      </div>
    </Shell>
  );
}

type Props = { searchParams: Promise<SP> };

export function staySearchPage() {
  async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const sp = await searchParams;
    const shops = await loadStayShops();
    const facets = facetsOf(shops);
    const f = parseFilters(sp, facets);
    const list = filterShops(shops, f);
    const v = VERTICALS.stay;
    const scope = scopeOf(f, facets);
    // 種類 1 つ・都道府県 1 つだけの絞り込みなら、その URL が正本。それ以外(文字・こだわり条件・複数の種類・地方・並べ替え・2 ページ目以降)は noindex(件数 0 を渡す)で、正本は種類・都道府県だけの URL
    const plain = f.kinds.length <= 1 && f.scenes.length === 0 && !f.q && !(f.region && !f.pref) && f.sort === "area" && f.page === 1;
    return buildMetadata({
      vertical: "stay",
      title: `${scope ? `${scope}の` : ""}宿を探す｜${v.brand}`,
      description: `${scope ? `${scope}の` : ""}宿を、エリア・宿の種類・こだわり条件から探せます。${list.length > 0 ? `掲載${list.length}件。` : ""}`,
      path: searchHref({ kinds: f.kinds.slice(0, 1), pref: f.pref }),
      count: plain ? list.length : 0,
    });
  }

  async function Page({ searchParams }: Props) {
    const sp = await searchParams;
    const shops = await loadStayShops();
    return <SearchView shops={shops} sp={sp} />;
  }

  return { generateMetadata, Page };
}
