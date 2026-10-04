"use client";
/**
 * 案5「駒 KOMA」: 押し込める四角いキー。中央に大きめのアイコン、キーの下に小さなラベル。
 * キーは紙色に墨の縁、右下にずれた墨の影。主役（予約または電話）は朱のキー。
 * hover: 影が伸びてキーが浮き、アイコンがその種類らしく小さく動く。押すとキーが影の位置まで沈み、離すと戻る。
 */
import type { CSSProperties } from "react";
import type { ActionModel, IconKey } from "@/lib/portal/shopActions";
import { Act, SaIcon, ShareFoot, type ShareState } from "./ShopActionsParts";
import { SHARE_SHORT, SlimSub, slimAria, slimLabel } from "./ShopActionsSlim";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  sample?: boolean;
  share: ShareState;
  bar?: boolean;
}

function Key({ icon, size, visit, small }: { icon: IconKey; size: number; visit?: boolean; small?: boolean }) {
  return (
    <span className={`sa-koma-key${small ? " is-sm" : ""}`} aria-hidden="true">
      <span className="sa-koma-sh" />
      <span className="sa-koma-face">
        <span className="sa-koma-ico">
          <SaIcon name={icon} size={size} />
        </span>
        {visit && (
          <span className="sa-koma-vis">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
        )}
      </span>
    </span>
  );
}

export default function ShopActionsKoma({ model, storeId, page, sample, share }: Props) {
  const n = model.primary.length;
  return (
    <>
      {n > 0 && (
        <ul className="sa-koma-list" role="list">
          {model.primary.map((a, i) => (
            <li key={a.id} className="sa-koma-li" style={{ "--i": i } as CSSProperties}>
              <Act a={a} storeId={storeId} page={page} sample={sample} aria={slimAria(a)} noCursor className={`sa-koma-cell${a.hero ? " is-hero" : ""}`}>
                <Key icon={a.icon} size={34} visit={a.external && !sample} />
                <span className="sa-koma-lbl">{slimLabel(a)}</span>
              </Act>
            </li>
          ))}
        </ul>
      )}

      <SlimSub items={model.secondary} sample={sample} index={n} />

      <div className="sa-s-share" role="group" aria-label="この店を共有" style={{ "--i": n + 1 } as CSSProperties}>
        <p className="sa-s-cap" aria-hidden="true">
          共有
        </p>
        <ul className="sa-koma-shares" role="list">
          {share.items.map((it) => (
            <li key={it.id}>
              {sample ? (
                <span className="sa-koma-cell is-sm sa-sample" aria-disabled="true" data-sa-id={it.id}>
                  <Key icon={it.icon} size={22} small />
                  <span className="sa-vh">{SHARE_SHORT[it.id]}</span>
                </span>
              ) : (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sa-koma-cell is-sm"
                  data-sa-id={it.id}
                  aria-label={`${SHARE_SHORT[it.id]}で共有（外部サイトが新しいタブで開きます）`}
                  title={`${SHARE_SHORT[it.id]}で共有`}
                  onClick={() => share.tap(it.tap)}
                >
                  <Key icon={it.icon} size={22} small />
                </a>
              )}
            </li>
          ))}
          <li>
            {sample ? (
              <span className="sa-koma-cell is-sm sa-sample" aria-disabled="true" data-sa-id="copy">
                <Key icon="link" size={22} small />
                <span className="sa-vh">リンクをコピー</span>
              </span>
            ) : (
              <button
                type="button"
                className={`sa-koma-cell is-sm${share.copied ? " is-done" : ""}`}
                    data-sa-id="copy"
                aria-label={share.copied ? "コピーしました" : "リンクをコピー"}
                title="リンクをコピー"
                onClick={share.copy}
              >
                <Key icon={share.copied ? "check" : "link"} size={22} small />
              </button>
            )}
          </li>
        </ul>
        {!sample && <ShareFoot s={share} />}
      </div>
    </>
  );
}
