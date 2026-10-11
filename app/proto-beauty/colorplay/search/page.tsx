import Link from "next/link";
import Header from "@/components/portal/bproto/colorplay/Header";
import Footer from "@/components/portal/bproto/colorplay/Footer";
import { ShopCard } from "@/components/portal/bproto/colorplay/Cards";
import { IconFilter, IconPin, IconSearch, KIND_ICON } from "@/components/portal/bproto/colorplay/Icons";
import { loadShops } from "@/lib/portal/bproto/colorplay/data";
import { BASE, KIND_SHORT, searchHref, type Filters } from "@/lib/portal/bproto/colorplay/types";
import { PREFECTURES } from "@/lib/areas/prefectures";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const KIND_ORDER = ["hair", "nail", "eyelash", "esthetic", "hair-removal"];

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const shops = await loadShops();
  const kinds = KIND_ORDER.filter((k) => shops.some((s) => s.kind === k));
  const kind = kinds.includes(one(sp.kind)) ? one(sp.kind) : "";
  const prefSlugs = new Set(shops.map((s) => s.pref));
  const pref = prefSlugs.has(one(sp.pref)) ? one(sp.pref) : "";
  const tagAll = [...new Set(shops.flatMap((s) => s.tags))];
  const tag = tagAll.includes(one(sp.tag)) ? one(sp.tag) : "";
  const q = one(sp.q).trim().slice(0, 40);
  const sort = one(sp.sort) === "name" ? "name" : "area";
  const n = Math.min(Math.max(parseInt(one(sp.n)) || 20, 20), 200);
  const f: Filters = { kind, pref, q, tag, sort };

  const norm = (s: string) => s.toLowerCase().normalize("NFKC");
  let list = shops.filter(
    (s) =>
      (!kind || s.kind === kind) &&
      (!pref || s.pref === pref) &&
      (!tag || s.tags.includes(tag)) &&
      (!q || norm(`${s.name} ${s.address} ${s.prefName} ${s.city} ${s.kindName}`).includes(norm(q))),
  );
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  // 写真の無い店は並びの最後へ(それぞれの中の並びは、そのまま)
  list = [...list.filter((s) => s.main), ...list.filter((s) => !s.main)];
  const shown = list.slice(0, n);
  const sig = `${kind}|${pref}|${tag}|${q}|${sort}`;

  // 店の多いエリア(実際に店が多い順)
  const count = new Map<string, number>();
  for (const s of shops) count.set(s.pref, (count.get(s.pref) ?? 0) + 1);
  const topPrefs = [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
  const prefName = (slug: string) => PREFECTURES.find((p) => p.slug === slug)?.short ?? slug;
  const prefOptions = PREFECTURES.filter((p) => prefSlugs.has(p.slug));

  return (
    <>
      <Header />
      <section className="cp-sband" data-sp="o">
        <div className="cp-wrap cp-sband-in">
          <div className="cp-sband-t">
            <h1 className="cp-h1s"><span className="cp-line" style={{ ["--l" as string]: 0 }}>お店を探す</span></h1>
            <p className="cp-sband-sub cp-line" style={{ ["--l" as string]: 1 }}>好きが見つかる、近くのビューティーサロン</p>
          </div>
          <div className="cp-sband-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/_portal/bproto/colorplay/ref-search.jpg" alt="" width={316} height={352} fetchPriority="high" />
          </div>
          <p className="cp-script cp-sband-sc" aria-hidden="true">Find<br />Your Beauty<br />in Your Town.</p>
        </div>
      </section>

      <div className="cp-wrap cp-search">
        <nav className="cp-kinds" aria-label="種類">
          <Link href={searchHref({ ...f, kind: "", n: 20 })} className={`cp-kind ${kind === "" ? "is-on" : ""}`} aria-current={kind === "" ? "true" : undefined}>
            <KIND_ICON.all size={36} /><span>すべて</span>
          </Link>
          {kinds.map((k) => {
            const Ic = KIND_ICON[k];
            return (
              <Link key={k} href={searchHref({ ...f, kind: k, n: 20 })} className={`cp-kind ${kind === k ? "is-on" : ""}`} aria-current={kind === k ? "true" : undefined}>
                <Ic size={36} /><span>{KIND_SHORT[k]}</span>
              </Link>
            );
          })}
        </nav>

        <form className="cp-form" action={`${BASE}/search`} method="get" role="search">
          {kind && <input type="hidden" name="kind" value={kind} />}
          {sort === "name" && <input type="hidden" name="sort" value="name" />}
          <label className="cp-field cp-field-q">
            <IconSearch size={20} />
            <input name="q" defaultValue={q} placeholder="エリア・駅名・サロン名で検索" aria-label="エリア・サロン名で検索" />
          </label>
          <label className="cp-field">
            <IconPin size={18} />
            <select name="pref" defaultValue={pref} aria-label="エリア">
              <option value="">エリア</option>
              {prefOptions.map((p) => (<option key={p.slug} value={p.slug}>{p.name}</option>))}
            </select>
          </label>
          <label className="cp-field">
            <IconFilter size={18} />
            <select name="tag" defaultValue={tag} aria-label="こだわり条件">
              <option value="">こだわり条件</option>
              {tagAll.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </label>
          <button type="submit" className="cp-go">さがす</button>
        </form>

        <div className="cp-areas" id="area">
          <b>店の多いエリア</b>
          <ul>
            {topPrefs.map(([slug, c]) => (
              <li key={slug}>
                <Link href={searchHref({ ...f, pref: pref === slug ? "" : slug, n: 20 })} className={pref === slug ? "is-on" : ""} aria-current={pref === slug ? "true" : undefined}>
                  {prefName(slug)}<small>{c}</small>
                </Link>
              </li>
            ))}
          </ul>
          <span className="cp-sort">
            並べ替え
            <Link href={searchHref({ ...f, sort: "area", n: 20 })} className={sort === "area" ? "is-on" : ""}>エリア順</Link>
            <Link href={searchHref({ ...f, sort: "name", n: 20 })} className={sort === "name" ? "is-on" : ""}>店名順</Link>
          </span>
        </div>

        <p className="cp-count" aria-live="polite">検索結果 <b>{list.length}</b> 件{list.length > shown.length && <span>({shown.length} 件を表示)</span>}</p>

        <div key={sig} className="cp-list">
          {shown.map((s, i) => (<ShopCard key={s.id} s={s} i={i % 8} />))}
          {shown.length === 0 && <p className="cp-empty">条件に合うサロンはありません。条件を変えてみてください。</p>}
        </div>
        {list.length > shown.length && (
          <p className="cp-more"><Link href={searchHref({ ...f, n: n + 20 })} scroll={false}>もっと見る({shown.length} / {list.length})</Link></p>
        )}
      </div>
      <Footer />
    </>
  );
}
