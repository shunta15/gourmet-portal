import Link from "next/link";
import Header from "@/components/portal/bproto/colorplay/Header";
import Footer from "@/components/portal/bproto/colorplay/Footer";
import Heart from "@/components/portal/bproto/colorplay/Heart";
import { MiniCard } from "@/components/portal/bproto/colorplay/Cards";
import { IconChevron, IconPin } from "@/components/portal/bproto/colorplay/Icons";
import { loadDetail } from "@/lib/portal/bproto/colorplay/data";
import { BASE, searchHref } from "@/lib/portal/bproto/colorplay/types";

type SP = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const id = Array.isArray(sp.id) ? sp.id[0] : sp.id;
  const { detail: d, sameArea, sameKind } = await loadDetail(id);
  const s = d.shop;
  const big = d.photos[0];
  return (
    <>
      <Header />
      <div className="cp-wrap cp-shop-top" id="top">
        <div className="cp-shop-left">
          <nav className="cp-crumb" aria-label="パンくず">
            <Link href={BASE}>TOP</Link><IconChevron size={12} />
            <Link href={searchHref({ pref: s.pref })}>{s.prefName}</Link><IconChevron size={12} />
            <span>{s.city || s.prefName}</span><IconChevron size={12} />
            <span aria-current="page">{s.name}</span>
          </nav>
          <h1 className="cp-h1d"><span className="cp-line" style={{ ["--l" as string]: 0 }}>{s.name}</span></h1>
          {d.nameKana && <p className="cp-kana">{d.nameKana}</p>}
          <p className="cp-tags"><span className={`cp-tag k-${s.kind}`}>{s.kindName}</span></p>
          <p className="cp-addr cp-addr-l"><IconPin size={18} /><span>{s.address}{d.headline && (<><br /><small>{d.headline}</small></>)}</span></p>
        </div>
        <div className="cp-shop-right">
          <div className="cp-shop-photo" data-sp="p">
            {big && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={big.src} alt={big.alt} width={1024} height={683} fetchPriority="high" />
            )}
            <p className="cp-script cp-shop-sc" aria-hidden="true">Find Your Beauty<br />in Your Town.</p>
          </div>
          <div className="cp-cta">
            <Heart id={s.id} name={s.name} className="cp-heart-l" />
            <a className="cp-red" href={d.cta.href} target="_blank" rel="noopener noreferrer">
              {d.cta.label}<IconChevron size={18} />
            </a>
          </div>
        </div>
      </div>

      <nav className="cp-tabs cp-wrap" aria-label="ページ内の移動">
        <a href="#top" className="is-on">トップ</a>
        <a href="#photos">写真</a>
        <a href="#about">店について</a>
        <a href="#access">アクセス</a>
      </nav>

      <section className="cp-wrap cp-photos cp-rv" id="photos" aria-label="店の写真">
        <ul>
          {d.photos.slice(0, 4).map((p) => (
            <li key={p.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </section>

      <section className="cp-wrap cp-about" id="about">
        <div className="cp-about-t cp-rv">
          {d.headline && <h2 className="cp-h2d">{d.headline}</h2>}
          {d.lede && <p>{d.lede}</p>}
          {d.sections.map((x) => (
            <div key={x.heading} className="cp-sec">
              <h3>{x.heading}</h3>
              <p>{x.body}</p>
            </div>
          ))}
        </div>
        <aside className="cp-bluecard cp-rv" aria-hidden="true" style={{ ["--i" as string]: 1 }}>
          <p className="cp-script">Good Hair<br />&nbsp;&nbsp;&nbsp;Good Days.</p>
        </aside>
      </section>

      <section className="cp-wrap cp-access cp-rv" id="access">
        <h2 className="cp-h2">アクセス</h2>
        <dl>
          <div><dt>住所</dt><dd>{s.address}</dd></div>
          {d.hours && <div><dt>営業時間</dt><dd>{d.hours}</dd></div>}
          {d.holidays && <div><dt>定休日</dt><dd>{d.holidays}</dd></div>}
          {d.phone && <div><dt>電話</dt><dd><a href={`tel:${d.phone}`}>{d.phone}</a></dd></div>}
        </dl>
        <p><a className="cp-line-link" href={d.mapUrl ?? `https://www.google.com/maps/search/${encodeURIComponent(s.name + " " + s.address)}`} target="_blank" rel="noopener noreferrer">地図で見る</a></p>
      </section>

      {sameArea.length > 0 && (
        <section className="cp-wrap cp-more-shops">
          <h2 className="cp-h2 cp-rv">同じエリアのサロン</h2>
          <div className="cp-minis">{sameArea.map((x, i) => (<MiniCard key={x.id} s={x} i={i} />))}</div>
        </section>
      )}
      {sameKind.length > 0 && (
        <section className="cp-wrap cp-more-shops">
          <h2 className="cp-h2 cp-rv">同じ種類のサロン</h2>
          <div className="cp-minis">{sameKind.map((x, i) => (<MiniCard key={x.id} s={x} i={i} />))}</div>
        </section>
      )}
      <Footer />
    </>
  );
}
