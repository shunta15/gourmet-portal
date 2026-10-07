"use client";
import { useEffect, useRef } from "react";
import { HAMON_BODY } from "./copy";

/**
 * 下のブロック（本文の全文）。白の地に、青と墨で組む。
 * 段落ごとに、細い青い輪が 1 つずつ大きくなる（輪が広がる）。見えてくると、輪が中心から広がる。
 * スクリプトなし・動きを減らす設定では、最初から全部見えている（CSS が切り替える）。
 */
export default function HamonStatement() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".hs-p"));
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

  return (
    <section ref={ref} className="hs" aria-label="本文">
      <div className="hs-in">
        {HAMON_BODY.map((lines, i) => (
          <div key={i} className="hs-p" data-i={i}>
            <span className="hs-ring" aria-hidden="true" />
            <p className="hs-t">
              {lines.map((ln, li) => (
                <span key={li} className="hs-l">
                  {ln}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
