"use client";
import { useEffect, useState } from "react";
import { bandAt, jstNow, kanjiTime, type Band } from "@/lib/portal/noren/lamp";
import Lantern from "./Lantern";

const BAND_LINE: Record<Band, { ja: string; en: string }> = {
  morning: { ja: "暖簾は、まだ下がったまま。", en: "Morning — the noren is still down" },
  day: { ja: "昼の光。灯りは、まだ点さない。", en: "Daylight — the lanterns wait" },
  dusk: { ja: "暖簾が出る頃。", en: "Dusk — lanterns are lit" },
  night: { ja: "灯りの時間。", en: "Night — lanterns at full glow" },
  late: { ja: "夜は、まだ続いている。", en: "Late — the night goes on" },
};

export default function NightClock({ photo }: { photo: string }) {
  const [t, setT] = useState<{ h: number; m: number; s: number; hour: number } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("t");
    const tick = () => setT(jstNow(q));
    tick();
    const iv = window.setInterval(tick, 1000);
    return () => window.clearInterval(iv);
  }, []);

  const band: Band = t ? bandAt(t.hour) : "night";
  const hh = t ? String(t.h).padStart(2, "0") : "--";
  const mm = t ? String(t.m).padStart(2, "0") : "--";
  const line = BAND_LINE[band];

  return (
    <section className="vN-clock vN-rv" id="now" data-band={band} aria-label="いま何時">
      <div className="vN-clock-photo" style={{ backgroundImage: `url(${photo})` }} aria-hidden="true" />
      <div className="vN-clock-shade" aria-hidden="true" />
      <Lantern className="vN-clock-lan vN-clock-lan--a" />
      <Lantern className="vN-clock-lan vN-clock-lan--b" mark="宵" />

      <div className="vN-clock-body">
        <p className="vN-clock-k">
          <span>いま何時</span>
          <em>Japan Standard Time</em>
        </p>
        <p className="vN-clock-digits" aria-label={t ? `${t.h}時${t.m}分` : "時刻を取得中"}>
          <span className="hh">{hh}</span>
          <span className="cl">:</span>
          <span className="mm">{mm}</span>
        </p>
        <div className="vN-clock-sec" aria-hidden="true">
          <i style={{ transform: `scaleX(${t ? (t.s / 60).toFixed(3) : 0})` }} />
        </div>
        <p className="vN-clock-line">
          <b>{line.ja}</b>
          <span>{line.en}</span>
        </p>
      </div>

      <p className="vN-clock-tate" aria-hidden="true">
        {t ? kanjiTime(t.h, t.m) : ""}
      </p>
      <p className="vN-clock-note">
        提灯の強さは、日本時間の時刻に合わせた演出です。各店の営業状況を示すものではありません。
      </p>
    </section>
  );
}
