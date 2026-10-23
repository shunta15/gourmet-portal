"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { IcArrow, IcPlay } from "./Deco";

/**
 * 動画の札(最初のページの「動画でみる」の欄)。店の写真から作った短い動画。札を押すと、ページの上に枠が開いて、その場で再生する(閉じると止まる)。
 * 札の見た目・並びは、見本の札のまま(ボタンにしただけ)。
 */
export type MovieItem = { id: string; lines: string[]; dur: string; poster: string; src: string; title: string; shopName: string; shopHref: string };

export default function MovieList({ items }: { items: MovieItem[] }) {
  // 題の字の大きさは、その題のいちばん長い行に合わせて、全部の行で同じにする(行ごとに大きさが違って見えないように)
  const widest = (m: MovieItem) => Math.max(1, ...m.lines.map((l) => l.length));
  const [cur, setCur] = useState<MovieItem | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (cur && !d.open) d.showModal();
    if (!cur && d.open) d.close();
  }, [cur]);
  return (
    <>
      <ul className="t-movie-list">
        {items.map((m) => (
          <li key={m.id}>
            <button type="button" className="t-movie-it apa-btn-reset" onClick={() => setCur(m)} aria-label={`${m.title}の動画を再生`}>
              <span className="t-movie-ph">
                <img src={m.poster} alt="" loading="lazy" />
                <span className="t-movie-play">
                  <IcPlay />
                </span>
                <i className="t-movie-d">{m.dur}</i>
              </span>
              <span className="t-movie-t">
                {m.lines.map((l) => (
                  // --n = 題のいちばん長い行の字数(全部の行で同じ)。長い題は、札の幅に収まるよう字を小さくする(a-extra.css)。札の幅・並びは見本のまま
                  <span key={l} style={{ ["--n" as string]: widest(m) } as CSSProperties}>
                    {l}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dlg} className="apa-vid" onClose={() => setCur(null)} onClick={(e) => e.target === dlg.current && setCur(null)} aria-label={cur ? `${cur.title}の動画` : "動画"}>
        {cur ? (
          <div className="apa-vid-in">
            <button type="button" className="apa-vid-x" onClick={() => setCur(null)} aria-label="閉じる">
              <span aria-hidden="true">×</span>
            </button>
            <video key={cur.id} className="apa-vid-v" src={cur.src} poster={cur.poster} controls autoPlay playsInline preload="metadata" />
            <p className="apa-vid-t apa-maru">{cur.title}</p>
            <Link href={cur.shopHref} className="apa-vid-go">
              {cur.shopName}のページへ <IcArrow />
            </Link>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
