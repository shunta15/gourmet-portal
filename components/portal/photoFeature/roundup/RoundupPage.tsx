import Link from "next/link";
import { sized } from "@/lib/imageUrl";
import { FEATURE_KIND_ROUNDUP } from "@/lib/portal/noren/featureKinds";
import type { RoundupData, RpStore } from "@/lib/portal/photoFeature/roundupBuild";
import type { PfPhoto } from "@/lib/portal/photoFeature/build";
import Motion from "../Motion";
import Gate from "../Gate";
import { Brush, Seal, Tate } from "../parts";
import { Dark, Fig, FooterBar, HeaderBar, Nr, RodAndHud, Row, Text, nrKind, type Fx } from "./rparts";
import "./roundup.css";

// シーン別まとめ記事（利用シーン + 複数の店）の中身（サーバーコンポーネント）。見た目は店舗特集記事（components/portal/photoFeature/PhotoFeaturePage.tsx）と同じ世界:
//   入口の暖簾（WebGL の布・利用シーンの語を染め抜き）→ 巻頭（主役の写真 + 題の札）→ リード → 店 ×N（和紙の面と暗い面が交互・店 1 軒 = 1 区切り・写真が主役・小さな暖簾に屋号・文は短く「続きを読む」）
//   → 締め（編集部の言葉）→ 特集の一覧・さがす → ほかのシーン別まとめ記事。
// 動き（Motion）・入口の暖簾（Gate）・CSS は店舗特集記事のものをそのまま使う。店ごとの区切りの作りは roundup.css。外枠（.pf-root）は呼び出し側の PhotoFeatureShell。

/** 小見出し（店名）の変わり方: 写真の上に白抜き（ov）/ 写真にかかる白い短冊（tz）。どちら側か */
const HEAD: Record<string, { kind: "ov" | "tz"; side: "l" | "r" }> = {
  A: { kind: "ov", side: "r" },
  B: { kind: "tz", side: "l" },
  C: { kind: "ov", side: "l" },
  D: { kind: "tz", side: "r" },
};

function StoreBlock({ s, index }: { s: RpStore; index: number }) {
  const id = `s-${s.no}`;
  const n = s.photos.length;
  const h = HEAD[s.variant] ?? HEAD.A;
  const nrk = nrKind(index);
  const meta = [s.cuisine, s.area].filter(Boolean);

  // 店の情報（記事のデータにある項目をそのまま）と Google マップ: 「続きを読む」の中
  const fold = (
    <>
      {s.specs.length > 0 && (
        <dl className="rp-specs">
          {s.specs.map((x, i) => (
            <div key={i}>
              <dt>{x.k}</dt>
              <dd>{x.v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="rp-map">
        <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer">
          Google マップで開く ↗<span className="pf-vh">（外部サイトが新しいタブで開きます）</span>
        </a>
      </p>
    </>
  );
  const body = (
    <div className="pf-v__tx pf-rv">
      {meta.length > 0 && (
        <p className="rp-meta">
          {meta.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </p>
      )}
      {s.heading && <p className="pf-hd">{s.heading}</p>}
      <Text t={s.text} fold={fold} />
      {s.href && (
        <p className="rp-go">
          <Link href={s.href} className="pf-btn pf-btn--sm pf-mag">
            店ページを見る →<span className="pf-vh">（{s.name}）</span>
          </Link>
        </p>
      )}
    </div>
  );

  // 写真が無い店: 暗い空の枠は出さず、和紙の面に店名を大きな縦書きで見せる
  if (n === 0) {
    return (
      <section className="pf-v rp-bare" data-no={s.no} aria-labelledby={`${id}-h`}>
        <Nr units={s.mark} k={nrk} side="l" />
        {/* 縦書きの店名は、画面に入ったとき 1 字ずつ現れる（親の [data-rvw] に .in が付いたあと） */}
        <div className="rp-bare__w" data-rvw="" data-rv="none" style={{ "--per": Math.max(...s.cols.map((c) => Array.from(c).length)) } as Fx}>
          <h2 id={`${id}-h`} className="rp-bare__h">
            <span className="pf-no" aria-hidden="true">{s.no}</span>
            <Tate cols={s.cols} className="rp-bare__t" label={false} trigger />
            <span className="pf-vh">{s.name}</span>
          </h2>
        </div>
        {body}
      </section>
    );
  }

  const heading = (
    <h2 id={`${id}-h`} className={`pf-${h.kind} pf-${h.side}`}>
      <span className="pf-no" aria-hidden="true">{s.no}</span>
      <Tate cols={s.cols} className="pf-vt" label={false} trigger />
      <span className="pf-vh">{s.name}</span>
    </h2>
  );
  const cls = `pf-v pf-v--${s.variant}${n > 1 ? " pf-v--multi" : s.photos[0].port ? " pf-v--port" : ""}`;
  return (
    <section className={cls} data-no={s.no} aria-labelledby={`${id}-h`}>
      <Nr units={s.mark} k={nrk} side={h.side === "r" ? "l" : "r"} />
      <div className="pf-v__ph">
        <div className="pf-cl__in" data-rvw="" data-rv={s.rv}>
          <Row photos={s.photos} rv={s.rv} />
          {heading}
        </div>
      </div>
      {body}
    </section>
  );
}

export type RoundupRelatedItem = { id: string; href: string; title: string; tag: string; area: string; img: string };

export type RoundupPageProps = {
  data: RoundupData;
  /** 利用シーンの語（「ランチ」など）+ 地域の言い方（「大阪」など）。巻頭の札に出す */
  areaLabel: string;
  /** 特集の一覧・グルメの入口・さがすの行き先 */
  listHref: string;
  topHref: string;
  searchHref: string;
  /** その利用シーンで絞ったさがす（/search?scene=<slug>）。無ければ出さない */
  sceneSearch?: { href: string; label: string } | null;
  /** その地域で絞ったさがす（/search?region=<キー>）。無ければ出さない */
  regionSearch?: { href: string; label: string } | null;
  /** ほかのシーン別まとめ記事（最大 3 本）。空なら出さない */
  related?: RoundupRelatedItem[];
};

export default function RoundupPage({ data: D, areaLabel, listHref, topHref, searchHref, sceneSearch, regionSearch, related = [] }: RoundupPageProps) {
  const T = D.title;
  const hero: PfPhoto | null = D.hero;
  const cover: Fx = { "--per": T.per, "--cols": T.cols.length, "--nh": hero && hero.nh ? Math.round(hero.nh * 1.3) : 9999, "--hcap": `${hero ? hero.cap : 1200}px` };
  const small = !!hero && hero.cap < 1000;
  const searchBtns = [sceneSearch, regionSearch].filter((x): x is { href: string; label: string } => !!x);
  // 暗い面の区画（和紙と交互）
  const blocks = D.stores.map((s, i) => {
    const el = <StoreBlock key={s.no} s={s} index={i} />;
    return s.dark ? <Dark key={s.no}>{el}</Dark> : el;
  });

  return (
    <>
      {/* 暖簾の入口（WebGL の布。使える端末だけ）: 最初の画面に藍の暖簾が掛かり、利用シーンの語が染め抜いてある。スクロール（またはタップ）で上がって、奥から主役の写真と題が現れる。
          布が使えない・動きを減らす・JS なしでは、この枠は何もせず、最初から写真と題が見える */}
      <Gate name={D.tag} units={D.gate} />
      <div className="pf-open">
        <div className="pf-open__in">
          <HeaderBar topHref={topHref} listHref={listHref} searchHref={searchHref} />

          {/* 巻頭: 主役の写真（大きく）+ 縦書きの題の札が重なる + 朱の丸 */}
          <section className={`pf-cover rp-cover${hero ? "" : " pf-cover--nophoto"}${small ? " rp-cover--sm" : ""}`} style={cover} aria-label="巻頭">
            {hero && (
              <div className="pf-cover__ph" style={{ "--cap": `${hero.cap}px` } as Fx}>
                <Fig p={hero} cls="pf-hero" rv={false} big />
                <Brush kind="wave" className="pf-cover__br" delay={0.5} />
              </div>
            )}
            <div className="pf-cover__t">
              <span className="pf-tag" aria-hidden="true">まとめ</span>
              <Seal className="pf-cover__seal" delay={0.9} />
              {D.subCols.length > 0 && <Tate cols={D.subCols} className="pf-sub" />}
              <Tate cols={T.cols} as="h1" className="pf-ttl" animate delay={0.15} emFrom={T.em} />
            </div>
            <p className="pf-cover__cap">
              <span className="pf-cover__name">
                <b>{FEATURE_KIND_ROUNDUP}</b>
                <span>{[D.tag, areaLabel].filter(Boolean).join("　")}</span>
              </span>
              {sceneSearch && (
                <Link href={sceneSearch.href} className="pf-btn pf-btn--sm pf-mag">
                  {sceneSearch.label} →
                </Link>
              )}
            </p>
          </section>
        </div>
      </div>

      {/* リード（記事の文そのまま。最初の数文だけ見せて、残りは開く） */}
      <section className="pf-lede" aria-label="導入">
        <Text t={D.lede} className="pf-lede__in pf-rv" />
      </section>

      {/* 店 ×N: 和紙の面と暗い面が交互。店 1 軒 = 1 区切り */}
      <div id="main" className="pf-body">
        {blocks}
      </div>

      {/* 締め（編集部の言葉）→ 特集の一覧・さがす */}
      <section className="pf-end rp-tail" aria-label="締めの文">
        <div className="pf-end__in pf-rv">
          {D.quote.length > 0 && (
            <blockquote className="pf-quote">
              {D.quote.map((x, i) => (
                <p key={i}>{x}</p>
              ))}
            </blockquote>
          )}
          {D.closing.head && <Text t={D.closing} className="pf-closing" />}
          {/* 締めの文の下に、筆の跡が引かれ、朱の印が押される */}
          <div className="pf-end__sig" aria-hidden="true">
            <Brush kind="dash" className="pf-end__brush" delay={0.1} reveal />
            <Seal className="pf-end__seal" delay={0.95} reveal />
          </div>
          <p className="pf-acts pf-acts--end rp-acts">
            <Link href={listHref} className="pf-btn pf-mag">
              特集の一覧へ →
            </Link>
            {searchBtns.map((b) => (
              <Link key={b.href} href={b.href} className="pf-btn pf-btn--ghost">
                {b.label} →
              </Link>
            ))}
          </p>
        </div>
      </section>

      {/* ほかのシーン別まとめ記事（同じ地域 → 同じ利用シーン → 並びの順。最大 3 本） */}
      {related.length > 0 && (
        <section className="pf-rel" aria-labelledby="pf-rel-h">
          <div className="pf-rel__in pf-rv">
            <h2 id="pf-rel-h" className="pf-rel__t">ほかの{FEATURE_KIND_ROUNDUP}</h2>
            <ul className="pf-rel__ul">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="pf-rel__a">
                    <span className="pf-rel__ph" aria-hidden="true">
                      {r.img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="pf-rel__img" src={sized(r.img, 640)} alt="" loading="lazy" decoding="async" />
                      )}
                    </span>
                    <span className="pf-rel__b">
                      <b>{r.title}</b>
                      <small>{[r.tag, r.area].filter(Boolean).join("　")}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <FooterBar />
      <RodAndHud topHref={topHref} listHref={listHref} searchHref={searchHref} />

      {/* 動き・大きく見る幕 */}
      <Motion />
    </>
  );
}
