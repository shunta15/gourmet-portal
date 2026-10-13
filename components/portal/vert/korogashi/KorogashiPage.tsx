import Link from "next/link";
import "./korogashi.css";
import KorogashiHero from "./KorogashiHero";
import { KZ_FONT_CLASSES } from "./fonts";
import { koroKinds, koroLead, pickShops } from "@/lib/portal/vert/korogashi/data";
import { loadVertical, pick } from "@/components/portal/pages/data";
import { PREFECTURES, getPrefBySlug } from "@/lib/areas/prefectures";
import { VERTICALS } from "@/lib/verticals";
import type { VerticalKey } from "@/lib/verticals/types";
import { countPlaces } from "@/lib/places";
import { HAS_CLAIM_POLICY } from "@/lib/portal/meta";
import { bodycareSearchOn } from "@/lib/portal/vert/bodycareStructure";
import { BODYCARE_SITE } from "@/lib/portal/vert/bodysearch/site";
import { searchHref } from "@/lib/portal/colorplay/search";

const VERTICAL = "bodycare" as const;
const ORDER: VerticalKey[] = ["gourmet", "beauty", "bodycare", "pet", "leisure", "stay"];

/**
 * ボディケア入口「転がし(KOROGASHI)」の中身（サーバー）。本物の /bodycare（app/bodycare/(top)/page.tsx）と、
 * 見本のルート /proto-hub/bodycare-korogashi（プレビュー・ローカル専用）が同じものを使う。
 * 最初の画面(丸めたマットの山)・スクロールで進む場面・種類の場面は KorogashiHero(クライアント)。その下は店・エリア・利用シーン・ほかの業種。
 * 種類・都道府県・利用シーン・店は、すべて店のデータ（lib/places）から作る。0 件の種類・エリア・利用シーン・業種は出さない。
 * 件数の数え方は、行き先のページ（components/portal/pages）と同じ pick。
 */
export default async function KorogashiPage() {
  const { v, all } = await loadVertical(VERTICAL);
  const total = all.length;
  // 「さがす」にまとまる構成のとき(lib/portal/vert/bodycareStructure.ts。本番は今のまま)は、種類・エリア・利用シーンの行き先を、さがすの絞り込みにする
  const searchOn = bodycareSearchOn();
  const kinds = koroKinds(v, all, searchOn ? (slug) => searchHref(BODYCARE_SITE, { kind: slug }) : undefined);
  const shops = pickShops(all);
  const prefs = PREFECTURES.flatMap((p) => {
    const count = pick(all, { pref: p.slug }).length;
    return count > 0 ? [{ slug: p.slug, name: p.name, count }] : [];
  });
  const scenes = v.scenes.flatMap((s) => {
    const count = pick(all, { scene: s }).length;
    // さがすの「こだわり」(店のタグ)。シーンに対応するタグがデータにあるもの
    const tag = s.matchTags.find((t) => all.some((p) => p.tags.includes(t)));
    return count > 0 ? [{ slug: s.slug, name: s.name, count, href: searchOn && tag ? searchHref(BODYCARE_SITE, { tag }) : `${v.path}/scene/${s.slug}` }] : [];
  });
  // ほかの業種: 掲載が 1 件以上あるものだけ（グルメは常に掲載あり）
  const others = (
    await Promise.all(
      ORDER.filter((k) => k !== VERTICAL).map(async (k) => ((k === "gourmet" ? 1 : await countPlaces(k)) > 0 ? [k] : []))
    )
  ).flat();
  const lead = koroLead(kinds, total);

  return (
    <div className={`kz ${KZ_FONT_CLASSES}`} data-mode="init">
      <KorogashiHero kinds={kinds} lead={lead} />

      {/* 動きを減らす設定・WebGL なしのときの、種類の場面(静止) */}
      <section className="kz-kinds" aria-labelledby="kz-kinds-h">
        <h2 id="kz-kinds-h" className="kz-h2">
          種類からさがす
        </h2>
        <ul>
          {kinds.map((k) => (
            <li key={k.slug}>
              <Link href={k.href} style={{ ["--c" as string]: k.color }}>
                <i>{String(k.n).padStart(2, "0")}</i>
                <b>{k.name}</b>
                <em>{k.count}件</em>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="kz-below">
        <p className="kz-tag">
          <span>種類と場所から、</span>
          <span>店をさがす。</span>
        </p>

        {shops.length > 0 && (
          <section className="kz-sec" aria-labelledby="kz-shops-h">
            <header className="kz-sec-h">
              <h2 id="kz-shops-h" className="kz-h2">
                掲載の店
              </h2>
              <span className="kz-sec-en" aria-hidden="true">
                Shops
              </span>
            </header>
            <p className="kz-sec-note">掲載中の {total} 件から {shops.length} 店を表示しています。そのほかの店は、種類・エリアから探せます。</p>
            <ul className="kz-shops">
              {shops.map((s) => (
                <li key={s.id}>
                  <Link href={`${v.path}/shop/${s.id}`} className="kz-shop">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.photo} alt={`${s.name} — ${s.what}`} loading="lazy" width={s.width} height={s.height} />
                    <span className="kz-shop-n">{s.name}</span>
                    <span className="kz-shop-c">
                      {getPrefBySlug(s.pref)?.short ?? ""} {s.cityName}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="kz-sec" aria-labelledby="kz-areas-h">
          <header className="kz-sec-h">
            <h2 id="kz-areas-h" className="kz-h2">
              エリアからさがす
            </h2>
            <span className="kz-sec-en" aria-hidden="true">
              Areas
            </span>
          </header>
          <ul className="kz-areas">
            {prefs.map((p) => (
              <li key={p.slug}>
                <Link href={searchOn ? searchHref(BODYCARE_SITE, { pref: p.slug }) : `${v.path}/area/${p.slug}`}>
                  {p.name}
                  <small>{p.count}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {scenes.length > 0 && (
          <section className="kz-sec" aria-labelledby="kz-scenes-h">
            <header className="kz-sec-h">
              <h2 id="kz-scenes-h" className="kz-h2">
                利用シーンからさがす
              </h2>
              <span className="kz-sec-en" aria-hidden="true">
                Scenes
              </span>
            </header>
            <ul className="kz-areas">
              {scenes.map((s) => (
                <li key={s.slug}>
                  <Link href={s.href}>
                    {s.name}
                    <small>{s.count}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="kz-note">
          {HAS_CLAIM_POLICY.has(VERTICAL) && <p>掲載方針：店の種類・場所・メニュー・営業時間・設備など、確認できた事実だけを載せます。</p>}
          <p className="kz-note-links">
            <Link href="/editorial/guidelines">掲載基準</Link>
            <Link href="/contact">掲載のご相談</Link>
          </p>
        </div>

        <nav className="kz-others" aria-label="ほかの業種">
          <span className="kz-others-l">Machinowa</span>
          {others.map((k) => (
            <Link key={k} href={VERTICALS[k].path}>
              {VERTICALS[k].name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
