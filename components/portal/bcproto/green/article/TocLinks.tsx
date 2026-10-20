"use client";

import type { ReactNode } from "react";

/** 「この記事のポイント」の目次。クリックでその節へなめらかに移動(固定のヘッダーとタブの分だけ手前で止める) */
export default function TocLinks({ items, arrow }: { items: Array<{ id: string; no: string; title: string }>; arrow: ReactNode }) {
  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <ol data-rv-group>
      {items.map((it) => (
        <li key={it.id} data-rv>
          <a href={`#${it.id}`} onClick={(e) => go(e, it.id)} className="gr-hov">
            <span className="ar-no">{it.no}</span>
            <span>{it.title}</span>
            <span className="gr-arrow">{arrow}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}
