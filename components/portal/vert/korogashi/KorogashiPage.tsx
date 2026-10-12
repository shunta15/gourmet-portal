import Link from "next/link";
import "./korogashi.css";
import KorogashiHero from "./KorogashiHero";
import { KZ_FONT_CLASSES } from "./fonts";
import { KOROGASHI_LEAD, SHOP_PICKS, koroKinds } from "@/lib/portal/vert/korogashi/data";
import { getGeneratedPlaces } from "@/lib/places/newVerticals";
import { getPrefBySlug } from "@/lib/areas/prefectures";

/**
 * ボディケア入口「転がし(KOROGASHI)」の中身（サーバー）。
 * 最初の画面(ポールの山)・スクロールで進む場面・種類の場面は KorogashiHero(クライアント)。その下は実在の店 6 店・エリア・ほかの業種。
 */
export default async function KorogashiPage() {
  const kinds = koroKinds();
  const places = await getGeneratedPlaces("bodycare");
  const shops = SHOP_PICKS.flatMap((pk) => {
    const pl = places.find((x) => x.id === pk.id);
    return pl ? [{ id: pl.id, name: pl.name, city: pl.cityName ?? "", pref: getPrefBySlug(pl.pref)?.short ?? "", photo: pk.photo, alt: `${pl.name} — ${pk.alt}` }] : [];
  });
  const prefSlugs = Array.from(new Set(places.map((x) => x.pref)));
  const prefs = prefSlugs.flatMap((s) => {
    const p = getPrefBySlug(s);
    return p ? [{ slug: p.slug, name: p.name, code: p.code }] : [];
  });
  prefs.sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className={`kz ${KZ_FONT_CLASSES}`} data-mode="init">
      <KorogashiHero kinds={kinds} lead={KOROGASHI_LEAD} />

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
                <em>{k.en}</em>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="kz-below">
        <p className="kz-tag">街の、手のしごと。</p>

        <section className="kz-sec" aria-labelledby="kz-shops-h">
          <header className="kz-sec-h">
            <h2 id="kz-shops-h" className="kz-h2">
              店をみる
            </h2>
            <span className="kz-sec-en" aria-hidden="true">
              Shops
            </span>
          </header>
          <ul className="kz-shops">
            {shops.map((s) => (
              <li key={s.id}>
                <Link href={`/bodycare/shop/${s.id}`} className="kz-shop">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.photo} alt={s.alt} loading="lazy" width={640} height={440} />
                  <span className="kz-shop-n">{s.name}</span>
                  <span className="kz-shop-c">
                    {s.pref} {s.city}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

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
                <Link href={`/bodycare/area/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="kz-others" aria-label="ほかの業種">
          <span className="kz-others-l">Machinowa</span>
          <Link href="/gourmet">グルメ</Link>
          <Link href="/beauty">ビューティー</Link>
        </nav>
      </div>
    </div>
  );
}
