"use client";

import { useId, useState } from "react";
import Link from "next/link";

export type MorePref = { slug: string; short: string; count: number; href: string };

/**
 * エリア節の 6 つ目の札(「ほか N 都道府県から探す」)と、それを押すと開く都道府県の一覧(0 件の県は渡さない)。
 * 一覧のリンクは、閉じていても HTML には入っている(hidden)。grid の中に置く: 札は 1 マス、一覧は全幅の 1 行。
 * 見本の 6 つ目の札(地図の絵)と同じ見た目。
 */
export default function MorePrefs({ prefs, mapSrc }: { prefs: MorePref[]; mapSrc: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <div data-rv>
        <button type="button" className="gt-map gr-lift gr-hov" data-scrollp aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          <span className="gt-map-clip" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gt-map-img" src={mapSrc} width={114} height={122} alt="" loading="lazy" />
          </span>
          <svg viewBox="0 0 24 30" width="16" height="24" aria-hidden="true" className="gt-map-pin">
            <path d="M12 1C6.2 1 2 5.3 2 10.8c0 7.2 10 18 10 18s10-10.8 10-18C22 5.3 17.8 1 12 1Z" fill="#2c5439" />
            <circle cx="12" cy="10.600" r="3.700" fill="#fff" />
          </svg>
          <span className="gt-map-t">
            <b>ほか {prefs.length} 都道府県</b>
            <span>{open ? "を閉じる" : "から探す"}</span>
          </span>
        </button>
      </div>
      <div id={id} className="gt-more" hidden={!open}>
        <p className="gt-more-h">ほかの都道府県から探す</p>
        <ul>
          {prefs.map((p) => (
            <li key={p.slug}>
              <Link href={p.href} className="gt-more-a gr-press">
                <span>{p.short}</span>
                <em>{p.count}</em>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
