import Link from "next/link";
import { sized, sizedSrcSet, CARD_SIZES } from "@/lib/imageUrl";
import { PinIcon, TagGlyph } from "../../search/icons";
import type { TagIcon } from "../../search/data";
import Heart from "./Heart";
import type { SearchShop } from "./types";

/** 札の右肩の札(料理の分類の名前)の色。BROAD_GROUPS の key ごと(試作の 6 色から選ぶ) */
const CHIP: Record<string, "green" | "cream" | "creamred" | "red" | "olive" | "creamgray"> = {
  wa: "green",
  yo: "cream",
  chu: "creamred",
  men: "green",
  niku: "red",
  sake: "olive",
  cha: "creamgray",
};

/** タグの語 → 線画アイコン(語に当たらないものは door) */
const TAG_ICON: [RegExp, TagIcon][] = [
  [/個室|座敷|半個室|貸切/, "room"],
  [/落ち着|雰囲気|隠れ家|大人/, "bulb"],
  [/カウンター|一人|ひとり|おひとり/, "counter"],
  [/デート|記念日|女子会|カップル/, "heart"],
  [/子連れ|子供|ファミリー|キッズ|ペット|持ち帰り|テイクアウト|デリバリー/, "basket"],
  [/ランチ|深夜|朝|モーニング|営業|昼|夜/, "clock"],
  [/飲み放題|日本酒|焼酎|ワイン|ビール|ドリンク|酒/, "glass"],
  [/テラス|オープン|屋外|庭/, "awning"],
  [/夜景|景色|眺め|眺望/, "dome"],
  [/仕事|接待|会食|宴会|団体|ビジネス/, "bag"],
];
export const tagIconOf = (label: string): TagIcon => TAG_ICON.find(([re]) => re.test(label))?.[1] ?? "door";

/**
 * 店の札(さがす・店舗紹介一覧で共通)。見た目は試作の Card(gn-search-card)のまま。
 * 写真の無い店は、空の枠・壊れた画像を出さず、麻の面に店名だけを出す。星・口コミ・他サイト評価・金額は出さない。
 */
export default function Card({ shop: s, index, chipLabel }: { shop: SearchShop; index: number; chipLabel?: string }) {
  const chipKey = s.cuisineKeys[0];
  return (
    <li className="gn-search-card" style={{ "--i": index % 24 } as React.CSSProperties}>
      <div className={`gn-search-card-ph${s.img ? "" : " gn-search-r-noph"}`}>
        {s.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sized(s.img, 640)} srcSet={sizedSrcSet(s.img)} sizes={CARD_SIZES} alt="" width={480} height={268} loading={index < 4 ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span className="gn-search-r-noph-t gn-linen" aria-hidden="true">
            {s.name}
          </span>
        )}
        {chipLabel && chipKey && (
          <span className="gn-search-chip" data-chip={CHIP[chipKey] ?? "cream"}>
            {chipLabel}
          </span>
        )}
      </div>
      <div className="gn-search-card-body">
        <h3 className="gn-search-card-name">
          <Link href={s.href}>{s.name}</Link>
        </h3>
        {s.nearest && (
          <p className="gn-search-card-st">
            <PinIcon />
            <span>{s.nearest}</span>
          </p>
        )}
        {s.desc && <p className="gn-search-card-desc">{s.desc}</p>}
        {s.tags.length > 0 && (
          <ul className="gn-search-card-tags">
            {s.tags.map((t) => (
              <li key={t}>
                <TagGlyph kind={tagIconOf(t)} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Heart id={s.id} name={s.name} />
    </li>
  );
}
