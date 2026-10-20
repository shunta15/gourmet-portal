import type { ReactNode } from "react";
import Link from "next/link";
import { Heart, Reveal } from "../common/Motion";

/** 小さな部品(記事 3 本で共通)。すべて server でも使える(Heart だけ client だが props は軽い) */

export const Arrow = () => (
  <svg viewBox="0 0 16 10" width="13" height="9" aria-hidden="true">
    <path d="M1 5h13M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 若葉(見本の「この記事のポイント」の左の飾り。根元からそよぐ) */
export const Leaf = ({ size = 30, className = "gr-sway" }: { size?: number; className?: string }) => (
  <svg className={`ar-leaf ${className}`} viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
    <defs>
      <linearGradient id="ar-lf" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#2f5a3d" />
        <stop offset="1" stopColor="#7fb48a" />
      </linearGradient>
    </defs>
    <path d="M6 35C5 18 15 6 34 4c1 18-8 30-26 31z" fill="url(#ar-lf)" />
    <path d="M7 34C14 25 22 17 31 9" stroke="#fff" strokeOpacity=".75" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

export const Check = ({ size = 15 }: { size?: number }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" className="gr-draw">
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Pin = ({ size = 12 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M12 21.2s-6.6-6-6.6-11.3a6.6 6.6 0 0 1 13.2 0C18.6 15.2 12 21.2 12 21.2z" fill="currentColor" />
    <circle cx="12" cy="9.7" r="2.4" fill="#fff" />
  </svg>
);

export const Info = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 11v5.5M12 7.6v.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** 節の見出し。id は ScrollSpyTabs と目次の行き先 */
export function Sec({ id, no, title, children }: { id: string; no: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="ar-sec">
      <Reveal as="h2" className="ar-h2 gr-vbar">
        <span className="n">{no}</span>
        {title}
      </Reveal>
      <div>{children}</div>
    </section>
  );
}

export const P = ({ children }: { children: ReactNode }) => (
  <p className="ar-p" data-rv>
    {children}
  </p>
);

/** 注意の箱(淡い緑) */
export const Note = ({ children }: { children: ReactNode }) => (
  <div className="ar-note-box" data-rv>
    <Info />
    <p>{children}</p>
  </div>
);

export function Steps({ items }: { items: Array<{ t: string; d: string }> }) {
  return (
    <ol className="ar-steps" data-rv-group>
      {items.map((s, i) => (
        <li className="ar-step" key={s.t} data-rv="left">
          <span className="no">{String(i + 1).padStart(2, "0")}</span>
          <div className="tx gr-lift">
            <b>{s.t}</b>
            <p>{s.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Checks({ items }: { items: Array<{ t: string; d: string }> }) {
  return (
    <ul className="ar-checks" data-rv-group>
      {items.map((s) => (
        <li className="ar-check gr-hov" key={s.t} data-rv>
          <span className="ck gr-bounce">
            <Check />
          </span>
          <div>
            <b>{s.t}</b>
            <p>{s.d}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** 関連記事の札(持ち上がる・写真ズーム・矢印の丸が滑る) */
export function RelCard({ href, img, tag, title, text, color }: { href: string; img: string; tag: string; title: string; text: string; color?: string }) {
  return (
    <div data-rv>
      <Link href={href} className="ar-rc gr-lift gr-hov" style={color ? ({ "--ar-c": color } as React.CSSProperties) : undefined}>
        <div className="ph gr-zoom">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" loading="lazy" />
        </div>
        <div className="tx">
          <small>{tag}</small>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
        <span className="gr-arrow">
          <Arrow />
        </span>
      </Link>
    </div>
  );
}

export { Heart };
