"use client";
/**
 * おまかせ提案の結果。条件に合う店から 3 軒（ページごとに入れ替え）を、暖簾を上げて見せる。
 *
 * 暖簾（CSS だけ。WebGL・ライブラリなし）: 結果の枠に、店の数ぶんの布が竿から下がる。
 *  最初: 上から落ちる（drop）→ 店の情報が取れるまで揺れて待つ（hang）→ 布が竿のほうへ巻き上がる（lift）→ 取り除く（off）
 *  「ほかの候補を見る」: いま出ている店の上に布が落ち、布の裏で店を入れ替えて、また巻き上げる。
 *  動きを減らす設定では布を出さず、すぐ店を見せる（CSS の prefers-reduced-motion と、ここでの判定の両方）。
 * 店の名前・写真・街は /list-data/{店ID}（候補リストと同じ静的 JSON）。星・点数・評価は出さない。
 * 「なぜ出たか」は、答えた条件ごとに、その店のデータにある事実だけを書く（設備は必ず「〜の記載あり」）。
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ListShop } from "@/lib/portal/listShop";
import { BUDGET_BANDS } from "@/lib/portal/facetDefs";
import { FACT_ATOMS, ATOM_BIT, OMAKASE_PREFS, WHO_OPTIONS, type OState, type OmakaseRow, type Relax } from "@/lib/portal/omakaseDefs";
import SaveButton from "../SaveButton";
import { useShops } from "./useShops";

const NUMERALS = ["壱", "弐", "参"] as const;
type Curtain = "drop" | "hang" | "lift" | "off";

/** その店が、答えた条件のどれに・どう当てはまったか（事実だけ） */
export function reasonsOf(shop: ListShop, row: OmakaseRow | undefined, st: OState): string[] {
  if (!row) return [];
  const out: string[] = [];
  if (st.region !== null && st.region !== "all" && row[1] >= 0) {
    out.push(`場所は${OMAKASE_PREFS[row[1]].name}`);
  }
  if (st.who !== null && st.who !== "any") {
    const w = WHO_OPTIONS.find((x) => x.id === st.who);
    for (const a of w?.atoms ?? []) {
      if (row[4] & ATOM_BIT[a]) out.push(FACT_ATOMS.find((x) => x.id === a)?.label ?? "");
    }
  }
  if (st.band !== null && st.band !== "any") out.push(`予算は ${BUDGET_BANDS[st.band].label}`);
  if (st.mood !== null && st.mood !== "any" && shop.category) out.push(`ジャンルは「${shop.category}」`);
  return out.filter(Boolean);
}

interface Props {
  /** いま出す店の ID（先頭から 壱・弐・参） */
  ids: string[];
  rowById: Map<string, OmakaseRow>;
  st: OState;
  /** 当てはまる店の数 */
  total: number;
  /** 何ページ目か（0 から）と、全部で何ページか */
  page: number;
  pages: number;
  onMore: () => void;
  relax: Relax[];
  onRelax: (r: Relax) => void;
  /** 動きの区切りを親に知らせる（印を押す・ふるいの点を動かす用） */
  onReveal?: (revealed: boolean) => void;
}

export default function Results({ ids, rowById, st, total, page, pages, onMore, relax, onRelax, onReveal }: Props) {
  const [shown, setShown] = useState<string[]>(ids);
  const [curtain, setCurtain] = useState<Curtain>("drop");
  const [revealedOnce, setRevealedOnce] = useState(false);
  const { shops, ready, failed } = useShops(shown);
  const latest = useRef(ids);
  latest.current = ids;
  const firstRun = useRef(true);
  const reduce = useRef(false);
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);

  // 出す店が変わったとき（2 回目以降）: 布を落として、裏で入れ替える
  const key = ids.join(",");
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (ids.length === 0) {
        setCurtain("off");
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCurtain("off");
        setRevealedOnce(true);
      }
      return;
    }
    if (key === shown.join(",")) return;
    if (reduce.current || ids.length === 0) {
      setShown(ids);
      setCurtain("off");
      return;
    }
    setCurtain("drop"); // 落ち終わったら（onAnimationEnd）、店を入れ替える
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 布が落ち終わった: 店を入れ替えて、揺れて待つ
  const onDropEnd = () => {
    if (curtain !== "drop") return;
    setShown(latest.current);
    setCurtain("hang");
  };
  // 落ちる動きが（何かの理由で）始まらなくても進めるための保険
  useEffect(() => {
    if (curtain !== "drop") return;
    const t = window.setTimeout(() => {
      setShown(latest.current);
      setCurtain((c) => (c === "drop" ? "hang" : c));
    }, 1400);
    return () => window.clearTimeout(t);
  }, [curtain]);

  // 店の情報が取れたら、少し揺らしてから巻き上げる。取れなくても待ち続けない（上限 4 秒）
  useEffect(() => {
    if (curtain !== "hang") return;
    if (ready) {
      const t = window.setTimeout(() => setCurtain("lift"), 520);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCurtain("lift"), 4000);
    return () => window.clearTimeout(t);
  }, [curtain, ready]);

  useEffect(() => {
    if (curtain !== "lift") return;
    setRevealedOnce(true);
    const t = window.setTimeout(() => setCurtain("off"), 1700);
    return () => window.clearTimeout(t);
  }, [curtain]);

  const revealed = revealedOnce && (curtain === "lift" || curtain === "off");
  useEffect(() => {
    onReveal?.(revealed);
  }, [revealed, onReveal]);

  const list = shown.map((id) => ({ id, shop: shops.get(id) })).filter((x): x is { id: string; shop: ListShop } => !!x.shop);
  const curtainOn = curtain !== "off" && shown.length > 0;
  const cardsVisible = curtain === "lift" || curtain === "off" || (curtain === "drop" && revealedOnce);
  const n = Math.min(3, Math.max(1, shown.length));
  const few = total < 3;
  const condText = (() => {
    const bits: string[] = [];
    if (st.region !== null && st.region !== "all") bits.push("場所");
    if (st.who !== null && st.who !== "any") bits.push("誰と");
    if (st.band !== null && st.band !== "any") bits.push("予算");
    if (st.mood !== null && st.mood !== "any") bits.push("気分");
    return bits.length === 0 ? "条件を指定せず、掲載店すべて" : `答えた条件（${bits.join("・")}）に合う店`;
  })();

  return (
    <div className="om-res" data-curtain={curtain} data-n={n}>
      <div className="om-res-head">
        <div className="om-res-txt">
          <h2 className="om-res-title" id="om-res-title" tabIndex={-1}>
            {total === 0 ? (
              <>
                <span>条件に合う店は、</span>
                <em>ありません。</em>
              </>
            ) : few ? (
              <>
                <span>条件に合う店は、</span>
                <em>{total}軒だけでした。</em>
              </>
            ) : (
              <>
                <span>{total}店のなかから、</span>
                <em>{Math.min(3, total)}軒。</em>
              </>
            )}
          </h2>
          <p className="om-res-sub">
            {total === 0
              ? "いまの答えを全部満たす店は、掲載店にありません。下のどれかをゆるめると店が出ます。"
              : `${condText}から、順不同で選びました。評価や人気は使っていません。`}
          </p>
        </div>
        {total > 0 && pages > 1 && (
          <button type="button" className="om-more" onClick={onMore} disabled={curtain === "drop" || curtain === "hang"} data-cursor="MORE">
            <span>ほかの候補を見る</span>
            <small>
              {(page % pages) + 1} / {pages}
            </small>
          </button>
        )}
      </div>

      <div className="om-cards-wrap">
        {shown.length > 0 && (
          <ol className="om-cards" data-visible={cardsVisible ? "1" : "0"} aria-label="条件に合う店">
            {list.map(({ id, shop }, i) => {
              const row = rowById.get(id);
              const why = reasonsOf(shop, row, st);
              return (
                <li key={id} className="om-card" style={{ ["--i" as string]: i }}>
                  <div className="om-card-ph sv-host">
                    {shop.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shop.photo.src}
                        srcSet={shop.photo.srcSet}
                        sizes="(max-width: 899px) 92vw, 340px"
                        width={shop.photo.width}
                        height={shop.photo.height}
                        alt=""
                        decoding="async"
                      />
                    ) : (
                      <span className="om-card-glyph" aria-hidden="true">
                        {shop.glyph}
                      </span>
                    )}
                    <span className="om-card-no" aria-hidden="true">
                      {NUMERALS[i]}
                    </span>
                    <SaveButton id={shop.id} name={shop.name} variant="card" page="/omakase" />
                  </div>
                  <div className="om-card-body">
                    <p className="om-card-cat">
                      {shop.category && <span>{shop.category}</span>}
                      {shop.area && <span>{shop.area}</span>}
                    </p>
                    <h3 className="om-card-name">
                      <Link href={shop.href} prefetch={false} data-cursor="VIEW">
                        {shop.name}
                      </Link>
                    </h3>
                    <span className="om-card-go" aria-hidden="true">
                      店のページへ <i>→</i>
                    </span>
                    <div className="om-why">
                      <p className="om-why-h">出た理由</p>
                      {why.length > 0 ? (
                        <ul>
                          {why.map((w) => (
                            <li key={w}>{w}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="om-why-none">条件を指定していないので、掲載店すべてから選びました。</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {shown.length > 0 && ready && failed && <p className="om-res-err">店の情報を読み込めなかった店があります。ページを読み込み直してください。</p>}

        {curtainOn && (
          <div className="om-nr" data-n={n} aria-hidden="true">
            <i className="om-nr-rod" />
            {Array.from({ length: n }, (_, i) => (
              <span
                key={i}
                className="om-nr-s"
                style={{ ["--i" as string]: i, ["--k" as string]: Math.abs(i - (n - 1) / 2) }}
                onAnimationEnd={i === n - 1 ? onDropEnd : undefined}
              >
                <b>{NUMERALS[i]}</b>
              </span>
            ))}
          </div>
        )}
      </div>

      {relax.length > 0 && (total < 3 || total === 0) && (
        <section className="om-relax" aria-labelledby="om-relax-h">
          <h3 id="om-relax-h">条件をゆるめると、店が増えます</h3>
          <ul>
            {relax.map((r) => (
              <li key={r.step + r.label}>
                <button type="button" onClick={() => onRelax(r)} disabled={r.count <= total}>
                  <span>{r.label}</span>
                  <b>{r.count}店</b>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
