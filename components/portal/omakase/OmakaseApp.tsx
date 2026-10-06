"use client";
/**
 * おまかせ提案（/omakase）の本体。4 つの質問（どこで／誰と／予算／気分）に答えると、条件に合う店を 3 軒出す。
 * 仕様・結び付けの表: proto-portal/OMAKASE-COVERAGE.md。判定は lib/portal/omakaseDefs.ts（店ごとの小さな表 data.rows を引くだけ）。
 *
 * 画面
 *  - 左「お品書き」: 4 行（壱 どこで／弐 誰と／参 予算／四 気分）。答えると、その行に答えが墨で書き込まれる（押すとその質問に戻れる）。
 *    その下に、掲載店ぜんぶの点（Pool）と、いまの条件に合う店数。選択肢を指すと、それを選んだ場合に残る店が朱で見える。
 *  - 右: いまの質問（選択肢ごとに、いまの答えに重ねたときの店数。0 店の選択肢は押せない）。4 つ答えると、暖簾を上げて結果（Results）。
 * URL に答えが残る（?r=&p=&who=&b=&m=、見直し中の質問は &q=、結果の並びは &s=&n=）。history.pushState で書き、useSearchParams で読む
 * （/search のこだわり条件と同じ作り。戻る・進む・再読み込みで保たれる）。
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUDGET_BANDS } from "@/lib/portal/facetDefs";
import {
  EMPTY_STATE,
  MOODS,
  OMAKASE_PREFS,
  OMAKASE_REGIONS,
  PAGE_SIZE,
  REGION_OF_PREF,
  PREF_INDEX,
  STEPS,
  STEP_NUMERAL,
  STEP_TITLE,
  WHO_OPTIONS,
  answerText,
  answeredCount,
  firstOpenStep,
  isAnswered,
  isComplete,
  matchIds,
  omakaseQuery,
  optionCounts,
  pageOf,
  parseOmakase,
  prefsOfRegion,
  relaxations,
  rowMatches,
  shuffled,
  type OState,
  type OmakaseData,
  type OmakaseRow,
  type Relax,
  type StepId,
} from "@/lib/portal/omakaseDefs";
import CountRoll from "./CountRoll";
import Pool from "./Pool";
import Results from "./Results";
import { prefetchShops } from "./useShops";

/** 選んだ答えを見せてから次へ進むまでの間（ms）。動きを減らす設定では 0 */
const PICK_MS = 440;

function newSeed(): string {
  return Math.random().toString(36).slice(2, 6);
}

/* ───────────────────────── 選択肢 1 つ ───────────────────────── */

interface OptProps {
  label: string;
  note?: string;
  count: number;
  selected: boolean;
  picked: boolean;
  dim: boolean;
  any?: boolean;
  expanded?: boolean;
  controls?: string;
  onPick: () => void;
  onPreview: (on: boolean) => void;
}

function Opt({ label, note, count, selected, picked, dim, any, expanded, controls, onPick, onPreview }: OptProps) {
  const zero = count === 0 && !selected;
  return (
    <button
      type="button"
      className="om-opt"
      data-any={any ? "1" : undefined}
      data-picked={picked ? "1" : undefined}
      data-dim={dim ? "1" : undefined}
      data-zero={zero ? "1" : undefined}
      aria-pressed={expanded === undefined ? selected : undefined}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-disabled={zero ? true : undefined}
      aria-label={`${label}（${count}店）${note ? "。" + note : ""}`}
      data-cursor={zero ? undefined : "選ぶ"}
      onClick={() => {
        if (!zero) onPick();
      }}
      onPointerEnter={() => !zero && onPreview(true)}
      onPointerLeave={() => onPreview(false)}
      onFocus={() => !zero && onPreview(true)}
      onBlur={() => onPreview(false)}
    >
      <span className="om-opt-l">
        <b>{label}</b>
        {note && <small>{note}</small>}
      </span>
      <span className="om-opt-c">
        <i>{count}</i>店
      </span>
    </button>
  );
}

/* ───────────────────────── 本体 ───────────────────────── */

export default function OmakaseApp({ data }: { data: OmakaseData }) {
  const sp = useSearchParams();
  const parsed = useMemo(() => parseOmakase((k) => sp.get(k), data.shownBands), [sp, data.shownBands]);
  const { st, edit, seed, page } = parsed;
  const rows = data.rows;

  /* 店の並び（点の置き場所）: 地方 → 県 → ID */
  const order = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const ra = a[1] < 0 ? 99 : OMAKASE_REGIONS.findIndex((r) => r.slug === REGION_OF_PREF[a[1]]);
      const rb = b[1] < 0 ? 99 : OMAKASE_REGIONS.findIndex((r) => r.slug === REGION_OF_PREF[b[1]]);
      return ra - rb || a[1] - b[1] || (a[0] < b[0] ? -1 : 1);
    });
    return arr.map((r) => r[0]);
  }, [rows]);
  const rowById = useMemo(() => new Map(rows.map((r) => [r[0], r])), [rows]);

  const ids = useMemo(() => matchIds(rows, st), [rows, st]);
  const aliveSet = useMemo(() => new Set(ids), [ids]);
  const counts = useMemo(() => optionCounts(rows, st), [rows, st]);
  const complete = isComplete(st);
  const openStep = edit ?? firstOpenStep(st);
  const phase: "ask" | "result" = openStep === -1 || (complete && edit === null) ? "result" : "ask";

  /* 結果の並び（種で決まる順。ページごとに 3 軒） */
  const orderIds = useMemo(() => (phase === "result" ? shuffled(ids, seed || "0") : []), [phase, ids, seed]);
  const pages = Math.max(1, Math.ceil(orderIds.length / PAGE_SIZE));
  const pickIds = useMemo(() => pageOf(orderIds, page), [orderIds, page]);
  const relax = useMemo(() => (phase === "result" ? relaxations(rows, st) : []), [phase, rows, st]);

  /* URL を書く */
  const go = useCallback((next: OState, opts: { edit?: number | null; seed?: string; page?: number; replace?: boolean } = {}) => {
    const qs = omakaseQuery(next, { edit: opts.edit ?? null, seed: opts.seed ?? "", page: opts.page ?? 0 });
    const url = window.location.pathname + (qs ? "?" + qs : "");
    if (opts.replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }, []);

  /* 答える（選んだ答えを見せる間を置いてから URL を書く） */
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const lock = useRef(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const answer = useCallback(
    (key: string, patch: Partial<OState>) => {
      if (lock.current) return;
      lock.current = true;
      setPickedKey(key);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const commit = () => {
        const next = { ...st, ...patch };
        const nextOpen = firstOpenStep(next);
        go(next, { edit: null, seed: nextOpen === -1 ? seed || newSeed() : seed, page: 0 });
        lock.current = false;
        setPickedKey(null);
        setPreview(null);
      };
      if (reduce) commit();
      else timer.current = window.setTimeout(commit, PICK_MS);
    },
    [go, seed, st],
  );

  /* 選択肢を指したときの予告（それを選ぶと残る店） */
  const [preview, setPreview] = useState<ReadonlySet<string> | null>(null);
  const previewFor = useCallback(
    (patch: Partial<OState> | null) => {
      if (!patch) return setPreview(null);
      const s = { ...st, ...patch };
      setPreview(new Set(rows.filter((r) => rowMatches(r, s)).map((r) => r[0])));
    },
    [rows, st],
  );

  /* 結果が見えているあいだだけ、点に輪をかける */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (phase !== "result") setRevealed(false);
  }, [phase]);
  const picks = phase === "result" && revealed ? pickIds : [];

  /* 次に出す店を先に取っておく */
  useEffect(() => {
    if (phase === "result" && pages > 1) prefetchShops(pageOf(orderIds, page + 1));
  }, [phase, orderIds, page, pages]);

  /* 質問が変わったら、見出しにフォーカス（読み上げ・キーボードで続けられるように） */
  const headRef = useRef<HTMLHeadingElement>(null);
  const prevOpen = useRef<number | null>(null);
  useEffect(() => {
    const key = phase === "result" ? 99 : openStep;
    if (prevOpen.current !== null && prevOpen.current !== key) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => {
        const el = key === 99 ? document.getElementById("om-res-title") : headRef.current;
        el?.focus({ preventScroll: true });
        if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }, 60);
    }
    prevOpen.current = key;
  }, [openStep, phase]);

  /* 地方を開いて、県を選ぶ（質問「どこで」の中だけの見た目の状態） */
  const [detail, setDetail] = useState<string | null>(null);
  useEffect(() => setDetail(null), [openStep]);
  const prefCounts = useMemo(() => (detail ? optionCounts(rows, { ...st, region: detail, pref: null }).where.pref : {}), [rows, st, detail]);

  const goStep = (i: number) => go(st, { edit: i, seed });
  const skipRest = () => {
    const next: OState = {
      region: st.region ?? "all",
      pref: st.region === null ? null : st.pref,
      who: st.who ?? "any",
      band: st.band ?? "any",
      mood: st.mood ?? "any",
    };
    go(next, { edit: null, seed: seed || newSeed(), page: 0 });
  };
  const restart = () => go(EMPTY_STATE, { edit: null });
  const [copied, setCopied] = useState<"" | "ok" | "ng">("");
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied("ok");
    } catch {
      setCopied("ng");
    }
    window.setTimeout(() => setCopied(""), 2600);
  };

  /* ───── 質問の中身 ───── */
  const step: StepId = STEPS[openStep < 0 ? 0 : openStep];
  const cur = st;
  const optionList = (): React.ReactNode => {
    if (step === "where") {
      return (
        <div className="om-opts om-opts-where" role="group" aria-labelledby="om-q-title">
          {OMAKASE_REGIONS.map((r) => {
            const n = counts.where.region[r.slug] ?? 0;
            const open = detail === r.slug;
            const selected = cur.region === r.slug;
            const panelId = `om-prefs-${r.slug}`;
            return (
              <div key={r.slug} className="om-reg" data-open={open ? "1" : undefined}>
                <Opt
                  label={r.label}
                  note={`${prefsOfRegion(r.slug).length}${r.slug === "hokkaido" ? "道" : "都府県"}`}
                  count={n}
                  selected={selected}
                  picked={pickedKey === `r:${r.slug}`}
                  dim={pickedKey !== null && pickedKey !== `r:${r.slug}`}
                  expanded={open}
                  controls={panelId}
                  onPick={() => setDetail(open ? null : r.slug)}
                  onPreview={(on) => previewFor(on ? { region: r.slug, pref: null } : null)}
                />
                {open && (
                  <div className="om-prefs" id={panelId} role="group" aria-label={`${r.label}の県`}>
                    <button
                      type="button"
                      className="om-pref om-pref-all"
                      data-picked={pickedKey === `r:${r.slug}:` ? "1" : undefined}
                      onClick={() => answer(`r:${r.slug}:`, { region: r.slug, pref: null })}
                      onPointerEnter={() => previewFor({ region: r.slug, pref: null })}
                      onPointerLeave={() => previewFor(null)}
                      onFocus={() => previewFor({ region: r.slug, pref: null })}
                      onBlur={() => previewFor(null)}
                      data-cursor="選ぶ"
                    >
                      {r.label}ぜんぶ <i>{n}</i>店
                    </button>
                    {prefsOfRegion(r.slug).map((pi) => {
                      const p = OMAKASE_PREFS[pi];
                      const pn = prefCounts[p.slug] ?? 0;
                      const zero = pn === 0;
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          className="om-pref"
                          data-zero={zero ? "1" : undefined}
                          data-picked={pickedKey === `r:${r.slug}:${p.slug}` ? "1" : undefined}
                          aria-disabled={zero ? true : undefined}
                          aria-label={`${p.name}（${pn}店）`}
                          onClick={() => {
                            if (!zero) answer(`r:${r.slug}:${p.slug}`, { region: r.slug, pref: p.slug });
                          }}
                          onPointerEnter={() => !zero && previewFor({ region: r.slug, pref: p.slug })}
                          onPointerLeave={() => previewFor(null)}
                          onFocus={() => !zero && previewFor({ region: r.slug, pref: p.slug })}
                          onBlur={() => previewFor(null)}
                          data-cursor={zero ? undefined : "選ぶ"}
                        >
                          {p.short} <i>{pn}</i>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <Opt
            label="どこでも"
            note="場所では絞らない"
            count={counts.where.any}
            selected={cur.region === "all"}
            picked={pickedKey === "r:all"}
            dim={pickedKey !== null && pickedKey !== "r:all"}
            any
            onPick={() => answer("r:all", { region: "all", pref: null })}
            onPreview={(on) => previewFor(on ? { region: "all", pref: null } : null)}
          />
        </div>
      );
    }
    if (step === "who") {
      return (
        <div className="om-opts" role="group" aria-labelledby="om-q-title">
          {WHO_OPTIONS.map((w) => (
            <Opt
              key={w.id}
              label={w.label}
              note={w.note}
              count={counts.who.who[w.id] ?? 0}
              selected={cur.who === w.id}
              picked={pickedKey === `w:${w.id}`}
              dim={pickedKey !== null && pickedKey !== `w:${w.id}`}
              onPick={() => answer(`w:${w.id}`, { who: w.id })}
              onPreview={(on) => previewFor(on ? { who: w.id } : null)}
            />
          ))}
          <Opt
            label="誰とでも"
            note="同行者では絞らない"
            count={counts.who.any}
            selected={cur.who === "any"}
            picked={pickedKey === "w:any"}
            dim={pickedKey !== null && pickedKey !== "w:any"}
            any
            onPick={() => answer("w:any", { who: "any" })}
            onPreview={(on) => previewFor(on ? { who: "any" } : null)}
          />
        </div>
      );
    }
    if (step === "budget") {
      return (
        <div className="om-opts" role="group" aria-labelledby="om-q-title">
          {data.shownBands.map((b) => (
            <Opt
              key={b}
              label={BUDGET_BANDS[b].label}
              count={counts.budget.band[b] ?? 0}
              selected={cur.band === b}
              picked={pickedKey === `b:${b}`}
              dim={pickedKey !== null && pickedKey !== `b:${b}`}
              onPick={() => answer(`b:${b}`, { band: b })}
              onPreview={(on) => previewFor(on ? { band: b } : null)}
            />
          ))}
          <Opt
            label="予算は問わない"
            note="予算が分からない店も含める"
            count={counts.budget.any}
            selected={cur.band === "any"}
            picked={pickedKey === "b:any"}
            dim={pickedKey !== null && pickedKey !== "b:any"}
            any
            onPick={() => answer("b:any", { band: "any" })}
            onPreview={(on) => previewFor(on ? { band: "any" } : null)}
          />
        </div>
      );
    }
    return (
      <div className="om-opts" role="group" aria-labelledby="om-q-title">
        {MOODS.map((m) => (
          <Opt
            key={m.id}
            label={m.label}
            note={m.note}
            count={counts.mood.mood[m.id] ?? 0}
            selected={cur.mood === m.id}
            picked={pickedKey === `m:${m.id}`}
            dim={pickedKey !== null && pickedKey !== `m:${m.id}`}
            onPick={() => answer(`m:${m.id}`, { mood: m.id })}
            onPreview={(on) => previewFor(on ? { mood: m.id } : null)}
          />
        ))}
        <Opt
          label="気分は問わない"
          note="ジャンルでは絞らない"
          count={counts.mood.any}
          selected={cur.mood === "any"}
          picked={pickedKey === "m:any"}
          dim={pickedKey !== null && pickedKey !== "m:any"}
          any
          onPick={() => answer("m:any", { mood: "any" })}
          onPreview={(on) => previewFor(on ? { mood: "any" } : null)}
        />
      </div>
    );
  };

  const QUESTION: Record<StepId, { title: React.ReactNode; sub: string }> = {
    where: { title: <>どこで、<em>食べますか。</em></>, sub: "店の県と地方で絞ります。地方を開くと、県も選べます。" },
    who: { title: <>誰と、<em>行きますか。</em></>, sub: "店の設備の記載と、店ページに出ているタグに結び付けています。どれか1つでも書いてある店が出ます。" },
    budget: { title: <>予算は、<em>どのくらい。</em></>, sub: "店の案内にある予算の上限による帯です。予算が書かれていない店は、予算を選ぶと出ません。" },
    mood: { title: <>いまの気分は、<em>どれ。</em></>, sub: "店の業態の表記に結び付けています。選択肢の下に、結び付けた店の種類を書きました。" },
  };

  const nAns = answeredCount(st);
  const total = ids.length;
  const showSkip = phase === "ask" && nAns >= 1 && !complete && total >= 1;

  return (
    <div className="om" data-phase={phase} data-step={openStep < 0 ? 4 : openStep}>
      {/* 左: お品書き */}
      <aside className="om-board" aria-label="お品書き（答えた条件）">
        <div className="om-board-card">
          <p className="om-kicker">Machinowa — Omakase</p>
          <h1 className="om-h1">
            おまかせ<em>提案</em>
          </h1>
          <p className="om-lead">4つの質問に答えると、店を3軒ほど出します。</p>

          <ol className="om-lines">
            {STEPS.map((s, i) => {
              const text = answerText(st, s);
              const state = openStep === i && phase === "ask" ? "open" : text ? "done" : "todo";
              const can = text !== null || state === "open";
              return (
                <li key={s}>
                  <button
                    type="button"
                    className="om-line"
                    data-state={state}
                    aria-current={state === "open" ? "step" : undefined}
                    aria-disabled={can ? undefined : true}
                    aria-label={text ? `${STEP_TITLE[s]}：${text}。変更する` : `${STEP_TITLE[s]}：未回答`}
                    onClick={() => can && state !== "open" && goStep(i)}
                    data-cursor={can && state !== "open" ? "変える" : undefined}
                  >
                    <span className="om-line-no">{STEP_NUMERAL[i]}</span>
                    <span className="om-line-t">{STEP_TITLE[s]}</span>
                    <span className="om-line-lead" aria-hidden="true" />
                    <span className="om-line-a">{text && <span key={text} className="om-ink">{text}</span>}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="om-sieve">
            <Pool order={order} alive={aliveSet} preview={preview} picks={picks} />
            <p className="om-count">
              <CountRoll value={total} />
              <span className="om-count-u">店</span>
              <span className="om-count-t">
                掲載 {rows.length} 店のうち、<br />
                いまの条件に合う店
              </span>
            </p>
            <p className="om-sr" role="status" aria-live="polite">
              {nAns === 0 ? `掲載${rows.length}店` : `条件に合う店は${total}店です`}
            </p>
          </div>
          <span className="om-seal" data-on={phase === "result" && revealed ? "1" : "0"} aria-hidden="true">
            選
          </span>
        </div>
      </aside>

      {/* 右: 質問 / 結果 */}
      <section className="om-main" aria-label={phase === "ask" ? "質問" : "結果"}>
        {phase === "ask" ? (
          <div className="om-q" key={`${step}-${openStep}`} data-step={openStep}>
            <div className="om-mini">
              <p className="om-mini-c" aria-hidden="true">
                <span>いまの条件に合う店</span>
                <CountRoll value={total} />
                <span>店</span>
              </p>
              <ol className="om-prog" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <li key={s} data-on={i < openStep || isAnswered(st, s) ? "1" : undefined} data-now={i === openStep ? "1" : undefined} />
                ))}
              </ol>
            </div>
            <div className="om-q-head">
              <div className="om-q-txt">
                <p className="om-q-cnt">
                  質問 {openStep + 1} / {STEPS.length}
                </p>
                <h2 className="om-q-title" id="om-q-title" tabIndex={-1} ref={headRef}>
                  {QUESTION[step].title}
                </h2>
                <p className="om-q-sub">{QUESTION[step].sub}</p>
              </div>
              <span className="om-q-no" aria-hidden="true">
                {STEP_NUMERAL[openStep]}
              </span>
            </div>
            {optionList()}
            <div className="om-q-foot">
              {openStep > 0 ? (
                <button type="button" className="om-back" onClick={() => goStep(openStep - 1)}>
                  <i aria-hidden="true">←</i> ひとつ戻る
                </button>
              ) : (
                <span />
              )}
              {complete && edit !== null ? (
                <button type="button" className="om-skip" onClick={() => go(st, { edit: null, seed })}>
                  変えずに結果へ戻る <i aria-hidden="true">→</i>
                </button>
              ) : showSkip ? (
                <button type="button" className="om-skip" onClick={skipRest}>
                  残りは問わずに、いま合う{total}店を見る <i aria-hidden="true">→</i>
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="om-r">
            <Results
              ids={pickIds}
              rowById={rowById}
              st={st}
              total={total}
              page={page}
              pages={pages}
              onMore={() => go(st, { edit: null, seed, page: page + 1 })}
              relax={relax}
              onRelax={(r: Relax) => go(r.next, { edit: null, seed, page: 0 })}
              onReveal={setRevealed}
            />
            <div className="om-r-actions">
              {total > 0 && (
                <Link href={`/search?${omakaseQuery(st)}`} className="om-r-all" prefetch={false} data-cursor="ALL">
                  この条件の{total}店を、すべて見る <i aria-hidden="true">→</i>
                </Link>
              )}
              <button type="button" className="om-r-btn" onClick={share}>
                {copied === "ok" ? "リンクをコピーしました" : copied === "ng" ? "コピーできませんでした" : "この結果のリンクをコピー"}
              </button>
              <button type="button" className="om-r-btn" onClick={restart}>
                はじめからやり直す
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
