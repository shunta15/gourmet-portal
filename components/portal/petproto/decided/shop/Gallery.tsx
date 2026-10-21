import { CountUp } from "../common/Motion";
import { IcExternal, IcGallery } from "./ShopIcons";
import { STRIP } from "./data";

/** 写真 5 枚の並び(最後の写真に「すべての写真を見る(24枚)」)。触ると持ち上がって写真がズーム。スマホは横スクロール */
export function Gallery() {
  return (
    <section className="sp-strip" aria-label="写真" data-io-group>
      <ul className="sp-strip-in">
        {STRIP.map((p, i) => (
          <li key={p.src} className="sp-ph pt-lift pt-zoom io" style={{ ["--w" as string]: p.w }}>
            <img src={p.src} width={p.w * 2} height={220} alt={p.alt} loading={i < 5 ? "eager" : "lazy"} />
            {i === STRIP.length - 1 ? (
              <a href="#" className="sp-allph pt-press" aria-label="すべての写真を見る(24枚)">
                <IcGallery aria-hidden="true" />
                <span>
                  すべての写真を見る（<CountUp to={24} />枚）
                </span>
                <IcExternal className="sp-allph-x" aria-hidden="true" />
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
