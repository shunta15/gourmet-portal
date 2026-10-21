import Link from "next/link";
import { IconArrow } from "../common/Icons";
import { FillHeading } from "../common/Motion";
import { ARTICLES_HREF } from "../common/site";
import { FACILITY, IMG, MENU } from "./data";

const ICON_URL = (id: string) => `${IMG}/ic-${id}.png`;

/** メニュー 3 品(料金あり) */
export function Menu() {
  return (
    <section className="sp-card sp-menu pt-bgshift pt-skew" data-skew="0.5" id="menu" aria-label="メニュー" data-io-group style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f6f0e6" }}>
      <div className="sp-lcol">
        <p className="sp-lab">Menu</p>
        <FillHeading as="h2" className="sp-ttl">
          メニュー
        </FillHeading>
        <p className="sp-ldesc">
          {MENU.desc.map((l, i) => (
            <span key={i}>
              {l}
              {i < MENU.desc.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
        <Link href={ARTICLES_HREF} className="sp-ghost pt-press pt-hov pt-magnet">
          <span>すべてのメニューを見る</span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
      <div className="sp-items">
      {MENU.items.map((m) => (
        <article key={m.name} className="sp-mi pt-lift pt-tilt pt-popin" data-tilt="6">
          <div className="sp-mi-ph pt-zoom pt-wipe" data-wipe="up">
            <img src={m.src} width={370} height={172} alt={m.name} loading="lazy" />
          </div>
          <h3 className="sp-mi-t">{m.name}</h3>
          <p className="sp-mi-p">{m.price}</p>
          <p className="sp-mi-d">
            {m.desc.map((l, i) => (
              <span key={i}>
                {l}
                {i < m.desc.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </article>
      ))}
      </div>
    </section>
  );
}

/** 施設・サービス 6 つ(線画アイコンは触ると弾む・描き直される) */
export function Facility() {
  return (
    <section className="sp-card sp-fac pt-bgshift pt-skew" data-skew="0.5" id="facility" aria-label="施設・サービス" data-io-group style={{ ["--bg-to" as string]: "#fefefe", ["--bg-from" as string]: "#f6f0e6" }}>
      <div className="sp-lcol">
        <p className="sp-lab">Facility</p>
        <FillHeading as="h2" className="sp-ttl">
          施設・サービス
        </FillHeading>
        <p className="sp-ldesc">
          {FACILITY.desc.map((l, i) => (
            <span key={i}>
              {l}
              {i < FACILITY.desc.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>
      <div className="sp-items">
      {FACILITY.items.map((f) => (
        <div key={f.id} className="sp-fi pt-hov pt-lift pt-popin">
          <span className="sp-fi-ic pt-bounce" style={{ ["--w" as string]: f.w, ["--h" as string]: f.h, ["--m" as string]: `url(${ICON_URL(f.id)})` }} aria-hidden="true" />
          <span className="sp-fi-l">{f.label}</span>
        </div>
      ))}
      </div>
    </section>
  );
}
