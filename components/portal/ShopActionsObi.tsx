"use client";
/**
 * 案6「帯 OBI」: 一本の帯を、行動の数だけ区画に割ったボタン。区画ごとにアイコン＋ラベル。主役の区画は朱。
 * hover / focus: 指した区画が横に広がり（ほかは少し縮む）、右端に矢印が現れる。墨のブロック「1 枚」がポインタを追って区画から区画へ滑る
 * （区画ごとの色替えではない）。押した瞬間は墨のブロックが一瞬縮んで戻る。
 * 行動が 6 つ以上の店は帯を 2 段に。少ない店は帯の幅を内容に合わせる。
 * 幅 960px 未満（スマホ・タブレット）は 2 列の格子の帯。広がる動きは無く、押した区画が墨に反転する。
 */
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { ActionModel, IconKey } from "@/lib/portal/shopActions";
import { Act, SaArrow, SaIcon, ShareFoot, type ShareState } from "./ShopActionsParts";
import { SHARE_SHORT, SlimSub, slimAria, slimLabel } from "./ShopActionsSlim";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  sample?: boolean;
  share: ShareState;
  bar?: boolean;
}

const GROW_ON = 1.5; // 指した区画の広がり（ほかの区画は 1 のまま、帯の幅は一定なので少し縮む）
const HERO_BASE = 1.2; // 主役の区画は、もとから少しだけ広い
const WIDE = "(min-width: 960px)";

/** 6 つ以上は 2 段（上を多めに） */
function splitRows<T>(items: T[]): T[][] {
  if (items.length < 6) return [items];
  const a = Math.ceil(items.length / 2);
  return [items.slice(0, a), items.slice(a)];
}

/* ---------- 墨のブロック（帯につき 1 枚）。区画から区画へ滑る ---------- */

function useObiInk(ref: RefObject<HTMLDivElement | null>, grow: boolean) {
  useEffect(() => {
    const band = ref.current;
    if (!band) return;
    const wide = window.matchMedia(WIDE);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const inkEl = band.querySelector<HTMLElement>(".sa-obi-ink");
    const inkB = inkEl?.firstElementChild as HTMLElement | null;
    if (!inkEl || !inkB) return;

    let cur: HTMLElement | null = null;
    let shown = false; // 墨が見えている（または引っ込み途中）。false のときは位置を飛ばして置く
    let hover = false;
    let kb: HTMLElement | null = null; // キーボードの focus がある区画
    let timer: ReturnType<typeof setTimeout> | null = null;

    /** 区画の最終の位置と大きさ（広がる動きの途中ではなく、広がり終えたときの値）を、重みから計算する */
    const rectOf = (li: HTMLElement) => {
      const row = li.parentElement as HTMLElement;
      const y = row.offsetTop;
      const h = row.offsetHeight;
      if (!grow) return { x: li.offsetLeft, y, w: li.offsetWidth, h };
      const sibs = Array.from(row.children) as HTMLElement[];
      const mult = reduce.matches ? 1 : GROW_ON;
      const ws = sibs.map((s) => (parseFloat(s.dataset.g || "1") || 1) * (s === li ? mult : 1));
      const sum = ws.reduce((a, b) => a + b, 0);
      const W = row.clientWidth;
      const k = sibs.indexOf(li);
      let x = 0;
      for (let j = 0; j < k; j++) x += (W * ws[j]) / sum;
      return { x, y, w: (W * ws[k]) / sum, h };
    };

    let lastX = 0;
    const place = (li: HTMLElement) => {
      const r = rectOf(li);
      // 進む側の縁を先に走らせ、反対側の縁があとから追いつく（墨が伸びて縮むように滑る）。向きは CSS の data-go で使い分ける
      if (Math.abs(r.x - lastX) > 0.5) band.dataset.go = r.x > lastX ? "r" : "l";
      lastX = r.x;
      band.style.setProperty("--ix", `${r.x.toFixed(2)}px`);
      band.style.setProperty("--ir", `${Math.max(0, band.clientWidth - r.x - r.w).toFixed(2)}px`);
      band.style.setProperty("--iy", `${r.y}px`);
      band.style.setProperty("--ih", `${r.h}px`);
      return r;
    };

    const pct = (clientX: number, r: { x: number; w: number }) => {
      const b = band.getBoundingClientRect();
      const v = ((clientX - (b.left + band.clientLeft + r.x)) / Math.max(1, r.w)) * 100;
      return `${Math.max(0, Math.min(100, v)).toFixed(0)}%`;
    };

    const activate = (li: HTMLElement, clientX: number | null) => {
      if (!wide.matches) return;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (cur === li && band.dataset.ink === "1") return;
      cur?.removeAttribute("data-on");
      cur = li;
      li.setAttribute("data-on", "1");
      if (!shown) {
        // 出てくる位置へは滑らせず、その場に置いて、ポインタの入ってきた側から現れる
        band.classList.add("is-jump");
        const r = place(li);
        band.style.setProperty("--ox", clientX == null ? "0%" : pct(clientX, r));
        void band.offsetWidth;
        band.classList.remove("is-jump");
        shown = true;
      } else {
        place(li);
      }
      band.dataset.ink = "1";
    };

    const clear = (side: string) => {
      cur?.removeAttribute("data-on");
      cur = null;
      band.style.setProperty("--ox", side);
      band.dataset.ink = "0";
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        shown = false;
        timer = null;
      }, 420);
    };

    const liOf = (t: EventTarget | null) => (t instanceof Element ? (t.closest(".sa-obi-li") as HTMLElement | null) : null);

    const press = () => {
      if (!cur || reduce.matches || typeof inkB.animate !== "function") return;
      inkB.animate(
        [{ scale: "1 1" }, { scale: "0.9 0.7", offset: 0.32 }, { scale: "1 1" }],
        { duration: 460, easing: "cubic-bezier(.22,1,.36,1)" }
      );
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const li = liOf(e.target);
      if (!li) return;
      hover = true;
      activate(li, e.clientX);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hover = false;
      if (kb) {
        activate(kb, null);
        return;
      }
      const r = inkEl.getBoundingClientRect();
      clear(e.clientX < r.left + r.width / 2 ? "0%" : "100%");
    };
    const onDown = (e: PointerEvent) => {
      if (!wide.matches || e.button > 0) return;
      const li = liOf(e.target);
      if (!li) return;
      if (e.pointerType === "touch" || band.dataset.ink !== "1") activate(li, e.clientX);
      press();
    };
    const onUp = (e: PointerEvent) => {
      // 指で触れたときは「離してしばらくしたら」引っ込める（pointerleave が来ないため）
      if (e.pointerType !== "touch") return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => clear("100%"), 520);
    };
    const onClick = (e: MouseEvent) => {
      // キーボード（Enter）で押したとき。マウスは pointerdown で済んでいる
      if (e.detail === 0 && liOf(e.target)) press();
    };
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      let vis = false;
      try {
        vis = t.matches(":focus-visible");
      } catch {
        vis = false;
      }
      const li = liOf(t);
      if (!vis || !li) return;
      kb = li;
      activate(li, null);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && band.contains(e.relatedTarget)) return;
      kb = null;
      if (!hover) clear("100%");
    };
    const onChange = () => {
      if (!wide.matches) {
        cur?.removeAttribute("data-on");
        cur = null;
        shown = false;
        band.dataset.ink = "0";
      }
    };
    const onResize = () => {
      if (cur) place(cur);
    };

    band.addEventListener("pointerover", onOver);
    band.addEventListener("pointerleave", onLeave);
    band.addEventListener("pointerdown", onDown);
    band.addEventListener("pointerup", onUp);
    band.addEventListener("pointercancel", onUp);
    band.addEventListener("click", onClick);
    band.addEventListener("focusin", onFocusIn);
    band.addEventListener("focusout", onFocusOut);
    wide.addEventListener("change", onChange);
    window.addEventListener("resize", onResize);
    return () => {
      band.removeEventListener("pointerover", onOver);
      band.removeEventListener("pointerleave", onLeave);
      band.removeEventListener("pointerdown", onDown);
      band.removeEventListener("pointerup", onUp);
      band.removeEventListener("pointercancel", onUp);
      band.removeEventListener("click", onClick);
      band.removeEventListener("focusin", onFocusIn);
      band.removeEventListener("focusout", onFocusOut);
      wide.removeEventListener("change", onChange);
      window.removeEventListener("resize", onResize);
      if (timer) clearTimeout(timer);
    };
  }, [ref, grow]);
}

function Band({ rows, n, grow, small }: { rows: ReactNode[][]; n: number; grow: boolean; small?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useObiInk(ref, grow);
  return (
    <div
      ref={ref}
      className={`sa-obi-band${small ? " is-sm" : ""}`}
      data-grow={grow ? "1" : "0"}
      data-ink="0"
      style={{ "--n": n } as CSSProperties}
    >
      <span className="sa-obi-ink" aria-hidden="true">
        <span className="sa-obi-inkb" />
      </span>
      {rows.map((r, i) => (
        <ul key={i} className="sa-obi-row" role="list">
          {r}
        </ul>
      ))}
    </div>
  );
}

/** 区画の中身（アイコン・ラベル・右端の矢印）。矢印は広がった区画にだけ現れる */
function Inner({ icon, label, visit, arrow = true }: { icon: IconKey; label: string; visit?: boolean; arrow?: boolean }) {
  return (
    <>
      <span className="sa-obi-bg" aria-hidden="true" />
      <span className="sa-obi-press" aria-hidden="true" />
      <span className="sa-obi-in">
        <span className="sa-obi-ico" aria-hidden="true">
          <SaIcon name={icon} size={24} />
          {visit && (
            <span className="sa-obi-vis">
              <svg viewBox="0 0 24 24" width="9" height="9" fill="none" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
          )}
        </span>
        <span className="sa-obi-lbl">{label}</span>
        {arrow && (
          <span className="sa-obi-go" aria-hidden="true">
            <SaArrow />
          </span>
        )}
      </span>
    </>
  );
}

export default function ShopActionsObi({ model, storeId, page, sample, share }: Props) {
  const n = model.primary.length;
  const items = model.primary.map((a, i) => {
    const g = a.hero ? HERO_BASE : 1;
    return (
      <li
        key={a.id}
        className={`sa-obi-li${a.hero ? " is-hero" : ""}${n % 2 === 1 && i === n - 1 ? " is-wide" : ""}`}
        data-g={g}
        style={{ "--g": g } as CSSProperties}
      >
        <Act a={a} storeId={storeId} page={page} sample={sample} aria={slimAria(a)} noCursor className="sa-obi-sec">
          <Inner icon={a.icon} label={slimLabel(a)} visit={a.external && !sample} />
        </Act>
      </li>
    );
  });

  const shareLis: ReactNode[] = [
    ...share.items.map((it) => (
      <li key={it.id} className="sa-obi-li">
        {sample ? (
          <span className="sa-obi-sec sa-sample" aria-disabled="true" data-sa-id={it.id}>
            <Inner icon={it.icon} label={SHARE_SHORT[it.id]} arrow={false} />
          </span>
        ) : (
          <a
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            className="sa-obi-sec"
            data-sa-id={it.id}
            aria-label={`${SHARE_SHORT[it.id]}で共有（外部サイトが新しいタブで開きます）`}
            onClick={() => share.tap(it.tap)}
          >
            <Inner icon={it.icon} label={SHARE_SHORT[it.id]} arrow={false} />
          </a>
        )}
      </li>
    )),
    <li key="copy" className="sa-obi-li">
      {sample ? (
        <span className="sa-obi-sec sa-sample" aria-disabled="true" data-sa-id="copy">
          <Inner icon="link" label={SHARE_SHORT.copy} arrow={false} />
        </span>
      ) : (
        <button
          type="button"
          className={`sa-obi-sec${share.copied ? " is-done" : ""}`}
         
          data-sa-id="copy"
          aria-label={share.copied ? "コピーしました" : "リンクをコピー"}
          onClick={share.copy}
        >
          <Inner icon={share.copied ? "check" : "link"} label={share.copied ? "完了" : SHARE_SHORT.copy} arrow={false} />
        </button>
      )}
    </li>,
  ];

  return (
    <>
      {n > 0 && <Band rows={splitRows(items)} n={n} grow />}

      <SlimSub items={model.secondary} sample={sample} index={n} />

      <div className="sa-s-share" role="group" aria-label="この店を共有" style={{ "--i": n + 1 } as CSSProperties}>
        <p className="sa-s-cap" aria-hidden="true">
          共有
        </p>
        <Band rows={[shareLis]} n={shareLis.length} grow={false} small />
        {!sample && <ShareFoot s={share} />}
      </div>
    </>
  );
}
