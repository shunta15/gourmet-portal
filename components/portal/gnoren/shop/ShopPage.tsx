import "./shop.css";
import { LeafSpray } from "../common/Decor";
import { ArrowR, INFO_ICONS, TAG_ICONS } from "./icons";
import Gallery from "./Gallery";
import { INFO, MENU, SCENES, SHOP } from "./data";

const IMG = "/_portal/gnoren/shop";

/** 店舗紹介(見本 3)。仮の中身は data.ts。PC は見本の座標どおり(--u)、≤768px は縦 1 列。 */
export default function ShopPage() {
  return (
    <main className="gn-shop">
      {/* ───── ヒーロー(暖簾 + 縦の短冊 + キャッチ) ───── */}
      <section className="gn-shop-hero gn-wrap" aria-label="お店の紹介">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-shop-herobg" src={`${IMG}/hero.webp`} alt="" aria-hidden="true" width={2172} height={992} fetchPriority="high" />

        <div className="gn-shop-band gn-shop-band-a" aria-hidden="true">
          <span className="gn-shop-n-sub gn-mincho">{SHOP.nameMain}</span>
          <span className="gn-shop-n-name gn-mincho">{SHOP.nameTail}</span>
          <span className="gn-shop-n-kaze gn-mincho">KAZEMACHI</span>
        </div>

        <div className="gn-shop-band gn-shop-band-b">
          <ul className="gn-shop-strips">
            {SHOP.strips.map((s, i) => (
              <li key={s} className={`gn-shop-strip gn-shop-strip-${i + 1} gn-mincho`}>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="gn-shop-catch">
          <p className="gn-shop-catch-h gn-mincho">
            {SHOP.catch.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <p className="gn-shop-catch-p">
            {SHOP.lead.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ───── 本文 + 店舗情報(右・sticky) ───── */}
      <div className="gn-shop-body gn-wrap">
        <div className="gn-shop-col">
          {/* 紹介 */}
          <section className="gn-shop-intro" aria-label="お店について">
            <ul className="gn-shop-tags">
              {SHOP.tags.map((t) => {
                const Icon = TAG_ICONS[t.icon];
                return (
                  <li key={t.label} className={`gn-shop-tag gn-shop-tag-${t.icon}`}>
                    <Icon className="gn-shop-tag-ic" />
                    <span>{t.label}</span>
                  </li>
                );
              })}
            </ul>
            <h1 className="gn-shop-h1 gn-mincho">
              <span className="gn-shop-h1-a">{SHOP.nameMain}</span>
              <span className="gn-shop-h1-b">
                <ruby>
                  {SHOP.nameTail}
                  <rt>{SHOP.nameKana}</rt>
                </ruby>
              </span>
            </h1>
            <p className="gn-shop-desc">
              {SHOP.description.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <div className="gn-shop-deco" aria-hidden="true">
              <LeafSpray className="gn-shop-leaf" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gn-shop-script" src={`${IMG}/script.webp`} alt="" width={300} height={176} />
            </div>
          </section>

          {/* おすすめメニュー */}
          <section className="gn-shop-menu" aria-labelledby="gn-shop-menu-h">
            <div className="gn-shop-head">
              <h2 id="gn-shop-menu-h" className="gn-shop-h2 gn-mincho">おすすめメニュー</h2>
              <a href="#gn-shop-menu-h" className="gn-shop-more">
                すべてのメニューを見る <ArrowR />
              </a>
            </div>
            <ul className="gn-shop-menu-list">
              {MENU.map((m, i) => (
                <li key={m.name} className={`gn-shop-item gn-shop-item-${i + 1}`}>
                  <div className="gn-shop-item-ph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${IMG}/${m.img}.webp`} alt={m.name} loading="lazy" decoding="async" />
                  </div>
                  <h3 className="gn-shop-item-n gn-mincho">{m.name}</h3>
                  <p className="gn-shop-item-pr">{m.price}</p>
                  <p className="gn-shop-item-d">
                    {m.desc.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* 店内の様子 */}
          <section className="gn-shop-gallery" aria-labelledby="gn-shop-gal-h">
            <div className="gn-shop-head gn-shop-head-gal">
              <h2 id="gn-shop-gal-h" className="gn-shop-h2 gn-mincho">店内の様子</h2>
              <p className="gn-shop-lead">木のぬくもりに包まれた、落ち着いた空間で、お食事や甘味をお楽しみいただけます。</p>
              <a href="#gn-shop-gal-h" className="gn-shop-more">
                すべて見る <ArrowR />
              </a>
            </div>
            <Gallery />
          </section>
        </div>

        {/* 店舗情報(PC は右で sticky・スマホは紹介の下) */}
        <aside className="gn-shop-aside" aria-labelledby="gn-shop-info-h">
          <div className="gn-shop-card">
            <div className="gn-shop-card-top">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gn-shop-card-noren" src={`${IMG}/card-noren.webp`} alt="" aria-hidden="true" width={528} height={166} />
              <h2 id="gn-shop-info-h" className="gn-shop-card-h gn-mincho">店舗情報</h2>
            </div>
            <dl className="gn-shop-info">
              {INFO.map((r) => {
                const Icon = INFO_ICONS[r.icon];
                return (
                  <div key={r.key} className={`gn-shop-row gn-shop-row-${r.key}`}>
                    <dt>
                      <Icon className="gn-shop-row-ic" />
                      <span>{r.label}</span>
                    </dt>
                    <dd>
                      {r.lines.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                      {"button" in r && r.button ? (
                        <a href="#gn-shop-map" className="gn-shop-btn gn-shop-btn-s">
                          {r.button} <ArrowR />
                        </a>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div id="gn-shop-map" className="gn-shop-map">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/map.webp`} alt="お店の周辺の地図" width={454} height={346} loading="lazy" decoding="async" />
              <a href="#gn-shop-map" className="gn-shop-btn gn-shop-btn-g">
                Googleマップで見る <ArrowR />
              </a>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gn-shop-sprig" src={`${IMG}/sprig-r.webp`} alt="" aria-hidden="true" width={62} height={320} />
          </div>
        </aside>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-shop-twig" src={`${IMG}/twig.webp`} alt="" aria-hidden="true" width={208} height={164} />
      </div>

      {/* ───── こんなシーンにおすすめ ───── */}
      <section className="gn-shop-scenes gn-wrap" aria-labelledby="gn-shop-sc-h">
        <h2 id="gn-shop-sc-h" className="gn-shop-h2 gn-mincho">こんなシーンにおすすめ</h2>
        <ul className="gn-shop-sc-list">
          {SCENES.map((s) => (
            <li key={s.img} className="gn-shop-sc">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/${s.img}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
              <p className="gn-shop-sc-t gn-mincho">
                {s.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
