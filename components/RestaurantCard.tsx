import Link from "next/link";
import type { Restaurant } from "@/lib/data";

export default function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <Link
      href={`/restaurant/${r.id}`}
      className={"rest-card " + (r.shape || "")}
      data-cursor="VIEW"
    >
      <div className="img" style={{ backgroundImage: `url(${r.image})` }} />
      <div className="meta">
        <span>
          #{r.id.replace(/^r/, "").padStart(2, "0")} · {r.area}
        </span>
        <span className="rating">★ {r.rating}</span>
      </div>
      <div className="body">
        <div className="cuisine">{r.cuisine}</div>
        <h4>{r.name}</h4>
      </div>
    </Link>
  );
}
