import "@/components/portal/gnoren/shop/shop.css";
import "./real.css";
import type { CSSProperties } from "react";
import LeafletMap from "@/components/LeafletMap";
import { LeafSpray, Townscape, Twig } from "../../common/Decor";
import { ArrowR, INFO_ICONS, TAG_ICONS } from "../../shop/icons";
import { IconPeople } from "./icons";
import GalleryReal from "./GalleryReal";
import MapLinkR from "./MapLinkR";
import type { GnShopVM } from "@/lib/portal/gnoren/shop";

const IMG = "/_portal/gnoren/shop";
const INFO_ICON: Record<GnShopVM["info"][number]["key"], keyof typeof INFO_ICONS> = {
  addr: "store",
  hours: "clock",
  closed: "calendar",
  tel: "phone",
  seats: "chair",
  access: "train",
};

/**
 * 店ページ(見本 3)の実データ版。試作 components/portal/gnoren/shop/ShopPage.tsx と同じ見た目・同じクラス名(gn-shop-*)。
 * データは lib/portal/gnoren/shop.ts の GnShopVM(サーバーで整形済み)。追加の CSS は real.css(gn-shop-r-*)。
 * 写真が少ない店は、空の枠を出さずに詰める(ギャラリー 0 枚なら節ごと出さない)。
 */
/** 暖簾の布 1 枚(中央)に収まる 1 行の幅(全角 1 字 = 1。半角は 0.7) */
const CLOTH_W = 6;
const charW = (ch: string): number => (/[\x20-\x7e]/.test(ch) ? 0.7 : 1);
const textW = (t: string): number => Array.from(t).reduce((n, ch) => n + charW(ch), 0);
const charClass = (ch: string): string => (/[\x20-\x7e]/.test(ch) ? "a" : /[ァ-ヶー]/.test(ch) ? "k" : /[ぁ-ゟ]/.test(ch) ? "h" : "j");

/** 1 つの語が布 1 枚の幅を超えるとき、文字の種類が変わる所(カナ→漢字など)を優先して、どちらも幅内に収まるように分ける */
function chunkPiece(piece: string): string[] {
  const chars = Array.from(piece);
  if (textW(piece) <= CLOTH_W || chars.length < 2) return [piece];
  const mid = chars.length / 2;
  let best = -1;
  let bestKind = 2;
  for (let i = 1; i < chars.length; i++) {
    const l = textW(chars.slice(0, i).join(""));
    const r = textW(chars.slice(i).join(""));
    if (l > CLOTH_W || r > CLOTH_W) continue;
    const kind = charClass(chars[i - 1]) !== charClass(chars[i]) ? 0 : 1;
    if (best < 0 || kind < bestKind || (kind === bestKind && Math.abs(i - mid) < Math.abs(best - mid))) {
      best = i;
      bestKind = kind;
    }
  }
  if (best < 0) best = Math.ceil(mid);
  return [...chunkPiece(chars.slice(0, best).join("")), ...chunkPiece(chars.slice(best).join(""))];
}

/** 暖簾の文字を行に分ける。12 字までは 1 行(布 3 枚にまたがって置く)。超えるときは、布の継ぎ目に字がまたがらないよう、
 *  真ん中の布 1 枚に収まる幅(CLOTH_W)ごとに「 / 」・空白・「・」・字種の変わり目で行を分けて縮める */
function clothLines(name: string): { lines: string[]; narrow: boolean; fs: number } {
  const chars = Array.from(name);
  if (chars.length <= 12) return { lines: [name], narrow: false, fs: 0 };
  const pieces = name.split(/[\s/／・]+/).map((t) => t.trim()).filter(Boolean).flatMap(chunkPiece);
  const lines: string[] = [];
  for (const p of pieces) {
    const last = lines[lines.length - 1];
    if (last !== undefined) {
      const sep = charClass(Array.from(last).slice(-1)[0]) === "a" && charClass(Array.from(p)[0]) === "a" ? " " : "";
      if (textW(last + sep + p) <= CLOTH_W) {
        lines[lines.length - 1] = last + sep + p;
        continue;
      }
    }
    lines.push(p);
  }
  const maxW = Math.max(...lines.map(textW), 1);
  /** 布の高さ(232)に収まるよう行数でも縮める。単位は布の幅 410 を基準にした px */
  const fs = Math.min(34, 112 / maxW, 100 / (lines.length * 1.35));
  return { lines, narrow: true, fs: Math.round(fs * 10) / 10 };
}

export default function ShopPageReal({ shop: s }: { shop: GnShopVM }) {
  const page = `/restaurant/${s.id}`;
  const nameStyle = { "--n": Math.max(s.nameLen, 1) } as CSSProperties;
  const cloth = clothLines(s.name);
  const lines = cloth.lines;
  const clothStyle = (cloth.narrow
    ? { "--n": 1, "--fs": cloth.fs }
    : { "--n": Math.max(...lines.map((l) => Array.from(l).length), 1) }) as unknown as CSSProperties;

  return (
    <main className="gn-shop gn-shop-r">
      {/* ───── ヒーロー(店の写真 + 暖簾の布 + 縦の短冊) ───── */}
      <section className={`gn-shop-hero gn-shop-r-hero gn-wrap${s.hero ? "" : " gn-shop-r-hero-bare gn-linen"}`} aria-label="お店の紹介">
        <div className="gn-shop-r-stage">
          {s.hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="gn-shop-herobg gn-shop-r-herophoto" {...s.hero} alt={`${s.name} の写真`} width={1800} height={1000} fetchPriority="high" decoding="async" />
          ) : (
            <Townscape className="gn-shop-r-town" />
          )}
          {s.hero ? <div className="gn-shop-r-wash" aria-hidden="true" /> : null}

          <div className="gn-shop-r-cloth" style={clothStyle} aria-hidden="true">
            <span className="gn-shop-r-rod" />
            <span className="gn-shop-r-panel gn-shop-r-panel-1" />
            <span className="gn-shop-r-panel gn-shop-r-panel-2" />
            <span className="gn-shop-r-panel gn-shop-r-panel-3" />
            <div className="gn-shop-r-cloth-tx">
              {s.cuisine ? (
                <span className={`gn-shop-r-cloth-sub gn-mincho${cloth.narrow ? " gn-shop-r-cloth-sub-2" : ""}`}>
                  {s.cuisine.split("・").map((t, i) => (
                    <span key={`${i}${t}`}>{i > 0 ? <>・<wbr /></> : null}{t}</span>
                  ))}
                </span>
              ) : null}
              <span className={`gn-shop-r-cloth-name gn-mincho${cloth.narrow ? " gn-shop-r-cloth-name-2" : ""}`}>
                {lines.map((l) => (
                  <span key={l} className="gn-shop-r-cloth-line">{l}</span>
                ))}
              </span>
            </div>
          </div>

          {s.strips.length > 0 ? (
            <ul className="gn-shop-r-strips">
              {s.strips.map((t, i) => (
                <li key={t} className={`gn-shop-r-strip gn-shop-r-strip-${i + 1} gn-mincho`}>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {s.area || s.nearest || s.feature ? (
          <div className="gn-shop-catch gn-shop-r-catch">
            {s.area ? <p className="gn-shop-catch-h gn-mincho">{s.area}</p> : null}
            {s.nearest ? <p className="gn-shop-catch-p">{s.nearest}</p> : null}
            {s.feature ? (
              <a href={s.feature.href} className="gn-shop-btn gn-shop-r-feat">
                この店の特集記事を読む <ArrowR />
              </a>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* ───── 本文(紹介・おすすめ・写真・シーン・関連記事)+ 店舗情報(右・sticky) ───── */}
      <div className="gn-shop-body gn-shop-r-body gn-wrap">
        <div className="gn-shop-col">
          {/* 紹介 */}
          <section className="gn-shop-intro gn-shop-r-intro" aria-label="お店について">
            {s.tags.length > 0 ? (
              <ul className="gn-shop-tags">
                {s.tags.map((t) => {
                  const Icon = t.kind === "cuisine" ? TAG_ICONS.bowl : t.kind === "region" ? TAG_ICONS.pin : IconPeople;
                  return (
                    <li key={t.kind} className={`gn-shop-tag gn-shop-r-tag gn-shop-tag-${t.kind === "cuisine" ? "bowl" : t.kind === "region" ? "pin" : "cup"}`}>
                      <Icon className="gn-shop-tag-ic" />
                      <span>{t.label}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <h1 className="gn-shop-h1 gn-shop-r-h1 gn-mincho" style={nameStyle}>
              {s.name}
            </h1>
            {s.desc.length > 0 ? (
              <div className="gn-shop-desc gn-shop-r-desc">
                {s.desc.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ) : null}
            <div className="gn-shop-deco" aria-hidden="true">
              <LeafSpray className="gn-shop-leaf" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gn-shop-script" src={`${IMG}/script.webp`} alt="" width={300} height={176} />
            </div>
          </section>

          {/* この店のおすすめ */}
          {s.picks.length > 0 ? (
            <section className="gn-shop-menu gn-shop-r-picks" aria-labelledby="gn-shop-menu-h">
              <div className="gn-shop-head">
                <h2 id="gn-shop-menu-h" className="gn-shop-h2 gn-mincho">この店のおすすめ</h2>
              </div>
              <ul className="gn-shop-menu-list">
                {s.picks.map((m, i) => (
                  <li key={`${m.name}${m.desc}`} className={`gn-shop-item gn-shop-item-${i + 1}${m.img ? "" : " gn-shop-r-item-text"}`}>
                    {m.img ? (
                      <div className="gn-shop-item-ph">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img {...m.img} alt={m.alt ?? ""} loading="lazy" decoding="async" />
                      </div>
                    ) : null}
                    {m.name ? <h3 className="gn-shop-item-n gn-mincho">{m.name}</h3> : null}
                    {m.desc ? <p className="gn-shop-item-d">{m.desc}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* お店の写真 */}
          {s.gallery.length > 0 ? (
            <section className="gn-shop-gallery" aria-labelledby="gn-shop-gal-h">
              <div className="gn-shop-head gn-shop-head-gal">
                <h2 id="gn-shop-gal-h" className="gn-shop-h2 gn-mincho">お店の写真</h2>
              </div>
              <GalleryReal items={s.gallery} />
            </section>
          ) : null}
          {/* ───── こんなシーンにおすすめ ───── */}
          {s.scenes.length > 0 ? (
            <section className="gn-shop-scenes gn-shop-r-scenes" aria-labelledby="gn-shop-sc-h">
              <h2 id="gn-shop-sc-h" className="gn-shop-h2 gn-mincho">こんなシーンにおすすめ</h2>
              <ul className="gn-shop-sc-list">
                {s.scenes.map((sc) => (
                  <li key={sc.slug} className={`gn-shop-sc${sc.img ? "" : " gn-shop-r-sc-plain"}`}>
                    {sc.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img {...sc.img} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    ) : null}
                    <a href={sc.href} className="gn-shop-r-sc-a">
                      <span className="gn-shop-sc-t gn-mincho">
                        <span className="gn-shop-r-sc-n">{sc.name}</span>
                        <span className="gn-shop-r-sc-s">{sc.sub}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* ───── 関連記事(対の特集記事が先頭) ───── */}
          {s.related.length > 0 ? (
            <section className="gn-shop-r-rel" aria-labelledby="gn-shop-rel-h">
              <h2 id="gn-shop-rel-h" className="gn-shop-h2 gn-mincho">関連記事</h2>
              <ul className="gn-shop-r-rel-list">
                {s.related.map((f) => (
                  <li key={f.id} className="gn-shop-r-rel-i">
                    <a href={f.href} className="gn-shop-r-rel-a">
                      {f.img ? (
                        <span className="gn-shop-r-rel-ph">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img {...f.img} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        </span>
                      ) : null}
                      <span className="gn-shop-r-rel-t gn-mincho">{f.title}</span>
                      {f.sub ? <span className="gn-shop-r-rel-s">{f.sub}</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* 店舗情報(PC は右で sticky・スマホは紹介の下) */}
        {s.info.length > 0 || s.geo ? (
          <aside className="gn-shop-aside" aria-labelledby="gn-shop-info-h">
            <div className="gn-shop-card">
              <div className="gn-shop-card-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="gn-shop-card-noren" src={`${IMG}/card-noren.webp`} alt="" aria-hidden="true" width={528} height={166} />
                <h2 id="gn-shop-info-h" className="gn-shop-card-h gn-mincho">店舗情報</h2>
              </div>
              <dl className="gn-shop-info">
                {s.info.map((r) => {
                  const Icon = INFO_ICONS[INFO_ICON[r.key]];
                  return (
                    <div key={r.key} className={`gn-shop-row gn-shop-row-${r.key}`}>
                      <dt>
                        <Icon className="gn-shop-row-ic" />
                        <span>{r.label}</span>
                      </dt>
                      <dd>
                        {r.tel ? <a href={`tel:${r.tel}`}>{r.text}</a> : <span>{r.text}</span>}
                        {r.key === "addr" && s.mapsUrl ? (
                          s.geo ? (
                            <a href="#gn-shop-map" className="gn-shop-btn gn-shop-btn-s gn-shop-r-btn-s">
                              地図で見る <ArrowR />
                            </a>
                          ) : (
                            <MapLinkR href={s.mapsUrl} storeId={s.id} page={page} className="gn-shop-btn gn-shop-btn-s gn-shop-r-btn-s">
                              地図で見る <ArrowR />
                            </MapLinkR>
                          )
                        ) : null}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {s.geo ? (
                <div id="gn-shop-map" className="gn-shop-map gn-shop-r-map">
                  <div className="gn-shop-r-map-in">
                    <LeafletMap points={[{ id: s.id, name: s.name, lat: s.geo.lat, lng: s.geo.lng, sub: s.address }]} height={180} zoom={15} interactive={false} />
                  </div>
                  {s.mapsUrl ? (
                    <MapLinkR href={s.mapsUrl} storeId={s.id} page={page} className="gn-shop-btn gn-shop-btn-g gn-shop-r-btn-g">
                      Googleマップで見る <ArrowR />
                    </MapLinkR>
                  ) : null}
                </div>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gn-shop-sprig" src={`${IMG}/sprig-r.webp`} alt="" aria-hidden="true" width={62} height={320} />
            </div>
          </aside>
        ) : null}

        <Twig className="gn-shop-twig" />
      </div>

    </main>
  );
}
