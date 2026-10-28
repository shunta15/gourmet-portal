"use client";
import { useEffect, useRef } from "react";

// 見本の 1024 幅の舞台を、画面幅(最大 1440)に合わせて拡大縮小する。
export default function Fit({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => {
      const w = Math.min(window.innerWidth, 1440);
      const z = w / 1024;
      if (ref.current) {
        ref.current.style.setProperty("--z", String(z));
        ref.current.style.width = w + "px";
        ref.current.style.height = 1536 * z + "px";
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div ref={ref} className="p4-fit">
      <div className="p4-stage">{children}</div>
    </div>
  );
}
