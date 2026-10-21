import Link from "next/link";
import { IconArrow } from "../common/Icons";
import { FillHeading, PawTrail } from "../common/Motion";
import { ARTICLE_HREF } from "../common/site";
import { ACCESS, IMG, SCENE, SHOP, TABLE } from "./data";

/** おすすめのシーン 4 つ(ベージュの帯) */
export function Scene() {
  return (
    <section className="sp-scene pt-bgshift pt-skew" data-skew="0.5" id="scene" aria-label="おすすめのシーン" data-io-group style={{ ["--bg-to" as string]: "#f4f2ee", ["--bg-from" as string]: "#ebe3d6" }}>
      <div className="sp-lcol">
        <p className="sp-lab">Scene</p>
        <FillHeading as="h2" className="sp-ttl">
          おすすめのシーン
        </FillHeading>
        <p className="sp-ldesc">{SCENE.desc[0]}</p>
      </div>
      <div className="sp-items">
      {SCENE.items.map((s) => (
        <Link key={s.title} href={ARTICLE_HREF} className="sp-si pt-lift pt-tilt pt-popin" data-tilt="6">
          <div className="sp-si-ph pt-zoom pt-wipe" data-wipe="left">
            <img src={s.src} width={310} height={178} alt={s.title} loading="lazy" />
          </div>
          <h3 className="sp-si-t">{s.title}</h3>
          <p className="sp-si-d">
            {s.desc.map((l, i) => (
              <span key={i}>
                {l}
                {i < s.desc.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </Link>
      ))}
      </div>
      <PawTrail count={6} direction="right" size={13} gap="calc(9 * var(--u))" className="sp-paws-scene" />
    </section>
  );
}

/** アクセス(電車・車)+ 地図 + 店舗情報の表 */
export function Access() {
  return (
    <section className="sp-acc pt-bgshift pt-skew" data-skew="0.4" data-from="0.99" data-to="0.62" id="access" aria-label="アクセスと店舗情報" style={{ ["--bg-to" as string]: "#f8f8f6", ["--bg-from" as string]: "#efe8dc" }}>
      <div className="sp-acc-l io" data-io="left">
        <p className="sp-lab">Access</p>
        <FillHeading as="h2" className="sp-ttl sp-ttl--acc" start={1.0} end={0.6}>
          アクセス
        </FillHeading>
        <div className="sp-way sp-way--train pt-hov">
          <span className="sp-way-ic pt-bounce" aria-hidden="true">
            <i style={{ ["--m" as string]: `url(${IMG}/ic-train.png)`, ["--w" as string]: 18.2, ["--h" as string]: 23.8 }} />
          </span>
          <h3>{ACCESS.train.title}</h3>
          <p>
            {ACCESS.train.lines.map((l, i) => (
              <span key={i}>
                {l}
                {i < ACCESS.train.lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>
        <div className="sp-way sp-way--car pt-hov">
          <span className="sp-way-ic pt-bounce" aria-hidden="true">
            <i style={{ ["--m" as string]: `url(${IMG}/ic-carb.png)`, ["--w" as string]: 25.2, ["--h" as string]: 21.1 }} />
          </span>
          <h3>{ACCESS.car.title}</h3>
          <p>
            {ACCESS.car.lines.map((l, i) => (
              <span key={i}>
                {l}
                {i < ACCESS.car.lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </div>
        <a href="#" className="sp-ghost sp-ghost--map pt-press pt-hov pt-magnet">
          <span>Googleマップで見る</span>
          <IconArrow aria-hidden="true" />
        </a>
      </div>

      <div className="sp-map io" data-io="zoom">
        <div className="sp-map-clip" data-scrollp>
          <img className="sp-map-img" src={`${IMG}/map.webp`} width={568} height={342} alt="sora cafe の周辺地図" loading="lazy" />
        </div>
        <span className="sp-pin pt-live" aria-hidden="true">
          <i className="sp-pin-ring" />
          <svg className="sp-pin-svg" viewBox="0 0 28 40">
            <path d="M14 1C7 1 1.600 6.300 1.600 13c0 8.200 12.400 26 12.400 26s12.400-17.800 12.400-26C26.400 6.300 21 1 14 1z" fill="#d93a3a" />
            <circle cx="14" cy="13.200" r="4.600" fill="#fff" />
            <circle cx="14" cy="13.200" r="1.700" fill="#d93a3a" />
          </svg>
          <span className="sp-pin-bub">{SHOP.name}</span>
        </span>
      </div>

      <div className="sp-acc-r io" data-io="right">
        <p className="sp-lab">Information</p>
        <FillHeading as="h2" className="sp-ttl sp-ttl--info" start={1.0} end={0.6}>
          店舗情報
        </FillHeading>
        <dl className="sp-tbl">
          {TABLE.map((r) => (
            <div key={r.k} className="sp-tr">
              <dt>{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
