import Link from "next/link";
import { sized } from "@/lib/imageUrl";
import type { Neighborhood } from "@/lib/regions";

interface NeighborhoodsProps {
  neighborhoods: Neighborhood[];
}

export default function Neighborhoods({ neighborhoods }: NeighborhoodsProps) {
  return (
    <section className="hoods">
      <div
        className="section-head"
        style={{ padding: "0 0 60px", gridTemplateColumns: "1fr 2fr 1fr" }}
      >
        <div className="no">
          <b>◎ 04</b>エリア
        </div>
        <h2 className="reveal-line">
          <span>
            街を、<em>舌で歩く。</em>
          </span>
        </h2>
        <div className="lede">
          各エリアを、風景と共に。マウスを重ねると、夜が見える。
        </div>
      </div>
      <div className="hoods-list">
        {neighborhoods.map((n, i) => {
          const imgUrl = sized(n.image, 640);
          return (
          <Link
            key={i}
            href={`/search?region=${n.region}&q=${encodeURIComponent(n.name)}`}
            className="hood"
            data-cursor="ENTER"
          >
            <div className="no">{n.no}</div>
            <h3>
              <span className="main">{n.name}</span>
            </h3>
            <div className="desc">{n.desc}</div>
            <div className="count">{n.count}</div>
            <div className="arrow">→</div>
            <div className="preview-strip" style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={imgUrl}
                alt={n.name}
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
          </Link>
          );
        })}
      </div>
    </section>
  );
}
