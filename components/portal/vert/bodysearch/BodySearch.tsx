/**
 * ボディケアの「さがす」(/bodycare/search)。ビューティーの /beauty/search(components/portal/colorplay/pages/search.tsx)と同じ作りを、ボディケアの世界(木の床・紙の帯・明朝・落ち着いた 5 色)で。
 * 検索の箱(キーワード)・種類・エリア(都道府県)・こだわり(店のタグ。データにあるものだけ)で絞る。状態はすべて URL の引数(kind・pref・tag・q・sort・n)で決まり、
 * JS が無くてもリンクとフォームで絞れる。件数はデータから。「いま営業中」など今の時刻で変わる表示は出さない。星・点数・口コミ・順位・料金は出さない。
 * 種類・エリア・こだわりだけの URL は、これまでの種類・エリア・利用シーンのページからの転送先なので index 対象(件数 3 件以上。lib/seo/gate.ts)。
 * キーワード・並べ替え・「もっと見る」の付いた URL は noindex(canonical は種類・エリア・こだわりだけの URL)。
 */
import "../bodyshop/bodyshop.css";
import "./bodysearch.css";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/portal/JsonLd";
import { KZ_FONT_CLASSES } from "../korogashi/fonts";
import { BsImg } from "../bodyshop/Shared";
import { loadShops } from "@/lib/portal/colorplay/data";
import { PAGE_SIZE, countBy, filterShops, parseFilters, searchHref } from "@/lib/portal/colorplay/search";
import type { CpShop } from "@/lib/portal/colorplay/types";
import { BODYCARE_SITE as site } from "@/lib/portal/vert/bodysearch/site";
import { POLE_COLORS } from "@/lib/portal/vert/korogashi/colors";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { getVertical } from "@/lib/verticals";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumb } from "@/lib/seo/jsonld";
import { absUrl } from "@/lib/seo/util";

type SP = Record<string, string | string[] | undefined>;
const PREF = new Map(PREFECTURES.map((p) => [p.slug, p]));

function setup(shops: CpShop[]) {
  const v = getVertical("bodycare");
  const kindName = (slug: string) => site.kinds.find((k) => k.slug === slug)?.name ?? slug;
  const validKinds = new Set(v.categories.map((c) => c.slug));
  const validPrefs = new Set(PREFECTURES.map((p) => p.slug));
  // こだわり(店のタグ)。データにあるものだけ。多い順
  const tagCount = new Map<string, number>();
  for (const sh of shops) for (const t of sh.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
  const validTags = new Set(tags.map((t) => t[0]));
  return { v, kindName, validKinds, validPrefs, tags, validTags };
}

const colorOfKind = (slug: string) => {
  const i = site.kinds.findIndex((k) => k.slug === slug);
  return POLE_COLORS[Math.max(0, i)] ?? POLE_COLORS[0];
};

export async function bodySearchMetadata(sp: SP): Promise<Metadata> {
  const shops = await loadShops(site);
  const { v, kindName, validKinds, validPrefs, validTags } = setup(shops);
  const f = parseFilters(sp, site, validKinds, validPrefs, validTags);
  const count = countBy(shops, f);
  const pref = f.pref ? PREF.get(f.pref) : undefined;
  const scope = [f.tag ? `${f.tag}の` : "", pref ? `${pref.short}の` : "", f.kind ? kindName(f.kind) : `${v.name}の店`].join("");
  const title = `${f.kind || pref || f.tag ? scope : `${v.name}の店を探す`}｜${v.brand}`;
  const plain = !f.q && f.sort === "area" && f.n === PAGE_SIZE;
  const canonical = searchHref(site, { kind: f.kind, pref: f.pref, tag: f.tag });
  return buildMetadata({
    vertical: "bodycare",
    title,
    description: `${f.kind || pref || f.tag ? scope : v.name}の店を、種類・エリア・こだわり・キーワードで探せます。${count > 0 ? `掲載${count}件。` : ""}`,
    path: canonical,
    count: plain ? count : 0,
  });
}

export default async function BodySearch({ sp }: { sp: SP }) {
  const shops = await loadShops(site);
  const { v, kindName, validKinds, validPrefs, tags, validTags } = setup(shops);
  const f = parseFilters(sp, site, validKinds, validPrefs, validTags);
  const kinds = site.kinds.filter((k) => shops.some((s) => s.kind === k.slug));
  const prefCount = new Map<string, number>();
  for (const s of shops) prefCount.set(s.pref, (prefCount.get(s.pref) ?? 0) + 1);
  const prefOptions = PREFECTURES.filter((p) => prefCount.has(p.slug));
  const byCount = [...prefCount.entries()].sort((a, b) => b[1] - a[1] || PREF.get(a[0])!.code.localeCompare(PREF.get(b[0])!.code));
  const topPrefs = byCount.slice(0, 8);
  const restPrefs = byCount.slice(8);
  const prefShort = (slug: string) => PREF.get(slug)?.short ?? slug;

  const list = filterShops(shops, f);
  const shown = list.slice(0, f.n);
  const scope = [f.tag ? `${f.tag}・` : "", f.pref ? `${prefShort(f.pref)}の` : "", f.kind ? kindName(f.kind) : "", f.q ? `「${f.q}」` : ""].join("");
  const ld = breadcrumb([
    { name: "マチノワ", url: absUrl("/") },
    { name: v.name, url: absUrl(v.path) },
    { name: "店をさがす", url: absUrl(`${site.base}/search`) },
  ]);
  const base = { ...f, n: PAGE_SIZE };
  const chip = (slug: string, c: number) => (
    <li key={slug}>
      <Link href={searchHref(site, { ...base, pref: f.pref === slug ? "" : slug })} className={f.pref === slug ? "is-on" : ""} aria-current={f.pref === slug ? "true" : undefined}>
        {prefShort(slug)}
        <small>{c}</small>
      </Link>
    </li>
  );

  return (
    <div className={`bs bs-floor bq ${KZ_FONT_CLASSES}`}>
      <JsonLd data={ld} />
      <header className="bs-head">
        <Link href="/bodycare" className="bs-logo">
          マチノワ <span>Bodycare</span>
        </Link>
        <Link className="bq-top" href="/bodycare">
          ボディケアのトップへ
        </Link>
      </header>
      <main className="bq-main" id="bq-main">
        <section className="bq-hero">
          <div className="bq-hero-in">
            <p className="bq-eyebrow">Find a Body Care</p>
            <h1 className="bq-h1">店をさがす</h1>
            <p className="bq-lead">{site.searchLead}</p>
            <form className="bq-form" action={`${site.base}/search`} method="get" role="search">
              {f.kind && <input type="hidden" name="kind" value={f.kind} />}
              {f.sort === "name" && <input type="hidden" name="sort" value="name" />}
              <label className="bq-field bq-field-q">
                <span>キーワード</span>
                <input name="q" type="search" defaultValue={f.q} placeholder={site.placeholder} aria-label="エリア・店名で検索" maxLength={40} />
              </label>
              <label className="bq-field">
                <span>エリア</span>
                <select name="pref" defaultValue={f.pref} aria-label="エリア(都道府県)">
                  <option value="">すべて</option>
                  {prefOptions.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}({prefCount.get(p.slug)})
                    </option>
                  ))}
                </select>
              </label>
              {tags.length > 0 && (
                <label className="bq-field">
                  <span>こだわり</span>
                  <select name="tag" defaultValue={f.tag} aria-label="こだわり条件">
                    <option value="">すべて</option>
                    {tags.map(([t, c]) => (
                      <option key={t} value={t}>
                        {t}({c})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button type="submit" className="bq-go">
                さがす
              </button>
            </form>
          </div>
          <span className="bq-rollers" aria-hidden="true">
            <i style={{ ["--c" as string]: POLE_COLORS[2] }} />
            <i style={{ ["--c" as string]: POLE_COLORS[4] }} />
            <i style={{ ["--c" as string]: POLE_COLORS[3] }} />
          </span>
        </section>

        <div className="bq-body">
          <nav className="bq-kinds" aria-label="種類">
            <Link href={searchHref(site, { ...base, kind: "" })} className={`bq-kind ${f.kind === "" ? "is-on" : ""}`} aria-current={f.kind === "" ? "true" : undefined} style={{ ["--c" as string]: "#3b3d40" }}>
              <b>すべて</b>
              <small>{countBy(shops, { pref: f.pref, tag: f.tag })}</small>
            </Link>
            {kinds.map((k) => (
              <Link key={k.slug} href={searchHref(site, { ...base, kind: k.slug })} className={`bq-kind ${f.kind === k.slug ? "is-on" : ""}`} aria-current={f.kind === k.slug ? "true" : undefined} style={{ ["--c" as string]: colorOfKind(k.slug) }}>
                <b>{k.name}</b>
                <small>{countBy(shops, { kind: k.slug, pref: f.pref, tag: f.tag })}</small>
              </Link>
            ))}
          </nav>

          <div className="bq-areas" id="area">
            <b>店の多いエリア</b>
            <ul>{topPrefs.map(([slug, c]) => chip(slug, c))}</ul>
            {restPrefs.length > 0 && (
              <details className="bq-areas-more">
                <summary>ほかのエリア({restPrefs.length})</summary>
                <ul>{restPrefs.map(([slug, c]) => chip(slug, c))}</ul>
              </details>
            )}
            <span className="bq-sort">
              並べ替え
              <Link href={searchHref(site, { ...base, sort: "area" })} className={f.sort === "area" ? "is-on" : ""}>
                エリア順
              </Link>
              <Link href={searchHref(site, { ...base, sort: "name" })} className={f.sort === "name" ? "is-on" : ""}>
                店名順
              </Link>
            </span>
          </div>

          {scope && <h2 className="bq-scope">{scope}</h2>}
          <p className="bq-count" aria-live="polite">
            検索結果 <b>{list.length}</b> 件{list.length > shown.length && <span>({shown.length} 件を表示)</span>}
          </p>

          <ul className="bq-list">
            {shown.map((s) => (
              <li key={s.id}>
                <Link href={`/bodycare/shop/${s.id}`} className="bq-card" style={{ ["--c" as string]: colorOfKind(s.kind) }}>
                  {s.main ? (
                    <span className="bq-ph">
                      <BsImg p={{ src: s.main.src, alt: s.main.alt, w: s.main.w ?? 1200, h: s.main.h ?? 800 }} sizes="(max-width: 700px) 92vw, 30vw" />
                    </span>
                  ) : (
                    <span className="bq-ph bq-ph-no" aria-hidden="true">
                      <b>{s.name}</b>
                    </span>
                  )}
                  <span className="bq-band">
                    <i>{s.kindName}</i>
                    <em>
                      {s.prefName}
                      {s.city ? ` ${s.city}` : ""}
                    </em>
                  </span>
                  <span className="bq-name">{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className="bq-empty">条件に合う店はありません。条件を変えてみてください。</p>}
          {list.length > shown.length && (
            <p className="bq-more">
              <Link href={searchHref(site, { ...f, n: f.n + PAGE_SIZE })} scroll={false}>
                もっと見る({shown.length} / {list.length})
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
