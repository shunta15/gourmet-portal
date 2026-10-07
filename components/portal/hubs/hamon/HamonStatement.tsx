"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { HAMON_BODY } from "./copy";

/**
 * 下のブロック（本文の全文）。
 * 段落 1〜3 は白の地に、青と墨で。段落 4・5 は、最初の画面と同じあざやかな青の面に、白で組む。
 * 段落ごとに、輪が 1 つずつ大きくなる（輪が広がる）。最後の段落は大きな白い円に収め、まわりへ青い輪が広がっていく。
 * 見えてくると、輪が中心から広がる。スクリプトなし・動きを減らす設定では、最初から全部見えている（CSS が切り替える）。
 */

/** 最後の円のまわりの輪（円の半径を 1 としたときの半径に近い値。単位は viewBox。太さ px・濃さ） */
const WAVES: { r: number; w: number; o: number }[] = [
  { r: 205, w: 9, o: 0.9 },
  { r: 268, w: 6.5, o: 0.7 },
  { r: 352, w: 4.6, o: 0.55 },
  { r: 458, w: 3.2, o: 0.4 },
  { r: 590, w: 2.2, o: 0.28 },
  { r: 745, w: 1.5, o: 0.18 },
  { r: 925, w: 1, o: 0.11 },
];

export default function HamonStatement() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".hs-p, .hs-final"));
    if (typeof IntersectionObserver === "undefined") {
      rows.forEach((r) => r.setAttribute("data-in", ""));
      return;
    }
    el.setAttribute("data-js", "1");
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  const row = (i: number) => (
    <div key={i} className="hs-p" data-i={i}>
      <span className="hs-ring" aria-hidden="true" />
      <p className="hs-t">
        {HAMON_BODY[i].map((ln, li) => (
          <span key={li} className="hs-l">
            {ln}
          </span>
        ))}
      </p>
    </div>
  );

  return (
    <section ref={ref} id="hm-statement" className="hs" aria-label="本文">
      <div className="hs-a">
        <svg className="hs-bg" viewBox="-1000 -1000 2000 2000" aria-hidden="true" focusable="false">
          {[240, 330, 450, 610, 820, 1090, 1420].map((r, i) => (
            <circle key={r} r={r} strokeWidth={5 - i * 0.6} style={{ ["--o" as string]: 0.2 - i * 0.025 } as CSSProperties} />
          ))}
        </svg>
        <div className="hs-in">{[0, 1, 2].map(row)}</div>
      </div>
      <div className="hs-b">
        <div className="hs-in">
          {row(3)}
          <div className="hs-final" data-i="4">
            <svg className="hs-waves" viewBox="-1000 -1000 2000 2000" aria-hidden="true" focusable="false">
              {WAVES.map((w, i) => (
                <circle key={i} r={w.r} strokeWidth={w.w} style={{ ["--o" as string]: w.o, ["--w" as string]: i } as CSSProperties} />
              ))}
            </svg>
            <div className="hs-disc">
              <p className="hs-t">
                {HAMON_BODY[4].map((ln, li) => (
                  <span key={li} className="hs-l">
                    {ln}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
