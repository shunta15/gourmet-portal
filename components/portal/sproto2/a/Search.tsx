import Link from "next/link";
import Header from "./Header";
import { IcArrow, IcCheck, IcChev, IcDown, IcPin, IcRefresh, IcSearch } from "./Icons";
import { KINDS, PREF_OPTIONS, type SShop } from "./data";

/* eslint-disable @next/next/no-img-element */
const P = "/_portal/sproto2/a/";
const S = "/proto-sports/search";
const FEATURES = ["駐車場あり", "女性専用エリアあり", "パーソナルトレーニング", "スタジオプログラム", "シャワーあり"];
const VLAB: Record<string, string> = { gym: "GYM & FITNESS", "martial-arts": "MARTIAL ARTS", golf: "GOLF" };

function Card({ s, big }: { s: SShop; big?: boolean }) {
  return (
    <Link href={s.href} className={`s2-rc s2-rc-${s.kindSlug}${big ? " s2-rc-big" : ""}`}>
      <span className="s2-rc-lab">
        <span>{VLAB[s.kindSlug] ?? s.kindEn}</span>
      </span>
      <span className="s2-rc-ph">
        <img src={s.photo} alt={s.name} style={{ objectPosition: s.pos }} loading="lazy" />
      </span>
      <span className="s2-rc-bd">
        <b>{s.name}</b>
        <small>{s.loc}</small>
        <IcArrow className="s2-rc-ar" />
      </span>
    </Link>
  );
}

/** 探すページ(見本 2_探す)。条件は URL の引数(f・kind・pref・city・q)、絞り込みはサーバーで動く。設備・特徴は見た目だけ(店のデータに無い) */
export default function Search({
  shops,
  all,
  checked,
  sp,
}: {
  shops: SShop[];
  all: SShop[];
  checked: string[];
  sp: { pref?: string; city?: string; q?: string };
}) {
  const [first, ...others] = shops;
  const cities = Array.from(new Set(all.filter((s) => !sp.pref || s.pref === sp.pref).map((s) => s.city)));
  const count = (k: string) => all.filter((s) => s.kindSlug === k).length;
  return (
    <main className="s2-page s2-sr">
      <Header variant="search" active="search" />
      <h1 className="s2-sr">
        <img className="s2-banner" src={`${P}s-banner.webp`} alt="気になる場所を、探しにいこう。ジム・フィットネス、格闘技・武道、ゴルフ。あなたのまちのスポーツ施設を見つけて、新しい一歩をはじめよう。" width={1024} height={327} />
      </h1>

      <div className="s2-bar">
        <form className="s2-bar-f" action={S} method="get" role="search">
          <IcSearch className="s2-bar-ic" />
          <input type="text" name="q" defaultValue={sp.q ?? ""} aria-label="エリア・駅名・施設名で検索" placeholder="エリア・駅名・施設名で検索" />
          <button type="submit">検索</button>
        </form>
        <Link href="/map" className="s2-bar-loc">
          <IcPin />
          <span>現在地から探す</span>
          <IcArrow />
        </Link>
      </div>

      <nav className="s2-kinds" aria-label="カテゴリから探す">
        {KINDS.map((k, i) => (
          <Link key={k.slug} href={`${S}?f=1&kind=${k.slug}`} className={`s2-kinds-i s2-kinds-${k.slug}`}>
            <img src={`${P}s-ic${i + 1}.webp`} alt="" width={52} height={44} />
            <span>
              <b>{k.name}</b>
              <small>{k.en}</small>
            </span>
            <IcChev />
          </Link>
        ))}
      </nav>

      <div className="s2-main">
        <form className="s2-flt" action={S} method="get">
          <input type="hidden" name="f" value="1" />
          <h2>条件で絞り込む</h2>
          <div className="s2-flt-b">
            <h3>
              <IcPin className="s2-flt-pin" />
              エリア
            </h3>
            <div className="s2-sel">
              <select name="pref" aria-label="都道府県を選択" defaultValue={sp.pref ?? ""}>
                <option value="">都道府県を選択</option>
                {PREF_OPTIONS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              <IcDown />
            </div>
            <div className="s2-sel">
              <select name="city" aria-label="市区町村を選択" defaultValue={sp.city ?? ""}>
                <option value="">市区町村を選択</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <IcDown />
            </div>
            <h3 className="s2-flt-h2">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3h6v2.2c2 .5 3.5 2.3 3.5 4.4 0 1-.3 1.9-.9 2.7H18c1.7 0 3 1.3 3 3V20H3v-4.7c0-1.7 1.3-3 3-3h.4c-.6-.8-.9-1.700-.9-2.700 0-2.100 1.500-3.900 3.500-4.400Z" /></svg>
              カテゴリ
            </h3>
            <ul className="s2-chk">
              {KINDS.map((k) => (
                <li key={k.slug}>
                  <label>
                    <input type="checkbox" name="kind" value={k.slug} defaultChecked={checked.includes(k.slug)} />
                    <i>
                      <IcCheck />
                    </i>
                    <span>
                      {k.name} <small>({count(k.slug)})</small>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <h3 className="s2-flt-h3">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm-3 4v10a2 2 0 0 0 2 2h9v1.500H7a3.500 3.500 0 0 1-3.500-3.500V8Z" /></svg>
              設備・特徴
            </h3>
            <ul className="s2-chk">
              {FEATURES.map((f) => (
                <li key={f}>
                  <label>
                    <input type="checkbox" />
                    <i>
                      <IcCheck />
                    </i>
                    <span>{f}</span>
                  </label>
                </li>
              ))}
            </ul>
            {sp.q ? <input type="hidden" name="q" value={sp.q} /> : null}
            <button type="submit" className="s2-flt-go">
              <span>この条件で検索</span>
              <IcArrow />
            </button>
            <Link href={S} className="s2-flt-clr">
              <IcRefresh />
              条件をリセット
            </Link>
          </div>
        </form>

        <section className="s2-res" aria-label="検索結果">
          <div className="s2-res-hd">
            <h2>
              検索結果<b>{shops.length}</b>件
            </h2>
          </div>
          <div className="s2-res-l">
            {first ? <Card s={first} big /> : <p className="s2-empty">条件に合う施設はありません。条件をリセットしてもう一度お試しください。</p>}
          </div>
          <div className="s2-res-r">
            <div className="s2-map">
              <img src={`${P}s-map.webp`} alt="" width={324} height={85} />
              <Link href="/map" className="s2-map-go" aria-label="地図で見る" />
            </div>
            {others.map((s) => (
              <Card key={s.id} s={s} />
            ))}
          </div>
        </section>
      </div>

      <Link href="/about" className="s2-bottom" aria-label="マチノワスポーツについて">
        <img src={`${P}s-bottom.webp`} alt="動く人が、まちをおもしろくする。スポーツがあると、日常がちょっと変わる。新しい自分に出会ったり、まちで仲間ができたり。マチノワスポーツは、地域のスポーツシーンを応援します。" width={1024} height={319} />
      </Link>
    </main>
  );
}
