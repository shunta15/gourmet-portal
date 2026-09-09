import Link from "next/link";
import { sized } from "@/lib/imageUrl";
import { REGIONS, type RegionKey, type Stat } from "@/lib/regions";

export default function RegionsShowcase({
  region,
  regionStats,
}: {
  region: RegionKey;
  /** サーバー側で getRegionStats() を計算して渡す（クライアントに data.ts を載せない） */
  regionStats: Record<RegionKey, Stat[]>;
}) {
  return (
    <section className="hoods" style={{ background: "var(--bg-2)" }}>
      <div
        className="section-head"
        style={{ padding: "0 0 60px" }}
      >
        <div className="no">
          <b>◎ 05</b>地域別ポータル
        </div>
        <h2 className="reveal-line">
          <span>
            地域の、<em>ミニポータル</em>
          </span>
        </h2>
        <div className="lede">
          {Object.keys(REGIONS).length}の地域で、それぞれの編集部が独自の紙面を展開。クリックで潜入できます。
        </div>
      </div>
      <div className="regions-grid">
        {Object.entries(REGIONS).map(([k, r], i) => {
          const s = regionStats[k as RegionKey];
          const imgUrl = sized(r.heroImages[0], 640);
          return (
            <Link
              key={k}
              href={`/region/${k}`}
              className={"region-card " + (k === region ? "active" : "")}
              data-cursor="ENTER"
            >
              <div className="img">
                <img
                  src={imgUrl}
                  alt={r.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="rc-body">
                <div className="rc-no">
                  地域 / {String(i + 1).padStart(2, "0")}
                </div>
                <h3>{r.name}</h3>
                <p className="rc-tag">
                  <em>{r.tagline}</em>
                </p>
                <div className="rc-stats">
                  <span>{s[0].n} 店舗</span>
                  <span>·</span>
                  <span>{s[1].n} エリア</span>
                  <span>·</span>
                  <span>★ {s[3].n}</span>
                </div>
                {k === region && <div className="rc-now">現在 表示中</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
