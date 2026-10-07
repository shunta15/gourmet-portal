"use client";
import { useEffect, useRef, useState } from "react";

type Cand = { thumb: string; full: string };

/** 画像の「映え」を、小さく描いた画素から見積もる（明るさ・彩度が高く、暗い所が少ないほど高い）。読めなければ -1 */
function score(src: string): Promise<number> {
  return new Promise((resolve) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 32;
        c.height = 32;
        const g = c.getContext("2d", { willReadFrequently: true })!;
        g.drawImage(im, 0, 0, 32, 32);
        const d = g.getImageData(0, 0, 32, 32).data;
        let lum = 0;
        let sat = 0;
        let dark = 0;
        const n = d.length / 4;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]);
          const mn = Math.min(d[i], d[i + 1], d[i + 2]);
          const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
          lum += l;
          sat += mx ? (mx - mn) / mx : 0;
          if (l < 0.18) dark++;
        }
        resolve((lum / n) * 0.7 + (sat / n) * 0.6 - (dark / n) * 0.6);
      } catch {
        resolve(-1);
      }
    };
    im.onerror = () => resolve(-1);
    im.src = src;
  });
}

/**
 * 漢字の形に切り抜いた写真（トップの章と同じ技法）。店の写真のうち、料理や灯りで明るく色のあるものを選ぶ
 * （暗い外観の写真だと、字の形が読めなくなるため）。選べなければ先頭の写真。
 */
export default function KanjiCut({ kanji, cands }: { kanji: string; cands: Cand[] }) {
  const [full, setFull] = useState(cands[0]?.full ?? "");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || cands.length < 2) return;
    let alive = true;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        Promise.all(cands.map((c) => score(c.thumb))).then((sc) => {
          if (!alive) return;
          let best = 0;
          sc.forEach((v, i) => {
            if (v > sc[best]) best = i;
          });
          if (sc[best] >= 0) setFull(cands[best].full);
        });
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [cands]);

  return (
    <div ref={box} className="vS-kj vN-rv" aria-hidden="true">
      <span className="vS-kj-line">{kanji}</span>
      <span className="vS-kj-img" style={{ backgroundImage: `url(${full})` }}>{kanji}</span>
    </div>
  );
}
