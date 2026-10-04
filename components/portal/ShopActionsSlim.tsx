"use client";
/**
 * 行動ボタンの案4〜6（玉・駒・帯）で共有する部品。補足（@アカウント名・電話番号・ドメイン・住所・座標）は出さず、
 * ボタンはアイコンと短いラベルだけにする。読み上げ用の名前（aria-label）には行き先の種類を入れる。
 * 仕様: proto-portal/SNS-BUTTONS-BRIEF-2.md
 */
import type { CSSProperties } from "react";
import type { PrimaryAction, SecondaryAction } from "@/lib/portal/shopActions";
import { ExtHint, SaArrow } from "./ShopActionsParts";

/** 読み上げ用の名前。見える文字（short）で始め、そのあとに行き先の種類を添える（外部リンクの「新しいタブ」は Act が足す） */
const KIND: Record<PrimaryAction["id"], string> = {
  reserve: "予約サイトを開く",
  phone: "電話アプリで発信する",
  gmap: "Google マップで店の場所を開く",
  map: "このページの地図へ移動する",
  instagram: "店の Instagram を開く",
  tiktok: "店の TikTok を開く",
  x: "店の X を開く",
  facebook: "店の Facebook ページを開く",
  line: "店の LINE 公式アカウントを開く",
  website: "店の公式サイトを開く",
};

/** 見えるラベル。スマホの 2 列でも 1 行に収まるよう、Google マップは「マップ」に縮める（読み上げ名には Google マップと入る） */
export function slimLabel(a: PrimaryAction): string {
  return a.id === "gmap" ? "マップ" : a.short;
}

export function slimAria(a: PrimaryAction): string {
  return `${slimLabel(a)}（${KIND[a.id]}）`;
}

/** 共有ボタンの短いラベルと読み上げ名 */
export const SHARE_SHORT: Record<string, string> = { line: "LINE", x: "X", facebook: "Facebook", copy: "コピー" };

/** 脇役のリンク（街の他の店・地域の他の店・出典・特集記事）。ボタンの下に小さく */
export function SlimSub({ items, sample, index }: { items: SecondaryAction[]; sample?: boolean; index: number }) {
  if (items.length === 0) return null;
  return (
    <ul className="sa-s-sub" role="list" style={{ "--i": index } as CSSProperties}>
      {items.map((s) => (
        <li key={s.id}>
          {sample ? (
            <span className={`sa-s-sublink sa-sample${s.external ? "" : " is-in"}`} aria-disabled="true">
              {s.label}
              <SaArrow />
            </span>
          ) : (
            <a
              href={s.href}
              className={`sa-s-sublink${s.external ? "" : " is-in"}`}
              data-cursor={s.cursor}
              {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {s.label}
              <SaArrow />
              {s.external && <ExtHint />}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
