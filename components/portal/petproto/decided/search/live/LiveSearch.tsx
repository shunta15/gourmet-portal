import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Shell from "../../common/Shell";
import Logo from "../../common/Logo";
import { IconArrow, IconPin } from "../../common/Icons";
import { Heart, CountUp, MaskLines, Write, FillHeading, PawTrail } from "../../common/Motion";
import { IMG_SEARCH, ptLinks } from "../../common/site";
import { IconChevronLR } from "../SearchIcons";
import HeroScroll from "../HeroScroll";
import { FilterBar, SearchBox, SortSelect, type LinkOption, type PillDef } from "./LiveControls";
import { IconPawLine } from "./LiveIcons";
import { PAGE_SIZE, facetsOf, filterShops, loadPetShops, parseFilters, petFeatureCount, searchHref, shopHref, type PetFacets, type PetFilters, type PetShop } from "./liveData";
import { sized } from "@/lib/imageUrl";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";
import { getVertical } from "@/lib/verticals";
import "./search-live.css";

/**
 * 探すページ(本番 /pet/search)。見本「探す」(../SearchPage.tsx・../search.css)と同じ見た目・動きで、中身は実在の店(getPlaces('pet'))。
 * 見本は触らない(試作 /proto-pet/decided/search は仮の内容のまま残す)。本番の CSS は search-live.css(接頭辞 lsr-)。
 * 状態は URL の引数(kind・pref・tag・animal・q・sort・page)。サーバーが絞り込んで描くので、JS が無くても選択肢のリンクで絞れる。
 * 店が 0 件でも壊れない(空の欄を出さない): 条件の箱・右の列・ページ送りは、データがあるものだけ出す。
 *
 * 見本から外した・替えた欄:
 *  - 「地図から探す」(東京周辺の地図画像と架空のピン)を外した(実在の地図の素材が無い)
 *  - 条件の 6 つ(犬のサイズ・店内OK・テラスOK・駐車場あり・予約可・予算)は、データにある 種類・エリア・対応動物・こだわり に替えた
 *  - 「よく使われる条件」は「条件から探す」に(データにあるこだわり・対応動物。多い順)。「特集から探す」は、特集記事があるときだけ
 *  - 「おすすめ順」は「エリア順・店名順」に。ハートは見た目だけ(保存はしない)
 */

type SP = Record<string, string | string[] | undefined>;
const AREA_IMG = new Set(["tokyo", "kanagawa", "chiba", "saitama", "yamanashi", "shizuoka"]);

const withPage = (f: PetFilters, page: number) => ({ ...f, page });

function scopeOf(f: PetFilters, facets: PetFacets): string {
  const pref = facets.prefs.find((x) => x.pref.slug === f.pref)?.pref;
  const kind = facets.kinds.find((x) => x.slug === f.kind)?.name;
  const parts = [pref?.name, kind, f.animal ? `${f.animal}に対応` : "", f.tag, f.q ? `「${f.q}」` : ""].filter(Boolean);
  return parts.join("・");
}

// ------------------------------------------------------------------ 部品
function Hero({ f, facets, areaEx, kindEx }: { f: PetFilters; facets: PetFacets; areaEx: string; kindEx: string }) {
  const L = ptLinks("live");
  const keep: Record<string, string> = { pref: f.pref, tag: f.tag, animal: f.animal, sort: f.sort === "name" ? "name" : "" };
  return (
    <>
      <section className="lsr-hero pt-live" aria-label="お店を探す">
        {/* 写真は 2 層: 外側 = スクロールで寄りながら遅れて動く(視差)/ 内側 = ゆっくり寄り続ける(pt-kb)。先頭では見本どおり */}
        <div className="lsr-hero-par">
          <img className="lsr-hero-img pt-kb" src={`${IMG_SEARCH}/hero.webp`} width={948} height={224} alt="" fetchPriority="high" />
        </div>
        <div className="lsr-hero-sh pt-shine" aria-hidden="true" />
        <h1 className="lsr-h1-w">
          <MaskLines as="span" className="lsr-h1" lines={["ペットのお店を", "エリアから探す"]} step={170} delay={120} />
        </h1>
        <div className="lsr-sub-w">
          <Write as="p" className="lsr-sub" lines={["犬カフェ・猫カフェ・ペットホテルなど、", "エリアや種類から近くのお店を探せます。"]} delay={650} step={520} />
        </div>
      </section>
      <HeroScroll target=".lsr-hero" />
      <div className="lsr-boxw pt-live">
        <SearchBox action={L.search} q={f.q} kind={f.kind} keep={keep} kinds={facets.kinds.map((k) => ({ slug: k.slug, name: k.name }))} areaEx={areaEx} kindEx={kindEx} />
      </div>
    </>
  );
}

function pills(f: PetFilters, facets: PetFacets): PillDef[] {
  const to = (patch: Partial<PetFilters>) => searchHref({ ...f, ...patch, page: 1 }, "#lsr-results");
  const all = (key: keyof PetFilters, label = "すべて"): LinkOption => ({ label, href: to({ [key]: "" } as Partial<PetFilters>), on: !f[key] });
  const out: PillDef[] = [];
  if (facets.kinds.length > 0) {
    out.push({
      key: "kind",
      label: "種類",
      value: facets.kinds.find((k) => k.slug === f.kind)?.name ?? "すべて",
      active: !!f.kind,
      icon: "category",
      options: [all("kind"), ...facets.kinds.map((k) => ({ label: `${k.name}(${k.count})`, href: to({ kind: k.slug }), on: f.kind === k.slug }))],
    });
  }
  if (facets.prefs.length > 0) {
    out.push({
      key: "pref",
      label: "エリア",
      value: facets.prefs.find((p) => p.pref.slug === f.pref)?.pref.short ?? "すべて",
      active: !!f.pref,
      icon: "pin",
      options: [all("pref"), ...facets.prefs.map((p) => ({ label: `${p.pref.name}(${p.count})`, href: to({ pref: p.pref.slug }), on: f.pref === p.pref.slug }))],
    });
  }
  if (facets.animals.length > 0) {
    out.push({
      key: "animal",
      label: "対応動物",
      value: f.animal || "すべて",
      active: !!f.animal,
      icon: "dog",
      options: [all("animal"), ...facets.animals.map((a) => ({ label: `${a.name}(${a.count})`, href: to({ animal: a.name }), on: f.animal === a.name }))],
    });
  }
  if (facets.tags.length > 0) {
    out.push({
      key: "tag",
      label: "こだわり",
      value: f.tag || "指定なし",
      active: !!f.tag,
      icon: "tag",
      options: [all("tag", "指定なし"), ...facets.tags.slice(0, 40).map((t) => ({ label: `${t.name}(${t.count})`, href: to({ tag: t.name }), on: f.tag === t.name }))],
    });
  }
  return out;
}

function Crumb({ scope }: { scope: string }) {
  const L = ptLinks("live");
  const chev = (
    <svg viewBox="0 0 8 12" aria-hidden="true" className="lsr-crumb-s">
      <path d="m1.8 1.5 4.4 4.5-4.4 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <nav className="lsr-crumb io" data-io="left" aria-label="パンくず">
      <Link href={L.home}>ホーム</Link>
      {chev}
      {scope ? <Link href={L.search}>お店を探す</Link> : <span aria-current="page">お店を探す</span>}
      {scope ? (
        <>
          {chev}
          <span aria-current="page">{scope}</span>
        </>
      ) : null}
    </nav>
  );
}

function ResultHead({ count, sortValue, sortOptions }: { count: number; sortValue: string; sortOptions: LinkOption[] }) {
  return (
    <div className="lsr-rh" id="lsr-results">
      <h2 className="lsr-rh-t">
        <FillHeading as="span" className="lsr-rh-jp" start={1.05} end={0.9}>
          検索結果
        </FillHeading>
        <span className="lsr-rh-n">
          <CountUp to={count} className="lsr-rh-num" />
          <span className="lsr-rh-u">件</span>
        </span>
      </h2>
      <PawTrail count={7} direction="right" size={12} gap="calc(8 * var(--u))" className="lsr-trail-h" />
      {count > 1 ? <SortSelect value={sortValue} options={sortOptions} /> : null}
    </div>
  );
}

function Cards({ shops }: { shops: PetShop[] }) {
  return (
    <div className="lsr-cards pt-skew" data-skew="0.5">
      {shops.map((c, i) => {
        const d = (i % 3) * 120; // 列ごとに少しずつずらす(行は画面に入った順)
        return (
          <article key={c.id} className="lsr-card io pt-lift pt-tilt" data-tilt="5" style={{ ["--d" as string]: `${d}ms`, ["--c" as string]: `${d}ms` }}>
            <Link href={shopHref(c.id)} prefetch={false} className="lsr-card-a" aria-label={`${c.name}を見る`} />
            <div className={`lsr-photo pt-zoom ${c.photo ? "" : "lsr-photo--none"}`}>
              {c.photo ? (
                <div className="lsr-photo-w pt-wipe" data-wipe={i % 2 ? "right" : "left"} style={{ ["--d" as string]: `${d + 160}ms` }}>
                  <img src={sized(c.photo.src, 640)} alt={c.photo.alt} width={c.photo.w ?? 640} height={c.photo.h ?? 448} loading={i < 3 ? "eager" : "lazy"} decoding="async" />
                </div>
              ) : (
                <div className="lsr-nophoto" aria-hidden="true">
                  <IconPawLine />
                  <span>写真なし</span>
                </div>
              )}
              <i className="pt-tilt-glare" aria-hidden="true" />
              <Heart className="lsr-heart pt-popin" label={`${c.name}をお気に入りに追加`} size={17} />
            </div>
            <h3 className="lsr-card-t">{c.name}</h3>
            <p className="lsr-card-cat">
              <span className="lsr-cat">{c.kindName}</span>
            </p>
            {c.place ? (
              <p className="lsr-card-pl">
                <IconPin className="lsr-card-pin" />
                <span>{c.place}</span>
              </p>
            ) : null}
            {c.blurb ? <p className="lsr-card-d">{c.blurb}</p> : null}
            {c.chips.length > 0 ? (
              <ul className="lsr-card-tags">
                {c.chips.map((t) => (
                  <li key={t} className="lsr-tag">
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

/** ページ送り(リンク)。7 ページまでは全部、それ以上は 先頭・今のページの前後・最後 */
function Pager({ f, pages }: { f: PetFilters; pages: number }) {
  if (pages <= 1) return null;
  const hrefOf = (n: number) => searchHref(withPage(f, n), "#lsr-results");
  const nums: Array<number | "…"> = [];
  if (pages <= 7) for (let n = 1; n <= pages; n++) nums.push(n);
  else {
    const set = new Set([1, pages, f.page - 1, f.page, f.page + 1].filter((n) => n >= 1 && n <= pages));
    const sorted = [...set].sort((a, b) => a - b);
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) nums.push("…");
      nums.push(n);
    });
  }
  const arrow = (dir: "left" | "right", to: number, ok: boolean) =>
    ok ? (
      <Link href={hrefOf(to)} prefetch={false} className={`lsr-pg lsr-pg-arrow lsr-pg-${dir === "left" ? "prev" : "next"} pt-press pt-magnet`} data-magnet="0.55" data-magnet-r="16" aria-label={dir === "left" ? "前のページ" : "次のページ"}>
        <IconChevronLR dir={dir} />
      </Link>
    ) : (
      <span className={`lsr-pg lsr-pg-arrow lsr-pg-${dir === "left" ? "prev" : "next"} is-off`} aria-hidden="true">
        <IconChevronLR dir={dir} />
      </span>
    );
  return (
    <div className="lsr-pagerw">
      <nav className="lsr-pager" aria-label="ページ送り">
        {arrow("left", f.page - 1, f.page > 1)}
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`d${i}`} className="lsr-pg-dots" aria-hidden="true">
              …
            </span>
          ) : (
            <Link key={n} href={hrefOf(n)} prefetch={false} className={`lsr-pg lsr-pg-n pt-press pt-magnet ${f.page === n ? "is-on" : ""}`} data-magnet="0.55" data-magnet-r="16" aria-label={`${n}ページ`} aria-current={f.page === n ? "page" : undefined}>
              {n}
            </Link>
          ),
        )}
        {arrow("right", f.page + 1, f.page < pages)}
      </nav>
      {/* ページ送りの右の余白を、画面に入ると足あとが順に歩く(見本の飾り) */}
      <div className="lsr-trail-w" aria-hidden="true">
        <PawTrail count={9} direction="right" size={17} gap="calc(14 * var(--u))" mode="auto" delay={250} className="lsr-trail" />
      </div>
    </div>
  );
}

function Empty({ total, f }: { total: number; f: PetFilters }) {
  const L = ptLinks("live");
  return (
    <div className="lsr-empty">
      <IconPawLine className="lsr-empty-i" />
      {total === 0 ? (
        <>
          <p className="lsr-empty-t">ペットのお店は、いま掲載の準備をしています。</p>
          <p className="lsr-empty-d">掲載できるようになったら、ここから探せるようになります。</p>
          <Link href={L.home} className="lsr-empty-a">
            マチノワPetのトップへ
          </Link>
        </>
      ) : (
        <>
          <p className="lsr-empty-t">条件に合うお店はありません。</p>
          <p className="lsr-empty-d">条件をゆるめて、もう一度探してみてください。</p>
          <Link href={searchHref({ sort: f.sort })} className="lsr-empty-a">
            条件をはずして探す
          </Link>
        </>
      )}
    </div>
  );
}

function Side({ facets, hasFeatures }: { facets: PetFacets; hasFeatures: boolean }) {
  const L = ptLinks("live");
  const areas = facets.prefs.slice(0, 6);
  const chips = [
    ...facets.animals.slice(0, 3).map((a) => ({ label: `${a.name}に対応`, href: searchHref({ animal: a.name }, "#lsr-results") })),
    ...facets.tags.slice(0, 8).map((t) => ({ label: t.name, href: searchHref({ tag: t.name }, "#lsr-results") })),
  ].slice(0, 8);
  if (areas.length === 0 && chips.length === 0 && !hasFeatures) return null;
  return (
    <aside className="lsr-side io pt-bgshift pt-skew" data-io="right" data-skew="0.45" style={{ ["--bg-to" as string]: "#faf8f6", ["--bg-from" as string]: "#efe7db" }} aria-label="ほかの探し方">
      {areas.length > 0 ? (
        <section className="lsr-sd lsr-sd-area" aria-labelledby="lsr-area-h">
          <div className="lsr-sd-hd">
            <h2 id="lsr-area-h" className="lsr-sd-h">
              <span className="pt-fill">エリアから探す</span>
            </h2>
            {facets.prefs.length > areas.length ? (
              <Link href={L.areaAnchor} className="pt-more lsr-sd-more">
                <span>すべてのエリアを見る</span>
                <IconArrow />
              </Link>
            ) : null}
          </div>
          <ul className="lsr-areas">
            {areas.map((a, i) => (
              <li key={a.pref.slug} className="lsr-area pt-popin" style={{ ["--d" as string]: `${(i % 3) * 90 + Math.floor(i / 3) * 140}ms` }}>
                <Link href={searchHref({ pref: a.pref.slug }, "#lsr-results")} prefetch={false} className="pt-hov">
                  <span className={`lsr-area-p pt-zoom ${AREA_IMG.has(a.pref.slug) ? "" : "lsr-area-p--none"}`}>
                    {AREA_IMG.has(a.pref.slug) ? <img src={`${IMG_SEARCH}/area-${a.pref.slug}.webp`} width={68} height={68} alt="" loading="lazy" /> : <IconPawLine />}
                  </span>
                  <span className="lsr-area-jp">{a.pref.short}</span>
                  <span className="lsr-area-en">{a.pref.slug.replace(/-/g, " ").toUpperCase()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {chips.length > 0 ? (
        <section className="lsr-sd lsr-sd-pop" aria-labelledby="lsr-pop-h">
          <h2 id="lsr-pop-h" className="lsr-sd-h">
            <span className="pt-fill">条件から探す</span>
          </h2>
          <ul className="lsr-chips">
            {chips.map((c, i) => (
              <li key={c.label} className="lsr-chipw pt-popin" style={{ ["--d" as string]: `${i * 90}ms` }}>
                <Link href={c.href} prefetch={false} className="pt-chip lsr-chip pt-press">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasFeatures ? (
        <section className="lsr-feat pt-hov io" data-io="zoom" style={{ ["--d" as string]: "120ms" }} aria-labelledby="lsr-feat-h">
          <img className="lsr-feat-img pt-scale-scroll" style={{ ["--ss" as string]: 0.14 }} src={`${IMG_SEARCH}/feature.webp`} width={237} height={204} alt="" loading="lazy" />
          <h2 id="lsr-feat-h" className="lsr-feat-t">
            特集から探す
          </h2>
          <p className="lsr-feat-d">
            <span>ペットのお店の特集記事を</span>
            <span>まとめて読めます。</span>
          </p>
          <Link href={L.articles} className="lsr-feat-btn pt-press pt-magnet">
            <span>特集を見る</span>
            <IconArrow />
          </Link>
        </section>
      ) : null}
    </aside>
  );
}

/** 青空の帯のフッター(見本の探すのもの)。行き先は実在のページだけ。SNS・利用規約など行き先のない物は出さない */
function SearchFooter({ facets }: { facets: PetFacets }) {
  const L = ptLinks("live");
  const prefs = facets.prefs.slice(0, 6);
  return (
    <footer className="lsr-foot">
      <div className="lsr-fband pt-live">
        <img className="lsr-fband-img pt-kb" src={`${IMG_SEARCH}/foot-band.webp`} width={948} height={76} alt="" loading="lazy" />
        <p className="lsr-ftag pt-blurin">ペットと、この街で、もっと豊かに。</p>
        <Link href={L.home} className="lsr-flogo" aria-label="マチノワPet トップ">
          <Logo className="lsr-flogo-l" />
        </Link>
        <a href="/about" className="lsr-fabout pt-press pt-hov pt-magnet">
          <span>マチノワについて</span>
          <IconArrow />
        </a>
      </div>
      <div className="lsr-fbody pt-bgshift" data-from="1.02" data-to="0.9" style={{ ["--bg-to" as string]: "#fafaf8", ["--bg-from" as string]: "#f1ebe1" }}>
        <div className="lsr-fcols" data-io-group>
          {prefs.length > 0 ? (
            <nav className="lsr-fc lsr-fc1 io" aria-label="エリアから探す">
              <h3>エリアから探す</h3>
              <ul>
                {prefs.map((a) => (
                  <li key={a.pref.slug}>
                    <Link href={searchHref({ pref: a.pref.slug }, "#lsr-results")} prefetch={false}>
                      {a.pref.short}
                    </Link>
                  </li>
                ))}
                {facets.prefs.length > prefs.length ? (
                  <li className="lsr-fc-more">
                    <Link href={L.areaAnchor}>ほかのエリア</Link>
                  </li>
                ) : null}
              </ul>
            </nav>
          ) : null}
          {facets.kinds.length > 0 ? (
            <nav className="lsr-fc lsr-fc2 io" aria-label="種類から探す">
              <h3>種類から探す</h3>
              <ul>
                {facets.kinds.map((k) => (
                  <li key={k.slug}>
                    <Link href={searchHref({ kind: k.slug }, "#lsr-results")} prefetch={false}>
                      {k.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <nav className="lsr-fc lsr-fc3 io" aria-label="マチノワについて">
            <h3>マチノワについて</h3>
            <ul>
              <li>
                <a href="/about">編集部について</a>
              </li>
              <li>
                <a href="/editorial/guidelines">掲載基準</a>
              </li>
              <li>
                <a href="/contact">お問い合わせ</a>
              </li>
            </ul>
          </nav>
          <i className="lsr-fdiv lsr-fdiv1" aria-hidden="true" />
          <i className="lsr-fdiv lsr-fdiv2" aria-hidden="true" />
        </div>
        <p className="lsr-copy">© マチノワPet</p>
      </div>
    </footer>
  );
}

// ------------------------------------------------------------------ ページ
/** 例文(データにある地名・種類から。最大 3 つ)。無ければ空 */
function examples(shops: PetShop[], facets: PetFacets) {
  const cities = new Map<string, number>();
  for (const s of shops) if (s.city) cities.set(s.city, (cities.get(s.city) ?? 0) + 1);
  const top = [...cities.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja")).slice(0, 3).map((x) => x[0]);
  const kinds = facets.kinds.slice(0, 3).map((k) => k.name);
  return { areaEx: top.length ? `(例：${top.join("、")})` : "", kindEx: kinds.length ? `(例：${kinds.join("、")})` : "" };
}

export function petSearchPage() {
  async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
    const sp = await searchParams;
    const shops = await loadPetShops();
    const facets = facetsOf(shops);
    const f = parseFilters(sp, facets);
    const v = getVertical("pet");
    const list = filterShops(shops, f);
    const scope = scopeOf(f, facets);
    const title = `${scope ? `${scope}の` : ""}${v.name}のお店を探す｜${v.brand}`;
    // 種類・エリアだけの絞り込みなら、その URL が正本。それ以外(文字・こだわり・動物・並べ替え・2 ページ目以降)は noindex(件数 0 を渡す)で、正本は種類・エリアだけの URL
    const plain = !f.q && !f.tag && !f.animal && f.sort === "area" && f.page === 1;
    return buildMetadata({
      vertical: "pet",
      title,
      description: `${scope ? `${scope}の` : ""}${v.name}のお店を、エリア・種類・こだわりで探せます。${list.length > 0 ? `掲載${list.length}件。` : ""}`,
      path: searchHref({ kind: f.kind, pref: f.pref }),
      count: plain ? list.length : 0,
    });
  }

  async function Page({ searchParams }: { searchParams: Promise<SP> }) {
    const sp = await searchParams;
    const shops = await loadPetShops();
    const facets = facetsOf(shops);
    const f = parseFilters(sp, facets);
    const list = filterShops(shops, f);
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const cur = Math.min(f.page, pages);
    const fc: PetFilters = { ...f, page: cur };
    const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
    const hasFeatures = (await petFeatureCount()) > 0;
    const scope = scopeOf(fc, facets);
    const ex = examples(shops, facets);
    const L = ptLinks("live");
    const v = getVertical("pet");
    const sortOptions: LinkOption[] = [
      { label: "エリア順", href: searchHref({ ...fc, sort: "area", page: 1 }, "#lsr-results"), on: fc.sort === "area" },
      { label: "店名順", href: searchHref({ ...fc, sort: "name", page: 1 }, "#lsr-results"), on: fc.sort === "name" },
    ];
    const pl = pills(fc, facets);
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
      { name: "お店を探す", url: absUrl(L.search) },
    ]);
    return (
      <Shell page="search" footer={false} mode="live">
        <JsonLd data={ld} />
        <div className="lsr">
          <div className="lsr-top" data-f={pl.length > 0 ? "1" : "0"}>
            <Hero f={fc} facets={facets} areaEx={ex.areaEx} kindEx={ex.kindEx} />
            {pl.length > 0 ? (
              <div className="lsr-filters-w">
                <FilterBar pills={pl} />
              </div>
            ) : null}
          </div>
          <div className="lsr-main">
            <div className="lsr-l">
              <Crumb scope={scope} />
              <ResultHead count={list.length} sortValue={sortOptions.find((o) => o.on)?.label ?? "エリア順"} sortOptions={sortOptions} />
              {shown.length > 0 ? <Cards shops={shown} /> : <Empty total={shops.length} f={fc} />}
              <Pager f={fc} pages={pages} />
            </div>
            <Side facets={facets} hasFeatures={hasFeatures} />
          </div>
        </div>
        <SearchFooter facets={facets} />
      </Shell>
    );
  }

  return { generateMetadata, Page };
}
