"use client";
/**
 * 共有ボタン（LINE・X・Facebook・リンクをコピー）。外部のウィジェットは読み込まない（普通のリンク）。
 * スマホなどで Web Share API が使えるときは「共有」1つにまとめる（ハイドレーションを合わせるため、
 * 最初の描画は常に4つ。マウント後に判定して切り替える）。
 * コピーが失敗したとき（http・権限なし）は、URL の入った欄を出して選択状態にする。
 * タップは lib/portal/track.ts で数える（storeId・kind・page だけ）。
 *
 * variant:
 *  - "portal"  総合サイトの見た目（portal.css の .mp-share*）
 *  - "gourmet" グルメの既存ページに馴染む見た目（グルメの CSS 変数と最小限のインライン指定。portal.css は読まれない）
 */
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { shareUrls } from "@/lib/portal/share";
import { trackTap, type TapKind } from "@/lib/portal/track";
import { Icon } from "./icons";

interface Props {
  /** 共有する絶対URL（lib/portal/share.ts の shareTarget で作る） */
  url: string;
  /** X・共有シートに渡す文言（ページ名など） */
  text: string;
  /** 計測用のページのパス */
  page: string;
  /** 店のページなら店 ID（駅・県などは省略） */
  storeId?: string;
  variant?: "portal" | "gourmet";
  /** 見出し（既定は「このページを共有」） */
  label?: string;
}

const G: Record<string, CSSProperties> = {
  wrap: { marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--line)" },
  label: { fontSize: 12, letterSpacing: "0.2em", color: "var(--ink-soft)", margin: "0 0 14px" },
  row: { display: "flex", flexWrap: "wrap", gap: 10 },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    padding: "0 18px",
    border: "1px solid var(--line)",
    borderRadius: 0,
    background: "transparent",
    color: "var(--ink)",
    font: "inherit",
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
  },
  msg: { minHeight: "1.6em", margin: "10px 0 0", fontSize: 13, color: "var(--ink-soft)" },
  url: {
    width: "100%",
    maxWidth: 560,
    marginTop: 12,
    padding: "10px 12px",
    border: "1px solid var(--ink)",
    background: "transparent",
    color: "var(--ink)",
    font: "inherit",
    fontSize: 13,
  },
};

const SR_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
};

/** 読み上げ専用の文字（総合サイトは .mp-sr、グルメは portal.css が無いのでインライン） */
function Sr({ g, children }: { g: boolean; children: string }) {
  return g ? <span style={SR_STYLE}>{children}</span> : <span className="mp-sr">{children}</span>;
}

export default function ShareButtons({ url, text, page, storeId, variant = "portal", label = "このページを共有" }: Props) {
  const gourmet = variant === "gourmet";
  const id = useId();
  const [native, setNative] = useState(false);
  const [msg, setMsg] = useState("");
  const [manual, setManual] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urls = shareUrls(url, text);

  // Web Share API があり、指が主な入力（スマホ・タブレット）のときだけ「共有」1つにする
  useEffect(() => {
    try {
      if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) setNative(true);
    } catch {
      /* 判定できなければ4つのまま */
    }
  }, []);

  useEffect(() => {
    if (manual) {
      input.current?.focus();
      input.current?.select();
    }
  }, [manual]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const tap = (kind: TapKind) => trackTap({ storeId, kind, page });

  function say(m: string) {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 4000);
  }

  async function copy() {
    tap("share-copy");
    try {
      await navigator.clipboard.writeText(url);
      setManual(false);
      say("リンクをコピーしました");
    } catch {
      setManual(true);
      if (timer.current) clearTimeout(timer.current);
      setMsg("コピーできませんでした。表示したURLを選択しました。コピーしてお使いください。");
    }
  }

  async function nativeShare() {
    tap("share-native");
    try {
      await navigator.share({ title: text, url });
    } catch (e) {
      // 閉じただけ（AbortError）は何もしない。ほかの失敗は4つのボタンに戻す
      if (!(e instanceof DOMException && e.name === "AbortError")) setNative(false);
    }
  }

  const cls = (n: string) => (gourmet ? undefined : n);
  const sty = (s: CSSProperties) => (gourmet ? s : undefined);
  const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
  const labelId = `${id}-t`;

  return (
    <div className={cls("mp-share")} style={sty(G.wrap)} role="group" aria-labelledby={labelId} data-share="">
      <p id={labelId} className={cls("mp-share-t")} style={sty(G.label)}>
        {label}
      </p>
      <div className={cls("mp-share-row")} style={sty(G.row)}>
        {native ? (
          <button type="button" className={cls("mp-share-b")} style={sty(G.btn)} onClick={nativeShare} data-cursor="SHARE" data-share-kind="native">
            <Icon name="share" />
            共有する
          </button>
        ) : (
          <>
            <a href={urls.line} {...ext} className={cls("mp-share-b")} style={sty(G.btn)} onClick={() => tap("share-line")} data-cursor="SHARE" data-share-kind="line">
              <Icon name="line" />
              LINE<Sr g={gourmet}>で共有（外部サイトが新しいタブで開きます）</Sr>
            </a>
            <a href={urls.x} {...ext} className={cls("mp-share-b")} style={sty(G.btn)} onClick={() => tap("share-x")} data-cursor="SHARE" data-share-kind="x">
              <Icon name="x" />X<Sr g={gourmet}>で共有（外部サイトが新しいタブで開きます）</Sr>
            </a>
            <a href={urls.facebook} {...ext} className={cls("mp-share-b")} style={sty(G.btn)} onClick={() => tap("share-facebook")} data-cursor="SHARE" data-share-kind="facebook">
              <Icon name="facebook" />
              Facebook<Sr g={gourmet}>で共有（外部サイトが新しいタブで開きます）</Sr>
            </a>
            <button type="button" className={cls("mp-share-b")} style={sty(G.btn)} onClick={copy} data-cursor="SHARE" data-share-kind="copy">
              <Icon name="copy" />
              リンクをコピー
            </button>
          </>
        )}
      </div>
      {manual && (
        <input
          ref={input}
          className={cls("mp-share-url")}
          style={sty(G.url)}
          type="text"
          readOnly
          value={url}
          aria-label="共有するURL"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
      <p className={cls("mp-share-msg")} style={sty(G.msg)} role="status" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}
