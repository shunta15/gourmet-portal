"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type TabItem = { id: string; no: string; title: string; href: string };

/** 特集の一覧（今のページの「タブ」と同じ中身）。短冊を横に並べ、いま読んでいる記事が朱。開いたとき、その短冊が見える位置にそろえる */
export default function FeatureTabsRail({ items, activeId }: { items: TabItem[]; activeId: string }) {
  const rail = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = rail.current;
    const on = ul?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!ul || !on) return;
    ul.scrollLeft = Math.max(0, on.offsetLeft - ul.clientWidth / 2 + on.clientWidth / 2);
  }, [activeId]);
  return (
    <ul ref={rail} className="vF-rail" tabIndex={0} aria-label="特集の一覧">
      {items.map((t) => (
        <li key={t.id}>
          <Link href={t.href} aria-current={t.id === activeId ? "page" : undefined} data-cursor="READ">
            <i>{t.no}</i>
            <b>{t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title}</b>
          </Link>
        </li>
      ))}
    </ul>
  );
}
