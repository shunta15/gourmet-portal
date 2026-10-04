"use client";
/**
 * 案3「箱 HAKO」: 見出し「この店へ。」のついたタイルの盤面（大小のタイルを格子に組む）＋スマホは画面下の固定の行動バー。
 * バーは、ヒーローを過ぎたら現れ、盤面やフッターが見えているあいだは隠れる。
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { ActionModel, PrimaryAction } from "@/lib/portal/shopActions";
import { Act, ExtHint, SaArrow, SaIcon, SaVisit, ShareFoot, type ShareState } from "./ShopActionsParts";
import { trackTap } from "@/lib/portal/track";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  sample?: boolean;
  share: ShareState;
  /** スマホ下の固定バーを出すか */
  bar?: boolean;
}

/** 盤面の割り付け。小さなタイルの数 n から、右ブロック（主役の隣・2列×2行）と、その下の行のタイルの幅を決める（穴が出ない） */
function layoutBoard(n: number): { spans: [number, number][]; shareSpan: number } {
  if (n === 0) return { spans: [], shareSpan: 4 };
  const b = Math.min(n, 4);
  const first: [number, number][] =
    b === 1 ? [[2, 2]] : b === 2 ? [[2, 1], [2, 1]] : b === 3 ? [[2, 1], [1, 1], [1, 1]] : [[1, 1], [1, 1], [1, 1], [1, 1]];
  const rest = n - b;
  const spans = [...first, ...Array.from({ length: rest }, (): [number, number] => [1, 1])];
  return { spans, shareSpan: 4 - (rest % 4) };
}

const SNS_IDS = ["instagram", "tiktok", "x", "facebook", "line", "website"];

/** スマホの固定バーに載せる主な行動（最大3つ）: 予約または電話／地図／SNS の1つ目 */
function barItems(primary: PrimaryAction[]): PrimaryAction[] {
  const a = primary.find((p) => p.hero) ?? primary[0];
  if (!a) return [];
  const mapish = primary.find((p) => (p.id === "gmap" || p.id === "map") && p !== a);
  const sns = primary.find((p) => SNS_IDS.includes(p.id) && p !== a);
  return [a, mapish, sns].filter((x): x is PrimaryAction => !!x);
}

const BAR_LABEL: Record<string, string> = { reserve: "予約", phone: "電話", gmap: "地図", map: "地図" };

function Tile({ a, hero, storeId, page, sample }: { a: PrimaryAction; hero?: boolean; storeId: string; page: string; sample?: boolean }) {
  return (
    <Act a={a} storeId={storeId} page={page} sample={sample} className="sa-h-tile">
      {hero && <SaIcon name={a.icon} size={260} className="sa-h-wm" />}
      <span className="sa-h-ico">
        <SaIcon name={a.icon} size={hero ? 34 : 28} />
        {a.external && !sample && <SaVisit />}
      </span>
      <span className="sa-h-go" aria-hidden="true">
        <span className="sa-h-arr sa-h-a1">
          <SaArrow />
        </span>
        <span className="sa-h-arr sa-h-a2">
          <SaArrow />
        </span>
      </span>
      <span className="sa-h-body">
        <span className={`sa-h-label${a.label.length > 6 ? " is-long" : ""}`}>{a.label}</span>
        {a.note && <span className="sa-h-note">{a.note}</span>}
        {a.coord && (
          <span className="sa-h-coord">
            {a.coord.split("  ").map((c) => (
              <span key={c}>{c}</span>
            ))}
          </span>
        )}
      </span>
    </Act>
  );
}

export default function ShopActionsHako({ model, storeId, page, sample, share, bar = true }: Props) {
  const boardRef = useRef<HTMLUListElement>(null);
  const hero = model.primary[0];
  const smalls = model.primary.slice(1);
  const lay = useMemo(() => layoutBoard(smalls.length), [smalls.length]);
  const items = useMemo(() => barItems(model.primary), [model.primary]);

  // 固定バー: ヒーローを過ぎたら出す。盤面かフッターが見えているあいだは隠す
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (sample || !bar) return;
    setMounted(true);
    if (typeof IntersectionObserver === "undefined") return;
    const st = { past: false, board: false, foot: false };
    const upd = () => setShow(st.past && !st.board && !st.foot);
    const watch = (el: Element | null, f: (e: IntersectionObserverEntry) => void) => {
      if (!el) return null;
      const io = new IntersectionObserver((es) => {
        es.forEach(f);
        upd();
      });
      io.observe(el);
      return io;
    };
    const ios = [
      watch(document.querySelector(".feat-hero"), (e) => {
        st.past = !e.isIntersecting && e.boundingClientRect.bottom <= 0;
      }),
      watch(boardRef.current, (e) => {
        st.board = e.isIntersecting;
      }),
      watch(document.querySelector(".feat-page footer"), (e) => {
        st.foot = e.isIntersecting;
      }),
    ];
    return () => ios.forEach((io) => io?.disconnect());
  }, [sample, bar]);

  const wLast = smalls.length % 2 === 1;
  // 共有のタイルが最後の行を1枚で使うとき（細い帯にする）の行の高さ
  const rest = Math.max(0, smalls.length - 4);
  const shareAlone = smalls.length === 0 || rest % 4 === 0;
  const mainRows = smalls.length === 0 ? 1 : 2 + rest / 4;
  const boardStyle = (shareAlone ? { "--rows": `repeat(${mainRows}, minmax(184px, auto)) minmax(84px, auto)` } : undefined) as CSSProperties | undefined;

  return (
    <>
      <div className="sa-h-head">
        <h3 className="sa-h-title">
          この店<em>へ。</em>
        </h3>
      </div>

      {model.primary.length > 0 && hero && (
        <ul className="sa-h-board" role="list" ref={boardRef} style={boardStyle}>
          <li
            className="sa-h-t sa-h-hero"
            style={{ "--c": smalls.length === 0 ? 4 : 2, "--r": smalls.length === 0 ? 1 : 2, "--i": 0 } as CSSProperties}
          >
            <Tile a={hero} hero storeId={storeId} page={page} sample={sample} />
          </li>
          {smalls.map((a, k) => (
            <li
              key={a.id}
              className={`sa-h-t${wLast && k === smalls.length - 1 ? " sa-h-w2" : ""}`}
              style={{ "--c": lay.spans[k][0], "--r": lay.spans[k][1], "--i": k + 1 } as CSSProperties}
            >
              <Tile a={a} storeId={storeId} page={page} sample={sample} />
            </li>
          ))}
          <li className={`sa-h-t sa-h-share${shareAlone ? " is-strip" : ""}`} style={{ "--c": lay.shareSpan, "--i": smalls.length + 1 } as CSSProperties}>
            <div className="sa-h-sharebox" role="group" aria-label="この店を共有">
              <p className="sa-h-sharecap" aria-hidden="true">
                共有
              </p>
              <div className="sa-h-sharebtns">
                {share.items.map((it) =>
                  sample ? (
                    <span key={it.id} className="sa-h-sb sa-sample" aria-disabled="true">
                      <SaIcon name={it.icon} size={21} />
                    </span>
                  ) : (
                    <a
                      key={it.id}
                      href={it.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sa-h-sb"
                      data-cursor="SHARE"
                      onClick={() => share.tap(it.tap)}
                    >
                      <SaIcon name={it.icon} size={21} />
                      <span className="sa-vh">{it.label}で共有（外部サイトが新しいタブで開きます）</span>
                    </a>
                  )
                )}
                {sample ? (
                  <span className="sa-h-sb sa-sample" aria-disabled="true">
                    <SaIcon name="link" size={21} />
                  </span>
                ) : (
                  <button type="button" className={`sa-h-sb${share.copied ? " is-done" : ""}`} data-cursor="SHARE" onClick={share.copy}>
                    <SaIcon name={share.copied ? "check" : "link"} size={21} />
                    <span className="sa-vh">{share.copied ? "コピーしました" : "リンクをコピー"}</span>
                  </button>
                )}
              </div>
              {!sample && <ShareFoot s={share} />}
            </div>
          </li>
        </ul>
      )}

      {model.secondary.length > 0 && (
        <ul className="sa-h-sub" role="list" style={{ "--i": smalls.length + 2 } as CSSProperties}>
          {model.secondary.map((s) => (
            <li key={s.id}>
              {sample ? (
                <span className="sa-h-sublink sa-sample" aria-disabled="true">
                  {s.label}
                </span>
              ) : (
                <a
                  href={s.href}
                  className={`sa-h-sublink${s.external ? "" : " is-in"}`}
                  data-cursor={s.cursor}
                  {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {s.label}
                  <span className="sa-h-sublink-a" aria-hidden="true">
                    <SaArrow />
                  </span>
                  {s.external && <ExtHint />}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {mounted &&
        items.length > 0 &&
        createPortal(
          <nav className="sa-h-bar" data-show={show ? "1" : "0"} aria-label="この店への主な行動" inert={!show}>
            <ul role="list">
              {items.map((a) => (
                <li key={a.id} className={a.hero ? "is-hero" : undefined}>
                  <a
                    href={a.href}
                    className={`sa-h-bi${a.hero ? " is-hero" : ""}`}
                    {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => {
                      if (a.tap) trackTap({ storeId, kind: a.tap, page });
                    }}
                    data-sa-bar={a.id}
                  >
                    <SaIcon name={a.icon} size={22} />
                    <span>{BAR_LABEL[a.id] ?? a.short}</span>
                    {a.external && <ExtHint />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>,
          document.body
        )}
    </>
  );
}
