import Link from "next/link";
import { IcCal, IcClock, IcPhone, IcPin } from "./Deco";
import type { OpenDay } from "./filters";
import FavHeart from "./FavHeart";
import { aLinks } from "./links";

/** カードに必要な分だけ(クライアントの部品にも渡せるよう、文字だけ) */
export type CardShop = {
  id: string;
  name: string;
  pref: string;
  prefName: string;
  city: string;
  kindName: string;
  hours: string;
  phone: string;
  tagline: string;
  src: string;
  alt: string;
  region: string;
  kind: string;
  tags: string[];
  /** 日付から探すに使う営業日(filters.ts) */
  open: OpenDay;
};

/**
 * 店のカード(最初のページの「掲載中の体験」・探すの結果の共通)。実在の店の実データだけ:
 * 写真・都道府県・市区町村・店名・種類・営業時間(曜日を外した形。無ければ電話)。見本の「人気」「NEW」の札・所要時間・料金は出さない。
 * variant "feat" = 最初のページの小さめのカード / "list" = 探すの結果のカード(一言つき)。
 */
export default function ShopCard({ s, variant = "feat", note, href }: { s: CardShop; variant?: "feat" | "list"; note?: string; href?: string }) {
  const where = [s.prefName, s.city].filter(Boolean).join("・");
  // note = 日付で絞り込んだとき、営業日が案内から分からない店に出す「営業日は店に確認」
  const meta = note ? { Ic: IcCal, t: note } : s.hours ? { Ic: IcClock, t: s.hours } : s.phone ? { Ic: IcPhone, t: s.phone } : null;
  return (
    <Link href={href ?? aLinks.shop(s.id)} className={`apa-card apa-card-${variant}`} data-region={s.region} data-kind={s.kind}>
      <span className="apa-card-ph">
        <img src={s.src} alt={s.alt} loading="lazy" />
      </span>
      <FavHeart id={s.id} name={s.name} />
      <span className="apa-card-loc">
        <IcPin />
        {where}
      </span>
      <span className="apa-card-t">{s.name}</span>
      {variant === "list" && s.tagline ? <span className="apa-card-sub">{s.tagline}</span> : null}
      <span className="apa-card-meta">
        <span className="apa-card-kind">{s.kindName}</span>
        {meta ? (
          <span className="apa-card-m">
            <meta.Ic />
            {meta.t}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
