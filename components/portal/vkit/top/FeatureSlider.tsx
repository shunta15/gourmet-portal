"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrow, IconArrowLeft } from "../common/Icons";
import Nm from "../common/Nm";

/**
 * 最初のページの「SPECIAL FEATURE」の切り替え(見本の 01 / 02 / 03 と ← →)。実在の店の記事 1〜3 本。
 * 写真(その店の実物)・番号・所在地・店名・事実の 1 行・「VIEW MORE」を、1 本ずつ重ねて出し、選んだ 1 本だけ見せる(JS が無ければ 1 本目)。
 * 自動では動かさない(静かな見本のため)。1 本しか無いときは切り替えを出さない。
 */
export type FeatureSlide = {
  id: string;
  href: string;
  area: string;
  title: string;
  desc: string;
  photo: { src: string; w: number; h: number; alt: string };
};

export default function FeatureSlider({ slides }: { slides: FeatureSlide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = (k: number) => setI(((k % n) + n) % n);
  return (
    <div className="vk-t-fs" data-count={n}>
      <div className="vk-t-fs-ph" aria-live="polite">
        {slides.map((s, k) => (
          <Link key={s.id} href={s.href} tabIndex={k === i ? 0 : -1} aria-hidden={k === i ? undefined : true} className={`vk-t-fs-slide vk-zoom ${k === i ? "is-on" : ""}`} aria-label={`${s.title}の記事を読む`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.photo.src} width={s.photo.w} height={s.photo.h} alt={k === i ? s.photo.alt : ""} loading={k === 0 ? "eager" : "lazy"} decoding="async" />
          </Link>
        ))}
      </div>
      <div className="vk-t-fs-pn">
        {slides.map((s, k) => (
          <div key={s.id} className={`vk-t-fs-txt ${k === i ? "is-on" : ""}`} aria-hidden={k === i ? undefined : true}>
            <p className="vk-t-fs-meta">
              <span className="vk-t-fs-no">{String(k + 1).padStart(2, "0")}</span>
              <span className="vk-t-fs-area">{s.area}</span>
            </p>
            <h3 className="vk-t-fs-t">
              <Nm text={s.title} />
            </h3>
            <p className="vk-t-fs-d">
              <Nm text={s.desc} />
            </p>
            <Link href={s.href} tabIndex={k === i ? 0 : -1} className="vk-t-fs-more">
              VIEW MORE
              <IconArrow />
            </Link>
          </div>
        ))}
        {n > 1 ? (
          <div className="vk-t-fs-ctl">
            <ol className="vk-t-fs-dots">
              {slides.map((s, k) => (
                <li key={s.id}>
                  <button type="button" className={k === i ? "is-on" : ""} aria-label={`${k + 1}本目の記事を見る`} aria-current={k === i ? "true" : undefined} onClick={() => go(k)}>
                    {String(k + 1).padStart(2, "0")}
                  </button>
                </li>
              ))}
            </ol>
            <span className="vk-t-fs-arrows">
              <button type="button" aria-label="前の記事" onClick={() => go(i - 1)}>
                <IconArrowLeft />
              </button>
              <button type="button" aria-label="次の記事" onClick={() => go(i + 1)}>
                <IconArrow />
              </button>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
