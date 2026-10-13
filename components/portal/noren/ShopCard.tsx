import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/proto-noren/feature.css";
import "./featlist.css";
import "./scenesearch.css";
import { sized, sizedSrcSet, CARD_SIZES } from "@/lib/imageUrl";
import { kanjiFor, nameLayout } from "@/lib/portal/noren/shop";
import { shopNo, type ShopCardItem } from "@/lib/portal/noren/sceneShop";

// 暖簾のシーン・店をさがすページの部品。サーバー・クライアントのどちらからも使える（データは読まない）。
// 店のカードは、店ページの「同じ地域の他の店」（縦書きの店名＋写真）と同じ形。写真が無い店は、布に漢字を染めただけで出す（空の枠・壊れた画像を出さない）。
// 評価の数字・口コミの件数は出さない。CSS は scenesearch.css（vSc-）と featlist.css・feature.css（共通の変数）。

export type ShopTag = { label: string; on: boolean };

/** 店カード 1 枚。カード全体が店ページへのリンク。save は右上に重ねる「候補に入れる」ボタン（リンクの中に入れず、兄弟に置く） */
export function ShopCard({
  s,
  tags,
  tagsTotal = 0,
  save,
  eager = false,
}: {
  s: ShopCardItem;
  tags?: ShopTag[];
  tagsTotal?: number;
  save?: ReactNode;
  eager?: boolean;
}) {
  const no = shopNo(s.id);
  const kanji = kanjiFor(s.cuisine, s.name);
  // 縦書きの店名は、長いほど小さく（縦に収まらず切れるのを避ける）。nameLayout の列数（1: 9 字まで・2: 18 字まで・3: それ以上）
  const lv = nameLayout(s.name).cols;
  return (
    <li className="vSc-shop">
      <Link href={`/restaurant/${s.id}`} className="vSc-mc" data-cursor="VIEW">
        <span className={`vSc-mc-im${s.img ? "" : " is-nophoto"}`}>
          {s.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(s.img, 640)} srcSet={sizedSrcSet(s.img)} sizes={CARD_SIZES} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
          ) : (
            <b className="vSc-mc-k" aria-hidden="true">{kanji}</b>
          )}
          <span className="vSc-mc-nm" data-l={lv}>{s.name}</span>
        </span>
        <span className="vSc-mc-ms">
          <span>{[no && `#${no}`, s.area].filter(Boolean).join(" · ")}</span>
          {s.cuisine && <em>{s.cuisine}</em>}
        </span>
      </Link>
      {tags && tags.length > 0 && (
        <ul className="vSc-tags" aria-label={tagsTotal > tags.length ? `この店に当てはまる条件（${tagsTotal}件のうち${tags.length}件）` : "この店に当てはまる条件"}>
          {tags.map((t) => (
            <li key={t.label} data-on={t.on ? "1" : undefined}>
              {t.on && <span className="vN-vh">選んだ条件: </span>}
              {t.label}
            </li>
          ))}
        </ul>
      )}
      {save}
    </li>
  );
}

/** 店カードを並べる。写真は遅延読み込み（最初の数枚だけ即時）。何百軒でも重くならない */
export function ShopGrid({ items, label }: { items: ShopCardItem[]; label: string }) {
  return (
    <ul className="vSc-grid" aria-label={label}>
      {items.map((s, i) => (
        <ShopCard key={s.id} s={s} eager={i < 4} />
      ))}
    </ul>
  );
}

/** シーンの札（竿に掛かった暖簾に、シーン名を縦書きで染める）。紙の上・墨の上のどちらでも使える */
export function SceneTile({ no, name, tagline, href }: { no: number; name: string; tagline: string; href: string }) {
  return (
    <Link href={href} className="vSc-sc" data-cursor="ENTER">
      <span className="vSc-sc-no">No.{String(no).padStart(2, "0")}</span>
      <span className="vSc-sc-nm" data-l={Array.from(name).length > 6 ? "long" : undefined}>{name}</span>
      <span className="vSc-sc-tg">{tagline}</span>
      <span className="vSc-sc-go" aria-hidden="true">→</span>
    </Link>
  );
}
