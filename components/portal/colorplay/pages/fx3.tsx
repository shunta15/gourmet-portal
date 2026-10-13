/**
 * 店のページの動きの案 3「弾む」(?fx=3)。
 * 字と形が主役。店名と見出しは 1 字ずつ上から落ちて、ばねで弾む。丸・ハート・飾りの形と写真のカードも落ちて弾み、近づくマウス/指から逃げ、押すと弾ける。
 * 文字は押すとへこみ、スクロールの速さで縦に伸びて傾く。住所と電話は、見えたとき 1 字ずつ打たれるように現れる。
 * 動かすのは components/portal/colorplay/FxPhysics.tsx(ばねの計算。見えているときだけ回し、全部が静止したら止める)。
 * 動きを減らす設定・JS なしでは、ただの文字と形(動かない完成形)で読める(文字が隠れたままにならないよう、1.4 秒後には必ず出る)。
 */
import Footer from "../Footer";
import FxPhysics from "../FxPhysics";
import { FxText } from "../FxText";
import { IconHeart, IconPin, IconSparkle } from "@/components/portal/bproto/colorplay/Icons";
import { sized } from "@/lib/imageUrl";
import { AccessSection, Crumb, foldBody, GallerySection, InfoButton, JsonLds, MenuSection, MoreShops, nameSize, PrimaryCta, QuoteSection, ShopHeader, Tabs, type PanelData, type ShopModel } from "./shopModel";

function Panel3({ d, band, right }: { d: PanelData; band: string; right: boolean }) {
  const { open, rest } = foldBody(d.body);
  return (
    <section className={`sh-sec bg-${band}`} id={d.id} data-sp="e p">
      <p className="sh-no cp-cond" aria-hidden="true">{d.no}</p>
      <div className={`cp-wrap sh-sec-in sh-2col ${right ? "rev" : ""}`}>
        <div className="sh-hd">
          <h2 className="sh-h" aria-label={d.heading}><FxText text={d.heading} mode="drop" /></h2>
          {d.sub && <p className="sh-sub">{d.sub}</p>}
        </div>
        <div className={`sh-card ${right ? "al-r" : ""}`}>
          {open.map((t, i) => (<p key={i}>{t}</p>))}
          {rest.length > 0 && (
            <details className="sh-more">
              <summary><span className="so">続きを読む</span><span className="sc">たたむ</span></summary>
              {rest.map((t, i) => (<p key={i}>{t}</p>))}
            </details>
          )}
          {d.specs && d.specs.length > 0 && (
            <dl className="sh-specs">
              {d.specs.map((x) => (<div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

/** 飾りの形(入口の色と重ならない色を使う) */
const SHAPES: { cls: string; x: string; y: string; s: string; r?: number }[] = [
  { cls: "c1", x: "82%", y: "26%", s: "min(26vmin,300px)", r: 60 },
  { cls: "c2", x: "92%", y: "72%", s: "min(15vmin,170px)" },
  { cls: "h", x: "11%", y: "78%", s: "min(20vmin,220px)", r: 40 },
  { cls: "sp", x: "62%", y: "13%", s: "min(12vmin,130px)" },
  { cls: "c3", x: "34%", y: "92%", s: "min(9vmin,100px)" },
];

export function Fx3Shop({ m }: { m: ShopModel }) {
  const { site, d, s, n, tone } = m;
  return (
    <>
      <JsonLds m={m} />
      <ShopHeader m={m} />
      <noscript><style>{".fxc{opacity:1!important;animation:none!important}"}</style></noscript>
      <main id="cp-main" tabIndex={-1} className="fx-3">
        <section className={`f3-hero t-${tone} ${n > 0 ? "has-ph" : "no-ph"}`} id="top" data-fx-field="1" data-sp="o">
          {SHAPES.map((sh, i) => (
            <i key={i} className={`f3-shape ${sh.cls}`} data-fx-shape="1" data-r={sh.r ?? 0} style={{ ["--x" as string]: sh.x, ["--y" as string]: sh.y, ["--s" as string]: sh.s }} aria-hidden="true">
              {sh.cls === "h" && <IconHeart size={100} filled />}
              {sh.cls === "sp" && <IconSparkle size={100} />}
            </i>
          ))}
          <div className="cp-wrap f3-in">
            <Crumb m={m} />
            <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
            <h1 className={`f3-name z-${nameSize(s.name.length)}`} aria-label={s.name}><FxText text={s.name} mode="drop" /></h1>
            {d.nameKana && <p className="cp-kana">{d.nameKana}</p>}
            <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}{d.headline && (<><br /><small>{d.headline}</small></>)}</span></p>
            <PrimaryCta m={m} />
            <p className="sh-info-p"><InfoButton /></p>
            {n > 0 && (
              <div className="f3-photo" data-fx-shape="1" data-m="3" data-r="80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sized(d.photos[0].src, 900)} alt={d.photos[0].alt} width={d.photos[0].w ?? 1200} height={d.photos[0].h ?? 800} fetchPriority="high" decoding="async" />
              </div>
            )}
          </div>
        </section>

        <Tabs m={m} />
        <GallerySection m={m} />
        {m.panels.map((pd, i) => (<Panel3 key={i} d={pd} band={m.bandOf(i)} right={i % 2 === 1} />))}
        <QuoteSection m={m} />
        <MenuSection m={m} />
        <AccessSection m={m} typed />
        <MoreShops m={m} />
      </main>
      <FxPhysics />
      <Footer site={site} />
    </>
  );
}
