/**
 * ボディケアの店のページ見本 3 案の共通の部品(サーバー)。見出しの飾り・店舗情報・メニュー・同じエリア/種類の店。
 * 色は種類ごとのマットの色(最初のページ「転がし」と同じ 5 色)・書体は転がしと同じ明朝とゴシック。
 */
import Link from "next/link";
import type { ReactNode } from "react";
import BsLinks from "./BsLinks";
import type { BsMini, BsPanel, BsPhoto, BsShop } from "@/lib/portal/vert/bodyshop/model";

export const KIND_EN: Record<string, string> = { seitai: "SEITAI", sekkotsu: "SEKKOTSU", shinkyu: "SHINKYU", massage: "MASSAGE", relaxation: "RELAXATION", stretch: "STRETCH" };

const japaneseDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : iso;
};

/** ページの上に固定する細い帯: ロゴ(ボディケアのトップへ)と「店舗情報のみ見る」(44px 以上。動きの途中でも押せる) */
export function BsHeader() {
  return (
    <header className="bs-head">
      <Link href="/bodycare" className="bs-logo">
        マチノワ <span>Bodycare</span>
      </Link>
      <a className="bs-skip" href="#bs-access">
        店舗情報のみ見る
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </a>
    </header>
  );
}

export function BsCrumb({ shop }: { shop: BsShop }) {
  return (
    <nav className="bs-crumb" aria-label="パンくず">
      <Link href="/">マチノワ</Link>
      <Link href="/bodycare">ボディケア</Link>
      <Link href={`/bodycare/${shop.kindSlug}`}>{shop.kindName}</Link>
      <Link href={`/bodycare/area/${shop.prefSlug}`}>{shop.prefShort}</Link>
      <span aria-current="page">{shop.name}</span>
    </nav>
  );
}

export function BsImg({ p, eager, sizes }: { p: BsPhoto; eager?: boolean; sizes?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" sizes={sizes} />
  );
}

/** 紹介の 1 つの見どころの本文(見える段落・続きを読む・要点) */
export function BsBody({ p }: { p: BsPanel }) {
  return (
    <div className="bs-body">
      {p.open.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
      {p.rest.length > 0 && (
        <details className="bs-more">
          <summary>
            <span className="o">続きを読む</span>
            <span className="c">たたむ</span>
          </summary>
          {p.rest.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </details>
      )}
      {p.specs.length > 0 && (
        <dl className="bs-specs">
          {p.specs.map((x) => (
            <div key={x.k}>
              <dt>{x.k}</dt>
              <dd>{x.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function BsMenu({ shop }: { shop: BsShop }) {
  if (shop.menus.length === 0) return null;
  return (
    <ul className="bs-chips">
      {shop.menus.map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>
  );
}

/** 店舗情報(住所・最寄り駅・営業時間・定休日・電話)・リンクのボタン・情報の出どころ。「店舗情報のみ見る」の着く先は、この外側の #bs-access */
export function BsFacts({ shop }: { shop: BsShop }) {
  const page = `/bodycare/shop/${shop.id}`;
  return (
    <div className="bs-facts-wrap">
      <dl className="bs-facts">
        {shop.facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>
              {f.v.length === 1 ? (
                f.v[0]
              ) : (
                <ul>
                  {f.v.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <BsLinks links={shop.links} storeId={shop.id} page={page} />
      <p className="bs-note">営業時間などは変わることがあります。お出かけの前に公式サイトでご確認ください。</p>
      {shop.sources.length > 0 && (
        <div className="bs-src">
          <h3>情報の出どころ</h3>
          <ul>
            {shop.sources.map((x) => (
              <li key={x.url}>
                <a href={x.url} target="_blank" rel="noopener noreferrer">
                  {x.label}
                  <span className="bs-sr">(別のタブで開きます)</span>
                </a>
              </li>
            ))}
          </ul>
          {shop.checkedAt && (
            <p>
              確認日　<time dateTime={shop.checkedAt}>{japaneseDate(shop.checkedAt)}</time>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Mini({ m, v }: { m: BsMini; v: number }) {
  return (
    <li>
      <Link href={v ? `/bodycare/shop/${m.id}?v=${v}` : `/bodycare/shop/${m.id}`} className="bs-mini" style={{ ["--mat" as string]: m.color }}>
        {m.photo ? (
          <span className="bs-mini-ph">
            <BsImg p={m.photo} sizes="(max-width: 700px) 50vw, 25vw" />
          </span>
        ) : (
          <span className="bs-mini-ph bs-mini-no" aria-hidden="true">
            <b>{m.name}</b>
          </span>
        )}
        <span className="bs-mini-n">{m.name}</span>
        <span className="bs-mini-c">
          {m.kindName}　{m.area}
        </span>
      </Link>
    </li>
  );
}

/** 同じエリアの店・同じ種類の店。見本では、行き先も同じ案(?v=)のまま。公開版(v=0)は引数なし */
export function BsMoreShops({ shop, v, title }: { shop: BsShop; v: number; title?: (kind: "area" | "kind") => ReactNode }) {
  const t = title ?? ((k) => (k === "area" ? `${shop.prefShort}の店` : `${shop.kindName}の店`));
  return (
    <>
      {shop.sameArea.length > 0 && (
        <section className="bs-more-sec" aria-labelledby="bs-same-area">
          <h2 id="bs-same-area" className="bs-h2">
            {t("area")}
          </h2>
          <ul className="bs-minis">
            {shop.sameArea.map((m) => (
              <Mini key={m.id} m={m} v={v} />
            ))}
          </ul>
        </section>
      )}
      {shop.sameKind.length > 0 && (
        <section className="bs-more-sec" aria-labelledby="bs-same-kind">
          <h2 id="bs-same-kind" className="bs-h2">
            {t("kind")}
          </h2>
          <ul className="bs-minis">
            {shop.sameKind.map((m) => (
              <Mini key={m.id} m={m} v={v} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** 店名の長さで字の大きさの段を決める */
export const nameSize = (n: number) => (n <= 7 ? "xl" : n <= 14 ? "l" : n <= 22 ? "m" : "s");
