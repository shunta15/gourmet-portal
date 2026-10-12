/**
 * さがす専用ページ(/{v}/search)。COLOR PLAY(試作 app/proto-beauty/colorplay/search/page.tsx の本番版)。
 * 検索の箱(キーワード)・種類・エリア(都道府県)で絞る。状態はすべて URL の引数(kind・pref・q・sort・n)で決まり、
 * JS が無くてもリンクとフォームで絞れる。「いま営業中」など今の時刻で変わる表示は出さない。
 * 種類・エリアだけの URL(/{v}/search?kind=hair&pref=tokyo)は、これまでの種類ページ・エリアページからの転送先なので index 対象にする
 * (件数が 3 件以上のとき。lib/seo/gate.ts)。キーワード・並べ替え・「もっと見る」の付いた URL は noindex(canonical は種類・エリアだけの URL)。
 */
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import Header from "../Header";
import Footer from "../Footer";
import { ShopCard } from "../Cards";
import { IconFilter, IconPin, IconSearch, KIND_ICON } from "@/components/portal/bproto/colorplay/Icons";
import { loadShops } from "@/lib/portal/colorplay/data";
import type { CpShop } from "@/lib/portal/colorplay/types";
import { PAGE_SIZE, countBy, filterShops, parseFilters, searchHref } from "@/lib/portal/colorplay/search";
import type { CpSite } from "@/lib/portal/colorplay/site";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

type SP = Record<string, string | string[] | undefined>;
const PREF = new Map(PREFECTURES.map((p) => [p.slug, p]));

/** さがすの設定(種類・県の正しい値)。種類は掲載のない種類(これまでのページにあったもの)も URL としては受ける */
function setup(site: CpSite, shops: CpShop[]) {
  const v = getVertical(site.key);
  const kindName = (slug: string) => site.kinds.find((k) => k.slug === slug)?.name ?? v.categories.find((c) => c.slug === slug)?.name ?? slug;
  const validKinds = new Set(v.categories.map((c) => c.slug));
  const validPrefs = new Set(PREFECTURES.map((p) => p.slug));
  // こだわり(店のタグ)。データにあるものだけ。多い順
  const tagCount = new Map<string, number>();
  for (const sh of shops) for (const t of sh.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
  const validTags = new Set(tags.map((t) => t[0]));
  return { v, kindName, validKinds, validPrefs, tags, validTags };
}

export function cpSearchPage(site: CpSite) {
  async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
    const sp = await searchParams;
    const shops = await loadShops(site);
    const { v, kindName, validKinds, validPrefs, validTags } = setup(site, shops);
    const f = parseFilters(sp, site, validKinds, validPrefs, validTags);
    const count = countBy(shops, f);
    const pref = f.pref ? PREF.get(f.pref) : undefined;
    const scope = [f.tag ? `${f.tag}の` : "", pref ? `${pref.short}の` : "", f.kind ? kindName(f.kind) : `${v.name}の店`].join("");
    const title = `${f.kind || pref || f.tag ? scope : `${v.name}の店を探す`}｜${v.brand}`;
    // 種類・エリアだけの絞り込みなら、その URL が正本。キーワード・並べ替え・もっと見るが付くものは noindex(件数 0 を渡す)で、正本は種類・エリアだけの URL
    const plain = !f.q && f.sort === "area" && f.n === PAGE_SIZE;
    const canonical = searchHref(site, { kind: f.kind, pref: f.pref, tag: f.tag });
    const meta = buildMetadata({
      vertical: site.key,
      title,
      description: `${f.kind || pref || f.tag ? scope : v.name}の店を、種類・エリア・こだわり・キーワードで探せます。${count > 0 ? `掲載${count}件。` : ""}`,
      path: canonical,
      count: plain ? count : 0,
    });
    return meta;
  }

  async function Page({ searchParams }: { searchParams: Promise<SP> }) {
    const sp = await searchParams;
    const shops = await loadShops(site);
    const { v, kindName, validKinds, validPrefs, tags, validTags } = setup(site, shops);
    const f = parseFilters(sp, site, validKinds, validPrefs, validTags);
    const kinds = site.kinds.filter((k) => shops.some((s) => s.kind === k.slug));
    const prefCount = new Map<string, number>();
    for (const s of shops) prefCount.set(s.pref, (prefCount.get(s.pref) ?? 0) + 1);
    const prefOptions = PREFECTURES.filter((p) => prefCount.has(p.slug));
    const byCount = [...prefCount.entries()].sort((a, b) => b[1] - a[1] || (PREF.get(a[0])!.code).localeCompare(PREF.get(b[0])!.code));
    const topPrefs = byCount.slice(0, 8);
    const restPrefs = byCount.slice(8);
    const prefShort = (slug: string) => PREF.get(slug)?.short ?? slug;

    const list = filterShops(shops, f);
    const shown = list.slice(0, f.n);
    const sig = `${f.kind}|${f.pref}|${f.q}|${f.sort}`;
    const scope = [f.tag ? `${f.tag}・` : "", f.pref ? `${prefShort(f.pref)}の` : "", f.kind ? kindName(f.kind) : "", f.q ? `「${f.q}」` : ""].join("");
    const ld = breadcrumb([
      { name: "マチノワ", url: absUrl("/") },
      { name: v.name, url: absUrl(v.path) },
      { name: "お店を探す", url: absUrl(`${site.base}/search`) },
    ]);
    const base = { ...f, n: PAGE_SIZE };
    const chip = (slug: string, c: number) => (
      <li key={slug}>
        <Link href={searchHref(site, { ...base, pref: f.pref === slug ? "" : slug })} className={f.pref === slug ? "is-on" : ""} aria-current={f.pref === slug ? "true" : undefined}>
          {prefShort(slug)}<small>{c}</small>
        </Link>
      </li>
    );
    return (
      <>
        <JsonLd data={ld} />
        <Header base={site.base} logoA={site.logoA} logoB={site.logoB} />
        <main id="cp-main" tabIndex={-1}>
          <section className="cp-sband" data-sp="o">
            <div className="cp-wrap cp-sband-in">
              <div className="cp-sband-t">
                <h1 className="cp-h1s"><span className="cp-line" style={{ ["--l" as string]: 0 }}>お店を探す</span></h1>
                <p className="cp-sband-sub cp-line" style={{ ["--l" as string]: 1 }}>{site.searchLead}</p>
              </div>
              <div className="cp-sband-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/_portal/bproto/colorplay/ref-search.jpg" alt="" width={316} height={352} fetchPriority="high" />
              </div>
              <p className="cp-script cp-sband-sc" aria-hidden="true">{site.scriptSearch.split("\n").map((l, i) => (<span key={i}>{i > 0 && <br />}{l}</span>))}</p>
            </div>
          </section>

          <div className="cp-wrap cp-search">
            <nav className="cp-kinds" aria-label="種類">
              <Link href={searchHref(site, { ...base, kind: "" })} className={`cp-kind ${f.kind === "" ? "is-on" : ""}`} aria-current={f.kind === "" ? "true" : undefined}>
                <KIND_ICON.all size={36} /><span>すべて</span><small>{countBy(shops, { pref: f.pref, tag: f.tag })}</small>
              </Link>
              {kinds.map((k) => {
                const Ic = KIND_ICON[k.slug] ?? KIND_ICON.all;
                return (
                  <Link key={k.slug} href={searchHref(site, { ...base, kind: k.slug })} className={`cp-kind ${f.kind === k.slug ? "is-on" : ""}`} aria-current={f.kind === k.slug ? "true" : undefined}>
                    <Ic size={36} /><span>{k.name}</span><small>{countBy(shops, { kind: k.slug, pref: f.pref, tag: f.tag })}</small>
                  </Link>
                );
              })}
            </nav>

            <form className="cp-form" action={`${site.base}/search`} method="get" role="search">
              {f.kind && <input type="hidden" name="kind" value={f.kind} />}
              {f.sort === "name" && <input type="hidden" name="sort" value="name" />}
              <label className="cp-field cp-field-q">
                <IconSearch size={20} />
                <input name="q" type="search" defaultValue={f.q} placeholder={site.placeholder} aria-label="エリア・店名で検索" maxLength={40} />
              </label>
              <label className="cp-field">
                <IconPin size={18} />
                <select name="pref" defaultValue={f.pref} aria-label="エリア(都道府県)">
                  <option value="">エリア</option>
                  {prefOptions.map((p) => (<option key={p.slug} value={p.slug}>{p.name}({prefCount.get(p.slug)})</option>))}
                </select>
              </label>
              {tags.length > 0 && (
                <label className="cp-field">
                  <IconFilter size={18} />
                  <select name="tag" defaultValue={f.tag} aria-label="こだわり条件">
                    <option value="">こだわり</option>
                    {tags.map(([t, c]) => (<option key={t} value={t}>{t}({c})</option>))}
                  </select>
                </label>
              )}
              <button type="submit" className="cp-go">さがす</button>
            </form>

            <div className="cp-areas" id="area">
              <b>店の多いエリア</b>
              <ul>{topPrefs.map(([slug, c]) => chip(slug, c))}</ul>
              {restPrefs.length > 0 && (
                <details className="cp-areas-more">
                  <summary>ほかのエリア({restPrefs.length})</summary>
                  <ul>{restPrefs.map(([slug, c]) => chip(slug, c))}</ul>
                </details>
              )}
              <span className="cp-sort">
                並べ替え
                <Link href={searchHref(site, { ...base, sort: "area" })} className={f.sort === "area" ? "is-on" : ""}>エリア順</Link>
                <Link href={searchHref(site, { ...base, sort: "name" })} className={f.sort === "name" ? "is-on" : ""}>店名順</Link>
              </span>
            </div>

            {scope && <h2 className="cp-scope">{scope}</h2>}
            <p className="cp-count" aria-live="polite">検索結果 <b>{list.length}</b> 件{list.length > shown.length && <span>({shown.length} 件を表示)</span>}</p>

            <div key={sig} className="cp-list">
              {shown.map((s, i) => (<ShopCard key={s.id} site={site} s={s} i={i % 8} />))}
              {shown.length === 0 && <p className="cp-empty">条件に合う{site.noun}はありません。条件を変えてみてください。</p>}
            </div>
            {list.length > shown.length && (
              <p className="cp-more"><Link href={searchHref(site, { ...f, n: f.n + PAGE_SIZE })} scroll={false}>もっと見る({shown.length} / {list.length})</Link></p>
            )}
          </div>
        </main>
        <Footer site={site} />
      </>
    );
  }

  return { generateMetadata, Page };
}
