"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ShopCard, { type CardShop } from "./ShopCard";
import { IcArrow, IcCal, IcChevL, IcChevR, IcGroup, IcHiker, IcPin, Mountain, Pines, Stamp } from "./Deco";
import { useFavList } from "./favs";
import { KINDS, REGION_GROUPS, SCENES, parseYmd, regionKeyOf, stateFor, weekendDays, ymdLabel, type DateFilter } from "./filters";
import { aLinks, searchUrl } from "./links";

/**
 * 探すページの本体(見本 83 の、左の絞り込み・右の結果・モデルコース・ページ送り)。クライアントの部品。
 * 絞り込みは実在の店に対して動く: 地方・都道府県・ジャンル(種類。店のある種類だけ)・体験スタイル・日付・お気に入りだけ(?fav=1)。
 * URL の引数(links.ts の SearchArgs)が最初の状態になる(最初のページ・テーマの丸・利用シーンの札などのリンク先)。
 *
 * 日付から探す: 店の営業日(営業時間・定休日の案内から作った OpenDay)で、その日に営業している店だけにする。
 * 営業日が案内から分からない店(営業時間の案内が無い・不定休など)は、勝手に除かず、勝手に営業とも決めず、
 * 結果の下に「営業日は店に確認」として分けて出す。今日の日付はブラウザの時計(ページを開いたあとに読む)。
 * 料金の絞り込みは、データが無いので出さない。
 */
export type CourseCard = { id: string; title: string; badge: string; tags: string[]; place: string; a: string; b: string; altA: string; altB: string };
export type Counts = Record<string, number>;

export type SearchInit = {
  kinds: string[];
  styles: string[];
  /** 地方の札のキー(REGION_GROUPS の key) */
  areas: string[];
  /** 都道府県のスラッグ */
  prefs: string[];
  q: string;
  when: "" | "weekend" | "nextweekend";
  date: string;
  fav: boolean;
};

type DateMode = "any" | "weekend" | "nextweekend" | "pick";

const PAGE_SIZE = 12;

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const n = new Set(set);
  if (n.has(v)) n.delete(v);
  else n.add(v);
  return n;
}

const norm = (s: string) => s.toLowerCase().normalize("NFKC");
const regionOf = (s: CardShop) => regionKeyOf(s.region);

export default function SearchBody({ shops, courses, init, prefNames }: { shops: CardShop[]; courses: CourseCard[]; init: SearchInit; prefNames: Record<string, string> }) {
  const [chip, setChip] = useState<string>("all");
  const [areas, setAreas] = useState<Set<string>>(new Set(init.areas));
  const [prefs, setPrefs] = useState<Set<string>>(new Set(init.prefs));
  const [prefOpen, setPrefOpen] = useState(init.prefs.length > 0);
  const [kinds, setKinds] = useState<Set<string>>(new Set(init.kinds));
  const [styles, setStyles] = useState<Set<string>>(new Set(init.styles));
  const [mode, setMode] = useState<DateMode>(init.date && parseYmd(init.date) ? "pick" : init.when || "any");
  const [dateStr, setDateStr] = useState(init.date && parseYmd(init.date) ? init.date : "");
  const [favOnly, setFavOnly] = useState(init.fav);
  const [q, setQ] = useState(init.q);
  const [sort, setSort] = useState("area");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(true);
  // 今日の日付(ブラウザの時計)。ページを開いたあとに読む(サーバーの描画と食い違わないように、それまでは日付の絞り込みをしない)
  const [now, setNow] = useState<Date | null>(null);
  const favs = useFavList();
  useEffect(() => {
    setNow(new Date());
    // スマホでは絞り込みをたたんで始める(PC は常に開いている)
    if (window.matchMedia("(max-width: 859px)").matches) setOpen(false);
  }, []);
  // 上の「シーンから探す」などの札(#fac-…)を押したら、絞り込みを開いてそこへ
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.slice(1);
      if (!id.startsWith("fac-")) return;
      setOpen(true);
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  const count = useMemo(() => {
    const c = { area: {} as Counts, pref: {} as Counts, kind: {} as Counts, style: {} as Counts };
    for (const s of shops) {
      c.area[regionOf(s)] = (c.area[regionOf(s)] ?? 0) + 1;
      c.kind[s.kind] = (c.kind[s.kind] ?? 0) + 1;
      for (const t of s.tags) c.style[t] = (c.style[t] ?? 0) + 1;
    }
    return c;
  }, [shops]);

  const prefList = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shops) m.set(s.pref, (m.get(s.pref) ?? 0) + 1);
    return [...m.entries()].map(([slug, n]) => ({ slug, n, name: prefNames[slug] ?? slug }));
  }, [shops, prefNames]);

  const filter: DateFilter = useMemo(() => {
    if (!now || mode === "any") return { kind: "none" };
    if (mode === "pick") {
      const ymd = parseYmd(dateStr);
      return ymd ? { kind: "date", ymd } : { kind: "none" };
    }
    return { kind: mode };
  }, [mode, dateStr, now]);

  const dateOn = filter.kind !== "none";

  const { open: shown, unknown } = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const base = shops.filter((s) => {
      if (chip !== "all" && regionOf(s) !== chip) return false;
      if (areas.size && !areas.has(regionOf(s))) return false;
      if (prefs.size && !prefs.has(s.pref)) return false;
      if (kinds.size && !kinds.has(s.kind)) return false;
      if (styles.size && !s.tags.some((t) => styles.has(t))) return false;
      if (favOnly && !favs.includes(s.id)) return false;
      if (words.length && !words.every((w) => norm(`${s.name} ${s.prefName} ${s.city} ${s.kindName} ${s.tags.join(" ")}`).includes(w))) return false;
      return true;
    });
    const opened: CardShop[] = [];
    const unk: CardShop[] = [];
    for (const s of base) {
      if (!dateOn) {
        opened.push(s);
        continue;
      }
      const st = stateFor(s.open, filter, now ?? undefined);
      if (st === "open") opened.push(s);
      else if (st === "unknown") unk.push(s);
    }
    const order = (x: CardShop) => REGION_GROUPS.findIndex((g) => g.key === regionOf(x));
    const by = (a: CardShop, b: CardShop) => (sort === "name" ? a.name.localeCompare(b.name, "ja") : order(a) - order(b) || (a.id < b.id ? -1 : 1));
    return { open: [...opened].sort(by), unknown: [...unk].sort(by) };
  }, [shops, chip, areas, prefs, kinds, styles, favOnly, favs, q, filter, dateOn, now, sort]);

  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const pageList = shown.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const reset = () => {
    setChip("all");
    setAreas(new Set());
    setPrefs(new Set());
    setKinds(new Set());
    setStyles(new Set());
    setMode("any");
    setDateStr("");
    setFavOnly(false);
    setQ("");
    setPage(1);
  };
  // 絞り込みを変えたら 1 ページ目へ
  const upd = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const dateNote = useMemo(() => {
    if (!now || !dateOn) return "";
    if (filter.kind === "date") return ymdLabel(filter.ymd);
    const [a, b] = weekendDays(filter.kind, now);
    return `${filter.kind === "weekend" ? "今週末" : "来週末"}(${ymdLabel(a)}・${ymdLabel(b)})`;
  }, [filter, now, dateOn]);

  const minDate = now ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}` : undefined;
  const pickMode = (m: DateMode) => upd<DateMode>(setMode)(mode === m ? "any" : m);

  const showFavWait = favOnly && now === null; // お気に入りは、端末の保存を読むまで(空の案内を出さない)

  return (
    <div className="s-body">
      <aside className="s-side" aria-label="絞り込み検索">
        <details className="s-side-d" open={open}>
          <summary
            className="s-side-sum"
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
          >
            <span className="s-side-title">絞り込み検索</span>
          </summary>
          <Stamp id="lets" className="s-side-stamp" lines={["LET'S", "EXPLORE"]} mountain={false} />
          <div className="s-fac s-fac-area" id="fac-area">
            <h3>
              <IcPin /> エリア
            </h3>
            <img className="s-fac-map" src="/_portal/activity/se-map.webp" alt="" />
            <div className="s-fac-deco" aria-hidden="true">
              <Pines className="s-fac-pines" />
              <Mountain className="s-fac-mtn" />
            </div>
            <ul>
              {REGION_GROUPS.map((g) => (
                <li key={g.key}>
                  <label className={(count.area[g.key] ?? 0) === 0 ? "is-zero" : undefined}>
                    <input type="checkbox" checked={areas.has(g.key)} disabled={(count.area[g.key] ?? 0) === 0} onChange={() => upd(setAreas)(toggle(areas, g.key))} />
                    <i />
                    {g.name}
                    <small>({count.area[g.key] ?? 0})</small>
                  </label>
                </li>
              ))}
            </ul>
            <button type="button" className="s-fac-more" aria-expanded={prefOpen} aria-controls="fac-prefs" onClick={() => setPrefOpen(!prefOpen)}>
              エリアを選択する <b>{prefOpen ? "−" : "+"}</b>
            </button>
            {prefOpen ? (
              <ul className="s-fac-prefs" id="fac-prefs" aria-label="都道府県">
                {prefList.map((p) => (
                  <li key={p.slug}>
                    <label>
                      <input type="checkbox" checked={prefs.has(p.slug)} onChange={() => upd(setPrefs)(toggle(prefs, p.slug))} />
                      <i />
                      {p.name}
                      <small>({p.n})</small>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="s-fac s-fac-date" id="fac-date">
            <h3>
              <IcCal /> 日付
            </h3>
            <ul>
              <li>
                <label>
                  <input type="checkbox" checked={mode === "any"} onChange={() => upd<DateMode>(setMode)("any")} />
                  <i />
                  いつでも
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" checked={mode === "weekend"} onChange={() => pickMode("weekend")} />
                  <i />
                  今週末
                </label>
              </li>
              <li>
                <label>
                  <input type="checkbox" checked={mode === "nextweekend"} onChange={() => pickMode("nextweekend")} />
                  <i />
                  来週末
                </label>
              </li>
              <li className="s-fac-pick">
                <label>
                  <input type="checkbox" checked={mode === "pick"} onChange={() => pickMode("pick")} />
                  <i />
                  日付を指定する
                  <IcCal className="s-fac-pick-ic" />
                </label>
              </li>
              {mode === "pick" ? (
                <li className="s-fac-dateinput">
                  <input type="date" value={dateStr} min={minDate} onChange={(e) => upd(setDateStr)(e.target.value)} aria-label="営業しているか確かめる日付" />
                </li>
              ) : null}
            </ul>
          </div>
          <div className="s-fac s-fac-genre" id="fac-genre">
            <h3>
              <IcHiker /> ジャンル
            </h3>
            <Pines className="s-fac-genre-pines" />
            <ul>
              {KINDS.filter((k) => (count.kind[k.slug] ?? 0) > 0).map((k) => (
                <li key={k.slug}>
                  <label>
                    <input type="checkbox" checked={kinds.has(k.slug)} onChange={() => upd(setKinds)(toggle(kinds, k.slug))} />
                    <i />
                    {k.name}
                    <small>({count.kind[k.slug] ?? 0})</small>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="s-fac s-fac-style" id="fac-style">
            <h3>
              <IcGroup /> 体験スタイル
            </h3>
            <ul>
              {SCENES.map((t) => (
                <li key={t.slug}>
                  <label className={(count.style[t.name] ?? 0) === 0 ? "is-zero" : undefined}>
                    <input type="checkbox" checked={styles.has(t.name)} disabled={(count.style[t.name] ?? 0) === 0} onChange={() => upd(setStyles)(toggle(styles, t.name))} />
                    <i />
                    {t.name}
                    <small>({count.style[t.name] ?? 0})</small>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <button type="button" className="s-side-go" onClick={reset}>
            条件をリセットする
          </button>
        </details>
      </aside>

      <section className="s-main" aria-label="検索結果">
        <div className="s-res-head">
          <p className="s-res-n">
            <b>{shown.length}</b>件のアクティビティが見つかりました
          </p>
          <Pines className="s-res-pines" />
          <label className="s-sort">
            <span>並べ替え</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="並べ替え">
              <option value="area">エリア順</option>
              <option value="name">店名順</option>
            </select>
          </label>
        </div>
        <div className="s-chips">
          <button type="button" className={`s-chip${chip === "all" ? " is-on" : ""}`} onClick={() => upd(setChip)("all")}>
            すべて
          </button>
          {REGION_GROUPS.map((g) => (
            <button key={g.key} type="button" className={`s-chip${chip === g.key ? " is-on" : ""}`} onClick={() => upd(setChip)(g.key)}>
              {g.name}
            </button>
          ))}
        </div>
        <Mountain className="s-res-mtn" />

        {favOnly || dateOn || q ? (
          <p className="s-note" role="status">
            {favOnly ? <span>お気に入りに入れた体験だけを表示しています。</span> : null}
            {dateOn && dateNote ? <span>{dateNote}に営業している体験を表示しています(祝日・臨時休業は反映していません)。</span> : null}
            {q ? <span>「{q}」を含む体験を表示しています。</span> : null}
            {favOnly || q ? (
              <button
                type="button"
                className="s-note-x"
                onClick={() => {
                  setFavOnly(false);
                  setQ("");
                  setPage(1);
                }}
              >
                {favOnly ? "すべての体験を見る" : "解除する"}
              </button>
            ) : null}
          </p>
        ) : null}

        {showFavWait ? null : pageList.length > 0 ? (
          <div className="s-grid">
            {pageList.map((s) => (
              <ShopCard key={s.id} s={s} variant="list" />
            ))}
          </div>
        ) : (
          <p className="s-empty">
            {favOnly && favs.length === 0
              ? "お気に入りに入れた体験は、まだありません。札のハートを押すと、この端末に保存されます。"
              : dateOn && unknown.length > 0
                ? "この日に営業していると確かめられた体験は、いま掲載がありません。下の「営業日は店に確認」の店は、店に確かめてください。"
                : "条件に合う体験は、いま掲載がありません。条件を変えてみてください。"}
          </p>
        )}

        {dateOn && unknown.length > 0 && !showFavWait ? (
          <section className="s-unk" aria-label="営業日は店に確認">
            <h2 className="s-unk-t">
              営業日は店に確認<small>({unknown.length}件)</small>
            </h2>
            <p className="s-unk-p">営業時間・定休日の案内から、この日に営業するかどうかを決められなかった体験です。上の件数には入れていません。店の公式サイトなどで確かめてください。</p>
            <div className="s-grid">
              {unknown.map((s) => (
                <ShopCard key={s.id} s={s} variant="list" note="営業日は店に確認" />
              ))}
            </div>
          </section>
        ) : null}

        <section className="s-course" id="course" aria-label="モデルコースで探す">
          <div className="s-course-head">
            <svg className="s-course-flag" viewBox="0 0 40 36" fill="none" stroke="#0d4580" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 33V4M6 6c8-3 12 3 20 0l8 2-5 7 5 6c-8 3-12-3-20 0" />
            </svg>
            <h2>モデルコースで探す</h2>
            <p className="s-course-en">MODEL COURSE</p>
            <p className="s-course-sub">複数の体験を組み合わせて、もっと特別な1日に。</p>
            <Link href={searchUrl()} className="s-course-more">
              もっと見る <IcArrow />
            </Link>
          </div>
          <ul className="s-course-list">
            {courses.map((c) => (
              <li key={c.id}>
                <Link href={aLinks.shop(c.id)} className="s-course-card">
                  <span className="s-course-ph">
                    <img className="s-course-a" src={c.a} alt={c.altA} loading="lazy" />
                    <img className="s-course-b" src={c.b} alt={c.altB} loading="lazy" />
                    {c.badge ? (
                      <span className="s-course-badge">
                        <span>{c.badge}</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="s-course-t">{c.title}</span>
                  <span className="s-course-tags">
                    {c.tags.map((t) => (
                      <i key={t}>{t}</i>
                    ))}
                  </span>
                  <span className="s-course-place">
                    <IcPin />
                    {c.place}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <span className="s-course-next" aria-hidden="true">
            <IcChevR />
          </span>
        </section>

        <nav className="s-pager" aria-label="ページ送り">
          {cur > 1 ? (
            <button type="button" className="s-pg s-pg-arrow apa-btn-reset is-live" aria-label="前のページ" onClick={() => setPage(cur - 1)}>
              <IcChevL />
            </button>
          ) : (
            <span className="s-pg s-pg-arrow" aria-disabled="true">
              <IcChevL />
            </span>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
            n === cur ? (
              <span key={n} className="s-pg is-on" aria-current="page">
                {n}
              </span>
            ) : (
              <button key={n} type="button" className="s-pg apa-btn-reset is-live" aria-label={`${n}ページ`} onClick={() => setPage(n)}>
                {n}
              </button>
            ),
          )}
          {cur < pages ? (
            <button type="button" className="s-pg s-pg-arrow apa-btn-reset is-live" aria-label="次のページ" onClick={() => setPage(cur + 1)}>
              <IcChevR />
            </button>
          ) : (
            <span className="s-pg s-pg-arrow" aria-disabled="true">
              <IcChevR />
            </span>
          )}
        </nav>
        <p className="s-hand apa-hand">
          さあ、つぎは
          <br />
          どんな体験にでかけよう?
        </p>
        <div className="s-hand-r">
          <small>MACHINOWA ACTIVITY</small>
          <p className="apa-hand">
            あたらしい景色が、
            <br />
            きっと待ってる。
          </p>
          <Stamp id="srch-bn" className="s-hand-stamp" mountain wave />
        </div>
      </section>
    </div>
  );
}
