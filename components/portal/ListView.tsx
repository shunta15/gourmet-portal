"use client";
/**
 * 候補リストの中身（/list の本体）。クライアント専用。
 *
 * 2 つの見え方:
 *  - 自分のリスト（/list）: localStorage に保存した店。1 店ずつ外す・全部外す（確認つき）・上へ／下へ・共有。
 *  - 共有されたリスト（/list?ids=r33,r16,…）: URL の店 ID だけから作る、読むだけの表示。
 *    「自分の候補に全部入れる」「1 店ずつ入れる」ができる。表示できない店（存在しない ID など）は並べず、件数だけ知らせる。50 店を超える分は切る。
 *
 * 表示できない店（/list-data/{ID} が 404）は、自分のリストでは自動で外さない。「この店はいま表示できません」の行で残し、手で「外す」だけできる
 * （プレビューの作成後に載った店を保存しても、リストから消えないように。店のデータは作成時に静的に作るので、後から増えた店は 404 になる）。
 *
 * 店のデータは、リストに入っている店の分だけ /list-data/{ID}（店ごとの小さな静的 JSON。lib/portal/listData.ts）を取る。
 * 全店のデータはクライアントに渡さない。営業中かどうかは、営業予定が読み取れた店だけ、現在時刻で判定する（components/portal/OpenNow）。
 * localStorage が使えなくても壊れない（lib/portal/savedList.ts がメモリに切り替える）。
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SHARE_ORIGIN } from "@/lib/portal/share";
import {
  LIST_MAX,
  addManySaved,
  cleanIds,
  clearSaved,
  insertSaved,
  listPath,
  moveSaved,
  parseIdsParam,
  removeSaved,
  usePersistent,
  useSavedList,
} from "@/lib/portal/savedList";
import { trackTap } from "@/lib/portal/track";
import type { ListShop } from "@/lib/portal/listShop";
import { OpenBadge, OpenScope, type WeekTableProp } from "./OpenNow";
import SaveButton from "./SaveButton";
import { SaveIcon } from "./SaveIcon";
import ShareButtons from "./ShareButtons";
import { CSS_BASE, CSS_PAGE } from "./saveListCss";

/* ───────────── 店のデータを取る（店ごとの静的 JSON） ───────────── */

type Entry = { s: "ok"; shop: ListShop } | { s: "gone" } | { s: "error" };

/** 取れたもの（ある・無い）は、このページを開いている間は取り直さない。通信の失敗は覚えない（やり直せる） */
const cache = new Map<string, Entry>();

const inflight = new Map<string, Promise<Entry>>();

function loadOne(id: string): Promise<Entry> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(id);
  if (!p) {
    p = fetchOne(id).finally(() => inflight.delete(id));
    inflight.set(id, p);
  }
  return p;
}

async function fetchOne(id: string): Promise<Entry> {
  try {
    const res = await fetch(`/list-data/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      const e: Entry = { s: "gone" };
      cache.set(id, e);
      return e;
    }
    if (!res.ok) return { s: "error" };
    const shop = (await res.json()) as ListShop;
    if (!shop || shop.id !== id || typeof shop.name !== "string") return { s: "error" };
    const e: Entry = { s: "ok", shop };
    cache.set(id, e);
    return e;
  } catch {
    return { s: "error" };
  }
}

/** 一度に取る数（50 店でも通信を詰まらせない） */
const POOL = 6;

function useShops(ids: string[], attempt: number): (id: string) => Entry | null {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const key = ids.join(",");
  useEffect(() => {
    let dead = false;
    const todo = ids.filter((id) => !cache.has(id));
    let next = 0;
    const worker = async () => {
      while (!dead && next < todo.length) {
        const id = todo[next++];
        const e = await loadOne(id);
        if (!dead) setEntries((prev) => ({ ...prev, [id]: e }));
      }
    };
    for (let i = 0; i < Math.min(POOL, todo.length); i++) void worker();
    return () => {
      dead = true;
    };
    // ids は key から作り直せる。attempt が変わったら（やり直し）、取れなかった分を取り直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);
  return useCallback((id: string) => cache.get(id) ?? entries[id] ?? null, [entries]);
}

/* ───────────── 小さな部品 ───────────── */

function Chevron({ dir }: { dir: "up" | "down" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={dir === "up" ? "M5 12.5l5-5 5 5" : "M5 7.5l5 5 5-5"} />
    </svg>
  );
}

/** 空のとき・共有された店が 1 つも見つからないときの、さがす入口 */
function Entrances() {
  return (
    <ul className="mp-chips">
      <li>
        <Link href="/gourmet" prefetch={false} data-cursor="GOURMET">グルメを探す</Link>
      </li>
      <li>
        <Link href="/station" prefetch={false} data-cursor="STATION">駅から探す</Link>
      </li>
      <li>
        <Link href="/map" prefetch={false} data-cursor="MAP">地図で探す</Link>
      </li>
    </ul>
  );
}

export function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="候補リストを読み込んでいます">
      <style href="sv-base" precedence="sv">
        {CSS_BASE}
      </style>
      <style href="sv-page" precedence="sv">
        {CSS_PAGE}
      </style>
      {[0, 1, 2].map((i) => (
        <div className="sv-sk" key={i}>
          <i />
          <span />
        </div>
      ))}
    </div>
  );
}

function RowSkeleton() {
  return (
    <li className="sv-sk" aria-hidden="true">
      <i />
      <span />
    </li>
  );
}

/** 店のデータが取れなかった行（404＝いま表示できない／通信の失敗）。自分のリストでは、手で外せる */
function UnavailableRow({
  no,
  id,
  kind,
  first,
  last,
  onMove,
  onRemove,
}: {
  no: number;
  id: string;
  kind: "gone" | "error";
  first: boolean;
  last: boolean;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string, label: string) => void;
}) {
  const label = `店番号 ${id}`;
  return (
    <li className="sv-row sv-gone" data-sv-row={id} data-sv-gone={kind}>
      <span className="sv-no" aria-hidden="true">
        {String(no).padStart(2, "0")}
      </span>
      <span className="sv-ph" aria-hidden="true">
        <span className="g">−</span>
      </span>
      <div className="sv-body">
        <small>{label}</small>
        <span className="sv-nm sv-nm-off">{kind === "gone" ? "この店はいま表示できません" : "この店のデータを読み込めませんでした"}</span>
        <span className="sv-ar">
          {kind === "gone"
            ? "このサイトに、まだ載っていない（または、もう載っていない）店です。リストには残してあります。"
            : "通信を確かめて、あとでもう一度お試しください。リストには残してあります。"}
        </span>
      </div>
      <div className="sv-ctl" role="group" aria-label={`${label}の操作`}>
        <button type="button" className="sv-mv" disabled={first} aria-label={`${label}を上へ`} data-sv-act={`up:${id}`} onClick={() => onMove(id, -1)}>
          <Chevron dir="up" />
        </button>
        <button type="button" className="sv-mv" disabled={last} aria-label={`${label}を下へ`} data-sv-act={`down:${id}`} onClick={() => onMove(id, 1)}>
          <Chevron dir="down" />
        </button>
        <button type="button" className="sv-rm" aria-label={`${label}を候補から外す`} data-sv-act={`rm:${id}`} onClick={() => onRemove(id, label)}>
          外す
        </button>
      </div>
    </li>
  );
}

interface RowProps {
  no: number;
  shop: ListShop;
  mine: boolean;
  first: boolean;
  last: boolean;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string, label: string) => void;
}

function Row({ no, shop, mine, first, last, onMove, onRemove }: RowProps) {
  const tone = { ["--ac" as string]: shop.color, ["--acl" as string]: shop.light } as CSSProperties;
  return (
    <li className="sv-row" style={tone} data-sv-row={shop.id}>
      <span className="sv-no" aria-hidden="true">
        {String(no).padStart(2, "0")}
      </span>
      <Link href={shop.href} prefetch={false} className="sv-ph" tabIndex={-1} aria-hidden="true">
        {shop.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.photo.src}
            srcSet={shop.photo.srcSet}
            sizes={shop.photo.srcSet ? "(max-width: 700px) 96px, 136px" : undefined}
            alt=""
            width={shop.photo.width ?? 480}
            height={shop.photo.height ?? 360}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="g">{shop.glyph}</span>
        )}
      </Link>
      <div className="sv-body">
        {shop.category && <small>{shop.category}</small>}
        <Link href={shop.href} prefetch={false} className="sv-nm" data-cursor="ENTER">
          {shop.name}
        </Link>
        {shop.area && <span className="sv-ar">{shop.area}</span>}
        {shop.week && <OpenBadge id={shop.id} />}
      </div>
      {mine ? (
        <div className="sv-ctl" role="group" aria-label={`${shop.name}の操作`}>
          <button type="button" className="sv-mv" disabled={first} aria-label={`${shop.name}を上へ`} data-sv-act={`up:${shop.id}`} onClick={() => onMove(shop.id, -1)}>
            <Chevron dir="up" />
          </button>
          <button type="button" className="sv-mv" disabled={last} aria-label={`${shop.name}を下へ`} data-sv-act={`down:${shop.id}`} onClick={() => onMove(shop.id, 1)}>
            <Chevron dir="down" />
          </button>
          <button type="button" className="sv-rm" aria-label={`${shop.name}を候補から外す`} data-sv-act={`rm:${shop.id}`} onClick={() => onRemove(shop.id, shop.name)}>
            外す
          </button>
        </div>
      ) : (
        <div className="sv-ctl">
          <SaveButton id={shop.id} name={shop.name} variant="inline" page="/list" />
        </div>
      )}
    </li>
  );
}

/* ───────────── 本体 ───────────── */

type Focus = { kind: "move"; id: string; dir: -1 | 1 } | { kind: "removed"; index: number } | { kind: "heading" };

export default function ListView() {
  const sp = useSearchParams();
  const sharedParam = sp.get("ids");
  const isShared = sharedParam !== null;
  const mine = useSavedList();

  // 共有 URL の店 ID（形の違うもの・重複は黙って除き、50 を超える分は切る）
  const sharedIds = useMemo(() => parseIdsParam(sharedParam), [sharedParam]);
  const sharedOver = useMemo(() => (sharedParam ? cleanIds(sharedParam.split(","), 100000).length - LIST_MAX : 0), [sharedParam]);
  const ids = isShared ? sharedIds : mine;

  const [attempt, setAttempt] = useState(0);
  const get = useShops(ids, attempt);

  const states = ids.map((id) => ({ id, e: get(id) }));
  const okShops = states.flatMap((x) => (x.e?.s === "ok" ? [x.e.shop] : []));
  const loading = states.filter((x) => x.e === null).length;
  const failed = states.filter((x) => x.e?.s === "error").length;
  const settled = loading === 0;

  // 表示できない店（404）を、保存から自動で外すことはしない（手で「外す」だけ）。行は UnavailableRow で残す。
  const gone = states.filter((x) => x.e?.s === "gone").length;

  // 営業中の判定に使う、営業予定の表（営業予定が読み取れた店だけ）
  const weeks = useMemo<WeekTableProp>(() => {
    const table: WeekTableProp["table"] = [];
    const index: WeekTableProp["index"] = {};
    for (const s of okShops) {
      if (!s.week) continue;
      index[s.id] = table.length;
      table.push(s.week);
    }
    return { table, index };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [okShops.map((s) => s.id).join(",")]);

  /* ── 画面内の案内（外した・入れた・戻す） ── */
  const [msg, setMsg] = useState<{ text: string; undo?: { id: string; index: number }; link?: boolean } | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const say = useCallback((m: { text: string; undo?: { id: string; index: number }; link?: boolean } | null) => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setMsg(m);
    if (m?.undo) msgTimer.current = setTimeout(() => setMsg(null), 10000);
  }, []);
  useEffect(
    () => () => {
      if (msgTimer.current) clearTimeout(msgTimer.current);
    },
    [],
  );
  // 別のリストに移ったら案内は消す
  useEffect(() => {
    setMsg(null);
  }, [sharedParam]);

  /* ── 操作後のフォーカス ── */
  const root = useRef<HTMLDivElement>(null);
  const focus = useRef<Focus | null>(null);
  useEffect(() => {
    const f = focus.current;
    if (!f || !root.current) return;
    focus.current = null;
    const q = (sel: string) => root.current?.querySelector<HTMLElement>(sel) ?? null;
    let el: HTMLElement | null = null;
    if (f.kind === "move") {
      const want = f.dir === -1 ? "up" : "down";
      const other = f.dir === -1 ? "down" : "up";
      const a = q(`[data-sv-act="${want}:${f.id}"]`);
      el = a && !(a as HTMLButtonElement).disabled ? a : q(`[data-sv-act="${other}:${f.id}"]`);
    } else if (f.kind === "removed") {
      const btns = root.current.querySelectorAll<HTMLElement>('[data-sv-act^="rm:"]');
      el = btns[Math.min(f.index, btns.length - 1)] ?? null;
    }
    (el ?? q("#sv-h"))?.focus();
  });

  const onMove = (id: string, dir: -1 | 1) => {
    focus.current = { kind: "move", id, dir };
    moveSaved(id, dir);
  };
  const onRemove = (id: string, label: string) => {
    const index = mine.indexOf(id);
    focus.current = { kind: "removed", index };
    removeSaved(id);
    say({ text: `「${label}」を候補から外しました（残り${Math.max(0, mine.length - 1)}店）。`, undo: { id, index } });
    trackTap({ storeId: id, kind: "unsave", page: "/list" });
  };
  const onUndo = (u: { id: string; index: number }) => {
    insertSaved(u.id, u.index);
    say({ text: "元に戻しました。" });
  };

  const [confirming, setConfirming] = useState(false);
  const cancelBtn = useRef<HTMLButtonElement>(null);
  const clearBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirming) cancelBtn.current?.focus();
  }, [confirming]);
  const onClearAll = () => {
    const n = mine.length;
    clearSaved();
    setConfirming(false);
    focus.current = { kind: "heading" };
    say({ text: `${n}店すべてを候補から外しました。` });
  };

  const onAddAll = () => {
    const r = addManySaved(okShops.map((s) => s.id));
    trackTap({ kind: "list-import", page: "/list" });
    const parts: string[] = [];
    if (r.added > 0) parts.push(`${r.added}店を自分の候補に入れました。`);
    if (r.already > 0) parts.push(r.added === 0 && r.skipped === 0 ? "すべて、すでに自分の候補に入っています。" : `${r.already}店は、すでに入っていました。`);
    if (r.skipped > 0) parts.push(`候補リストは${LIST_MAX}店までのため、${r.skipped}店は入れていません。`);
    say({ text: parts.join(""), link: true });
  };

  /* ── 共有 URL（開いているサイトの URL ＋ /list?ids=…。店 ID だけ） ── */
  const origin = typeof window !== "undefined" && window.location.origin && window.location.origin !== "null" ? window.location.origin : SHARE_ORIGIN;
  const shareIds = okShops.map((s) => s.id);
  const shareUrl = `${origin}${listPath(shareIds)}`;

  const persistent = usePersistent();
  const shownCount = okShops.length;
  // 自分のリスト: 保存が 0 店のとき。共有リスト: 表示できる店が 0 店のとき（形の合わない ID だけ・全部が表示できない、を含む）
  const empty = isShared ? settled && shownCount === 0 && failed === 0 : ids.length === 0;

  return (
    <div ref={root} data-sv-mode={isShared ? "shared" : "mine"}>
      <style href="sv-base" precedence="sv">
        {CSS_BASE}
      </style>
      <style href="sv-page" precedence="sv">
        {CSS_PAGE}
      </style>

      <div className="sv-bar">
        <div>
          <h2 className="sv-h" id="sv-h" tabIndex={-1}>
            {isShared ? "共有されたリスト" : "自分のリスト"}
            <small>{settled ? `${isShared ? shownCount : ids.length}店` : "読み込み中"}</small>
          </h2>
          {isShared ? (
            <p className="sv-sub">
              友人や家族が選んだ店のリストです。ここでは読むだけで、あなたの候補は変わりません。気になる店は、自分の候補に入れられます。
            </p>
          ) : (
            <p className="sv-sub">
              このブラウザに保存しています。会員登録は要りません。店のページや駅のページの「候補に入れる」で増やせます（{LIST_MAX}店まで）。
            </p>
          )}
          {!isShared && !persistent && (
            <p className="sv-warn" role="note">
              このブラウザでは、保存が残らない設定になっています。入れた店は、このページを開いているあいだだけ保たれます。共有リンクは作れます。
            </p>
          )}
          {isShared && sharedOver > 0 && (
            <p className="sv-sub">リンクには{LIST_MAX}店を超える店が入っていたため、先頭の{LIST_MAX}店だけを表示しています。</p>
          )}
        </div>
        <div className="sv-tools">
          {isShared ? (
            <>
              <button type="button" className="sv-btn pri" disabled={!settled || okShops.length === 0} onClick={onAddAll} data-cursor="SAVE">
                自分の候補に全部入れる
              </button>
              <Link href="/list" prefetch={false} className="sv-link" data-cursor="LIST">
                自分の候補リストを見る{mine.length > 0 ? `（${mine.length}店）` : ""}
              </Link>
            </>
          ) : (
            mine.length > 0 &&
            !confirming && (
              <button ref={clearBtn} type="button" className="sv-btn dng" onClick={() => setConfirming(true)}>
                全部外す
              </button>
            )
          )}
        </div>
      </div>

      {confirming && (
        <div
          className="sv-confirm"
          role="group"
          aria-label="全部外す確認"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setConfirming(false);
              clearBtn.current?.focus();
            }
          }}
        >
          <p>{mine.length}店すべてを候補から外します。よろしいですか？</p>
          <button type="button" className="sv-btn dng fill" onClick={onClearAll}>
            全部外す
          </button>
          <button
            ref={cancelBtn}
            type="button"
            className="sv-btn"
            onClick={() => {
              setConfirming(false);
              requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(".sv-tools .sv-btn")?.focus());
            }}
          >
            やめる
          </button>
        </div>
      )}

      <p className="sv-msg" role="status" aria-live="polite">
        {msg && (
          <>
            {msg.text}
            {msg.undo && (
              <button type="button" onClick={() => onUndo(msg.undo!)}>
                元に戻す
              </button>
            )}
            {msg.link && (
              <Link href="/list" prefetch={false}>
                自分の候補リストを見る
              </Link>
            )}
          </>
        )}
      </p>

      {failed > 0 && settled && (
        <p className="sv-msg" role="alert">
          {failed}店を読み込めませんでした。通信を確かめて、もう一度お試しください。
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            再読み込み
          </button>
        </p>
      )}

      {isShared && gone > 0 && shownCount > 0 && settled && (
        <p className="sv-sub" data-sv-gone-note="">
          リンクには、いま表示できない店が{gone}店含まれていました（並べていません）。
        </p>
      )}
      {!isShared && gone > 0 && settled && (
        <p className="sv-sub" data-sv-gone-note="">
          いま表示できない店が{gone}店あります。リストには残してあるので、要らなければ「外す」を押してください。
        </p>
      )}

      {ids.length > 0 && !(empty && isShared) && (
        <OpenScope weeks={weeks}>
          <ol className="sv-list" aria-label={isShared ? "共有された店" : "候補の店"}>
            {(() => {
              // 共有リストでは、表示できない店は並べない。自分のリストでは、並び（保存した順）のとおり全部を並べる
              const rows = states.filter((x) => (isShared ? x.e === null || x.e.s === "ok" : true));
              return rows.map((x, i) => {
                if (x.e === null) return <RowSkeleton key={x.id} />;
                if (x.e.s === "ok") {
                  return (
                    <Row
                      key={x.id}
                      no={i + 1}
                      shop={x.e.shop}
                      mine={!isShared}
                      first={i === 0}
                      last={i === rows.length - 1}
                      onMove={onMove}
                      onRemove={onRemove}
                    />
                  );
                }
                return (
                  <UnavailableRow
                    key={x.id}
                    no={i + 1}
                    id={x.id}
                    kind={x.e.s}
                    first={i === 0}
                    last={i === rows.length - 1}
                    onMove={onMove}
                    onRemove={onRemove}
                  />
                );
              });
            })()}
          </ol>
        </OpenScope>
      )}

      {empty && !isShared && (
        <div className="sv-empty">
          <h3>まだ候補に入れた店がありません</h3>
          <p>
            店のページや駅のページで <SaveIcon size={18} className="sv-inline-ic" />「候補に入れる」を押すと、ここに集まります。保存先はこのブラウザです。集めた店は、リンク1つで友人や家族に送れます。
          </p>
          <Entrances />
        </div>
      )}
      {empty && isShared && (
        <div className="sv-empty">
          <h3>このリンクの店は、見つかりませんでした</h3>
          <p>リンクが古いか、途中で切れているのかもしれません。送ってくれた人に、もう一度リンクを確かめてもらってください。</p>
          <Entrances />
          <p>
            <Link href="/list" prefetch={false} className="sv-link">
              自分の候補リストを見る{mine.length > 0 ? `（${mine.length}店）` : ""}
            </Link>
          </p>
        </div>
      )}

      {settled && failed === 0 && shownCount > 0 && (
        <section className="sv-share" aria-label="このリストを共有">
          <ShareButtons
            url={shareUrl}
            text={`マチノワの候補リスト（${shownCount}店）`}
            page="/list"
            label={isShared ? "このリストを、さらに共有" : "このリストを共有"}
            networks={["line", "x"]}
          />
          <input
            className="sv-url"
            type="text"
            readOnly
            value={shareUrl}
            aria-label="共有するリンク"
            onFocus={(e) => e.currentTarget.select()}
            data-sv-share-url=""
          />
          <p className="sv-note">リンクに入るのは、店の番号だけです。受け取った人は、このリストを読むだけで、あなたの保存は変わりません。</p>
        </section>
      )}
    </div>
  );
}
