"use client";
/**
 * 「写真から探す」の壁（絞り込み・写真の壁・押したときの大きな表示）。
 *   - 絞り込み: ジャンル × 都道府県。押すとその場で並び替わる（再読み込みなし）。URL の ?genre= ?pref= と同期（replaceState）。
 *     写真が 0 枚になる選択肢は出さない（もう一方の絞り込みの結果に対して数える）。
 *   - 壁: CSS Grid（lib/portal/photoWallShared.ts の layoutOf が各写真の列数・段数を決める）。位置は JS で測らない。
 *   - 押す: 店のページへのリンク（<a>）のまま、通常の左クリックだけ大きな表示（PhotoViewer）に差し替える。
 *     Ctrl/⌘/Shift クリック・中クリック・JS 無しでは、そのまま店のページへ行く。ブラウザの「戻る」で閉じる（履歴を1つ積む）。
 * 初期の絞り込みはサーバーが URL から決めて渡す（サーバーの HTML と最初の描画が同じになる）。
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gridArea, packAll, wallImg, wallSizes, type Placed, type WallCols, type WallData, type WallItem } from "@/lib/portal/photoWallShared";
import PhotoViewer from "./PhotoViewer";

/** 先頭から何枚を、すぐ読み込む写真にするか（最初の画面に入る分。残りは遅延読み込み） */
const EAGER = 6;
const PREF_FOLD = 11;

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Props {
  data: WallData;
  initial: { genre: string; pref: string };
}

/** 壁の1枚。絞り込みや開閉で親が再描画されても、写真の並びが同じなら作り直さない */
const Tile = memo(function Tile({
  it,
  i,
  at,
  where,
  onOpen,
  reg,
}: {
  it: WallItem;
  i: number;
  /** 列数ごとの置き場所（2・3・4・5 列） */
  at: Record<WallCols, Placed>;
  where: string;
  onOpen: (e: React.MouseEvent, id: string) => void;
  reg: (id: string, el: HTMLLIElement | null) => void;
}) {
  // どの列数でも大きな枠にならない写真は、1200 の大きい版を srcset に入れない
  const large = at[2].cs === 2 || at[3].cs === 2 || at[4].cs === 2 || at[5].cs === 2;
  const img = wallImg(it, large);
  return (
    <li
      className="mp-ph-t"
      ref={(el) => reg(it.id, el)}
      data-i={i < 18 ? i : undefined}
      data-large={at[5].cs === 2 ? "" : undefined}
      style={{
        ["--a2" as string]: gridArea(at[2]),
        ["--a3" as string]: gridArea(at[3]),
        ["--a4" as string]: gridArea(at[4]),
        ["--a5" as string]: gridArea(at[5]),
        ["--i" as string]: i < 18 ? i : 0,
      }}
    >
      <Link
        href={`/restaurant/${it.id}`}
        prefetch={false}
        className="mp-ph-a"
        data-cursor="VIEW"
        aria-haspopup="dialog"
        onClick={(e) => onOpen(e, it.id)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes={wallSizes(at)}
          width={it.ws[it.ws.length - 1]}
          height={Math.round(it.ws[it.ws.length - 1] / it.r)}
          alt={`${it.n}の料理${it.a ? `（${it.a}）` : ""}`}
          loading={i < EAGER ? "eager" : "lazy"}
          fetchPriority={i < 2 ? "high" : undefined}
          decoding="async"
          draggable={false}
        />
        <span className="mp-ph-cap" aria-hidden="true">
          <b>{it.n}</b>
          <small>{where}</small>
        </span>
      </Link>
    </li>
  );
});

export default function PhotoWall({ data, initial }: Props) {
  const { items, genres, prefs } = data;
  const [genre, setGenre] = useState(initial.genre);
  const [pref, setPref] = useState(initial.pref);
  const [openId, setOpenId] = useState<string | null>(null);
  const [allPrefs, setAllPrefs] = useState(false);

  const gi = genre ? genres.findIndex((g) => g.key === genre) : -1;
  const pi = pref ? prefs.findIndex((p) => p.key === pref) : -1;

  const shown = useMemo(() => items.filter((it) => (gi < 0 || it.g.includes(gi)) && (pi < 0 || it.p === pi)), [items, gi, pi]);
  const packs = useMemo(() => packAll(shown), [shown]);

  // 選択肢ごとの枚数（もう一方の絞り込みの結果に対して数える。0 枚は出さない）
  const genreCount = useMemo(() => {
    const c = new Array(genres.length).fill(0) as number[];
    let all = 0;
    for (const it of items) {
      if (pi >= 0 && it.p !== pi) continue;
      all++;
      for (const g of it.g) c[g]++;
    }
    return { c, all };
  }, [items, genres.length, pi]);
  const prefCount = useMemo(() => {
    const c = new Array(prefs.length).fill(0) as number[];
    let all = 0;
    for (const it of items) {
      if (gi >= 0 && !it.g.includes(gi)) continue;
      all++;
      if (it.p >= 0) c[it.p]++;
    }
    return { c, all };
  }, [items, prefs.length, gi]);

  /* ── URL と同期 ── */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      const q = new URLSearchParams();
      if (genre) q.set("genre", genre);
      if (pref) q.set("pref", pref);
      const s = q.toString();
      window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    } catch {
      /* URL を書き換えられなくても、絞り込み自体は動く */
    }
  }, [genre, pref]);

  /* ── 並び替わったときの動き（最初の画面に入る分だけ、順にふわっと入る） ── */
  const grid = useRef<HTMLUListElement>(null);
  const filtered = useRef(false);
  useEffect(() => {
    if (!filtered.current) return;
    if (reduced()) return;
    const g = grid.current;
    if (!g) return;
    const vh = innerHeight;
    let n = 0;
    for (const el of Array.from(g.children) as HTMLElement[]) {
      if (n >= 22) break;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      el.animate([{ opacity: 0, transform: "translateY(16px) scale(.985)" }, { opacity: 1, transform: "none" }], {
        duration: 620,
        delay: n * 28,
        easing: "cubic-bezier(.19,1,.22,1)",
        fill: "backwards",
      });
      n++;
    }
  }, [genre, pref]);

  const choose = (g: string, p: string) => {
    filtered.current = true;
    setGenre(g);
    setPref(p);
  };

  /* ── 大きな表示 ── */
  const tileEls = useRef(new Map<string, HTMLLIElement>());
  const reg = useCallback((id: string, el: HTMLLIElement | null) => {
    if (el) tileEls.current.set(id, el);
    else tileEls.current.delete(id);
  }, []);
  const getTile = useCallback((id: string) => tileEls.current.get(id) ?? null, []);
  const pushed = useRef(false);
  const openRef = useRef<string | null>(null);
  openRef.current = openId;

  const onOpen = useCallback((e: React.MouseEvent, id: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setOpenId(id);
    try {
      window.history.pushState({ mpPh: 1 }, "", window.location.href);
      pushed.current = true;
    } catch {
      pushed.current = false;
    }
  }, []);

  const requestClose = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back(); // popstate で閉じる
    } else {
      setOpenId(null);
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (openRef.current) {
        pushed.current = false;
        setOpenId(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const onClosed = useCallback((id: string) => {
    const a = tileEls.current.get(id)?.querySelector("a");
    a?.focus({ preventScroll: true });
  }, []);

  const filtering = gi >= 0 || pi >= 0;
  const label = [gi >= 0 ? `「${genres[gi].label}」` : "", pi >= 0 ? prefs[pi].label : ""].filter(Boolean);
  const prefShown = prefs.map((p, i) => ({ p, i })).filter(({ i }) => prefCount.c[i] > 0 || i === pi);
  const prefVisible = allPrefs ? prefShown : prefShown.filter(({ i }, k) => k < PREF_FOLD || i === pi);

  return (
    <>
      <div className="mp-wrap">
        <div className="mp-ph-bar">
          <div className="mp-ph-row">
            <p className="mp-ph-lab" id="mp-ph-gl">ジャンル</p>
            <ul className="mp-mx-chips" role="group" aria-labelledby="mp-ph-gl">
              <li>
                <button type="button" className="mp-mx-chip" aria-pressed={gi < 0} onClick={() => choose("", pref)}>
                  すべて<small>{genreCount.all}</small>
                </button>
              </li>
              {genres.map((g, i) =>
                genreCount.c[i] > 0 || i === gi ? (
                  <li key={g.key}>
                    <button type="button" className="mp-mx-chip" aria-pressed={i === gi} onClick={() => choose(i === gi ? "" : g.key, pref)}>
                      {g.label}
                      <small>{genreCount.c[i]}</small>
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
          <div className="mp-ph-row">
            <p className="mp-ph-lab" id="mp-ph-pl">都道府県</p>
            <ul className="mp-mx-chips" role="group" aria-labelledby="mp-ph-pl">
              <li>
                <button type="button" className="mp-mx-chip" aria-pressed={pi < 0} onClick={() => choose(genre, "")}>
                  全国<small>{prefCount.all}</small>
                </button>
              </li>
              {prefVisible.map(({ p, i }) => (
                <li key={p.key}>
                  <button type="button" className="mp-mx-chip" aria-pressed={i === pi} onClick={() => choose(genre, i === pi ? "" : p.key)}>
                    {p.label}
                    <small>{prefCount.c[i]}</small>
                  </button>
                </li>
              ))}
              {prefShown.length > PREF_FOLD && (
                <li>
                  <button type="button" className="mp-mx-chip mp-ph-more" aria-expanded={allPrefs} onClick={() => setAllPrefs((v) => !v)}>
                    {allPrefs ? "たたむ" : `ほか${prefShown.length - prefVisible.length}県`}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
        <p className="mp-ph-meta" role="status" aria-live="polite">
          <span>
            <b data-testid="photo-count">{shown.length}</b>枚の料理写真
          </span>
          {filtering && <span className="mp-ph-cond">{label.join("・")}</span>}
          {filtering && (
            <button type="button" className="mp-ph-reset" onClick={() => choose("", "")}>
              絞り込みをはずす
            </button>
          )}
        </p>
      </div>

      <div className="mp-ph-bleed">
        <div className="mp-ph-wall">
          {shown.length === 0 ? (
            <p className="mp-ph-empty">
              この組み合わせの写真はまだありません。
              <button type="button" className="mp-ph-reset" onClick={() => choose("", "")}>
                絞り込みをはずす
              </button>
            </p>
          ) : (
            <ul className="mp-ph-grid" ref={grid} aria-label="料理の写真">
              {shown.map((it, i) => (
                <Tile
                  key={it.id}
                  it={it}
                  i={i}
                  at={{ 2: packs[2][i], 3: packs[3][i], 4: packs[4][i], 5: packs[5][i] }}
                  where={[it.p >= 0 ? prefs[it.p].label : "", it.a].filter(Boolean).join("・")}
                  onOpen={onOpen}
                  reg={reg}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <PhotoViewer items={shown} prefs={prefs} openId={openId} getTile={getTile} onNavigate={setOpenId} onRequestClose={requestClose} onClosed={onClosed} />
    </>
  );
}
