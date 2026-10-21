import Link from "next/link";
import { Heart, MaskLines, Write } from "../common/Motion";
import { IconArrow, IconChevron } from "../common/Icons";
import { SEARCH_HREF, BASE } from "../common/site";
import { IcCalendar, IcMail, IcTagDog, IcTagParking, IcTagSmall, IcTagTerrace } from "./ShopIcons";
import { IMG, SHOP } from "./data";

const TAG_ICON = { small: IcTagSmall, terrace: IcTagTerrace, large: IcTagDog, parking: IcTagParking } as const;

/** パンくず(ホーム > カフェ・飲食店 > sora cafe) */
export function Breadcrumb() {
  return (
    <nav className="sp-bc" aria-label="パンくず">
      <Link href={BASE}>ホーム</Link>
      <IconChevron aria-hidden="true" />
      <Link href={SEARCH_HREF}>{SHOP.category}</Link>
      <IconChevron aria-hidden="true" />
      <span aria-current="page">{SHOP.name}</span>
    </nav>
  );
}

/** ヒーロー:左に大きな写真(手書き)、右に店名・見出し・説明・タグ・ボタン */
export function Hero() {
  return (
    <section className="sp-hero" aria-label={SHOP.name}>
      <div className="sp-hero-ph pt-live pt-shine">
        <img className="sp-hero-img pt-kb" src={`${IMG}/hero.webp`} width={616} height={347} alt="湖を望むテラス席で、カフェのプレートと一緒に待つゴールデンレトリバー" fetchPriority="high" />
        <Write as="p" className="pt-hand sp-hero-write" lines={[...SHOP.handwriting]} delay={900} step={900} />
      </div>
      <div className="sp-hero-info">
        <span className="sp-cat pt-tag pt-pop">{SHOP.category}</span>
        <Heart tone="ink" className="sp-hero-heart" label="お気に入りに追加" size={17} />
        <h1 className="sp-name">
          <MaskLines lines={[SHOP.name]} delay={150} />
        </h1>
        <p className="sp-kana io" data-io="fade" style={{ ["--d" as string]: "500ms" }}>
          {SHOP.kana}
        </p>
        <h2 className="sp-catch">
          <MaskLines lines={[...SHOP.catch]} delay={320} step={160} />
        </h2>
        <p className="sp-lead io" style={{ ["--d" as string]: "700ms" }}>
          {SHOP.lead.map((l, i) => (
            <span key={i}>
              {l}
              {i < SHOP.lead.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
        <ul className="sp-tags" data-io-group>
          {SHOP.tags.map((t) => {
            const I = TAG_ICON[t.id];
            return (
              <li key={t.id} className="sp-tagp io">
                <I aria-hidden="true" />
                {t.label}
              </li>
            );
          })}
        </ul>
        <a href="#access" className="sp-cta sp-cta--main pt-btn pt-shimmer pt-press pt-hov io" style={{ ["--d" as string]: "900ms" }}>
          <span className="sp-cta-in">
            <IcCalendar aria-hidden="true" />
            空席確認・予約する
          </span>
          <IconArrow className="sp-cta-a" aria-hidden="true" />
        </a>
        <a href="#access" className="sp-cta sp-cta--sub pt-btn pt-btn--line pt-press pt-hov io" style={{ ["--d" as string]: "1000ms" }}>
          <span className="sp-cta-in">
            <IcMail aria-hidden="true" />
            お問い合わせ
          </span>
          <IconArrow className="sp-cta-a" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
