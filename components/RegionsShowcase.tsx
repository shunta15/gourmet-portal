import Link from "next/link";
import { REGIONS, type RegionKey } from "@/lib/data";

export default function RegionsShowcase({
  region,
}: {
  region: RegionKey;
}) {
  return (
    <section className="hoods" style={{ background: "var(--bg-2)" }}>
      <div
        className="section-head"
        style={{ padding: "0 0 60px", gridTemplateColumns: "1fr 2fr 1fr" }}
      >
        <div className="no">
          <b>◎ 04</b>MINI PORTALS / 地域別
        </div>
        <h2 className="reveal-line">
          <span>
            地域の、<em>ミニポータル</em>
          </span>
        </h2>
        <div className="lede">
          五つの地域で、それぞれの編集部が独自の紙面を展開。クリックで潜入できます。
        </div>
      </div>
      <div className="regions-grid">
        {Object.entries(REGIONS).map(([k, r], i) => (
          <Link
            key={k}
            href={`/region/${k}`}
            className={"region-card " + (k === region ? "active" : "")}
            data-cursor="ENTER"
          >
            <div
              className="img"
              style={{ backgroundImage: `url(${r.heroImages[0]})` }}
            />
            <div className="rc-body">
              <div className="rc-no">EDITION / {String(i + 1).padStart(2, "0")}</div>
              <h3>{r.name}</h3>
              <div className="rc-en">{r.nameEn}</div>
              <p className="rc-tag">
                <em>{r.tagline}</em>
              </p>
              <div className="rc-stats">
                <span>{r.stats[0].n} 店舗</span>
                <span>·</span>
                <span>{r.stats[1].n} エリア</span>
                <span>·</span>
                <span>★ {r.stats[3].n}</span>
              </div>
              {k === region && <div className="rc-now">現在 表示中</div>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
