import { IconX } from "../common/Icons";
import { IcClock, IcCalendar, IcExternal, IcInstagramColor, IcLink, IcPhone, IcSns } from "./ShopIcons";
import { IconPin } from "../common/Icons";
import { ABOUT, INFO_ROWS } from "./data";

const ICON = { pin: IconPin, clock: IcClock, calendar: IcCalendar, phone: IcPhone, link: IcLink, sns: IcSns } as const;

/** お店について + 住所〜SNS の表(2 枚のカード) */
export function AboutInfo() {
  return (
    <section className="sp-ai" id="about" aria-label="お店について" data-io-group>
      <div className="sp-card sp-about io">
        <p className="sp-lab">about</p>
        <h2 className="sp-ttl">お店について</h2>
        <p className="sp-about-p">
          {ABOUT.map((l, i) => (
            <span key={i}>
              {l}
              {i < ABOUT.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>
      <div className="sp-card sp-info io">
        <dl>
          {INFO_ROWS.map((r) => {
            const I = ICON[r.icon];
            return (
              <div key={r.id} className={`sp-ir sp-ir--${r.id}`}>
                <dt>
                  <I className="sp-ir-i" aria-hidden="true" />
                  <span>{r.label}</span>
                </dt>
                <dd>
                  {r.id === "sns" ? (
                    <span className="sp-sns">
                      <a href="#" aria-label="Instagram" className="pt-press">
                        <IcInstagramColor />
                      </a>
                      <a href="#" aria-label="X" className="pt-press">
                        <IconX />
                      </a>
                    </span>
                  ) : "link" in r && r.link ? (
                    <a href="#" className="sp-link">
                      {r.lines[0]}
                      <IcExternal aria-hidden="true" />
                    </a>
                  ) : (
                    r.lines.map((l, i) => (
                      <span key={i} className={i > 0 && "sub" in r && r.sub ? "sp-ir-sub" : undefined}>
                        {l}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
