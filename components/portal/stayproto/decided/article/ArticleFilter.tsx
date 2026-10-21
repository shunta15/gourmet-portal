"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 記事の一覧の「種類」の絞り込み(すべて / ホテル / 旅館 …)。children の中の [data-kind] を持つ要素を、選んだ種類だけ見せる。
 * 記事はすべてサーバーで出してあるので、JS が動かなくても全部読める(絞り込みは使えないだけ)。
 */
export default function ArticleFilter({ kinds, total, children }: { kinds: Array<{ slug: string; name: string; count: number }>; total: number; children: React.ReactNode }) {
  const [kind, setKind] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-kind]").forEach((el) => {
      el.hidden = !!kind && el.dataset.kind !== kind;
    });
  }, [kind]);
  const shown = kind ? (kinds.find((k) => k.slug === kind)?.count ?? 0) : total;
  return (
    <div ref={box}>
      {kinds.length > 1 ? (
        <div className="sy-al-filter" role="group" aria-label="宿の種類で絞り込む">
          <button type="button" className={kind === "" ? "is-on" : ""} aria-pressed={kind === ""} onClick={() => setKind("")}>
            すべて<span>{total}</span>
          </button>
          {kinds.map((k) => (
            <button key={k.slug} type="button" className={kind === k.slug ? "is-on" : ""} aria-pressed={kind === k.slug} onClick={() => setKind(k.slug)}>
              {k.name}
              <span>{k.count}</span>
            </button>
          ))}
        </div>
      ) : null}
      <p className="sy-al-count" aria-live="polite">
        <span className="sy-num">{shown}</span>本の記事
      </p>
      {children}
    </div>
  );
}
