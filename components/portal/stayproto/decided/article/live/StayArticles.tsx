import Link from "next/link";
import Shell from "../../common/Shell";
import { Reveal, MaskLines } from "../../common/Motion";
import { IconArrow } from "../../common/Icons";
import { IMG_TOP as T, syLinks } from "../../common/site";
import { dotDate, kindsWithShops, loadStayArticles, loadStayShops, prefsWithShops, scenesWithShops, type LiveShop } from "../../common/live";
import ArticleFilter from "../ArticleFilter";
import "../article.css";
import "../list.css";

/* eslint-disable @next/next/no-img-element */

// 宿の記事の一覧(本番 /stay/article。決定デザイン・見本 1_記事の世界)。実在の宿の紹介記事(写真のある宿だけ。種類を順に回した並びで、順位には見せない)。
// 種類の絞り込みと、利用シーン・エリアの入口。記事が 0 本でも壊れない(準備中の案内)。ヒーローの背景は Wikimedia Commons の CC0 写真(common/credits.json)。

const L = syLinks("live");

function Hero({ count }: { count: number }) {
  return (
    <header className="sy-al-hero">
      <div className="sy-al-hero-ph">
        <img src={`${T}/area-bg.webp`} width={1800} height={760} alt="" fetchPriority="high" />
      </div>
      <div className="sy-al-hero-in">
        <p className="sy-lab sy-al-lab">Articles</p>
        <MaskLines as="h1" className="sy-al-h1" lines={["宿の記事"]} delay={80} />
        <Reveal as="p" variant="fade" delay={420} className="sy-al-sub">
          実在の宿を一軒ずつ、まとめた記事です。{count > 0 ? `いま ${count} 本を掲載しています。` : ""}
        </Reveal>
      </div>
    </header>
  );
}

/** shops を渡すと、その宿で組む(確認用。本番のページは渡さない = getPlaces("stay")) */
export default async function StayArticles({ shops: given }: { shops?: LiveShop[] } = {}) {
  const shops = given ?? (await loadStayShops());
  const arts = await loadStayArticles(shops);
  const artShops = arts.map((a) => a.shop);
  const kinds = kindsWithShops(artShops);
  const scenes = scenesWithShops(shops);
  const prefs = prefsWithShops(shops).slice(0, 12);

  return (
    <Shell page="article" mode="live">
      <div className="sy-al">
        <Hero count={arts.length} />
        <div className="sy-al-body">
          {arts.length > 0 ? (
            <ArticleFilter kinds={kinds} total={arts.length}>
              <ul className="sy-al-grid" data-io-group>
                {arts.map((a) => (
                  <li key={a.id} className="io" data-kind={a.shop.kind}>
                    <Link href={L.article(a.id)} className="sy-al-card sy-hov">
                      <span className="sy-al-ph sy-zoom">
                        <img src={a.photo.src} width={a.photo.w} height={a.photo.h} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="sy-al-b">
                        <span className="sy-al-k">{a.shop.kindName}</span>
                        <span className="sy-al-n">{a.shop.name}</span>
                        <span className="sy-al-d">{a.title}</span>
                        <span className="sy-al-m">
                          <span>{a.shop.area}</span>
                          {a.date ? <time dateTime={a.date}>{dotDate(a.date)} 確認</time> : null}
                        </span>
                        <IconArrow className="sy-al-ar" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ArticleFilter>
          ) : (
            <section className="sy-al-empty" aria-labelledby="sy-al-empty-h">
              <h2 id="sy-al-empty-h">記事は準備中です</h2>
              <p>宿の記事は、まだありません。準備ができた宿から、順に載せていきます。</p>
              <p className="sy-al-empty-l">
                <Link href={L.search} className="sy-more">
                  宿を探す
                  <IconArrow />
                </Link>
              </p>
            </section>
          )}

          {scenes.length > 0 ? (
            <section id="sy-al-scene" className="sy-al-ent" aria-labelledby="sy-al-scene-h">
              <h2 id="sy-al-scene-h" className="sy-al-eh io">
                利用シーンから探す <span className="sy-lab">Scene</span>
              </h2>
              <ul className="sy-al-chips">
                {scenes.map((s) => (
                  <li key={s.slug}>
                    <Link href={`${L.home}/scene/${s.slug}`} className="sy-al-chip">
                      {s.name}
                      <span>{s.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {prefs.length > 0 ? (
            <section id="sy-al-area" className="sy-al-ent" aria-labelledby="sy-al-area-h">
              <h2 id="sy-al-area-h" className="sy-al-eh io">
                エリアから探す <span className="sy-lab">Area</span>
              </h2>
              <ul className="sy-al-chips">
                {prefs.map((p) => (
                  <li key={p.slug}>
                    <Link href={L.searchWith({ pref: p.slug })} className="sy-al-chip">
                      {p.short}
                      <span>{p.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}
