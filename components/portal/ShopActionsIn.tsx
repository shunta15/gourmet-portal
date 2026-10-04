"use client";
/**
 * 案2「印 IN」: 丸い印のボタン。円の外周を小さな字が回る（SVG の textPath）。主役は朱の印、ほかは細い罫の円（hover で墨に塗られる）。
 * ポインタに少し吸い寄せられる（最大 8px・pointer: fine のときだけ・rAF）。押すと判子のように縮み、離すとインクの輪が広がる。
 */
import { useEffect, useId, useLayoutEffect, useRef, type CSSProperties } from "react";
import type { ActionModel } from "@/lib/portal/shopActions";
import { Act, ExtHint, SaArrow, SaIcon, ShareFoot, prefersReducedMotion, type ShareState } from "./ShopActionsParts";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  sample?: boolean;
  share: ShareState;
  bar?: boolean;
}

/* ---------- 円の外周に沿って回る字 ---------- */

const R = 38; // 字の基線の半径（viewBox 100）
const FS = 11; // 字の大きさ（viewBox 100 の単位）
const ADV = FS * 0.6; // 等幅フォントの送り幅（JetBrains Mono / ui-monospace はどちらも約 0.6em）
const CIRC = 2 * Math.PI * R;

/** 外周ちょうど1周に字が収まるよう、繰り返し回数と字間を決める（ASCII の等幅だけを渡す前提） */
function fitRing(unit: string) {
  const n = unit.length;
  const reps = Math.max(1, Math.floor(CIRC / (n * (ADV - 0.35))));
  const ls = Math.max(-0.35, CIRC / (n * reps) - ADV);
  return { reps, ls };
}

function Ring({ text }: { text: string }) {
  const uid = useId();
  const pid = `sa-ring-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const { reps, ls } = fitRing(text);
  const textRef = useRef<SVGTextElement>(null);

  // フォントが差し替わって送り幅がずれたときは、実測の長さに合わせて字間を直す（継ぎ目の隙間・重なりを出さない）
  useLayoutEffect(() => {
    const t = textRef.current;
    if (!t) return;
    const fix = () => {
      try {
        t.style.letterSpacing = `${ls}px`;
        const len = t.getComputedTextLength();
        const count = text.length * reps;
        if (len > 0 && Math.abs(len - CIRC) > 1.2) t.style.letterSpacing = `${(ls + (CIRC - len) / count).toFixed(3)}px`;
      } catch {
        /* 測れなければそのまま */
      }
    };
    fix();
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fonts?.ready.then(fix).catch(() => {});
  }, [ls, reps, text]);

  return (
    <svg className="sa-i-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <path id={pid} d={`M${50 - R} 50a${R} ${R} 0 1 1 ${2 * R} 0a${R} ${R} 0 1 1 ${-2 * R} 0`} />
      </defs>
      <text ref={textRef} className="sa-i-rt" style={{ letterSpacing: `${ls}px` }}>
        <textPath href={`#${pid}`} startOffset="0">
          {text.repeat(reps)}
        </textPath>
      </text>
    </svg>
  );
}

/* ---------- ポインタに少し吸い寄せられる ---------- */

function useMagnet(listRef: React.RefObject<HTMLUListElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = listRef.current;
    if (!root || !enabled) return;
    let fine = false;
    try {
      fine = window.matchMedia("(pointer: fine)").matches;
    } catch {
      /* 判定できなければ動かさない */
    }
    if (!fine || prefersReducedMotion()) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>(".sa-i-cell"));
    const st = cells.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));
    const MAX = 8; // 最大 8px
    let raf = 0;

    const tick = () => {
      let moving = false;
      cells.forEach((c, i) => {
        const s = st[i];
        s.x += (s.tx - s.x) * 0.2;
        s.y += (s.ty - s.y) * 0.2;
        if (Math.abs(s.tx - s.x) < 0.04 && Math.abs(s.ty - s.y) < 0.04) {
          s.x = s.tx;
          s.y = s.ty;
        } else moving = true;
        c.style.setProperty("--mx", `${s.x.toFixed(2)}px`);
        c.style.setProperty("--my", `${s.y.toFixed(2)}px`);
      });
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cells.forEach((c, i) => {
        const w = c.querySelector<HTMLElement>(".sa-i-disc");
        if (!w) return;
        const r = w.getBoundingClientRect();
        const s = st[i];
        // 吸い寄せ中の自分の移動量を引いて、元の中心から測る（フィードバックさせない）
        const cx = r.left + r.width / 2 - s.x;
        const cy = r.top + r.height / 2 - s.y;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        const reach = r.width / 2 + 56;
        if (d < reach) {
          const k = Math.min(1, (reach - d) / 56);
          const len = Math.min(MAX, d * 0.16) * k;
          const nx = d > 0 ? dx / d : 0;
          const ny = d > 0 ? dy / d : 0;
          s.tx = nx * len;
          s.ty = ny * len;
        } else {
          s.tx = 0;
          s.ty = 0;
        }
      });
      kick();
    };
    const onLeave = () => {
      st.forEach((s) => {
        s.tx = 0;
        s.ty = 0;
      });
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [listRef, enabled]);
}

/** 離したとき、印の外へインクの輪を広げる */
function ripple(el: HTMLElement) {
  const r = el.querySelector<HTMLElement>(".sa-i-rip");
  if (!r) return;
  r.classList.remove("is-go");
  void r.offsetWidth;
  r.classList.add("is-go");
}

export default function ShopActionsIn({ model, storeId, page, sample, share }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  useMagnet(listRef, !sample);

  return (
    <>
      {model.primary.length > 0 && (
        <ul className={`sa-i-grid${model.primary.length >= 4 ? " is-spread" : ""}`} role="list" ref={listRef} style={{ "--n": Math.min(model.primary.length, 6) } as CSSProperties}>
          {model.primary.map((a, i) => (
            <li key={a.id} className="sa-i-li" style={{ "--i": i } as CSSProperties}>
              <Act a={a} storeId={storeId} page={page} sample={sample} className={`sa-i-cell${a.hero ? " is-hero" : ""}`} onTap={ripple}>
                <span className="sa-i-wrap">
                  <span className="sa-i-disc">
                    {a.hero && <span className="sa-i-halo" aria-hidden="true" />}
                    <span className="sa-i-r1">
                      <Ring text={a.ring} />
                    </span>
                    <SaIcon name={a.icon} size={30} className="sa-i-ico" />
                    <span className="sa-i-go" aria-hidden="true">
                      <SaArrow />
                    </span>
                    <span className="sa-i-rip" aria-hidden="true" />
                    {a.external && !sample && (
                      <span className="sa-i-vis" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                    )}
                  </span>
                </span>
                <span className="sa-i-cap">
                  <span className="sa-i-label">{a.short}</span>
                  {a.note && <span className="sa-i-note">{a.note}</span>}
                </span>
              </Act>
            </li>
          ))}
        </ul>
      )}

      {model.secondary.length > 0 && (
        <ul className="sa-i-sub" role="list" style={{ "--i": model.primary.length } as CSSProperties}>
          {model.secondary.map((s) => (
            <li key={s.id}>
              {sample ? (
                <span className="sa-i-sublink sa-sample" aria-disabled="true">
                  {s.label}
                </span>
              ) : (
                <a
                  href={s.href}
                  className={`sa-i-sublink${s.external ? "" : " is-in"}`}
                  data-cursor={s.cursor}
                  {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {s.label}
                  <span className="sa-i-sublink-a" aria-hidden="true">
                    <SaArrow />
                  </span>
                  {s.external && <ExtHint />}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="sa-i-share" role="group" aria-label="この店を共有" style={{ "--i": model.primary.length + 1 } as CSSProperties}>
        <p className="sa-i-sharecap" aria-hidden="true">
          この店を共有
        </p>
        <ul className="sa-i-sharerow" role="list">
          {share.items.map((it) => (
            <li key={it.id}>
              {sample ? (
                <span className="sa-i-sd sa-sample" aria-disabled="true">
                  <SaIcon name={it.icon} size={22} />
                </span>
              ) : (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sa-i-sd"
                  data-cursor="SHARE"
                  onClick={(e) => {
                    share.tap(it.tap);
                    ripple(e.currentTarget);
                  }}
                >
                  <SaIcon name={it.icon} size={22} />
                  <span className="sa-vh">{it.label}で共有（外部サイトが新しいタブで開きます）</span>
                  <span className="sa-i-rip" aria-hidden="true" />
                </a>
              )}
            </li>
          ))}
          <li>
            {sample ? (
              <span className="sa-i-sd sa-sample" aria-disabled="true">
                <SaIcon name="link" size={22} />
              </span>
            ) : (
              <button
                type="button"
                className={`sa-i-sd${share.copied ? " is-done" : ""}`}
                data-cursor="SHARE"
                onClick={(e) => {
                  ripple(e.currentTarget);
                  void share.copy();
                }}
              >
                <SaIcon name={share.copied ? "check" : "link"} size={22} />
                <span className="sa-vh">{share.copied ? "コピーしました" : "リンクをコピー"}</span>
                <span className="sa-i-rip" aria-hidden="true" />
              </button>
            )}
          </li>
        </ul>
        {!sample && <ShareFoot s={share} />}
      </div>
    </>
  );
}
