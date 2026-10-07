"use client";
/**
 * 行動ボタン（ShopActions）の部品: 自作アイコン・リンク1つ分（Act）・共有の動き・現れ方。
 * 総合サイトの公開スイッチが ON のときだけ、RestaurantDetail の React.lazy から読み込まれる。
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { shareUrls } from "@/lib/portal/share";
import { trackTap, type TapKind } from "@/lib/portal/track";
import type { IconKey, PrimaryAction } from "@/lib/portal/shopActions";

/* ---------- アイコン（24×24・単色・currentColor。各 SNS の公式ロゴは使わず、一目で分かる単純な形） ---------- */

const ICONS: Record<IconKey, ReactNode> = {
  // カレンダー
  reserve: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="m9 15 2.1 2.1L15.4 13" />
    </>
  ),
  // 受話器
  phone: (
    <path
      transform="scale(1.2)"
      strokeWidth="1.34"
      d="M5.2 3h2.3l1.3 3.4-1.7 1.2a9.3 9.3 0 0 0 4.3 4.3l1.2-1.7 3.4 1.3v2.3A1.8 1.8 0 0 1 14.2 15 11.8 11.8 0 0 1 3 3.8 1.8 1.8 0 0 1 5.2 3Z"
    />
  ),
  // ピン
  pin: (
    <>
      <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  // 折りたたんだ地図
  map: (
    <>
      <path d="m3.5 6.6 5.5-2.4 6 2.4 5.5-2.4v13.2L15 19.8l-6-2.4-5.5 2.4Z" />
      <path d="M9 4.2v13.2M15 6.6v13.2" />
    </>
  ),
  // Instagram: 角丸四角＋円＋点
  instagram: (
    <>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  // TikTok: 音符
  tiktok: (
    <>
      <path d="M14.5 3.5v10.9a3.9 3.9 0 1 1-3.9-3.9" />
      <path d="M14.5 3.5c.3 2.6 2 4.4 4.8 4.7" />
    </>
  ),
  // X: 交差する2本
  x: (
    <>
      <path d="M4.8 4.6 19.2 19.4" strokeWidth="2.1" />
      <path d="M19.2 4.6 4.8 19.4" strokeWidth="1.3" />
    </>
  ),
  // Facebook: f
  facebook: (
    <path d="M13.8 21v-8h2.7l.5-3.2h-3.2V8c0-1 .5-1.7 1.8-1.7H17V3.4c-.4 0-1.4-.2-2.6-.2-2.6 0-4.3 1.6-4.3 4.4v2.2H7.4V13h2.7v8Z" />
  ),
  // LINE: 吹き出し
  line: (
    <>
      <path d="M12 3.5c-4.7 0-8.5 3-8.5 6.8 0 3.1 2.5 5.7 6.1 6.5.4.1.8.3.8.7l-.1 1.6c0 .4.4.6.7.4 1.5-.8 5.3-3.2 7-5.3a6 6 0 0 0 1.5-3.9c0-3.8-3.8-6.8-8.5-6.8Z" />
      <path d="M8.2 10.3h.01M12 10.3h.01M15.8 10.3h.01" strokeWidth="2.3" />
    </>
  ),
  // 公式サイト: 地球
  website: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.3-3.6-8.6S9.6 5.8 12 3.4Z" />
    </>
  ),
  // リンク
  link: (
    <>
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5 0l3.1-3.1a3.6 3.6 0 0 0-5-5l-1.1 1.1" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5 0l-3.1 3.1a3.6 3.6 0 0 0 5 5l1.1-1.1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export function SaIcon({ name, size = 24 }: { name: IconKey; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

/** 矢印（→）。向きを変えるのは CSS 側 */
export function SaArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.5 12h14.5M13 6l6 6-6 6" />
    </svg>
  );
}

export function ExtHint() {
  return <span className="sa-vh">（外部サイトが新しいタブで開きます）</span>;
}

/* ---------- リンク1つ分 ---------- */

interface ActProps {
  a: PrimaryAction;
  storeId: string;
  page: string;
  className: string;
  children: ReactNode;
  /** 読み上げ用の名前（見た目の補足を出さない代わりに、行き先の種類を入れる）。外部リンクなら「新しいタブ」の案内を足す */
  aria: string;
}

export function Act({ a, storeId, page, className, children, aria }: ActProps) {
  return (
    <a
      href={a.href}
      {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      aria-label={`${aria}${a.external ? "（外部サイトが新しいタブで開きます）" : ""}`}
      data-sa-id={a.id}
      data-dir={a.href.startsWith("#") ? "down" : undefined}
      onClick={() => {
        if (a.tap) trackTap({ storeId, kind: a.tap, page });
      }}
    >
      {children}
    </a>
  );
}

/* ---------- 共有（LINE・X・Facebook・リンクをコピー） ---------- */

export interface ShareItem {
  id: "line" | "x" | "facebook";
  label: string;
  href: string;
  icon: IconKey;
  tap: TapKind;
}

export function useShare({ url, text, storeId, page }: { url: string; text: string; storeId: string; page: string }) {
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const [manual, setManual] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urls = shareUrls(url, text);

  const items: ShareItem[] = [
    { id: "line", label: "LINE", href: urls.line, icon: "line", tap: "share-line" },
    { id: "x", label: "X", href: urls.x, icon: "x", tap: "share-x" },
    { id: "facebook", label: "Facebook", href: urls.facebook, icon: "facebook", tap: "share-facebook" },
  ];

  useEffect(() => {
    if (manual) {
      input.current?.focus();
      input.current?.select();
    }
  }, [manual]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const tap = useCallback((kind: TapKind) => trackTap({ storeId, kind, page }), [storeId, page]);

  const copy = useCallback(async () => {
    tap("share-copy");
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(url);
      setManual(false);
      setCopied(true);
      setMsg("リンクをコピーしました");
      timer.current = setTimeout(() => {
        setCopied(false);
        setMsg("");
      }, 2600);
    } catch {
      setManual(true);
      setMsg("コピーできませんでした。表示したURLを選択しました。コピーしてお使いください。");
    }
  }, [tap, url]);

  return { items, tap, copy, copied, msg, manual, input, url };
}

export type ShareState = ReturnType<typeof useShare>;

/** コピー失敗時のURL欄と、読み上げ・表示用のメッセージ */
export function ShareFoot({ s }: { s: ShareState }) {
  return (
    <>
      {s.manual && (
        <input
          ref={s.input}
          className="sa-share-url"
          type="text"
          readOnly
          value={s.url}
          aria-label="共有するURL"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
      <p className="sa-share-msg" role="status" aria-live="polite">
        {s.msg}
      </p>
    </>
  );
}

/* ---------- 読み込み直後の現れ方（見えるとき1回。動きを減らす設定のときは何もしない） ---------- */

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * root に data-enter="pre"（隠す）→ 見えたら "in"（現れる）を付ける。値は DOM にだけ書く（再描画しない）。
 * すでに画面に見えているときは隠さずにそのまま出す（ちらつかせない）。
 */
export function useEnter() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
      el.dataset.enter = "in";
      return;
    }
    el.dataset.enter = "pre";
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          el.dataset.enter = "in";
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    const fb = window.setTimeout(() => {
      el.dataset.enter = "in";
    }, 6000);
    return () => {
      io.disconnect();
      window.clearTimeout(fb);
    };
  }, []);
  return ref;
}
