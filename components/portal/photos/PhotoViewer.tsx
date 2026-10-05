"use client";
/**
 * 壁の1枚を押したときに開く、大きな写真と店の入口（<dialog> の showModal）。
 *   PC: 左に大きな写真、右に店名・街・ジャンル・「店のページへ」。モバイル: 写真は上、情報は下から出るパネル。
 *   動き: 押した写真がその場から大きくなる（FLIP。位置と大きさを Web Animations で補間）→ 情報が遅れて入る。閉じるときは元の位置へ戻る。
 *   前後の写真へは入れ替え（かすかなスライド＋フェード）。prefers-reduced-motion では動かさず、すぐ切り替える。
 *   キーボード: Esc で閉じる ／ ← → で前後 ／ Tab は <dialog>（showModal）が中に閉じ込める。閉じたら押した写真にフォーカスを戻す（親が行う）。
 *   モバイル: 写真を左右にスワイプで前後、下にスワイプで閉じる。
 * 画像は、押した写真の読み込み済みの小さい版（wall の <img> の currentSrc）をまず出して動かし、同時に大きい版（800 / 1200）を読んで差し替える
 * （押してから待たされない）。<img> の src は React には持たせず、ここで直接決める。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { bigImg, type WallFacet, type WallItem } from "@/lib/portal/photoWallShared";
import { useIsSaved } from "@/lib/portal/savedList";
import SaveButton from "../SaveButton";

const EASE = "cubic-bezier(.19,1,.22,1)";
const EASE_IO = "cubic-bezier(.76,0,.24,1)";
const BIG_SIZES = "(max-width: 899px) 100vw, 64vw";

interface Props {
  /** 表示中の並び（絞り込み後） */
  items: WallItem[];
  prefs: WallFacet[];
  /** 開いている写真の店ID。null なら閉じている（または閉じる途中） */
  openId: string | null;
  getTile: (id: string) => HTMLElement | null;
  /** 前後の写真へ（親が openId を替える） */
  onNavigate: (id: string) => void;
  /** 閉じる操作（Esc・閉じるボタン・外側の押下・下スワイプ）。親が openId を null にする */
  onRequestClose: () => void;
  /** 閉じるアニメーションが終わって <dialog> を閉じた後（親がフォーカスを戻す） */
  onClosed: (id: string) => void;
}

interface View {
  it: WallItem;
  idx: number;
}

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = () => typeof matchMedia === "function" && matchMedia("(max-width: 899px)").matches;

function Arrow({ dir }: { dir: "l" | "r" | "ne" }) {
  const d = dir === "l" ? "M15 5l-7 7 7 7" : dir === "r" ? "M9 5l7 7-7 7" : "M5 12h14m-6-6 6 6-6 6";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function PhotoViewer({ items, prefs, openId, getTile, onNavigate, onRequestClose, onClosed }: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLImageElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<View | null>(null);
  const phase = useRef<{ kind: "open" } | { kind: "switch"; dir: 1 | -1 } | null>(null);
  const token = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const viewRef = useRef<View | null>(null);
  viewRef.current = view;
  const lastId = useRef<string | null>(null);

  /* ── 大きい写真を決める。thumb があれば、まずそれ（読み込み済み）を出して、大きい版を読めたら差し替える ── */
  const setBig = useCallback((it: WallItem, thumb?: string) => {
    const img = big.current;
    if (!img) return;
    const b = bigImg(it);
    const hiW = it.ws[it.ws.length - 1];
    img.sizes = BIG_SIZES;
    img.width = hiW;
    img.height = Math.round(hiW / it.r);
    img.style.setProperty("--r", String(it.r));
    // 小さい写真を何倍にも引き伸ばさない（作ってある最大幅の 1.6 倍まで）
    img.style.setProperty("--mw", `${Math.round(hiW * 1.6)}px`);
    const hi = new Image();
    hi.sizes = BIG_SIZES;
    hi.srcset = b.srcSet;
    hi.src = b.src;
    const apply = () => {
      if (big.current !== img || viewRef.current?.it.id !== it.id) return;
      img.srcset = b.srcSet;
      img.src = b.src;
    };
    if (thumb) {
      img.removeAttribute("srcset");
      img.src = thumb;
      hi.decode().then(apply, apply);
    } else {
      apply();
    }
  }, []);

  const preloadAround = useCallback((idx: number) => {
    const list = itemsRef.current;
    for (const k of [idx + 1, idx - 1]) {
      const it = list[(k + list.length) % list.length];
      if (!it) continue;
      const im = new Image();
      im.sizes = BIG_SIZES;
      im.srcset = bigImg(it).srcSet;
      im.src = bigImg(it).src;
    }
  }, []);

  /* ── 開く・切り替え（view が入れ替わった直後。DOM が新しい内容になっている） ── */
  useLayoutEffect(() => {
    const d = dlg.current;
    const ph = phase.current;
    if (!d || !view || !ph) return;
    phase.current = null;
    lastId.current = view.it.id;
    const rm = reduced();
    const img = big.current;
    const inf = info.current;
    if (!img || !inf) return;

    if (ph.kind === "open") {
      document.documentElement.classList.add("mp-ph-lock");
      if (!d.open) d.showModal();
      const tile = getTile(view.it.id);
      const tileImg = tile?.querySelector("img") ?? null;
      setBig(view.it, tileImg?.currentSrc || undefined);
      preloadAround(view.idx);
      closeBtn.current?.focus({ preventScroll: true });
      if (rm) return;
      veil.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out", fill: "backwards" });
      // 情報は遅れて入る（PC: 下から少し浮く／モバイル: 画面の下から出るパネル）
      inf.animate(
        narrow()
          ? [{ transform: "translateY(100%)" }, { transform: "none" }]
          : [
              { opacity: 0, transform: "translateY(26px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: narrow() ? 560 : 640, delay: narrow() ? 60 : 200, easing: EASE, fill: "backwards" },
      );
      // 押した写真が、その場から大きくなる
      const from = tile?.getBoundingClientRect();
      const vh = innerHeight;
      if (from && from.bottom > 0 && from.top < vh) {
        const to = img.getBoundingClientRect();
        if (to.width > 0 && to.height > 0) {
          img.style.transformOrigin = "0 0";
          img.animate(
            [
              { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
              { transform: "none" },
            ],
            { duration: 640, easing: EASE, fill: "backwards" },
          );
          tile?.setAttribute("data-lifted", "");
          return;
        }
      }
      img.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 480, easing: EASE, fill: "backwards" });
      return;
    }

    // 切り替え（前後）: 新しい内容を、進む向きからかすかに滑り込ませる
    setBig(view.it);
    preloadAround(view.idx);
    if (rm) return;
    const dx = 28 * ph.dir;
    img.animate([{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: "none" }], { duration: 420, easing: EASE, fill: "backwards" });
    inf.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 60, easing: EASE, fill: "backwards" });
  }, [view, getTile, setBig, preloadAround]);

  /* ── 閉じる（元の位置へ戻る） ── */
  const closeFlow = useCallback(async () => {
    const d = dlg.current;
    const v = viewRef.current;
    if (!d || !d.open) return;
    const my = ++token.current;
    const id = v?.it.id ?? lastId.current;
    const rm = reduced();
    const img = big.current;
    const inf = info.current;
    let tile = id ? getTile(id) : null;
    const anims: Animation[] = [];
    if (!rm && img && inf) {
      img.getAnimations().forEach((a) => a.cancel());
      // 押した写真が見えていなければ、見える位置までスクロールしてから戻る（前後で別の写真に移っていることがある）
      if (tile) {
        const r = tile.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) {
          tile.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
          tile = id ? getTile(id) : null;
        }
      }
      const to = tile?.getBoundingClientRect();
      const from = img.getBoundingClientRect();
      anims.push(inf.animate(narrow() ? [{ transform: "none" }, { transform: "translateY(100%)" }] : [{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: EASE_IO, fill: "forwards" }));
      anims.push(veil.current!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: "ease-in", fill: "forwards" }));
      if (to && from.width > 0 && to.bottom > 0 && to.top < innerHeight) {
        img.style.transformOrigin = "0 0";
        anims.push(
          img.animate(
            [
              { transform: "none" },
              { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})` },
            ],
            { duration: 460, easing: EASE_IO, fill: "forwards" },
          ),
        );
      } else {
        anims.push(img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }));
      }
      try {
        await Promise.all(anims.map((a) => a.finished));
      } catch {
        /* 途中で取り消された */
      }
    }
    if (my !== token.current) return;
    anims.forEach((a) => a.cancel());
    d.close();
    document.documentElement.classList.remove("mp-ph-lock");
    getTile(id ?? "")?.removeAttribute("data-lifted");
    document.querySelectorAll("[data-lifted]").forEach((el) => el.removeAttribute("data-lifted"));
    setView(null);
    if (id) onClosed(id);
  }, [getTile, onClosed]);

  /* ── 親の openId に追従 ── */
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (openId) {
      const list = itemsRef.current;
      const idx = list.findIndex((x) => x.id === openId);
      if (idx < 0) return;
      const it = list[idx];
      if (!d.open) {
        token.current++;
        phase.current = { kind: "open" };
        setView({ it, idx });
        return;
      }
      const cur = viewRef.current;
      if (cur && cur.it.id === it.id) return;
      // 前後への切り替え: いまの内容をすぐ薄くしてから、新しい内容に入れ替える
      const my = ++token.current;
      // 進む向き（端をまたぐ前後は、近いほうの向き）
      const n = list.length;
      const dir: 1 | -1 = cur && (idx - cur.idx + n) % n <= n / 2 ? 1 : -1;
      const swap = () => {
        if (my !== token.current) return;
        phase.current = { kind: "switch", dir };
        setView({ it, idx });
      };
      if (reduced() || !big.current) {
        swap();
        return;
      }
      const out = [
        big.current.animate([{ opacity: 1 }, { opacity: 0, transform: `translateX(${-24 * dir}px)` }], { duration: 130, easing: "ease-in", fill: "forwards" }),
        info.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 130, fill: "forwards" }),
      ];
      Promise.all(out.map((a) => a?.finished)).then(
        () => {
          swap();
          // swap 後の layout effect が新しい動きを足す。fill:forwards の薄いままにならないよう、取り消す
          requestAnimationFrame(() => out.forEach((a) => a?.cancel()));
        },
        () => {},
      );
      return;
    }
    if (d.open) void closeFlow();
  }, [openId, closeFlow]);

  // 画面を離れるとき（店のページへ移るなど）、スクロールの固定を必ず外す
  useEffect(
    () => () => {
      document.documentElement.classList.remove("mp-ph-lock");
    },
    [],
  );

  /* ── 前後・閉じる ── */
  const go = useCallback(
    (delta: number) => {
      const list = itemsRef.current;
      const cur = viewRef.current;
      if (!cur || list.length < 2) return;
      const next = list[(cur.idx + delta + list.length) % list.length];
      onNavigate(next.id);
    },
    [onNavigate],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  // スワイプ（タッチだけ）
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || e.pointerType !== "touch") return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dx) < 60) onRequestClose();
  };

  const total = items.length;
  const it = view?.it;

  // 「候補に入れる」を押した結果の読み上げ。<dialog>（showModal）の外は操作できず読み上げられないので、画面隅の案内（ListEntry）とは別に、中にも置く
  const saved = useIsSaved(it?.id ?? "");
  const [saveMsg, setSaveMsg] = useState("");
  const savedRef = useRef<{ id: string | undefined; saved: boolean }>({ id: undefined, saved: false });
  useEffect(() => {
    const p = savedRef.current;
    if (p.id !== it?.id) {
      // 別の写真に替わった。最初の状態を覚えるだけ（案内は出さない）
      savedRef.current = { id: it?.id, saved };
      setSaveMsg("");
      return;
    }
    if (p.saved !== saved) {
      savedRef.current = { id: it?.id, saved };
      setSaveMsg(saved ? "候補に入れました" : "候補から外しました");
    }
  }, [it?.id, saved]);
  const pref = it && it.p >= 0 ? prefs[it.p]?.label : "";
  const where = [pref, it?.a].filter(Boolean).join("・");
  const no = view ? `${String(view.idx + 1).padStart(String(total).length, "0")}` : "";

  return (
    <dialog
      ref={dlg}
      className="mp-ph-dlg"
      aria-labelledby="mp-ph-dt"
      onCancel={(e) => {
        e.preventDefault();
        onRequestClose();
      }}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if ((e.target as HTMLElement).hasAttribute("data-close")) onRequestClose();
      }}
    >
      <div className="mp-ph-veil" ref={veil} data-close="" />
      {view && it && (
        <div className="mp-ph-stage" data-close="">
          <div className="mp-ph-fig" ref={fig} data-close="" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={big} className="mp-ph-big" alt={`${it.n}の料理${it.a ? `（${it.a}）` : ""}`} decoding="async" draggable={false} />
          </div>
          <div className="mp-ph-info" ref={info}>
            <span className="mp-ph-handle" aria-hidden="true" />
            <div className="mp-ph-top">
              <p className="mp-ph-no">
                <b>{no}</b>
                <span> / {total}</span>
              </p>
              <button type="button" className="mp-ph-close" ref={closeBtn} onClick={onRequestClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
                閉じる
              </button>
            </div>
            {it.c && <p className="mp-ph-gen">{it.c}</p>}
            <h2 id="mp-ph-dt" className="mp-ph-name">
              {it.n}
            </h2>
            {where && <p className="mp-ph-loc">{where}</p>}
            <Link href={`/restaurant/${it.id}`} prefetch={false} className="mp-ph-go" data-cursor="ENTER">
              <span>店のページへ</span>
              <Arrow dir="ne" />
            </Link>
            <div className="mp-ph-save">
              <SaveButton id={it.id} name={it.n} variant="inline" page="/photos" />
            </div>
            <div className="mp-ph-nav">
              <button type="button" onClick={() => go(-1)} aria-label="前の写真" disabled={total < 2}>
                <Arrow dir="l" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="次の写真" disabled={total < 2}>
                <Arrow dir="r" />
              </button>
              <span className="mp-ph-hint" aria-hidden="true">← → で前後　Esc で閉じる</span>
            </div>
          </div>
        </div>
      )}
      <p className="mp-sr" role="status" aria-live="polite">
        {it ? `${it.n}、${view!.idx + 1}枚目、全${total}枚` : ""}
      </p>
      <p className="mp-sr" role="status" aria-live="polite" data-ph-save-msg="">
        {saveMsg}
      </p>
    </dialog>
  );
}
