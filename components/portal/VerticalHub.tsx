import Link from "next/link";
import type { Metadata } from "next";
import PortalFonts from "./PortalFonts";
import Breadcrumbs from "./Breadcrumbs";
import AreaBlocks from "./AreaBlocks";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { PREFECTURES } from "@/lib/areas/prefectures";
import { countPlaces } from "@/lib/places";
import { buildMetadata } from "@/lib/seo/meta";
import { fillTitle } from "@/lib/seo/util";
import { HAS_CLAIM_POLICY, VERTICAL_FACE } from "@/lib/portal/meta";

const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

/** 新業種の入口ページの metadata。件数 0 なら noindex（判定は lib/seo/gate.ts の1か所）。 */
export async function verticalHubMetadata(key: VerticalKey): Promise<Metadata> {
  const v = VERTICALS[key];
  const count = await countPlaces(key);
  const names = v.categories.map((c) => c.name).join("・");
  return buildMetadata({
    vertical: key,
    title: fillTitle(v.titleTemplates.top, { name: v.name, brand: v.brand }),
    description: `${v.brand}。${names}の店を、エリア・種類・利用シーンから探せる入口です。`,
    path: v.path,
    count,
  });
}

/**
 * 新業種（beauty / bodycare / pet / leisure / stay）の入口ページの中身（サーバー）。
 * 件数は countPlaces の実数。掲載 0 件のあいだは「掲載準備中」と正直に出す。
 */
export default async function VerticalHub({ vertical }: { vertical: VerticalKey }) {
  const v = VERTICALS[vertical];
  const face = VERTICAL_FACE[vertical];

  const total = await countPlaces(vertical);
  const [catCounts, prefCounts] = await Promise.all([
    Promise.all(v.categories.map((c) => countPlaces(vertical, { category: c.slug }))),
    Promise.all(PREFECTURES.map((p) => countPlaces(vertical, { pref: p.slug }))),
  ]);

  const pre = v.brand.startsWith("マチノワ") ? "マチノワ" : "";
  const nameOnly = v.brand.slice(pre.length);
  const catNames = v.categories.map((c) => c.name);
  const others = ORDER.filter((k) => k !== vertical);

  return (
    <div className="mp-vh" style={{ ["--ac" as string]: v.accent.color, ["--acl" as string]: v.accent.lightColor }}>
      <PortalFonts />

      <section className="mp-vh-hero">
        <div className="mp-vh-field" aria-hidden="true">
          <i className="b1" />
          <i className="b2" />
          <i className="b3" />
          <i className="grain" />
          <span className="g">{face.glyph}</span>
        </div>
        <div className="mp-wrap mp-vh-hero-in">
          <Breadcrumbs
            items={[
              { name: "マチノワ", href: "/" },
              { name: v.name, href: v.path },
            ]}
          />
          <p className="mp-kicker">Machinowa — {face.en}</p>
          <h1 className="mp-vh-title">
            <span className="pre">{pre}</span>
            <span className="name">{nameOnly}</span>
          </h1>
          <p className="mp-vh-lead">
            {catNames.join("、")}の店を、エリア・種類・利用シーンから探せる入口です。
          </p>
          <div className="mp-vh-state">
            {total === 0 && <p className="mp-state"><i aria-hidden="true" />掲載準備中</p>}
            <dl className="mp-vh-facts">
              <div>
                <dt>現在の掲載</dt>
                <dd><b>{total}</b>件</dd>
              </div>
              <div>
                <dt>種類</dt>
                <dd><b>{v.categories.length}</b></dd>
              </div>
              <div>
                <dt>利用シーン</dt>
                <dd><b>{v.scenes.length}</b></dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="category" className="mp-sec mp-vh-sec" aria-labelledby="mp-vh-cat-h">
        <div className="mp-wrap">
          <header className="mp-sec-head" data-reveal>
            <p className="mp-kicker">01 — Category</p>
            <h2 id="mp-vh-cat-h" className="mp-h2 sm">種類から探す</h2>
          </header>
          <ul className="mp-cats">
            {v.categories.map((c, i) => (
              <li key={c.slug} style={{ ["--i" as string]: i % 3 }} data-reveal>
                <Link href={`${v.path}/${c.slug}`} prefetch={false} className="mp-cat" data-cursor="CATEGORY">
                  <small>0{i + 1}</small>
                  <b>{c.name}</b>
                  <span className="st">{catCounts[i] > 0 ? `${catCounts[i]}件` : "掲載準備中"}</span>
                  <span className="ar" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="area" className="mp-sec mp-vh-sec" aria-labelledby="mp-vh-area-h">
        <div className="mp-wrap">
          <header className="mp-sec-head" data-reveal>
            <p className="mp-kicker">02 — Area</p>
            <h2 id="mp-vh-area-h" className="mp-h2 sm">エリアから探す</h2>
            <p className="mp-lead">都道府県を地方ごとに並べています。掲載が追加されると、ここに件数が出ます。</p>
          </header>
          <AreaBlocks
            unit="件"
            items={PREFECTURES.map((p, i) => ({
              slug: p.slug,
              short: p.short,
              block: p.block,
              count: prefCounts[i],
              href: `${v.path}/area/${p.slug}`,
              lit: prefCounts[i] > 0,
            }))}
          />
        </div>
      </section>

      <section id="scene" className="mp-sec mp-vh-sec" aria-labelledby="mp-vh-scene-h">
        <div className="mp-wrap">
          <header className="mp-sec-head" data-reveal>
            <p className="mp-kicker">03 — Scene</p>
            <h2 id="mp-vh-scene-h" className="mp-h2 sm">利用シーンから探す</h2>
          </header>
          <ul className="mp-chips" data-reveal>
            {v.scenes.map((s) => (
              <li key={s.slug}>
                <Link href={`${v.path}/scene/${s.slug}`} prefetch={false} data-cursor="SCENE">{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mp-sec mp-vh-note" aria-labelledby="mp-vh-note-h">
        <div className="mp-wrap mp-note-grid">
          <div data-reveal>
            <p className="mp-kicker">{total > 0 ? "About" : "Status"}</p>
            <h2 id="mp-vh-note-h" className="mp-h2 sm">{total > 0 ? "掲載について" : "掲載準備中です"}</h2>
          </div>
          <div data-reveal style={{ ["--i" as string]: 1 }}>
            {total === 0 && (
              <p className="mp-note-p">
                {`${v.name}の掲載は、まだありません（現在 0 件）。掲載できる店が確認でき次第、ここに並びます。`}
              </p>
            )}
            {HAS_CLAIM_POLICY.has(vertical) && (
              <p className="mp-note-p sub">
                掲載方針：効果・効能をうたう表現は使わず、確認できた事実（メニュー・営業時間・設備など）だけを載せます。
              </p>
            )}
            <p className="mp-note-links">
              <Link href="/editorial/guidelines">掲載基準</Link>
              <Link href="/contact">掲載のご相談</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mp-sec mp-vh-others" aria-labelledby="mp-vh-oth-h">
        <div className="mp-wrap">
          <header className="mp-sec-head" data-reveal>
            <p className="mp-kicker">Other entrances</p>
            <h2 id="mp-vh-oth-h" className="mp-h2 sm">ほかの入口</h2>
          </header>
          <ul className="mp-others" data-reveal>
            {others.map((k) => (
              <li key={k} style={{ ["--ac" as string]: VERTICALS[k].accent.color, ["--acl" as string]: VERTICALS[k].accent.lightColor }}>
                <Link href={VERTICALS[k].path} data-cursor={VERTICAL_FACE[k].en.toUpperCase()}>
                  <span className="g" aria-hidden="true">{VERTICAL_FACE[k].glyph}</span>
                  <b>{VERTICALS[k].name}</b>
                  <small>{VERTICAL_FACE[k].en}</small>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
