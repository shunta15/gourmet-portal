/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import type { GnArticleVM } from "@/components/portal/gnoren/real/common/types";
import { GN_LIVE_LINKS, type GnLinks } from "@/components/portal/gnoren/common/nav";
import FeatureReveal from "@/components/portal/gnoren/feature/FeatureReveal";
import { PinIcon, PhoneIcon, ClockIcon, ShopIcon, ArrowIcon, BowlIcon, LeafLine } from "@/components/portal/gnoren/feature/icons";
import { sized, sizedSrcSet } from "@/lib/imageUrl";
import "./real.css";

/**
 * 特集記事(見本 4「店の特集記事」)の実データ版。GnArticleVM を受けて描く(店 1 軒・シーン別まとめ・街歩きの 3 種とも同じ部品)。
 * 設計: components/portal/gnoren/REAL_PLAN.md「特集記事」/ 見た目の元: ../../feature/FeatureArticle.tsx と feature.css(試作は見本の座標の絶対配置。こちらは可変高さ)。
 * - PC: 章の組(番号+罫+ラベル / h2 / 本文 / 写真 0〜3 枚 / メモ紙)を 見本の章 01・02・03 の配置で、章の数だけ A→B→C→A… と縦に繰り返す。
 * - スマホ(≤768px): 縦 1 列(試作の feature.css の作法)。
 * - サーバー部品(データは props で受けるだけ)。動きは試作の FeatureReveal(クライアント・データ無し)を使う。
 */

const IMG = "/_portal/gnoren/feature"; // 飾りだけ(葉・街並み線画)。見本から切り出した店・料理・人物の写真は使わない
const ROOT_ID = "gn-feat-r-root";

/** 、。」の右半分と「の左半分の空きを詰める(見本の約物は詰めてある。試作の Jp と同じ) */
function T({ t }: { t: string }) {
  return (
    <>
      {t.split(/([、。」』）「『（])/).map((tok, j) =>
        /[、。」』）]/.test(tok) ? (
          <span key={j} className="gn-feat-r-pr">
            {tok}
          </span>
        ) : /[「『（]/.test(tok) ? (
          <span key={j} className="gn-feat-r-pl">
            {tok}
          </span>
        ) : (
          tok
        ),
      )}
    </>
  );
}

const len = (s: string) => Array.from(s).length;

/** 写真 1 枚。/restaurants/ の自前の写真と Wikimedia は縮小版(sized/sizedSrcSet)、外部 URL はそのまま。ファーストビュー以外は lazy */
function Photo({ p, w, sizes, eager }: { p: { src: string; alt: string }; w: number; sizes: string; eager?: boolean }) {
  const srcSet = sizedSrcSet(p.src);
  return (
    <img
      src={sized(p.src, w)}
      {...(srcSet ? { srcSet, sizes } : {})}
      alt={p.alt}
      loading={eager ? undefined : "lazy"}
      decoding="async"
      {...(eager ? { fetchPriority: "high" as const } : {})}
    />
  );
}

/** 縦の短冊 3 本 = 導入文の中の短い句(、。で区切り 4〜12 字。英数字を含むものは除く)。足りなければ本数を減らす(作らない) */
function stripsOf(lede: string[]): string[] {
  const out: string[] = [];
  for (const p of lede) {
    for (const c of p.split(/[、。]/)) {
      const t = c.replace(/[「」『』（）\s]/g, "");
      const n = len(t);
      if (n >= 4 && n <= 12 && !/[A-Za-z0-9０-９]/.test(t)) out.push(t);
      if (out.length === 3) return out;
    }
  }
  return out;
}

/** 店舗情報の 1 行。住所・電話・営業時間・定休日は値だけにアイコンを付け、それ以外は項目名を小さく添える */
function InfoRow({ k, v }: { k: string; v: string }) {
  let icon: ReactNode = null;
  if (/住所|所在地/.test(k)) icon = <PinIcon className="gn-feat-r-ic" />;
  else if (/電話|TEL/i.test(k)) icon = <PhoneIcon className="gn-feat-r-ic" />;
  else if (/営業/.test(k)) icon = <ClockIcon className="gn-feat-r-ic" />;
  else if (/定休|休業/.test(k)) icon = <ShopIcon className="gn-feat-r-ic" />;
  const tel = icon && /電話|TEL/i.test(k) && /^[\d\-+()\s]+$/.test(v) ? v.replace(/[^\d+]/g, "") : null;
  return (
    <li>
      {icon ?? <span className="gn-feat-r-ik">{k}</span>}
      {icon && <span className="gn-feat-r-sr">{k}</span>}
      <span className="gn-feat-r-iv">{tel ? <a href={`tel:${tel}`}>{v}</a> : v}</span>
    </li>
  );
}

function GoLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="gn-feat-r-btn">
      <span>{children}</span>
      <ArrowIcon className="gn-feat-r-btn-arrow" />
    </Link>
  );
}

type Chapter = GnArticleVM["chapters"][number];

/** 章の本文。最初の段落は見出しの下(写真の横)、残りは写真の下に広げる(長い本文でも写真の横に空きを作らない) */
function Chapter({ c, i }: { c: Chapter; i: number }) {
  const pat = (["A", "B", "C"] as const)[i % 3];
  const photos = c.photos.slice(0, 3);
  const n = photos.length;
  const lead = c.body.slice(0, 1);
  const rest = c.body.slice(1);
  const restChars = rest.reduce((a, p) => a + len(p), 0);
  const cols2 = rest.length >= 2 && restChars > (n === 0 ? 100 : 240); // 写真の無い章は、残りを 2 段に広げて右の空きを減らす(段落が 1 つだけなら 2 段に割れず片側が空くので広げない)
  const hid = `gn-feat-r-h${i}`;
  const fig = (p: { src: string; alt: string }, k: number, w: number, sizes: string) => (
    <figure key={k} className="gn-feat-r-fig" data-k={k} data-rv>
      <Photo p={p} w={w} sizes={sizes} />
    </figure>
  );
  const note = c.note ? (
    <aside className="gn-feat-r-note" data-rv="note">
      <div className="gn-feat-r-paper gn-feat-r-grain">
        <p>
          <T t={c.note} />
        </p>
      </div>
    </aside>
  ) : null;

  let main: ReactNode = null; // A だけ: 左の大きな写真
  let cluster: ReactNode;
  let noteOnMain: ReactNode = null; // A で写真が大きな 1 枚だけのとき: メモ紙は右の空き(右上)でなく、大きな写真の右下に重ねる
  if (pat === "A") {
    if (n >= 1) main = fig(photos[0], 0, 640, "(max-width: 768px) 100vw, 480px");
    if (n === 1) noteOnMain = note;
    cluster = (
      <div className="gn-feat-r-ph">
        {n >= 2 && <div className="gn-feat-r-row">{photos.slice(1).map((p, k) => fig(p, k + 1, 480, "(max-width: 768px) 50vw, 240px"))}</div>}
        {n === 1 ? null : note}
      </div>
    );
  } else if (pat === "B") {
    cluster = (
      <div className="gn-feat-r-ph">
        {n >= 1 && (
          <div className="gn-feat-r-row">
            {fig(photos[0], 0, 960, "(max-width: 768px) 100vw, 600px")}
            {n >= 2 && <div className="gn-feat-r-stack">{photos.slice(1).map((p, k) => fig(p, k + 1, 480, "(max-width: 768px) 50vw, 320px"))}</div>}
          </div>
        )}
        {note}
      </div>
    );
  } else {
    cluster = (
      <div className="gn-feat-r-ph">
        {n >= 1 && (
          <div className="gn-feat-r-row">
            {photos.map((p, k) => fig(p, k, k === 0 ? 960 : 480, k === 0 ? "(max-width: 768px) 100vw, 520px" : "(max-width: 768px) 50vw, 240px"))}
          </div>
        )}
        {note}
      </div>
    );
  }

  return (
    <section className={`gn-feat-r-ch gn-feat-r-p${pat} gn-feat-r-n${n}${c.note ? " has-note" : ""}`} aria-labelledby={hid}>
      <div className="gn-feat-r-copy" data-rv>
        <p className="gn-feat-r-head">
          <span className="gn-feat-r-num">{c.no}</span>
          <span className="gn-feat-r-rule" aria-hidden="true" />
          {c.label && <span className="gn-feat-r-label">{c.label}</span>}
        </p>
        <h2 className="gn-feat-r-h" id={hid}>
          <T t={c.heading} />
        </h2>
        <div className="gn-feat-r-body">
          {lead.map((p, k) => (
            <p key={k}>
              <T t={p} />
            </p>
          ))}
        </div>
      </div>
      {main}
      {noteOnMain}
      {cluster}
      {(rest.length > 0 || c.shop) && (
        <div className="gn-feat-r-more">
          {rest.length > 0 && (
            <div className={`gn-feat-r-body gn-feat-r-cols${cols2 ? " is-2" : ""}`} data-rv>
              {rest.map((p, k) => (
                <p key={k}>
                  <T t={p} />
                </p>
              ))}
            </div>
          )}
          {c.shop && (
            <div className="gn-feat-r-shopc" data-rv>
              <p className="gn-feat-r-shopc-name">
                <BowlIcon className="gn-feat-r-bowl" />
                <span>
                  <T t={c.shop.name} />
                </span>
              </p>
              {c.shop.info.length > 0 && (
                <ul className="gn-feat-r-info">
                  {c.shop.info.map(([k, v], j) => (
                    <InfoRow key={j} k={k} v={v} />
                  ))}
                </ul>
              )}
              {c.shop.href && <GoLink href={c.shop.href}>店ページを見る</GoLink>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ArticleView({ vm, links = GN_LIVE_LINKS }: { vm: GnArticleVM; links?: GnLinks }) {
  const tl = len(vm.title);
  const titleLv = tl <= 8 ? 0 : tl <= 14 ? 1 : tl <= 24 ? 2 : 3;
  const sl = vm.subtitle ? len(vm.subtitle) : 0;
  const subLv = sl <= 14 ? 0 : sl <= 26 ? 1 : 2;
  const strips = stripsOf(vm.lede);
  // 写真 0 枚の章が 3 章以上続かないよう、2 章ごとに(引用 → 章のメモ紙 → 店の箱 の順で)既にある要素を章の間に置く。文は足さない。
  const chapters = vm.chapters.map((c) => ({ ...c }));
  const quoteAt = vm.quote ? Math.min(1, chapters.length - 1) : -1;
  const inter: Array<null | { kind: "note"; text: string } | { kind: "shop" }> = chapters.map(() => null);
  let shopMoved = false;
  let run = 0;
  chapters.forEach((c, i) => {
    run = c.photos.length === 0 ? run + 1 : 0;
    if (i === quoteAt) {
      run = 0;
      return;
    }
    if (run < 2 || i >= chapters.length - 1) return;
    let at = -1;
    for (let j = i; j > i - run; j--) {
      if (chapters[j].note) {
        at = j;
        break;
      }
    }
    if (at >= 0) {
      inter[i] = { kind: "note", text: chapters[at].note as string };
      chapters[at].note = undefined;
      run = 0;
    } else if (vm.shop && !shopMoved) {
      inter[i] = { kind: "shop" };
      shopMoved = true;
      run = 0;
    }
  });
  const quoteLong = vm.quote ? len(vm.quote.text) > 70 : false;
  const closingChars = (vm.closing ?? []).reduce((a, p) => a + len(p), 0);
  const shopInBand = !!vm.shop && !shopMoved;
  const hasBand = (vm.closing && vm.closing.length > 0) || shopInBand;

  return (
    <main className="gn-feat-r" id={ROOT_ID}>
      <FeatureReveal rootId={ROOT_ID} />

      {/* ───────── ヒーロー ───────── */}
      <header className="gn-feat-r-hero">
        {vm.hero ? (
          <div className="gn-feat-r-hero-bg">
            <Photo p={vm.hero} w={1600} sizes="(max-width: 768px) 100vw, 938px" eager />
          </div>
        ) : (
          <div className="gn-feat-r-hero-bg gn-feat-r-nohero gn-linen" aria-hidden="true" />
        )}

        <nav className="gn-feat-r-crumb" aria-label="パンくず">
          <Link href={links.top}>トップ</Link>
          <i aria-hidden="true">&gt;</i>
          <Link href={links.feature}>特集</Link>
          <i aria-hidden="true">&gt;</i>
          <span aria-current="page">{vm.title}</span>
        </nav>

        <div className="gn-feat-r-card">
          <div className="gn-feat-r-card-bg gn-feat-r-grain" aria-hidden="true" />
          <span className="gn-feat-r-tag" data-rv="note" style={{ ["--rot" as string]: "-9.5deg" }}>
            <span className="gn-feat-r-tag-in">特集</span>
          </span>
          {vm.kicker && <p className="gn-feat-r-lead">{vm.kicker}</p>}
          <h1 className="gn-feat-r-title" data-lv={titleLv}>
            <T t={vm.title} />
          </h1>
          {vm.subtitle && (
            <p className="gn-feat-r-sub" data-lv={subLv}>
              <T t={vm.subtitle} />
            </p>
          )}
          <div className="gn-feat-r-intro">
            {vm.lede.map((p, k) => (
              <p key={k}>
                <T t={p} />
              </p>
            ))}
          </div>
          <time className="gn-feat-r-date" dateTime={vm.date.replace(/\./g, "-")}>
            {vm.date}
          </time>
        </div>

        <div className="gn-feat-r-panel">
          <div className="gn-feat-r-panel-bg gn-feat-r-grain" aria-hidden="true" />
          <p className="gn-feat-r-script gn-script" aria-label="MACHINOWA GOURMET">
            <span>MACHINOWA</span>
            <span>GOURMET</span>
          </p>
          {strips.length > 0 && (
            <div className="gn-feat-r-strips">
              {strips.map((s, k) => (
                <p key={k} className={`gn-feat-r-strip gn-feat-r-strip-${"abc"[k]}`} style={{ ["--n" as string]: len(s) }} data-rv>
                  {s}
                </p>
              ))}
            </div>
          )}
          <img className="gn-feat-r-town" src={`${IMG}/townscape.webp`} alt="" aria-hidden="true" width={444} height={306} />
        </div>
      </header>

      {/* ───────── 章 ───────── */}
      {chapters.map((c, i) => (
        <div key={i} className="gn-feat-r-chwrap">
          <Chapter c={c} i={i} />
          {inter[i]?.kind === "note" && (
            <aside className="gn-feat-r-quote gn-feat-r-inter" data-rv="note" style={{ ["--rot" as string]: "1.6deg" }}>
              <div className="gn-feat-r-paper gn-feat-r-grain">
                <p>
                  <T t={(inter[i] as { text: string }).text} />
                </p>
              </div>
            </aside>
          )}
          {inter[i]?.kind === "shop" && vm.shop && (
            <div className="gn-feat-r-inter gn-feat-r-inter-shop" data-rv>
              <div className="gn-feat-r-shopc">
                <p className="gn-feat-r-shopc-name">
                  <BowlIcon className="gn-feat-r-bowl" />
                  <span>
                    <T t={vm.shop.name} />
                  </span>
                </p>
                {vm.shop.info.length > 0 && (
                  <ul className="gn-feat-r-info">
                    {vm.shop.info.map(([k, v], j) => (
                      <InfoRow key={j} k={k} v={v} />
                    ))}
                  </ul>
                )}
                <GoLink href={vm.shop.href}>店舗の詳細を見る</GoLink>
              </div>
            </div>
          )}
          {vm.quote && i === quoteAt && (
            <aside className="gn-feat-r-quote" data-rv="note" style={{ ["--rot" as string]: "-2.2deg" }}>
              <figure className={`gn-feat-r-paper gn-feat-r-grain${quoteLong ? " is-long" : ""}`}>
                <blockquote>
                  <T t={vm.quote.text} />
                </blockquote>
                {vm.quote.cite && <figcaption>― {vm.quote.cite}</figcaption>}
              </figure>
            </aside>
          )}
        </div>
      ))}

      {/* ───────── 下の帯(まとめの文・店舗情報) ───────── */}
      {hasBand && (
        <section className={`gn-feat-r-band${shopInBand ? " has-shop" : ""}`} aria-label={shopInBand ? "まとめと店舗情報" : "まとめ"}>
          <div className="gn-feat-r-band-bg gn-feat-r-grain" aria-hidden="true" />
          {vm.closing && vm.closing.length > 0 && (
            <div className="gn-feat-r-closing" data-rv>
              <div className={`gn-feat-r-closing-in gn-feat-r-grain${closingChars > 300 ? " is-2" : ""}`}>
                <div className="gn-feat-r-closing-t">
                  {vm.closing.map((p, k) => (
                    <p key={k}>
                      <T t={p} />
                    </p>
                  ))}
                </div>
                <LeafLine className="gn-feat-r-leafline" />
              </div>
            </div>
          )}
          {vm.shop && shopInBand && (
            <div className="gn-feat-r-shop" data-rv>
              <p className="gn-feat-r-shop-label">店舗情報</p>
              <p className="gn-feat-r-shop-name">
                <BowlIcon className="gn-feat-r-bowl" />
                <span>
                  <T t={vm.shop.name} />
                </span>
              </p>
              {vm.shop.info.length > 0 && (
                <ul className="gn-feat-r-info">
                  {vm.shop.info.map(([k, v], j) => (
                    <InfoRow key={j} k={k} v={v} />
                  ))}
                </ul>
              )}
              <GoLink href={vm.shop.href}>店舗の詳細を見る</GoLink>
            </div>
          )}
          <img className="gn-feat-r-leaf gn-feat-r-leaf-tr" src={`${IMG}/leaf-tr.webp`} alt="" aria-hidden="true" width={202} height={280} />
          <img className="gn-feat-r-leaf gn-feat-r-leaf-bl" src={`${IMG}/leaf-bl.webp`} alt="" aria-hidden="true" width={140} height={256} />
        </section>
      )}

      {/* ───────── 関連記事 ───────── */}
      {vm.related.length > 0 && (
        <section className="gn-feat-r-rel" aria-labelledby="gn-feat-r-rel-h">
          <p className="gn-feat-r-head" data-rv>
            <span className="gn-feat-r-label" id="gn-feat-r-rel-h">
              関連記事
            </span>
            <span className="gn-feat-r-rule" aria-hidden="true" />
          </p>
          <ul className="gn-feat-r-rel-list">
            {vm.related.map((r) => (
              <li key={r.id} data-rv>
                <Link href={r.href} className="gn-feat-r-rel-card">
                  {r.img && (
                    <span className="gn-feat-r-rel-img">
                      <Photo p={{ src: r.img, alt: "" }} w={640} sizes="(max-width: 768px) 100vw, 340px" />
                    </span>
                  )}
                  <span className="gn-feat-r-rel-t">
                    <T t={r.title} />
                  </span>
                  {r.date && <time className="gn-feat-r-rel-d">{r.date}</time>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
