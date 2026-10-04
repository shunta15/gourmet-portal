"use client";
/**
 * 総合ヘッダーの検索（候補表示つきの combobox）の動き。
 * 候補データ /search-index.json は、検索欄に初めてフォーカスしたときに1回だけ取得する（@/lib/data はクライアントに入れない）。
 * 照合は lib/portal/searchCore.ts（サーバーの /find と同じ関数）。JS が無い・取得に失敗したときは、
 * 普通の GET フォーム（/find?q=）として動く。
 */
import { useRouter } from "next/navigation";
import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { prepare, search, type Candidate, type Prepared, type SearchIndexJson } from "@/lib/portal/searchCore";

let indexPromise: Promise<Prepared[]> | null = null;

/** 候補データの取得（ページの寿命で1回。失敗したら次のフォーカスで取り直す） */
export function loadSearchIndex(): Promise<Prepared[]> {
  if (!indexPromise) {
    indexPromise = fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`search-index ${r.status}`);
        return r.json() as Promise<SearchIndexJson>;
      })
      .then(prepare)
      .catch((e) => {
        indexPromise = null;
        throw e;
      });
  }
  return indexPromise;
}

/** 一覧の最後に出す「すべての結果を見る」行 */
export interface AllRow {
  kind: "all";
  name: string;
  sub: string;
  href: string;
}
export type Row = Candidate | AllRow;

export function findHref(q: string): string {
  return `/find?q=${encodeURIComponent(q.trim())}`;
}

export interface UseSiteSearch {
  q: string;
  setQ: (v: string) => void;
  rows: Row[];
  showList: boolean;
  status: "idle" | "loading" | "ready" | "error";
  active: number;
  listId: string;
  optionId: (i: number) => string;
  /** 読み上げ用の状況文 */
  announce: string;
  inputProps: {
    value: string;
    role: "combobox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-autocomplete": "list";
    "aria-activedescendant": string | undefined;
    autoComplete: "off";
    autoCapitalize: "off";
    spellCheck: false;
    enterKeyHint: "search";
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  };
  go: (row: Row) => void;
  close: () => void;
}

export function useSiteSearch(opts: { onNavigate?: () => void; onEscapeWhenClosed?: () => void } = {}): UseSiteSearch {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const optionId = useCallback((i: number) => `${id}-opt-${i}`, [id]);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Prepared[] | null>(null);
  const [status, setStatus] = useState<UseSiteSearch["status"]>("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const onNavigate = useRef(opts.onNavigate);
  onNavigate.current = opts.onNavigate;
  const onEsc = useRef(opts.onEscapeWhenClosed);
  onEsc.current = opts.onEscapeWhenClosed;

  const trimmed = q.trim();
  const results = useMemo(() => (items && trimmed ? search(items, trimmed) : []), [items, trimmed]);
  const rows: Row[] = useMemo(
    () => (trimmed ? [...results, { kind: "all" as const, name: `「${trimmed}」の検索結果をすべて見る`, sub: "", href: findHref(trimmed) }] : []),
    [results, trimmed],
  );
  const showList = open && trimmed.length > 0;

  const load = useCallback(() => {
    if (items || status === "loading") return;
    setStatus("loading");
    loadSearchIndex().then(
      (p) => {
        setItems(p);
        setStatus("ready");
      },
      () => setStatus("error"),
    );
  }, [items, status]);

  const go = useCallback(
    (row: Row) => {
      setOpen(false);
      setActive(-1);
      setQ("");
      onNavigate.current?.();
      router.push(row.href);
    },
    [router],
  );

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 変換中（IME）の Enter・矢印は候補の操作にしない
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!trimmed) return;
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(e.key === "ArrowDown" ? 0 : rows.length - 1);
        return;
      }
      const n = rows.length;
      setActive((a) => (e.key === "ArrowDown" ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
    } else if (e.key === "Enter") {
      if (showList && active >= 0 && rows[active]) {
        e.preventDefault();
        go(rows[active]);
      }
      // 選んでいなければ、フォームの送信（/find?q=）に任せる
    } else if (e.key === "Escape") {
      if (showList) {
        e.preventDefault();
        e.stopPropagation();
        close();
      } else {
        onEsc.current?.();
      }
    }
  };

  const announce = !showList
    ? ""
    : status === "loading" || status === "idle"
      ? "候補を読み込んでいます"
      : status === "error"
        ? "候補を取得できませんでした。Enter で検索できます"
        : results.length === 0
          ? "候補はありません。Enter で検索できます"
          : `${results.length}件の候補があります。上下の矢印キーで選べます`;

  return {
    q,
    setQ,
    rows,
    showList,
    status,
    active,
    listId,
    optionId,
    announce,
    inputProps: {
      value: q,
      role: "combobox",
      "aria-expanded": showList,
      "aria-controls": listId,
      "aria-autocomplete": "list",
      "aria-activedescendant": showList && active >= 0 ? optionId(active) : undefined,
      autoComplete: "off",
      autoCapitalize: "off",
      spellCheck: false,
      enterKeyHint: "search",
      onChange: (e) => {
        setQ(e.target.value);
        setOpen(true);
        setActive(-1);
        load();
      },
      onFocus: () => {
        load();
        setOpen(true);
      },
      onBlur: () => setOpen(false),
      onKeyDown,
    },
    go,
    close,
  };
}
