/**
 * 店のページの動きの案 1「留める」(?fx=1)。
 * 最初の画面を縦に長い枠の中に留め(.f1-track の中で .f1-stage が画面に貼り付く)、スクロールで「場面」が替わる。
 *   場面 0: 店名 / 場面 1: 種類とエリア / 場面 2: 住所と短い説明。
 *   全面の色が丸く広がる・左から塗られるように入れ替わり、大きな字が 1 行ずつ入れ替わり、写真の窓が 丸 → アーチ → 葉っぱ形 に変形しながら次の写真に替わる。
 * 場面の位置 --se は components/portal/colorplay/FxPin.tsx がスクロールから入れる(整数の近くで少し留まる)。窓を押すと次の場面へ。マウス/指に窓が少し傾く。
 * 写真は窓に最大 3 枚(0 枚は種類の英字、1 枚は同じ写真を場面ごとに寄る)。4 枚め以降は、窓のあとの「店の写真」に出す(同じ写真を繰り返さない)。
 * 「店舗情報のみ見る」は舞台の下に常に残る。動きを減らす設定・JS なしでは、留めずに 3 つの場面を縦に並べた完成形で読める。
 * 紹介以降は、今の形と同じ部品。見出しは、見えたとき下からせり上がる(マスク)。
 */
import Footer from "../Footer";
import FxPin from "../FxPin";
import { IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { sized } from "@/lib/imageUrl";
import { AccessSection, ArticleLinkSection, Crumb, GallerySection, InfoButton, JsonLds, KIND_EN, MenuSection, MoreShops, nameSize, PanelList, PrimaryCta, QuoteSection, ShopHeader, Tabs, type ShopModel } from "./shopModel";
import { cpFx1Static } from "./fxStatic";

const STEPS = 2;

/** 窓の写真 j が見える強さ(場面 s の写真番号 map[s] が j のとき 1)。--se から CSS で計算する */
function photoOpacity(j: number, map: number[]): string {
  const terms = map
    .map((pj, s) => (pj === j ? `clamp(0, calc(1 - max(var(--se) - ${s}, ${s} - var(--se)) * 2.2), 1)` : null))
    .filter(Boolean)
    .join(" + ");
  return `clamp(0, calc(${terms}), 1)`;
}

export function Fx1Shop({ m }: { m: ShopModel }) {
  const { site, d, s, tone } = m;
  const win = d.photos.slice(0, 3);
  const map = win.length >= 3 ? [0, 1, 2] : win.length === 2 ? [0, 1, 0] : [0, 0, 0];
  const extra = d.photos.slice(3);
  const kindEn = KIND_EN[s.kind] ?? s.kindName;
  // 窓の外の写真(4 枚め以降)だけを、店の写真の節に出す
  const m2: ShopModel = { ...m, gallery: extra };
  return (
    <>
      <JsonLds m={m} />
      <ShopHeader m={m} />
      <noscript><style>{cpFx1Static}</style></noscript>
      <main id="cp-main" tabIndex={-1} className="fx-1">
        <FxPin steps={STEPS} className={`f1-track t-${tone}`} id="top">
          <div className="f1-stage">
            <div className="f1-bg" aria-hidden="true"><i className="b1" /><i className="b2" /></div>
            <div className="f1-open" aria-hidden="true" />
            <div className="f1-orb" aria-hidden="true" />
            <div className="cp-wrap f1-in">
              <div className="f1-top"><Crumb m={m} /></div>
              <div className="f1-lines">
                <h1 className={`f1-l f1-l0 z-${nameSize(s.name.length)}`} style={{ ["--i" as string]: 0 }}>{s.name}</h1>
                <p className="f1-l f1-l1" style={{ ["--i" as string]: 1 }}>
                  <span className="k">{s.kindName}</span>
                  <span className="a">{s.prefName}{s.city ? ` ${s.city}` : ""}</span>
                </p>
                <p className="f1-l f1-l2" style={{ ["--i" as string]: 2 }}>
                  <span className="ad"><IconPin size={22} />{s.address}</span>
                  {d.headline && <small>{d.headline}</small>}
                </p>
                {d.nameKana && <p className="cp-sr">{d.nameKana}</p>}
              </div>
            </div>
            <div className={`f1-win ${win.length === 0 ? "no-ph" : ""}`}>
              <button type="button" className="f1-next" data-f1-next aria-label="次の場面へ" />
              <div className="f1-wb">
                {win.length === 0 ? (
                  <span className="f1-kind cp-cond">{kindEn.split(" ").map((w, i) => (<span key={i}>{w}</span>))}</span>
                ) : (
                  [...new Set(map)].map((j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={j}
                      src={sized(win[j].src, 900)}
                      alt={win[j].alt}
                      width={win[j].w ?? 1200}
                      height={win[j].h ?? 800}
                      loading={j === 0 ? "eager" : "lazy"}
                      fetchPriority={j === 0 ? "high" : undefined}
                      decoding="async"
                      style={{ opacity: win.length >= 2 ? photoOpacity(j, map) : undefined, scale: win.length === 1 ? "calc(1.04 + var(--se) * .05)" : undefined }}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="f1-cta">
              <PrimaryCta m={m} />
              <InfoButton />
            </div>
            <ol className="f1-dots" aria-hidden="true"><li style={{ ["--i" as string]: 0 }} /><li style={{ ["--i" as string]: 1 }} /><li style={{ ["--i" as string]: 2 }} /></ol>
            <p className="f1-hint" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg></p>
          </div>
        </FxPin>

        <Tabs m={m} />
        <GallerySection m={m2} />
        <PanelList m={m} />
        <ArticleLinkSection m={m} />
        <QuoteSection m={m} />
        <MenuSection m={m} />
        <AccessSection m={m} />
        <MoreShops m={m} />
      </main>
      <Footer site={site} />
    </>
  );
}

