"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow, Leaf } from "./parts";

/**
 * 特集ページ(/bodycare/special)の「種類で絞り込む」並び。【2026-10-26 試作】
 * 3 種類: 店の特集記事 / 利用シーンの記事 / 業種の読みもの。絞り込みはこの場で切り替える(URL は変えない)。JavaScript が動かなくても全部の札が並ぶ(絞り込みの帯だけ効かない)。
 * 記事が無い種類は、枠と「準備中」だけを出す(架空の記事は作らない)。
 */
export type SpecialKind = "store" | "scene" | "reading";
export type SpecialCardItem = {
  key: string;
  kind: SpecialKind;
  href: string;
  tag: string;
  title: string;
  text: string;
  /** 店の写真(無ければ種類の色の面+若葉) */
  photo?: { src: string; alt: string };
  color?: string;
  sub?: string;
};

const KIND_LABEL: Record<SpecialKind, string> = { store: "店の特集記事", scene: "利用シーンの記事", reading: "業種の読みもの" };
const PREP: Record<SpecialKind, string> = {
  store: "",
  scene: "利用シーンの記事は準備中です。",
  reading: "業種の読みものは準備中です。順次、載せていきます。",
};
const FIRST = 12;

export default function SpecialFilter({ items }: { items: SpecialCardItem[] }) {
  const [kind, setKind] = useState<"all" | SpecialKind>("all");
  const [open, setOpen] = useState(false);
  const count = (k: SpecialKind) => items.filter((i) => i.kind === k).length;
  const kinds: SpecialKind[] = ["store", "scene", "reading"];
  const shown = kind === "all" ? items : items.filter((i) => i.kind === kind);
  const limited = !open && shown.length > FIRST;
  const list = limited ? shown.slice(0, FIRST) : shown;
  const empty = kinds.filter((k) => count(k) === 0 && (kind === "all" || kind === k));

  return (
    <section aria-label="特集の一覧" className="ar-idx">
      <div className="ar-flt" role="group" aria-label="記事の種類で絞り込む">
        {(["all", ...kinds] as const).map((k) => (
          <button key={k} type="button" className={`ar-flt-b gr-chip gr-press${kind === k ? " is-on" : ""}`} aria-pressed={kind === k} onClick={() => { setKind(k); setOpen(false); }}>
            {k === "all" ? "すべて" : KIND_LABEL[k]}
            <span>{k === "all" ? items.length : count(k)}</span>
          </button>
        ))}
      </div>

      <ul className="ar-idx-g ar-idx-g--special">
        {list.map((s) => (
          <li key={s.key}>
            <Link href={s.href} className="ar-ic gr-lift gr-hov">
              <div className="ph" style={s.color && !s.photo ? ({ ["--kc" as string]: s.color } as React.CSSProperties) : undefined}>
                {s.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ar-ic-img" src={s.photo.src} alt="" loading="lazy" decoding="async" />
                ) : (
                  <Leaf size={44} />
                )}
              </div>
              <div className="tx">
                <small>{s.tag}</small>
                <h2>{s.title}</h2>
                {s.sub && <p className="ar-ic-sub">{s.sub}</p>}
                <p>{s.text}</p>
                <span className="go">
                  記事を読む
                  <span className="gr-arrow">
                    <Arrow />
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
        {empty.map((k) => (
          <li key={`prep-${k}`}>
            <div className="ar-ic ar-ic--prep" role="group" aria-label={`${KIND_LABEL[k]}(準備中)`}>
              <div className="ph">
                <Leaf size={44} />
              </div>
              <div className="tx">
                <small>{KIND_LABEL[k]}</small>
                <h2>準備中</h2>
                <p>{PREP[k]}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {limited && (
        <p className="ar-more">
          <button type="button" className="gr-btn gr-btn--line gr-press" onClick={() => setOpen(true)}>
            店の特集記事をもっと見る({shown.length - FIRST})
          </button>
        </p>
      )}
    </section>
  );
}
