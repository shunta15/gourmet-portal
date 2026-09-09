import Link from "next/link";
import type { RestaurantCardItem } from "@/lib/regions";
import { sized } from "@/lib/imageUrl";

export default function RestaurantCard({ r }: { r: RestaurantCardItem }) {
  const cardImageUrl = sized(r.image, 640);
  return (
    <Link
      href={`/restaurant/${r.id}`}
      className={"rest-card " + (r.shape || "")}
      data-cursor="VIEW"
    >
      <div className="img">
        <img
          src={cardImageUrl}
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
      <div className="meta">
        <span>
          #{r.id.replace(/^r/, "").padStart(2, "0")} · {r.area}
        </span>
        {(r.googleRating || r.rating) && (
          <span className="rating">★ {r.googleRating ?? r.rating}</span>
        )}
      </div>
      <div className="body">
        <div className="cuisine">{r.cuisine}</div>
        <h4>{r.name}</h4>
      </div>
    </Link>
  );
}
