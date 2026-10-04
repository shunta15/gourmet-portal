"use client";
/**
 * 案4「玉 TAMA」: 丸みのあるカプセル型のボタン。左の「玉」（丸）にアイコン、右に短いラベル。
 * hover: ラベルが 1 字ずつ上へ送られて同じ文字が下から入り、墨が液面のように下から満ちて反転する。押すと横に広がって縦に縮み、離すと戻る。
 * 主役（予約または電話）は朱のカプセル。ほかは細い罫のカプセル。
 */
import type { CSSProperties } from "react";
import type { ActionModel, IconKey } from "@/lib/portal/shopActions";
import { Act, SaArrow, SaIcon, ShareFoot, type ShareState } from "./ShopActionsParts";
import { SHARE_SHORT, SlimSub, slimAria, slimLabel } from "./ShopActionsSlim";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  sample?: boolean;
  share: ShareState;
  bar?: boolean;
}

/** 文字の送り: 1 字ずつ時間差で上へ。同じ文字が下から入ってくる（入ってくる側は ::after の data-c） */
function Roll({ text, sample }: { text: string; sample?: boolean }) {
  return (
    <>
      <span className="sa-tama-lbl" aria-hidden={sample ? undefined : "true"}>
        {Array.from(text).map((c, i) => {
          const ch = c === " " ? " " : c;
          return (
            <span key={i} className="sa-tama-ch" data-c={ch} style={{ "--c": i } as CSSProperties}>
              {ch}
            </span>
          );
        })}
      </span>
    </>
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

export default function ShopActionsTama({ model, storeId, page, sample, share }: Props) {
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
              <Act a={a} storeId={storeId} page={page} sample={sample} aria={slimAria(a)} noCursor className={`sa-tama-pill${a.hero ? " is-hero" : ""}`}>
                <span className="sa-tama-fill" aria-hidden="true" />
                <Bead icon={a.icon} visit={a.external && !sample} />
                <Roll text={slimLabel(a)} sample={sample} />
                <span className="sa-tama-go" aria-hidden="true">
                  <SaArrow />
                </span>
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
        <ul className="sa-tama-shares" role="list">
          {share.items.map((it) => (
            <li key={it.id}>
              {sample ? (
                <span className="sa-tama-pill is-sm sa-sample" aria-disabled="true">
                  <span className="sa-tama-fill" aria-hidden="true" />
                  <Bead icon={it.icon} />
                  <Roll text={SHARE_SHORT[it.id]} sample />
                </span>
              ) : (
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
              )}
            </li>
          ))}
          <li>
            {sample ? (
              <span className="sa-tama-pill is-sm sa-sample" aria-disabled="true">
                <span className="sa-tama-fill" aria-hidden="true" />
                <Bead icon="link" />
                <Roll text={SHARE_SHORT.copy} sample />
              </span>
            ) : (
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
            )}
          </li>
        </ul>
        {!sample && <ShareFoot s={share} />}
      </div>
    </>
  );
}
