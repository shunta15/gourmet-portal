"use client";
/**
 * 店ページの行動ボタン「玉 TAMA」（発注者が 6 案から選んだ 1 案。2026-10-07）: 丸みのあるカプセル型のボタン。左の「玉」（丸）にアイコン、右に短いラベル。
 * 補足（@アカウント名・電話番号・ドメイン・住所・座標）は出さず、アイコンと短いラベルだけ。読み上げ用の名前（aria-label）には行き先の種類を入れる。
 * hover: ラベルが 1 字ずつ上へ送られて同じ文字が下から入り、墨が液面のように下から満ちて反転する。押すと横に広がって縦に縮み、離すと戻る。
 * 主役（予約または電話）は朱のカプセル。ほかは細い罫のカプセル。
 * 仕様: proto-portal/SNS-BUTTONS-BRIEF-2.md
 */
import type { CSSProperties } from "react";
import type { ActionModel, IconKey, PrimaryAction, SecondaryAction } from "@/lib/portal/shopActions";
import { Act, ExtHint, SaArrow, SaIcon, ShareFoot, type ShareState } from "./ShopActionsParts";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  share: ShareState;
}

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
function label(a: PrimaryAction): string {
  return a.id === "gmap" ? "マップ" : a.short;
}

function ariaOf(a: PrimaryAction): string {
  return `${label(a)}（${KIND[a.id]}）`;
}

/** 共有ボタンの短いラベル */
const SHARE_SHORT: Record<string, string> = { line: "LINE", x: "X", facebook: "Facebook", copy: "コピー" };

/** 文字の送り: 1 字ずつ時間差で上へ。同じ文字が下から入ってくる（入ってくる側は ::after の data-c） */
function Roll({ text }: { text: string }) {
  return (
    <span className="sa-tama-lbl" aria-hidden="true">
      {Array.from(text).map((c, i) => (
        <span key={i} className="sa-tama-ch" data-c={c} style={{ "--c": i } as CSSProperties}>
          {c}
        </span>
      ))}
    </span>
  );
}

/** 玉（アイコンを載せた丸）。訪問済みの外部リンクだけ、右下に小さな印が付く */
function Bead({ icon, visit }: { icon: IconKey; visit?: boolean }) {
  return (
    <span className="sa-tama-bead" aria-hidden="true">
      <SaIcon name={icon} size={22} />
      {visit && (
        <span className="sa-tama-vis">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
      )}
    </span>
  );
}

/** 脇役のリンク（街の他の店・地域の他の店・出典・特集記事）。ボタンの下に小さく */
function Sub({ items, index }: { items: SecondaryAction[]; index: number }) {
  if (items.length === 0) return null;
  return (
    <ul className="sa-s-sub" role="list" style={{ "--i": index } as CSSProperties}>
      {items.map((s) => (
        <li key={s.id}>
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
        </li>
      ))}
    </ul>
  );
}

export default function ShopActionsTama({ model, storeId, page, share }: Props) {
  const n = model.primary.length;
  // 手前の列でスマホ（2 列）に収めるとき、主役を除いた残りが奇数なら最後の 1 つは 2 列ぶち抜き
  const rest = n - (model.primary[0]?.hero ? 1 : 0);
  const lastWide = rest % 2 === 1;

  return (
    <>
      {n > 0 && (
        <ul className="sa-tama-list" role="list">
          {model.primary.map((a, i) => (
            <li
              key={a.id}
              className={`sa-tama-li${a.hero ? " is-hero" : ""}${lastWide && i === n - 1 && !a.hero ? " is-wide" : ""}`}
              style={{ "--i": i } as CSSProperties}
            >
              <Act a={a} storeId={storeId} page={page} aria={ariaOf(a)} className={`sa-tama-pill${a.hero ? " is-hero" : ""}`}>
                <span className="sa-tama-fill" aria-hidden="true" />
                <Bead icon={a.icon} visit={a.external} />
                <Roll text={label(a)} />
                <span className="sa-tama-go" aria-hidden="true">
                  <SaArrow />
                </span>
              </Act>
            </li>
          ))}
        </ul>
      )}

      <Sub items={model.secondary} index={n} />

      <div className="sa-s-share" role="group" aria-label="この店を共有" style={{ "--i": n + 1 } as CSSProperties}>
        <p className="sa-s-cap" aria-hidden="true">
          共有
        </p>
        <ul className="sa-tama-shares" role="list">
          {share.items.map((it) => (
            <li key={it.id}>
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="sa-tama-pill is-sm"
                aria-label={`${SHARE_SHORT[it.id]}で共有（外部サイトが新しいタブで開きます）`}
                onClick={() => share.tap(it.tap)}
              >
                <span className="sa-tama-fill" aria-hidden="true" />
                <Bead icon={it.icon} />
                <Roll text={SHARE_SHORT[it.id]} />
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`sa-tama-pill is-sm${share.copied ? " is-done" : ""}`}
              aria-label={share.copied ? "コピーしました" : "リンクをコピー"}
              onClick={share.copy}
            >
              <span className="sa-tama-fill" aria-hidden="true" />
              <Bead icon={share.copied ? "check" : "link"} />
              <Roll text={share.copied ? "完了" : SHARE_SHORT.copy} />
            </button>
          </li>
        </ul>
        <ShareFoot s={share} />
      </div>
    </>
  );
}
