/**
 * 店のページの動きの案 2「重ねる」(?fx=2)。
 * ページ全体を「色のカード」の山にする。入口もカードで、開くと 4 枚の色の紙が上から順にめくれて(3D)店名と写真が現れる。
 * 見出しごとのカード(紹介・メニュー・店舗情報)は、下から傾いて滑り込み、次のカードが重なると 奥へ傾いて下がり、暗くなる。
 * 縁と影の重ね(厚み)で、カードの山に見せる。写真は「扇」に広げたカードで、スクロールで開く(写真が 0 枚の店は、入口の写真の代わりに種類の英字を載せたカードが 3D に傾く)。マウス/指になぞられて、入口の写真が 3D に傾き、光がすべる。
 * 動かすのは transform・opacity だけ(perspective は親)。スクロール連動は ScrollFx(--sp-e 入ってくる・--sp-o 抜けていく)、触る・なぞるは FxPointer。
 * 動きを減らす設定・JS なしでは、傾かない・めくれない完成形(カードが重なって並ぶだけ)で読める。
 */
import Footer from "../Footer";
import FxPointer from "../FxPointer";
import { IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { sized } from "@/lib/imageUrl";
import { AccessSection, Crumb, InfoButton, JsonLds, KIND_EN, MenuSection, MoreShops, nameSize, PanelList, PrimaryCta, QuoteSection, ShopHeader, type ShopModel } from "./shopModel";

const SP = "e p o";

export function Fx2Shop({ m }: { m: ShopModel }) {
  const { site, d, s, n, tone, cyc } = m;
  const fan = d.photos.slice(1, 6);
  return (
    <>
      <JsonLds m={m} />
      <ShopHeader m={m} />
      <main id="cp-main" tabIndex={-1} className="fx-2">
        <FxPointer className="f2-deck">
          <section className={`f2-card f2-hero t-${tone} ${n > 0 ? "has-ph" : "no-ph"}`} id="top" data-sp="o">
            <div className="f2-sheets" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="cp-wrap f2-hero-in">
              <Crumb m={m} />
              <div className="f2-hero-grid">
                <div className="f2-copy">
                  <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
                  <h1 className={`f2-name sz-${nameSize(s.name.length)}`}><span className="cp-line" style={{ ["--l" as string]: 0 }}>{s.name}</span></h1>
                  {d.nameKana && <p className="cp-kana">{d.nameKana}</p>}
                  <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}{d.headline && (<><br /><small>{d.headline}</small></>)}</span></p>
                  <PrimaryCta m={m} />
                  <p className="sh-info-p"><InfoButton /></p>
                </div>
                {n === 0 && (
                  <div className="f2-photo" aria-hidden="true">
                    <div className="f2-ph-in f2-ph-word">
                      <span className="cp-cond">{(KIND_EN[s.kind] ?? s.kindName).split(" ").map((w, i) => (<span key={i}>{w}</span>))}</span>
                      <i className="f2-glare" />
                    </div>
                  </div>
                )}
                {n > 0 && (
                  <div className="f2-photo">
                    <div className="f2-ph-in">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sized(d.photos[0].src, 1024)} alt={d.photos[0].alt} width={d.photos[0].w ?? 1200} height={d.photos[0].h ?? 800} fetchPriority="high" decoding="async" />
                      <i className="f2-glare" aria-hidden="true" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {fan.length > 0 && (
            <section className={`f2-card f2-fan-sec sh-sec bg-${cyc[cyc.length - 1]}`} data-sp={SP} aria-label="店の写真">
              <div className="cp-wrap sh-sec-in">
                <ul className="f2-fan" style={{ ["--cnt" as string]: fan.length }}>
                  {fan.map((x, i) => (
                    <li key={x.src} data-sp="e" style={{ ["--i" as string]: i, ["--c" as string]: (fan.length - 1) / 2 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sized(x.src, 800)} alt={x.alt} width={x.w ?? 1200} height={x.h ?? 800} loading="lazy" decoding="async" />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <PanelList m={m} sp={SP} />
          <QuoteSection m={m} sp={SP} />
          <MenuSection m={m} sp="e o" />
          <AccessSection m={m} sp="e o" />
        </FxPointer>
        <MoreShops m={m} />
      </main>
      <Footer site={site} />
    </>
  );
}
