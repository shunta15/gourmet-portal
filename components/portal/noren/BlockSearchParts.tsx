"use client";
/**
 * 「さがす」ページの block の見た目の部品（白い地・橙の差し色・紺の字。CSS は blocksearch.css の .vBk-）。
 * 'use client' の部品なので、大きなデータ（lib/data など）は import しない。店は SearchItem（サーバーで絞って props で来る）だけを見る。
 * 星・評価の数字・口コミの件数・価格は出さない。
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SearchItem } from "@/lib/regions";
import { sized, sizedSrcSet } from "@/lib/imageUrl";
import { kanjiFor } from "@/lib/portal/noren/shop";
import { LIST_MAX, announce, getList, toggleSaved, useIsSaved } from "@/lib/portal/savedList";
import { trackTap } from "@/lib/portal/track";
import { RELEASE_PERIPHERY } from "@/lib/portal/noren/release";
/** 店の札の写真の表示幅（実測: PC 1440 で約 385px、スマホ 390 で 2 列の約 174px）。高精細な画面で足りる縮小版を選ばせる */
const BLOCK_CARD_SIZES = "(max-width: 760px) 46vw, 390px";

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const;

export function PinIcon({ size = 18, sw = 2 }: { size?: number; sw?: number }) {
  return (
    <svg {...svg} width={size} height={size} strokeWidth={sw}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
export function SearchIcon({ size = 20, sw = 2.2 }: { size?: number; sw?: number }) {
  return (
    <svg {...svg} width={size} height={size} strokeWidth={sw}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
export function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...svg} width={size} height={size} strokeWidth={2.4}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
const TAB_PATH: Record<string, string> = {
  area: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  genre: "M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4V5Zm16 0h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7V5Z",
  scene: "M4 8l8-4 8 4v9l-8 4-8-4V8Zm8 4 8-4M12 12v9M12 12 4 8",
  tag: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.2 6.8 19l1-5.8L3.6 9.1l5.8-.8L12 3Z",
};
export function TabIcon({ k }: { k: string }) {
  if (k === "q") return <SearchIcon size={22} />;
  return (
    <svg {...svg} width={20} height={20} strokeWidth={1.9}>
      <path d={TAB_PATH[k] ?? TAB_PATH.area} />
    </svg>
  );
}

/** 新しい部品に出さない語（おすすめ・人気・厳選・名店と、ほかのサイトの評価・順位に当たる語）を含むタグは、札・タグの一覧に出さない（URL の ?tag= での絞り込みは今までどおり動く） */
const HIDDEN_TAG = /おすすめ|オススメ|人気|厳選|名店|ランキング|受賞|ミシュラン|食べログ|ホットペッパー|ぐるなび|Google|口コミ/i;
export const isShowableTag = (t: string) => !!t && !HIDDEN_TAG.test(t);

function currentPath(): string {
  try {
    return decodeURI(window.location.pathname);
  } catch {
    return window.location.pathname;
  }
}

/** 保存のハート。保存の仕組みは今の候補リスト（lib/portal/savedList.ts。この端末のブラウザに残る。会員登録なし）。SaveButton と同じ動き・同じお知らせ */
export function BlockHeart({ id, name }: { id: string; name: string }) {
  const saved = useIsSaved(id);
  const [pop, setPop] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const onClick = () => {
    const r = toggleSaved(id);
    if (r === "full") {
      announce(`候補リストは${LIST_MAX}店までです。ほかの店を外すと入れられます。`);
      return;
    }
    const n = getList().length;
    announce(r === "added" ? `「${name}」を候補に入れました（${n}店）` : `「${name}」を候補から外しました（${n}店）`);
    trackTap({ storeId: id, kind: r === "added" ? "save" : "unsave", page: currentPath() });
    if (r === "added") {
      setPop(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPop(false), 600);
    } else setPop(false);
  };
  return (
    <button type="button" className="vBk-heart" aria-pressed={saved} aria-label={`${saved ? "候補から外す" : "候補に入れる"}（${name}）`} data-pop={pop ? "1" : "0"} data-sv-id={id} onClick={onClick}>
      <span className="vBk-heart-disc">
        <svg {...svg} width={20} height={20} strokeWidth={2}>
          <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.8 8 3.6 5 6.8 5c2 0 3.5 1.2 5.2 3 1.7-1.8 3.2-3 5.2-3 3.2 0 5 3 4 6.1-1.7 4.8-9.2 9.4-9.2 9.4Z" />
        </svg>
      </span>
    </button>
  );
}

/**
 * 店の札: 写真・保存のハート・店名・エリア・業種・タグ・事実の行。写真の無い店は、業種の漢字を薄く出した面（空の枠・壊れた画像は出さない）。全体が店ページへのリンク（ハートは兄弟に置く）。
 * 事実の行（vBk-facts）は、暖簾版の店カード（ShopCard の vSc-tags）と同じもの: 呼び出し側が、こだわり条件の部品（FacetExt.tagsOf）が返した札（tags・total）をそのまま渡す。
 * 語・条件・並び・最大の数（4）は tagsOf のまま（ここで作り直さない）。データの無い店は渡ってこない（0 本のときは行ごと出さない）。選んだ条件は先頭で、太字 + 橙の点。
 */
export function BlockCard({ r, tags, tagsTotal = 0, eager = false }: { r: SearchItem; tags?: { label: string; on?: boolean }[]; tagsTotal?: number; eager?: boolean }) {
  // 店のデータにあるタグ（選んだ条件は、下の事実の行に出る）
  const chips = (r.tags ?? []).filter((t) => isShowableTag(t) && t !== r.area && t !== r.cuisine && !r.name.includes(t)).slice(0, 3).map((t) => ({ label: t, on: false }));
  const facts = tags ?? [];
  return (
    <li className="vBk-cardw">
      <Link href={`/restaurant/${r.id}`} className="vBk-card">
        <span className={`vBk-ph${r.image ? "" : RELEASE_PERIPHERY ? " is-none is-paper" : " is-none"}`}>
          {r.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(r.image, 640)} srcSet={sizedSrcSet(r.image)} sizes={BLOCK_CARD_SIZES} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
          ) : RELEASE_PERIPHERY ? (
            // 写真の無い店（RELEASE_PERIPHERY）: 空の枠・薄い字の枠にしない。和紙の面に店名を縦書きで（特集の一覧の「写真の無い札」と同じ考え方。写真は足さない）
            <span className="vBk-ph-name" aria-hidden="true" style={{ ["--n" as string]: Array.from(r.name).length }}>
              {r.name}
            </span>
          ) : (
            <b aria-hidden="true">{kanjiFor(r.cuisine, r.name)}</b>
          )}
        </span>
        <span className="vBk-cb">
          <b className="vBk-nm">{r.name}</b>
          <span className="vBk-m">
            <span>{r.area}</span>
            {r.cuisine && (
              <>
                <i aria-hidden="true" />
                <span>{r.cuisine}</span>
              </>
            )}
          </span>
          {chips.length > 0 && (
            <ul className="vBk-chips" aria-label="タグ">
              {chips.map((t) => (
                <li key={t.label}>{t.label}</li>
              ))}
            </ul>
          )}
          {facts.length > 0 && (
            <ul className="vBk-facts" aria-label={tagsTotal > facts.length ? `この店に当てはまる条件（${tagsTotal}件のうち${facts.length}件）` : "この店に当てはまる条件"}>
              {facts.map((t) => (
                <li key={t.label} data-on={t.on ? "1" : undefined}>
                  {t.on && <span className="vN-vh">選んだ条件: </span>}
                  {t.label}
                </li>
              ))}
            </ul>
          )}
        </span>
      </Link>
      <BlockHeart id={r.id} name={r.name} />
    </li>
  );
}
