"use client";
import Link from "next/link";
import { useState } from "react";
import { IcBinoc, IcCal, IcChev, IcCompass, IcPin, IcSearch } from "./Deco";
import { Stamp, Waves } from "./Deco";
import { REGION_GROUPS, SCENES, regionArg } from "./filters";
import { searchUrl } from "./links";

/**
 * 最初のページの検索の箱。4 つの札を切り替えるとき、紺の札が移る(見た目)。
 * 「どんなシーンで?」「どこで?」「いつ行く?」の選んだ値が、そのまま探す(/activity/search)の絞り込みになる(体験スタイル・地方・今週末/来週末)。
 * エリアは、いま店のある地方だけを出す(areas)。
 */
const TABS = [
  { k: "scene", t: "シーン", rest: "からさがす", Ic: IcBinoc },
  { k: "genre", t: "ジャンル", rest: "からさがす", Ic: IcCompass },
  { k: "area", t: "エリア", rest: "からさがす", Ic: IcPin },
  { k: "date", t: "日付", rest: "からさがす", Ic: IcCal },
];

export default function HeroSearch({ areas }: { areas: string[] }) {
  const [on, setOn] = useState(0);
  const [scene, setScene] = useState("");
  const [area, setArea] = useState("");
  const [when, setWhen] = useState<"" | "weekend" | "nextweekend">("");
  const href = searchUrl({ scene: scene ? [scene] : [], region: area ? regionArg(area) : [], when: when || undefined });
  return (
    <div className="t-search apa-ab">
      <div className="t-search-box" />
      <span className="t-search-label">アクティビティをさがす</span>
      <div className="t-tabs" role="tablist">
        {TABS.map(({ k, t, rest, Ic }, i) => (
          <button key={k} type="button" role="tab" aria-selected={on === i} className={`t-tab t-tab-${i}${on === i ? " is-on" : ""}`} onClick={() => setOn(i)}>
            <Ic className="t-tab-ic" />
            <span>
              <b>{t}</b>
              {rest}
            </span>
          </button>
        ))}
      </div>
      <div className="t-fields">
        <label className="t-field t-field-a">
          <span className="t-field-l">どんなシーンで?</span>
          <span className="t-field-sel">
            <select value={scene} onChange={(e) => setScene(e.target.value)} aria-label="シーン">
              <option value="">シーンを選択</option>
              {SCENES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <IcChev className="t-field-chev" />
          </span>
        </label>
        <label className="t-field t-field-b">
          <span className="t-field-l">どこで?</span>
          <span className="t-field-sel">
            <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="エリア">
              <option value="">エリアを選択</option>
              {REGION_GROUPS.filter((g) => areas.includes(g.key)).map((g) => (
                <option key={g.key} value={g.key}>
                  {g.name}
                </option>
              ))}
            </select>
            <IcChev className="t-field-chev" />
          </span>
        </label>
        <label className="t-field t-field-c">
          <span className="t-field-l">いつ行く?</span>
          <span className="t-field-sel t-field-date">
            <IcCal className="t-field-cal" />
            <select value={when} onChange={(e) => setWhen(e.target.value as "" | "weekend" | "nextweekend")} aria-label="日付">
              <option value="">日付を選択</option>
              <option value="weekend">今週末</option>
              <option value="nextweekend">来週末</option>
            </select>
            <IcChev className="t-field-chev" />
          </span>
        </label>
        <Link href={href} className="t-go">
          <IcSearch className="t-go-ic" />
          アクティビティを検索
        </Link>
      </div>
      <Stamp id="find" className="t-search-stamp" ring="FIND YOUR ACTIVITY" lines={["FIND", "YOUR", "ACTIVITY"]} mountain={false} />
      <Waves className="t-search-waves" />
    </div>
  );
}
