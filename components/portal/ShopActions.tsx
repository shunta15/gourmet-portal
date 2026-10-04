"use client";
/**
 * 店ページの「行動ボタン」（予約・電話・地図・SNS・ほかの店・共有）。公開スイッチ ON のときだけ RestaurantDetail が React.lazy で読み込む。
 * 6案（variant 1=罫 / 2=印 / 3=箱 / 4=玉 / 5=駒 / 6=帯）。previewTools（プレビュー・ローカルだけ）が true のときは、隅の切替で見比べられる。
 * 仕様と設計: proto-portal/SNS-BUTTONS-BRIEF.md（案1〜3）・SNS-BUTTONS-BRIEF-2.md（案4〜6）
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { buildActionModel, type ShopFacts } from "@/lib/portal/shopActions";
import { CSS_BASE, CSS_HAKO, CSS_IN, CSS_KEI } from "./shopActionsCss";
import { CSS_KOMA, CSS_OBI, CSS_SLIM, CSS_TAMA } from "./shopActionsCss2";
import { prefersReducedMotion, useEnter, useShare } from "./ShopActionsParts";
import ShopActionsKei from "./ShopActionsKei";
import ShopActionsIn from "./ShopActionsIn";
import ShopActionsHako from "./ShopActionsHako";
import ShopActionsTama from "./ShopActionsTama";
import ShopActionsKoma from "./ShopActionsKoma";
import ShopActionsObi from "./ShopActionsObi";

export type SaVariant = 1 | 2 | 3 | 4 | 5 | 6;
const VARIANTS: SaVariant[] = [1, 2, 3, 4, 5, 6];

export interface ShopActionsProps {
  shop: ShopFacts;
  storeId: string;
  /** 計測用のページのパス */
  page: string;
  variant?: SaVariant;
  /** 共有する絶対URL（lib/portal/share.ts の shareTarget） */
  shareUrl: string;
  shareText: string;
  /** プレビュー・ローカルだけ true。隅に「ボタン案 1〜6」の切替を出す */
  previewTools?: boolean;
  /** 見本（リンク先は未登録）。リンクにせず、押せない状態で出す */
  sample?: boolean;
  /** 案3のスマホ下の固定バーを出すか（既定 true。見比べページは複数並べるので false） */
  bar?: boolean;
}

const LS_KEY = "sa-variant";

function parseVariant(v: string | null | undefined): SaVariant | null {
  const n = Number(v);
  return v != null && /^[1-6]$/.test(v) ? (n as SaVariant) : null;
}

/** 隅の切替。スマホでは「案 N」だけの小さなボタンに畳み、押すと 1〜6 が開く（ほかのものを隠さない） */
function Switcher({ value, onChange }: { value: SaVariant; onChange: (v: SaVariant) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={box} className="sa-pv" data-open={open ? "1" : "0"} role="group" aria-label="ボタン案の切替（プレビュー専用）">
      <span className="sa-pv-l">ボタン案</span>
      <button type="button" className="sa-pv-t" aria-expanded={open} aria-label={`ボタン案を選ぶ（いま案${value}）`} onClick={() => setOpen(true)}>
        案{value}
      </button>
      {VARIANTS.map((n) => (
        <button
          key={n}
          type="button"
          className="sa-pv-b"
          aria-pressed={value === n}
          aria-label={`案${n}`}
          onClick={() => {
            onChange(n);
            setOpen(false);
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function ShopActions({
  shop,
  storeId,
  page,
  variant = 1,
  shareUrl,
  shareText,
  previewTools = false,
  sample = false,
  bar = true,
}: ShopActionsProps) {
  const [v, setV] = useState<SaVariant>(variant);

  // プレビューの選択（URL の ?sns= が先、なければ localStorage）。サーバーで searchParams を読むとページが動的になるので、クライアントで読む
  useEffect(() => {
    if (!previewTools) return;
    let picked: SaVariant | null = null;
    try {
      picked = parseVariant(new URLSearchParams(window.location.search).get("sns"));
    } catch {
      /* 読めなければ次へ */
    }
    if (!picked) {
      try {
        picked = parseVariant(window.localStorage.getItem(LS_KEY));
      } catch {
        /* 読めなければ既定（案1） */
      }
    }
    if (picked) setV(picked);
  }, [previewTools]);

  const choose = (n: SaVariant) => {
    setV(n);
    try {
      window.localStorage.setItem(LS_KEY, String(n));
    } catch {
      /* 保存できなくても動く */
    }
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("sns", String(n));
      window.history.replaceState(window.history.state, "", u.toString());
    } catch {
      /* URL を直せなくても動く */
    }
  };

  const model = useMemo(() => buildActionModel(shop), [shop]);
  const share = useShare({ url: shareUrl, text: shareText, storeId, page, sample });
  const rootRef = useEnter([v]);
  const cur: SaVariant = previewTools ? v : variant;

  const common = { model, storeId, page, sample, share, bar };

  // 墨は、ポインタが入ってきた側から塗る（案1: 左右・案2/共有の円: 入った点から広がる）
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const t = e.target as HTMLElement | null;
      const row = t?.closest<HTMLElement>(".sa-k-row");
      if (row && !row.contains(e.relatedTarget as Node | null)) {
        const r = row.getBoundingClientRect();
        row.dataset.from = e.clientX > r.left + r.width / 2 ? "r" : "l";
      }
      const disc = t?.closest<HTMLElement>(".sa-i-cell, .sa-i-sd");
      if (disc && !disc.contains(e.relatedTarget as Node | null)) {
        const d = disc.querySelector<HTMLElement>(".sa-i-disc") ?? disc;
        const r = d.getBoundingClientRect();
        d.style.setProperty("--ox", `${Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)).toFixed(0)}%`);
        d.style.setProperty("--oy", `${Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)).toFixed(0)}%`);
      }
    };
    root.addEventListener("pointerover", onOver);
    return () => root.removeEventListener("pointerover", onOver);
  }, [rootRef, cur]);

  return (
    <>
      <style href="sa-base" precedence="sa-1">
        {CSS_BASE}
      </style>
      {cur === 1 && (
        <style href="sa-kei" precedence="sa-2">
          {CSS_KEI}
        </style>
      )}
      {cur === 2 && (
        <style href="sa-in" precedence="sa-2">
          {CSS_IN}
        </style>
      )}
      {cur === 3 && (
        <style href="sa-hako" precedence="sa-2">
          {CSS_HAKO}
        </style>
      )}
      {cur >= 4 && (
        <style href="sa-slim" precedence="sa-2">
          {CSS_SLIM}
        </style>
      )}
      {cur === 4 && (
        <style href="sa-tama" precedence="sa-3">
          {CSS_TAMA}
        </style>
      )}
      {cur === 5 && (
        <style href="sa-koma" precedence="sa-3">
          {CSS_KOMA}
        </style>
      )}
      {cur === 6 && (
        <style href="sa-obi" precedence="sa-3">
          {CSS_OBI}
        </style>
      )}
      <div ref={rootRef} className={`sa sa-v${cur}`} data-sa-variant={cur}>
        {cur === 1 && <ShopActionsKei {...common} />}
        {cur === 2 && <ShopActionsIn {...common} />}
        {cur === 3 && <ShopActionsHako {...common} />}
        {cur === 4 && <ShopActionsTama {...common} />}
        {cur === 5 && <ShopActionsKoma {...common} />}
        {cur === 6 && <ShopActionsObi {...common} />}
      </div>
      {previewTools && <Switcher value={cur} onChange={choose} />}
    </>
  );
}
