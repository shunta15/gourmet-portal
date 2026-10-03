import Link from "next/link";
import type { LatestFeature } from "@/lib/portal/home";

/** 新着の特集（グルメの既存特集の実データ。リンク先は既存の /feature/{id}） */
export default function FeatureStrip({ items }: { items: LatestFeature[] }) {
  if (items.length === 0) return null;
  return (
    <section id="features" className="mp-sec mp-feat" aria-labelledby="mp-feat-h">
      <div className="mp-wrap">
        <header className="mp-sec-head row" data-reveal>
          <div>
            <p className="mp-kicker">03 — New Features</p>
            <h2 id="mp-feat-h" className="mp-h2">新着の特集</h2>
          </div>
          <Link href="/feature" className="mp-more" data-cursor="READ">
            特集をすべて見る <span aria-hidden="true">→</span>
          </Link>
        </header>
        <ul className="mp-feat-list">
          {items.map((f, i) => (
            <li key={f.id} style={{ ["--i" as string]: i }} data-reveal>
              <Link href={`/feature/${f.id}`} className="mp-fcard" data-cursor="READ">
                <span className="img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.image} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="meta">
                  <small>{f.tag || f.kicker}</small>
                  {f.date && <small className="d">{f.date}</small>}
                </span>
                <b>{f.title}</b>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
