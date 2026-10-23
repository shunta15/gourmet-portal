import Link from "next/link";
import Banner from "./Banner";
import Fav from "./Fav";
import { Flag, IcArrow, IcBag, IcCal, IcCheck, IcClock, IcDoc, IcExternal, IcPhone, IcPin, IcStar, IcVest, Mountain, Pine, Pines, Stamp, Waves } from "./Deco";
import { aLinks, searchUrl } from "./links";
import type { AShop, ARow, LinePhoto } from "./data";

const IMG = "/_portal/activity/";

/** 写真を、大きさの順(大きい写真を大きな枠へ)と使い道で振り分ける。足りなければ繰り返す(同じ節の中では重ねない) */
function assign(list: LinePhoto[]) {
  const bySize = [...list].sort((a, b) => b.w * b.h - a.w * a.h);
  const at = (arr: LinePhoto[], i: number) => arr[i % arr.length];
  const heroBig = bySize[0];
  const tiltA = at(bySize, 1);
  const tiltB = at(bySize, 2);
  const used = new Set([heroBig.src, tiltA.src, tiltB.src]);
  const rest = list.filter((p) => !used.has(p.src));
  const pool = rest.length >= 5 ? rest : [...rest, ...list.filter((p) => used.has(p.src))];
  const stamps = Array.from({ length: 5 }, (_, i) => at(pool, i));
  const about = list.find((p) => /外観/.test(p.alt)) ?? list.find((p) => /オープンテラス/.test(p.alt)) ?? list.find((p) => /駐車スペース/.test(p.alt)) ?? at(list, 3);
  const feat = [at(bySize, 1), at(bySize, 3)];
  return { heroBig, tiltA, tiltB, stamps, about, feat };
}

/** 特集の見出しの長さで字の大きさを切り替える(長い見出しは小さく折り返す) */
function featSize(lines: string[]): string {
  const n = lines.join("").length;
  return n <= 22 ? "" : n <= 46 ? " is-s" : " is-xs";
}

const ROW_IC = { address: IcPin, phone: IcPhone, hours: IcClock, holidays: IcCal, access: IcPin } as const;

function Rows({ rows, map }: { rows: ARow[]; map: string | null }) {
  return (
    <dl className="h-rows">
      {rows.map((r) => {
        const Ic = ROW_IC[r.k];
        return (
          <div key={r.k + r.label} className={`h-row h-row-${r.k}`}>
            <dt>
              <Ic />
              {r.label}
            </dt>
            <dd>
              {r.k === "phone" ? (
                <a href={`tel:${r.lines[0].replace(/[^0-9+]/g, "")}`} className="h-tel">
                  {r.lines[0]}
                </a>
              ) : (
                r.lines.map((l) => <span key={l}>{l}</span>)
              )}
            </dd>
            {r.k === "address" && map ? (
              <a className="h-map" href={map} target="_blank" rel="noopener noreferrer">
                MAP <IcArrow />
              </a>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}

const BOX_STYLE: Record<string, { cls: string; en: string; Ic: typeof IcBag }> = {
  point: { cls: "pt", en: "HIGHLIGHTS", Ic: IcStar },
  bring: { cls: "br", en: "WHAT TO BRING", Ic: IcBag },
  safety: { cls: "sf", en: "SAFETY", Ic: IcVest },
  flow: { cls: "br", en: "RESERVATION", Ic: IcDoc },
};

/** 店舗紹介ページ(見本 82)。実在の店 1 軒。星・口コミ・料金・「人気」・架空のスタッフ・架空の住所は出さない。口コミの欄は「情報の出どころ」に置き換えた。お気に入りのハートは、この端末に保存される */
export default function Shop({ shop, others }: { shop: AShop; others: AShop[] }) {
  const ph = assign(shop.photoList);
  const official = shop.officialUrl;
  const crumbKind = shop.kindName;
  // ヒーローの「評価・料金」の欄の代わり。店データにある本当の事実(営業時間・定休日・電話)の短いものを 2 行まで
  const factRows = ["hours", "holidays", "phone"]
    .map((k) => shop.rows.find((r) => r.k === k))
    .filter((r): r is ARow => !!r && r.lines.join(" ").length <= 24)
    .slice(0, 2);
  const maxPart = Math.max(...shop.nameParts.map((x) => x.length));
  const nameCls = maxPart <= 8 ? "" : maxPart <= 12 ? " is-l" : maxPart <= 14 ? " is-m" : " is-s";
  void others;
  return (
    <div className="apa-page apa-shop">
      <nav className="h-crumb" aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <i>›</i>
        <Link href={aLinks.top}>アクティビティ</Link>
        <i>›</i>
        <Link href={searchUrl({ kind: [shop.kind] })}>{crumbKind}</Link>
        <i>›</i>
        <span>{shop.name}</span>
      </nav>

      {/* ---- ヒーロー(写真のコラージュ) ---- */}
      <section className="h-hero" aria-label={shop.name}>
        <i className="h-yel h-yel-1" />
        <i className="h-yel h-yel-2" />
        <i className="h-yel h-yel-3" />
        <i className="h-yel h-yel-4" />
        <figure className="h-big">
          <img src={ph.heroBig.src} alt={ph.heroBig.alt} />
          <figcaption className="apa-hand">
            {shop.heroText.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </figcaption>
          <svg className="h-sun" viewBox="0 0 60 60" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="30" cy="32" r="8" />
            <path d="M30 14v-8M12 32H4M18 20l-6-6M44 20l5-6M48 32h8M18 44l-5 5M42 44l6 6" />
          </svg>
          <Stamp id="hb" className="h-big-stamp" ring="MACHINOWA ACTIVITY" mountain wave />
          {/* 店の特集記事(/activity/article/{店 ID})への入口。店名・写真のすぐそばに目立つように置く(オーナー決定 2026-10-23「簡単な店舗詳細ページから店舗特集記事に飛べる」)。下の「特集記事」の札も残す */}
          {shop.feat ? (
            <Link href={aLinks.story(shop.id)} className="h-story-btn">
              <IcDoc />
              特集記事を読む
              <IcArrow />
            </Link>
          ) : null}
        </figure>
        <Pine className="h-pine h-pine-a" />
        <Pine className="h-pine h-pine-b" />

        <div className="h-panel">
          <div className="h-panel-in">
            <p className="h-loc">
              {shop.prefName}
              {shop.city ? ` ・ ${shop.city}` : ""}
            </p>
            <h1 className={`h-name${nameCls}`}>
              {shop.nameParts.map((p, i) => (
                <span key={i}>{p}</span>
              ))}
            </h1>
            {shop.tagline ? <p className="h-tagline">{shop.tagline}</p> : null}
            {shop.pills.length ? (
              <ul className="h-pills">
                {shop.pills.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
            {factRows.length ? (
              <div className="h-facts">
                {factRows.map((r) => {
                  const Ic = ROW_IC[r.k];
                  return (
                    <p key={r.k} className="h-fact">
                      <Ic />
                      <span>{r.label}</span>
                      <b>{r.lines.join(" ")}</b>
                    </p>
                  );
                })}
              </div>
            ) : null}
            <div className="h-cta">
              {official ? (
                <a className="h-reserve" href={official} target="_blank" rel="noopener noreferrer">
                  <IcExternal />
                  公式サイトで確認する
                </a>
              ) : (
                <span className="h-reserve is-off">公式サイトは確認中です</span>
              )}
              <Fav id={shop.id} name={shop.name} className="h-fav" />
            </div>
          </div>
          <Pines className="h-panel-pines" />
        </div>
        <Stamp id="hs" className="h-pref-stamp" ring={shop.prefEn} mountain={true} />
        <Waves className="h-panel-waves" />

        <figure className="h-tiltA">
          <img src={ph.tiltA.src} alt={ph.tiltA.alt} />
          <figcaption className="apa-hand">{ph.tiltA.cap}</figcaption>
        </figure>
        <figure className="h-tiltB">
          <img src={ph.tiltB.src} alt={ph.tiltB.alt} />
          <figcaption className="apa-hand">{ph.tiltB.cap}</figcaption>
          <Pines className="h-tiltB-pines" />
        </figure>

        <div className="h-strip">
          {ph.stamps.map((p, i) => (
            <figure key={p.src + i} className={`h-st h-st-${i + 1}`}>
              <img src={p.src} alt={p.alt} loading="lazy" />
              {p.cap ? <figcaption className="apa-hand">{p.cap}</figcaption> : null}
            </figure>
          ))}
        </div>
      </section>

      {/* ---- 本体 ---- */}
      <div className="h-main">
        <section className="h-about" aria-label="店舗情報">
          <header className="h-about-h">
            <span className="h-about-ic">
              <IcPin />
            </span>
            <h2>店舗情報</h2>
            <small>ABOUT US</small>
          </header>
          <h3 className="h-about-name">{shop.name}</h3>
          <div className="h-about-ph">
            <img src={ph.about.src} alt={ph.about.alt} loading="lazy" />
            {shop.ledeLong || shop.ledeShort ? <p className="h-about-p">{shop.ledeLong || shop.ledeShort}</p> : null}
          </div>
          <Rows rows={shop.rows} map={shop.mapHref} />
        </section>

        <section className="h-plans" aria-label="体験の内容">
          <header className="h-sec-h">
            <Flag n="03" className="h-sec-flag" />
            <h2>体験の内容</h2>
            <small>ACTIVITY PLAN</small>
            <Mountain className="h-sec-deco" />
            {official ? (
              <a className="h-sec-more" href={official} target="_blank" rel="noopener noreferrer">
                公式サイトで詳しく見る <IcArrow />
              </a>
            ) : null}
          </header>
          <ul className="h-plan-list">
            {shop.plans.map((pl) => (
              <li key={pl.name} className="h-plan">
                <span className="h-plan-ph">
                  <img src={pl.photo.src} alt={pl.photo.alt} loading="lazy" />
                </span>
                <h3>{pl.name}</h3>
                <p>{pl.desc}</p>
                {pl.time ? (
                  <span className="h-plan-m">
                    <IcClock />
                    {pl.time}
                  </span>
                ) : null}
                {pl.cond ? <span className="h-plan-c">{pl.cond}</span> : null}
                {official ? (
                  <a className="h-plan-go" href={official} target="_blank" rel="noopener noreferrer" aria-label={`${pl.name}を公式サイトで確認`}>
                    <IcArrow />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          <div className={`h-boxes h-boxes-${shop.blocks.length}`}>
            {shop.blocks.map((b) => {
              const st = BOX_STYLE[b.key];
              return (
                <section key={b.key} className={`h-box h-box-${st.cls}`}>
                  <header>
                    <span className="h-box-ic">
                      <st.Ic />
                    </span>
                    <h3>{b.title}</h3>
                    <small>{b.en}</small>
                  </header>
                  <ul>
                    {b.items.map((it) => (
                      <li key={it}>
                        <IcCheck />
                        {it}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </section>
      </div>

      <div className="h-low">
        {shop.feat ? (
          <section className="h-feat" aria-label="特集記事">
            <div className="h-feat-tag">
              <span>特集記事</span>
              <small>FEATURE ARTICLE</small>
            </div>
            <h2 className={`h-feat-t${featSize(shop.feat.title)}`}>
              {shop.feat.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
            <p className="h-feat-sub">{shop.feat.sub}</p>
            {shop.feat.body ? <p className="h-feat-p">{shop.feat.body}</p> : null}
            <Link href={aLinks.story(shop.id)} className="h-feat-btn">
              記事を読む <IcArrow />
            </Link>
            <Pines className="h-feat-pines" />
            <figure className="h-feat-a">
              <img src={ph.feat[0].src} alt={ph.feat[0].alt} loading="lazy" />
              {ph.feat[0].cap ? <figcaption className="apa-hand">{ph.feat[0].cap}</figcaption> : null}
            </figure>
            <figure className="h-feat-b">
              <img src={ph.feat[1].src} alt={ph.feat[1].alt} loading="lazy" />
              {ph.feat[1].cap ? <figcaption className="apa-hand">{ph.feat[1].cap}</figcaption> : null}
            </figure>
          </section>
        ) : null}
        <section className="h-src" aria-label="情報の出どころ">
          <header className="h-src-h">
            <span className="h-src-flag">
              <IcDoc />
            </span>
            <h2>情報の出どころ</h2>
            <small>SOURCES</small>
            {shop.checkedAt ? <span className="h-src-date">確認日 {shop.checkedAt.replace(/-/g, ".")}</span> : null}
          </header>
          <ul className="h-src-list">
            {shop.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <IcExternal />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="h-src-note">情報は変わることがあります。最新の案内は、公式サイトなどでご確認ください。</p>
        </section>
      </div>

      <Banner v="shop" href={official ?? aLinks.top} external={!!official} />
    </div>
  );
}
