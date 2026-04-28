import Link from "next/link";
import { NEIGHBORHOODS } from "@/lib/data";

export default function Neighborhoods() {
  return (
    <section className="hoods">
      <div
        className="section-head"
        style={{ padding: "0 0 60px", gridTemplateColumns: "1fr 2fr 1fr" }}
      >
        <div className="no">
          <b>◎ 03</b>AREA / エリア
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
        {NEIGHBORHOODS.map((n, i) => (
          <Link
            key={i}
            href={`/search?region=${n.region}&q=${encodeURIComponent(n.name)}`}
            className="hood"
            data-cursor="ENTER"
          >
            <div className="no">/ {n.no}</div>
            <h3>
              <span className="main">{n.name}</span>
              <span className="alt">{n.alt}</span>
            </h3>
            <div className="desc">{n.desc}</div>
            <div className="count">{n.count}</div>
            <div className="arrow">→</div>
            <div
              className="preview-strip"
              style={{ backgroundImage: `url(${n.image})` }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
