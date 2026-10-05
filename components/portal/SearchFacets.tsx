"use client";
/**
 * 「こだわり条件で絞る」（公開スイッチ ON の /search だけ。components/SearchClient が React.lazy で読み込む）。
 *
 * 仕組み: SearchClient が「いまの絞り込み（キーワード・地域・業種・タグ）をかけた店」の一覧（base）と、画面の組み立て関数（render）を渡す。
 * ここで条件（URL の ?budget= と ?f=）を読み、base をさらに絞って、条件のパネル・注意書き・店カードの札を足して render に返す。
 * 判定は、サーバーが作った店ID＋判定ビットの小さな表（facets）を引くだけ。文字列の解析はここではしない（lib/portal/facetRow.ts）。
 *
 * - 条件はボタン（押すと ON/OFF。予算は帯を1つ）。全部を満たす店に絞る。
 * - 各ボタンの数字は、いまの他の絞り込みをかけた状態でその条件を足したときの店数。0 店になる条件は押せない（aria-disabled。Tab では届く）。
 * - URL と同期（history.pushState。戻る・進む・再読み込みで状態が保たれる）。画面幅 767px 以下では条件が下から出るシートになる。
 * - 「いま営業中」だけは現在時刻で決まるので、既存の getOpenStatus で、分単位に更新しながら判定する。
 */
import Link from "next/link";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import type { SearchItem } from "@/lib/regions";
import { sized } from "@/lib/imageUrl";
import {
  BOOL_FACETS,
  BUDGET_BANDS,
  FACET_BY_ID,
  FACET_DEFS,
  FACET_GROUPS,
  hasBit,
  parseSelection,
  rowOf,
  selectionParams,
  type BoolFacetId,
  type FacetExt,
  type FacetId,
  type FacetPayload,
  type FacetSelection,
} from "@/lib/portal/facetDefs";
import { isOpenState } from "@/lib/portal/openNow";
import { statusOf, useNowMs } from "./OpenNow";
import SaveButton from "./SaveButton";
import { CSS_SEARCH_FACETS } from "./searchFacetsCss";

interface Props {
  /** キーワード・地域・業種・タグで絞った店（条件で絞る前） */
  base: SearchItem[];
  facets: FacetPayload;
  sp: ReadonlyURLSearchParams;
  render: (list: SearchItem[], ext: FacetExt) => ReactNode;
}

/* ───────────── 画面幅（767px 以下はシート） ───────────── */

const MQ = "(max-width: 767px)";
function subscribeMq(cb: () => void) {
  const m = window.matchMedia(MQ);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function useIsSheet(): boolean {
  return useSyncExternalStore(
    subscribeMq,
    () => window.matchMedia(MQ).matches,
    () => false,
  );
}

/* ───────────── URL ───────────── */

/** いまの URL の選択（クリックの瞬間の最新の状態を読む） */
function readSelection(facets: FacetPayload): FacetSelection {
  const p = new URLSearchParams(window.location.search);
  return parseSelection(p.get("budget"), p.get("f"), facets);
}

/** 選択を URL に書く（pushState。ほかの検索条件・ハッシュは保つ。Next.js の useSearchParams と同期する） */
function writeSelection(sel: FacetSelection) {
  const p = new URLSearchParams(window.location.search);
  const { budget, f } = selectionParams(sel);
  if (budget) p.set("budget", budget);
  else p.delete("budget");
  if (f) p.set("f", f);
  else p.delete("f");
  const qs = p.toString();
  window.history.pushState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash);
}

/* ───────────── 店カード ───────────── */

/** 店カードの札 1 枚。on = 選んでいる条件（先頭に並べ、見分けがつく見た目にする） */
interface CardTag {
  label: string;
  on: boolean;
}
/** 1 枚のカードに出す札の最大数 */
const MAX_TAGS = 4;

/**
 * 店カード。カード全体が店ページへのリンク（.fc-card-link を全面に重ねる）で、右上に「候補に入れる」（SaveButton）を重ねる。
 * リンクの中にボタンを入れない（入れ子の操作要素は押し分けられない）ため、ルートは div にして、リンクとボタンを兄弟にしてある。
 */
function FacetCard({ r, tags, total }: { r: SearchItem; tags: CardTag[]; total: number }) {
  return (
    <div className={"rest-card fc-card " + (r.shape || "")}>
      <Link href={`/restaurant/${r.id}`} className="fc-card-link" data-cursor="VIEW">
        <div className="img">
          <img
            src={sized(r.image, 640)}
            alt={r.name}
            loading="lazy"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="meta">
          <span>
            #{r.id.replace(/^r/, "").padStart(2, "0")} · {r.area}
          </span>
        </div>
        <div className="body">
          <div className="cuisine">{r.cuisine}</div>
          <h4>{r.name}</h4>
          {tags.length > 0 && (
            <ul className="fc-tags" aria-label={total > tags.length ? `この店に当てはまる条件（${total}件のうち${tags.length}件）` : "この店に当てはまる条件"}>
              {tags.map((t) => (
                <li key={t.label} data-on={t.on ? "1" : undefined}>
                  {t.on && <span className="fc-vh">選んだ条件: </span>}
                  {t.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
      <SaveButton id={r.id} name={r.name} variant="card" page="/search" />
    </div>
  );
}

/* ───────────── 本体 ───────────── */

export default function SearchFacets({ base, facets, sp, render }: Props) {
  const uid = useId();
  const sel = useMemo(() => parseSelection(sp.get("budget"), sp.get("f"), facets), [sp, facets]);
  const nowRaw = useNowMs();
  // この部品はクライアントだけで描かれる（/search は useSearchParams で CSR）。分の頭に丸めた現在時刻（ミリ秒）
  const now = nowRaw ?? Math.floor(Date.now() / 60000) * 60000;

  /* 店ごとの判定（予算の帯・判定ビット・いま営業中） */
  const wantOpen = sel.ids.includes("open");
  const boolIds = sel.ids.filter((i): i is BoolFacetId => i !== "open");
  const boolShown = useMemo(() => facets.shown.filter((i): i is BoolFacetId => i !== "open"), [facets]);
  const shops = useMemo(
    () =>
      base.map((r) => {
        const [band, mask] = rowOf(facets, r.id);
        const st = statusOf(facets.weeks, r.id, now);
        return { r, band, mask, open: !!st && isOpenState(st.state) };
      }),
    [base, facets, now],
  );
  const shopById = useMemo(() => new Map(shops.map((s) => [s.r.id, s])), [shops]);
  // 条件ごとの「当てはまる店の数」（全店）。少ない条件ほど、その店を特徴づけるので、札では先に出す
  const rarity = useMemo(() => {
    const n: Record<string, number> = {};
    for (const id of BOOL_FACETS) n[id] = 0;
    for (const [, mask] of Object.values(facets.rows)) BOOL_FACETS.forEach((id) => hasBit(mask, id) && n[id]++);
    return n;
  }, [facets]);
  const view = useMemo(() => {
    const facetOk = shops.map((s) => boolIds.every((f) => hasBit(s.mask, f)) && (!wantOpen || s.open));
    const list: SearchItem[] = [];
    shops.forEach((s, i) => {
      if (facetOk[i] && (sel.band === null || s.band === sel.band)) list.push(s.r);
    });
    // 各条件を足したときの店数（選んでいる条件は、いまの結果の店数）
    const counts: Record<string, number> = {};
    for (const id of facets.shown) {
      if (sel.ids.includes(id)) {
        counts[id] = list.length;
        continue;
      }
      let n = 0;
      shops.forEach((s, i) => {
        if (!facetOk[i] || (sel.band !== null && s.band !== sel.band)) return;
        if (id === "open" ? s.open : hasBit(s.mask, id)) n++;
      });
      counts[id] = n;
    }
    // 予算の帯は1つだけ選ぶ。選んでいる帯は結果の店数、ほかの帯は「その帯に替えたとき」の店数
    const bandCounts: Record<number, number> = {};
    for (const b of facets.shownBands) {
      if (sel.band === b) {
        bandCounts[b] = list.length;
        continue;
      }
      let n = 0;
      shops.forEach((s, i) => {
        if (facetOk[i] && s.band === b) n++;
      });
      bandCounts[b] = n;
    }
    return { list, counts, bandCounts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, sel, facets, wantOpen]);

  /* 操作 */
  const toggle = useCallback(
    (id: FacetId) => {
      const cur = readSelection(facets);
      const has = cur.ids.includes(id);
      const ids = FACET_DEFS.map((d) => d.id).filter((x) => (x === id ? !has : cur.ids.includes(x)));
      writeSelection({ band: cur.band, ids });
    },
    [facets],
  );
  const pickBand = useCallback(
    (b: number) => {
      const cur = readSelection(facets);
      writeSelection({ band: cur.band === b ? null : b, ids: cur.ids });
    },
    [facets],
  );
  const clearAll = useCallback(() => {
    const cur = readSelection(facets);
    if (cur.band === null && cur.ids.length === 0) return;
    writeSelection({ band: null, ids: [] });
  }, [facets]);

  /* シート（767px 以下）の開閉・フォーカス・Esc・背景のスクロール止め */
  const isSheet = useIsSheet();
  const [open, setOpen] = useState(false);
  const sheetOpen = open && isSheet;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const closeSheet = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (sheetOpen) {
      wasOpen.current = true;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const t = window.setTimeout(() => closeRef.current?.focus(), 30);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [sheetOpen]);
  const onSheetKey = (e: KeyboardEvent<HTMLElement>) => {
    if (!sheetOpen) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      closeSheet();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>("button") ?? []).filter((n) => n.offsetParent !== null);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* 画面に出すもの */
  const nSel = sel.ids.length + (sel.band === null ? 0 : 1);
  const active = nSel > 0;
  // 選んでいる条件の札（結果の店はすべて当てはまる）。件数の行（summary）に出す
  const tags = useMemo(
    () => [...(sel.band === null ? [] : [`予算 ${BUDGET_BANDS[sel.band].label}`]), ...sel.ids.map((id) => FACET_BY_ID[id].badge)],
    [sel],
  );
  /**
   * 店ごとの札: その店に当てはまる条件（最大 MAX_TAGS）。選んでいる条件を先頭に、続けて選んでいない条件
   * （予算の帯 → 当てはまる店が少ない条件の順 → いま営業中）。画面に出している条件（facets.shown）だけ。
   * 設備・特徴の札は「〜の記載あり」（FACET_DEFS の badge）。
   */
  const tagsOf = (id: string): { tags: CardTag[]; total: number } => {
    const s = shopById.get(id);
    if (!s) return { tags: [], total: 0 };
    const all: CardTag[] = [];
    if (sel.band !== null) all.push({ label: `予算 ${BUDGET_BANDS[sel.band].label}`, on: true });
    for (const sid of sel.ids) all.push({ label: FACET_BY_ID[sid].badge, on: true });
    if (sel.band === null && s.band >= 0 && facets.shownBands.includes(s.band)) all.push({ label: `予算 ${BUDGET_BANDS[s.band].label}`, on: false });
    const rest = boolShown
      .filter((fid) => !sel.ids.includes(fid) && hasBit(s.mask, fid))
      .sort((a, b) => rarity[a] - rarity[b] || BOOL_FACETS.indexOf(a) - BOOL_FACETS.indexOf(b));
    for (const fid of rest) all.push({ label: FACET_BY_ID[fid].badge, on: false });
    if (s.open && !sel.ids.includes("open") && facets.shown.includes("open")) all.push({ label: FACET_BY_ID.open.badge, on: false });
    return { tags: all.slice(0, MAX_TAGS), total: all.length };
  };

  const chip = (key: string, label: string, n: number, on: boolean, onClick: () => void) => {
    const zero = n === 0 && !on;
    return (
      <button
        key={key}
        type="button"
        className="fc-chip"
        aria-pressed={on}
        aria-disabled={zero ? true : undefined}
        aria-label={`${label}（${n}店）`}
        data-zero={zero ? "1" : undefined}
        onClick={() => {
          if (!zero) onClick();
        }}
      >
        <span>{label}</span>
        <span className="fc-c" aria-hidden="true">
          {n}
        </span>
      </button>
    );
  };

  const clearBtn = (cls: string) => (
    <button type="button" className={"fc-clear " + cls} aria-disabled={active ? undefined : true} onClick={clearAll}>
      条件をすべて外す
    </button>
  );

  const panel = (
    <div className="fc" data-open={sheetOpen ? "1" : "0"} id="fc-panel">
      <style href="fc-search" precedence="fc-1">
        {CSS_SEARCH_FACETS}
      </style>
      <div className="fc-bar">
        <button
          ref={triggerRef}
          type="button"
          className="fc-open"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-controls={uid + "-sheet"}
          aria-label={nSel > 0 ? `こだわり条件で絞る（${nSel}件を選択中）` : "こだわり条件で絞る"}
          onClick={() => setOpen(true)}
        >
          <span className="fc-open-l">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="7" cy="5" r="2" fill="var(--paper,#fffdf7)" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="13" cy="10" r="2" fill="var(--paper,#fffdf7)" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="15" r="2" fill="var(--paper,#fffdf7)" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            こだわり条件で絞る
          </span>
          {nSel > 0 && (
            <span className="fc-badge" aria-hidden="true">
              {nSel}
            </span>
          )}
        </button>
      </div>
      <div className="fc-backdrop" onClick={closeSheet} aria-hidden="true" />
      <section
        ref={sheetRef}
        id={uid + "-sheet"}
        className="fc-sheet"
        role={isSheet ? "dialog" : "group"}
        aria-modal={sheetOpen ? true : undefined}
        aria-hidden={isSheet && !sheetOpen ? true : undefined}
        aria-labelledby={uid + "-title"}
        onKeyDown={onSheetKey}
      >
        <div className="fc-head">
          <div>
            <p className="fc-eyebrow">◎ こだわり条件</p>
            <h2 className="fc-title" id={uid + "-title"}>
              条件を重ねて、<em>絞る。</em>
            </h2>
          </div>
          {clearBtn("fc-clear-head")}
          <button ref={closeRef} type="button" className="fc-close" aria-label="閉じる" onClick={closeSheet}>
            <span aria-hidden="true">×</span>
          </button>
          <p className="fc-lead">選んだ条件をすべて満たす店だけを表示します。店の案内に書かれていないことは「不明」とし、条件には含めません。</p>
        </div>
        <div className="fc-scroll">
          {facets.shownBands.length > 0 && (
            <div className="fc-group" role="group" aria-labelledby={uid + "-g-budget"}>
              <div className="fc-gl" id={uid + "-g-budget"}>
                予算
                <small>店の案内にある予算の上限による</small>
              </div>
              <div className="fc-chips">
                {facets.shownBands.map((b) => chip("b" + b, BUDGET_BANDS[b].label, view.bandCounts[b] ?? 0, sel.band === b, () => pickBand(b)))}
              </div>
            </div>
          )}
          {FACET_GROUPS.map((g) => {
            const defs = FACET_DEFS.filter((d) => d.group === g.id && facets.shown.includes(d.id));
            if (defs.length === 0) return null;
            return (
              <div className="fc-group" role="group" aria-labelledby={uid + "-g-" + g.id} key={g.id}>
                <div className="fc-gl" id={uid + "-g-" + g.id}>
                  {g.title}
                  {g.note && <small>{g.note}</small>}
                </div>
                <div className="fc-chips">{defs.map((d) => chip(d.id, d.label, view.counts[d.id] ?? 0, sel.ids.includes(d.id), () => toggle(d.id)))}</div>
              </div>
            );
          })}
        </div>
        <div className="fc-foot">
          {clearBtn("fc-clear-foot")}
          <button type="button" className="fc-apply" onClick={closeSheet}>
            <em>{view.list.length}</em>店を見る
          </button>
        </div>
      </section>
      <p className="fc-vh" role="status" aria-live="polite">
        {active ? `条件に合う店は${view.list.length}店です` : ""}
      </p>
    </div>
  );

  const ext: FacetExt = {
    panel,
    active,
    notice: active ? (
      <p className="fc-note">
        <span>条件が分かっている店だけを表示しています（不明の店は含みません）</span>
        <small>店の案内に書かれている内容による。最新の情報は店にご確認ください。</small>
      </p>
    ) : null,
    summary: active ? <>{tags.join(" / ")} / </> : null,
    renderCard: (r) => {
      const t = tagsOf(r.id);
      return <FacetCard key={r.id} r={r} tags={t.tags} total={t.total} />;
    },
  };

  return <>{render(view.list, ext)}</>;
}
