import Link from "next/link";
import Shell from "../common/Shell";
import Crumbs from "../common/Crumbs";
import Nm from "../common/Nm";
import { IconArrow, IconPin } from "../common/Icons";
import { MaskLines, Reveal } from "../common/Motion";
import { dotDate, type LiveShop } from "../common/live";
import { vkLinks, type VkConfig } from "../config";
import { shortName, specialIndexLead, type Special } from "./data";
import "./special.css";

/* eslint-disable @next/next/no-img-element */

/**
 * 特集のページ(本番 /sports/special・/life/special とその記事 /{業種}/special/{slug}。メニューの「特集」の行き先。オーナー決定 2026-10-23)。
 * 利用シーン・業種の特集記事(lib/specials/{業種}.json の 3 本)だけを並べる。店 1 軒の記事(/{業種}/article/{店 ID})は並べない(店は店舗紹介の一覧にいる)。
 * 作りの手本はボディケアの /bodycare/special(components/portal/bcproto/green/article/)。一覧 = 見出し+導入+番号つきの記事の札 → ほかのページへの導線 /
 * 記事 = 見出し+導入+目次 → 節(番号・見出し・本文。店が出てくる節は店舗紹介へのリンク)→ 結び → この記事に出てくる店舗 → あわせて読む → 導線。
 * 色・書体・部品は、その業種のもの(vkit の vk- と base.css。接頭辞 vsp- は特集だけの CSS)。
 * 写真は、記事に出てくる実在の店の写真だけ(店の写真が無ければ写真の枠は出さない)。料金・評価・おすすめ・人気は出さない。「01 02 …」は記事の順の連番(順位ではない)。
 */

function ShopThumb({ s, className = "" }: { s: LiveShop; className?: string }) {
  if (!s.photo) return null;
  return <img className={className} src={s.photo.src} width={s.photo.w} height={s.photo.h} alt="" loading="lazy" decoding="async" />;
}

/** 記事の札(一覧・あわせて読むで共通) */
function SpecialCard({ cfg, s, n, photo }: { cfg: VkConfig; s: Special; n: number; photo: LiveShop | null }) {
  const L = vkLinks(cfg);
  return (
    <Link href={`${L.special}/${s.slug}`} className="vsp-card vk-hov">
      <span className={`vsp-card-ph vk-zoom${photo?.photo ? "" : " is-none"}`}>
        {photo ? <ShopThumb s={photo} /> : null}
        <span className="vsp-card-n vk-num">{String(n).padStart(2, "0")}</span>
      </span>
      <span className="vsp-card-b">
        <span className="vk-lab vsp-card-lab">Special</span>
        <h2 className="vsp-card-t">
          <Nm text={s.title} />
        </h2>
        {s.lead ? <span className="vsp-card-d">{s.lead}</span> : null}
        <span className="vk-more vsp-card-more">
          <span>記事を読む</span>
          <IconArrow />
        </span>
      </span>
    </Link>
  );
}

/** 「ほかのページへ」(店舗紹介・探す・トップ) */
function BackLinks({ cfg }: { cfg: VkConfig }) {
  const L = vkLinks(cfg);
  return (
    <nav className="vsp-back" aria-label="ほかのページへ">
      <span className="vsp-back-l">ほかのページへ</span>
      <Link href={L.shops} className="vk-btn vk-btn--pill">
        店舗紹介へ
        <IconArrow />
      </Link>
      <Link href={L.search} className="vk-btn vk-btn--pill vk-btn--line">
        {cfg.noun}を探す
        <IconArrow />
      </Link>
      <Link href={L.home} className="vk-btn vk-btn--pill vk-btn--line">
        トップへ
        <IconArrow />
      </Link>
    </nav>
  );
}

/** 特集の一覧(/{業種}/special)。photos = 記事ごとの写真(その記事に出てくる最初の店。無ければ null) */
export function SpecialIndexView({ cfg, specials, photos }: { cfg: VkConfig; specials: Special[]; photos: Array<LiveShop | null> }) {
  const L = vkLinks(cfg);
  const short = shortName(cfg);
  return (
    <Shell cfg={cfg} page="article">
      <div className="vsp">
        <header className="vsp-hero">
          <div className="vk-wrap vsp-hero-in">
            <Crumbs items={[{ label: "ホーム", href: L.home }, { label: "特集" }]} className="vsp-crumbs" />
            <p className="vk-lab vsp-lab">Special</p>
            <h1 className="vsp-h1">
              <MaskLines lines={[`${short}の特集`]} step={150} delay={80} />
            </h1>
            <Reveal as="p" variant="fade" className="vsp-lead" delay={420}>
              {specialIndexLead(cfg)}
            </Reveal>
          </div>
        </header>
        <section className="vk-wrap vsp-list" aria-label="特集の一覧">
          {specials.length > 0 ? (
            <ul className="vsp-grid" data-io-group>
              {specials.map((s, i) => (
                <li key={s.slug} className="io">
                  <SpecialCard cfg={cfg} s={s} n={i + 1} photo={photos[i] ?? null} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="vsp-empty">特集は、いま準備をしています。</p>
          )}
          <BackLinks cfg={cfg} />
        </section>
      </div>
    </Shell>
  );
}

/** 特集の記事(/{業種}/special/{slug})。shops = 記事に出てくる掲載中の店(初出の順)。others = ほかの特集(+その写真) */
export function SpecialArticleView({ cfg, s, shops, others }: { cfg: VkConfig; s: Special; shops: LiveShop[]; others: Array<{ s: Special; n: number; photo: LiveShop | null }> }) {
  const L = vkLinks(cfg);
  const byId = new Map(shops.map((x) => [x.id, x]));
  // 店の札は、その記事の中で最初に出てくる節にだけ付ける(同じ店が節ごとに繰り返し並ばないように)
  const shown = new Set<string>();
  const secs = s.sections.map((sec, i) => {
    const fresh = sec.storeIds.filter((id) => byId.has(id) && !shown.has(id));
    fresh.forEach((id) => shown.add(id));
    return { ...sec, id: `vsp-s${i + 1}`, no: String(i + 1).padStart(2, "0"), stores: fresh.map((id) => byId.get(id)!) };
  });
  const photoShops = shops.filter((x) => x.photo).slice(0, 3);
  return (
    <Shell cfg={cfg} page="article">
      <article className="vsp vsp--article">
        <header className="vsp-hero vsp-hero--article">
          <div className="vk-wrap vsp-hero-in">
            <Crumbs items={[{ label: "ホーム", href: L.home }, { label: "特集", href: L.special }, { label: s.title }]} className="vsp-crumbs" />
            <div className="vsp-ahero">
            <div className="vsp-ahero-t">
              <p className="vsp-kick">
                <span className="vk-lab">Special</span>
                {s.date ? <time dateTime={s.date}>{dotDate(s.date)}</time> : null}
              </p>
              <h1 className="vsp-ah1">
                <Nm text={s.title} />
              </h1>
              {s.lead ? <p className="vsp-alead">{s.lead}</p> : null}
            </div>
            {photoShops.length > 0 ? (
              <ul className="vsp-ahero-ph" data-n={photoShops.length} aria-label="この記事に出てくる店の写真">
                {photoShops.map((x) => (
                  <li key={x.id}>
                    <Link href={L.shop(x.id)} className="vk-zoom" aria-label={`${x.name}の店舗紹介を見る`}>
                      <img src={x.photo!.src} width={x.photo!.w} height={x.photo!.h} alt="" decoding="async" loading="eager" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            </div>
          </div>
        </header>

        <div className="vk-wrap vsp-body">
          <aside className="vsp-toc" aria-label="この記事の内容">
            <p className="vsp-toc-h">
              <span className="vk-lab">Contents</span>
              この記事の内容
            </p>
            <ol>
              {secs.map((x) => (
                <li key={x.id}>
                  <a href={`#${x.id}`}>
                    <span className="vk-num vsp-toc-n">{x.no}</span>
                    <span className="vsp-toc-t">
                      <Nm text={x.heading} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="vsp-main">
            {secs.map((x) => (
              <section key={x.id} id={x.id} className="vsp-sec io" aria-labelledby={`${x.id}-h`}>
                <p className="vsp-sec-no">
                  <span className="vk-num">{x.no}</span>
                </p>
                <h2 id={`${x.id}-h`} className="vsp-sec-h">
                  <Nm text={x.heading} />
                </h2>
                <p className="vsp-sec-p">{x.text}</p>
                {x.stores.length > 0 ? (
                  <ul className="vsp-pills" aria-label="この節に出てくる店">
                    {x.stores.map((st) => (
                      <li key={st.id}>
                        <Link href={L.shop(st.id)} className="vsp-pill vk-hov">
                          <IconPin />
                          <span className="vsp-pill-t">
                            <Nm text={st.name} />
                          </span>
                          <span className="vsp-pill-go">
                            店舗紹介を見る
                            <IconArrow />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {s.closing ? (
              <aside className="vsp-closing io" aria-label="ご確認ください">
                <p>{s.closing}</p>
              </aside>
            ) : null}

            {shops.length > 0 ? (
              <section className="vsp-shops io" aria-labelledby="vsp-shops-h">
                <h2 id="vsp-shops-h" className="vsp-sub-h">
                  この記事に出てくる{cfg.noun}
                  <span className="vk-lab">Shops</span>
                </h2>
                <ul className="vsp-shop-g" data-n={shops.length}>
                  {shops.map((st) => (
                    <li key={st.id}>
                      <Link href={L.shop(st.id)} className="vsp-shop vk-hov">
                        <span className={`vsp-shop-ph vk-zoom${st.photo ? "" : " is-none"}`}>
                          <ShopThumb s={st} />
                        </span>
                        <span className="vsp-shop-b">
                          <span className="vsp-shop-k">{[st.area || st.prefName, st.kindName].filter(Boolean).join("・")}</span>
                          <span className="vsp-shop-n">
                            <Nm text={st.name} />
                          </span>
                          <span className="vk-more vsp-shop-more">
                            <span>店舗紹介を見る</span>
                            <IconArrow />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>

        {others.length > 0 ? (
          <section className="vk-wrap vsp-rel" aria-labelledby="vsp-rel-h">
            <h2 id="vsp-rel-h" className="vsp-sub-h">
              あわせて読む
              <span className="vk-lab">Related</span>
            </h2>
            <ul className="vsp-grid vsp-grid--rel">
              {others.map((o) => (
                <li key={o.s.slug}>
                  <SpecialCard cfg={cfg} s={o.s} n={o.n} photo={o.photo} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="vk-wrap vsp-end">
          <BackLinks cfg={cfg} />
          <p className="vsp-end-l">
            <Link href={L.special} className="vk-more vk-more--plain">
              特集の一覧へ
              <IconArrow />
            </Link>
          </p>
        </div>
      </article>
    </Shell>
  );
}
