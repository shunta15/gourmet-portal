import Link from "next/link";
import type { ReactNode } from "react";
import { IcArrow, IcCompass, IcExternal, IcPlane, Stamp, Waves } from "./Deco";

const IMG = "/_portal/activity/";

/**
 * 各ページの一番下の、山と空の写真の帯(見本の下の帯)。写真は見本の画像から切り出した仮(public/_portal/activity/)。
 * 手書きの一言・赤い切手のボタン・丸いスタンプは HTML/SVG で重ねる。variant で、写真・文・ボタンの位置が見本どおりに変わる。
 *   top     = 最初のページ。オーナーが用意した 1 枚の画像(左に「さあ、次は…」・中央に赤い「アクティビティをさがす」ボタン・右に「あたらしい景色が…」+丸い印が画像に入っている)。
 *             文字・ボタン・印は画像の中なので重ねない。赤いボタンの範囲だけ、探すへの透明なリンクを画像の上に置く
 *   shop    = 店舗紹介(左に「この景色に…」・「この体験を予約する」→ 公式サイトを見る・スタンプ)
 *   article = 特集(左に「あそびが…」・「特集をもっと見る」・右に「さあ、次は…」+スタンプ)
 */
type V = "top" | "shop" | "article";
const CFG: Record<Exclude<V, "top">, { img: string; left: ReactNode; right: ReactNode; label: string; stamp: "shop" | "article" }> = {
  shop: { img: "sh-banner.webp", left: <>この体験に、<br />会いにいこう。</>, right: null, label: "公式サイトを見る", stamp: "shop" },
  article: { img: "ar-banner.webp", left: <>あそびが、<br />日常をちょっと特別にする。</>, right: <>さあ、次は、<br />どんな体験にでかけよう?</>, label: "特集をもっと見る", stamp: "article" },
};

/** 画像の中の文字(alt)。画像の文字をそのまま入れる */
const TOP_ALT = "さあ、次は どんな体験にでかけよう。 MACHINOWA ACTIVITY アクティビティをさがす あたらしい景色が、きっと待ってる。";

export default function Banner({ v, href, external }: { v: V; href: string; external?: boolean }) {
  if (v === "top") {
    return (
      <section className="apa-banner apa-banner-top is-pic" aria-label="アクティビティをさがす">
        <div className="b-pic">
          <img className="b-img" src={`${IMG}top-bottom-banner.webp`} alt={TOP_ALT} />
          <Link className="b-hit" href={href} aria-label="アクティビティをさがす" />
        </div>
      </section>
    );
  }
  const c = CFG[v];
  const inner = (
    <>
      <span className="b-compass">{v === "article" ? <IcPlane /> : <IcCompass />}</span>
      <span className="b-btn-t">
        <small>MACHINOWA ACTIVITY</small>
        <span>
          {c.label}
          {external ? <IcExternal className="b-btn-ar" /> : <IcArrow className="b-btn-ar" />}
        </span>
      </span>
    </>
  );
  return (
    <section className={`apa-banner apa-banner-${v}`} aria-label="アクティビティをさがす">
      <img className="b-img" src={`${IMG}${c.img}`} alt="" />
      <p className="b-left apa-hand">{c.left}</p>
      {external ? (
        <a className="b-btn" href={href} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      ) : (
        <Link className="b-btn" href={href}>
          {inner}
        </Link>
      )}
      {c.right ? <p className="b-right apa-hand">{c.right}</p> : null}
      <Waves className="b-waves" />
      <Stamp id={`bn-${v}`} className="b-stamp" ring={v === "shop" ? "GOOD ACTIVITY GOOD LIFE" : "MACHINOWA ACTIVITY"} mountain wave />
    </section>
  );
}
