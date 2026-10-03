import Link from "next/link";
import { VERTICAL_FACE } from "@/lib/portal/meta";
import type { Vertical } from "@/lib/verticals/types";
import type { GourmetPhoto } from "@/lib/portal/home";

/**
 * 6業種の入口（サーバー）。
 * グルメ: 実件数と実店舗の写真。ほか5つ: 色・文字・動きだけで表現し「掲載準備中」と正直に出す。
 * ストック写真・AI画像は使わない。
 */
export default function Entrances({
  gourmet,
  others,
  total,
  prefCount,
  featureTotal,
  photos,
}: {
  gourmet: Vertical;
  others: Vertical[];
  total: number;
  prefCount: number;
  featureTotal: number;
  photos: GourmetPhoto[];
}) {
  const [big, ...small] = photos;
  return (
    <section id="entrances" className="mp-sec mp-ent" aria-labelledby="mp-ent-h">
      <div className="mp-wrap">
        <header className="mp-sec-head" data-reveal>
          <p className="mp-kicker">01 — Entrances</p>
          <h2 id="mp-ent-h" className="mp-h2">6つの入口</h2>
          <p className="mp-lead">いま掲載があるのはグルメです。ほかの5つは、掲載準備中です。</p>
        </header>

        <article className="mp-gm" data-progress="through" style={{ ["--ac" as string]: gourmet.accent.color, ["--acl" as string]: gourmet.accent.lightColor }} data-reveal>
          <div className={`mp-gm-photos${small.length === 0 ? " solo" : ""}`}>
            {big && (
              <figure className="big">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={big.src} alt={`${big.name}（${big.area}）の写真`} loading="lazy" decoding="async" />
                <figcaption>
                  <b>{big.name}</b>
                  <span>{big.area}</span>
                </figcaption>
              </figure>
            )}
            {small.slice(0, 2).map((p) => (
              <figure key={p.id} className="sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={`${p.name}（${p.area}）の写真`} loading="lazy" decoding="async" />
                <figcaption>
                  <b>{p.name}</b>
                  <span>{p.area}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mp-gm-body">
            <div className="top">
              <p className="mp-state live"><i aria-hidden="true" />掲載中</p>
              <h3>
                <span className="ja">{gourmet.name}</span>
                <em>{VERTICAL_FACE.gourmet.en}</em>
              </h3>
              <p className="mp-gm-count" aria-label={`掲載 ${total} 店`}>
                <b>{total.toLocaleString("ja-JP")}</b>
                <span>店</span>
              </p>
              <ul className="mp-gm-facts">
                <li><b>{prefCount}</b>都道府県</li>
                <li><b>{featureTotal}</b>特集記事</li>
              </ul>
            </div>
            <div className="bot">
              <p className="mp-gm-text">全国の街の飲食店を、エリア・特集・利用シーンから探せます。</p>
              <Link href={gourmet.path} className="mp-btn" data-cursor="ENTER">
                グルメを見る <span aria-hidden="true">→</span>
              </Link>
              <p className="mp-gm-sub">
                <Link href="/feature">特集</Link>
                <Link href="/region">エリア</Link>
                <Link href="/scene">シーン</Link>
                <Link href="/search">さがす</Link>
              </p>
            </div>
          </div>
        </article>

        <ul className="mp-panels">
          {others.map((v, i) => {
            const face = VERTICAL_FACE[v.key];
            const names = v.categories.map((c) => c.name);
            return (
              <li key={v.key} style={{ ["--i" as string]: i }}>
                <Link
                  href={v.path}
                  className="mp-panel"
                  data-reveal
                  style={{ ["--ac" as string]: v.accent.color, ["--acl" as string]: v.accent.lightColor, ["--i" as string]: i }}
                  data-cursor={face.en.toUpperCase()}
                >
                  <span className="mp-panel-art" aria-hidden="true">
                    <i className="b1" />
                    <i className="b2" />
                    <i className="grain" />
                    <span className="g">{face.glyph}</span>
                  </span>
                  <span className="mp-panel-in">
                    <span className="top">
                      <small>0{i + 2}</small>
                      <span className="mp-state"><i aria-hidden="true" />掲載準備中</span>
                    </span>
                    <span className="bot">
                      <em>{face.en}</em>
                      <b>{v.name}</b>
                      <span className="brand">{v.brand}</span>
                      <span className="cats">{names.join("・")}</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
