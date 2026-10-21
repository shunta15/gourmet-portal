import Link from "next/link";
import { IconArrow } from "../common/Icons";
import { ARTICLES_HREF } from "../common/site";
import { FACILITY, IMG, MENU } from "./data";

const ICON_URL = (id: string) => `${IMG}/ic-${id}.png`;

/** メニュー 3 品(料金あり) */
export function Menu() {
  return (
    <section className="sp-card sp-menu" id="menu" aria-label="メニュー" data-io-group>
      <div className="sp-lcol">
        <p className="sp-lab">Menu</p>
        <h2 className="sp-ttl">メニュー</h2>
        <p className="sp-ldesc">
          {MENU.desc.map((l, i) => (
            <span key={i}>
              {l}
              {i < MENU.desc.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
        <Link href={ARTICLES_HREF} className="sp-ghost pt-press pt-hov">
          <span>すべてのメニューを見る</span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
      <div className="sp-items">
      {MENU.items.map((m) => (
        <article key={m.name} className="sp-mi pt-lift io">
          <div className="sp-mi-ph pt-zoom">
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
    <section className="sp-card sp-fac" id="facility" aria-label="施設・サービス" data-io-group>
      <div className="sp-lcol">
        <p className="sp-lab">Facility</p>
        <h2 className="sp-ttl">施設・サービス</h2>
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
        <div key={f.id} className="sp-fi pt-hov pt-lift io">
          <span className="sp-fi-ic pt-bounce" style={{ ["--w" as string]: f.w, ["--h" as string]: f.h, ["--m" as string]: `url(${ICON_URL(f.id)})` }} aria-hidden="true" />
          <span className="sp-fi-l">{f.label}</span>
        </div>
      ))}
      </div>
    </section>
  );
}
