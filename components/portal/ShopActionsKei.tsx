"use client";
/** 案1「罫 KEI」: 上の「店舗、詳細。」の表と同じ細い罫で区切った、幅いっぱいの行。1行が1つのボタン */
import type { CSSProperties } from "react";
import type { ActionModel } from "@/lib/portal/shopActions";
import { Act, SaArrow, SaIcon, SaVisit, ExtHint, ShareFoot, type ShareState } from "./ShopActionsParts";

interface Props {
  model: ActionModel;
  storeId: string;
  page: string;
  sample?: boolean;
  share: ShareState;
  bar?: boolean;
}

export default function ShopActionsKei({ model, storeId, page, sample, share }: Props) {
  return (
    <>
      {model.primary.length > 0 && (
        <ul className="sa-k-list" role="list">
          {model.primary.map((a, i) => (
            <li key={a.id} className="sa-k-li" style={{ "--i": i } as CSSProperties}>
              <Act a={a} storeId={storeId} page={page} sample={sample} className={`sa-k-row${a.hero ? " is-hero" : ""}`}>
                <span className="sa-k-cat" aria-hidden="true">
                  <span className="sa-k-no">{String(i + 1).padStart(2, "0")}</span>
                  <span>{a.cat}</span>
                  {a.external && !sample && <SaVisit />}
                </span>
                <span className="sa-k-label">{a.label}</span>
                {a.note && <span className="sa-k-note">{a.note}</span>}
                <span className="sa-k-arrow" aria-hidden="true">
                  <SaArrow />
                </span>
              </Act>
            </li>
          ))}
        </ul>
      )}

      {model.secondary.length > 0 && (
        <div className="sa-k-sub" style={{ "--i": model.primary.length } as CSSProperties}>
          <p className="sa-k-subcat" aria-hidden="true">
            ほか
          </p>
          <ul className="sa-k-sublist" role="list">
            {model.secondary.map((s) => (
              <li key={s.id}>
                {sample ? (
                  <span className={`sa-k-sublink sa-sample${s.external ? "" : " is-in"}`} aria-disabled="true">
                    {s.label}
                    <SaArrow />
                  </span>
                ) : (
                  <a
                    href={s.href}
                    className={`sa-k-sublink${s.external ? "" : " is-in"}`}
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
        </div>
      )}

      <div className="sa-k-share" role="group" aria-label="この店を共有" style={{ "--i": model.primary.length + 1 } as CSSProperties}>
        <p className="sa-k-sharecat" aria-hidden="true">
          共有
        </p>
        <div>
          <div className="sa-k-sharebtns">
            {share.items.map((it) =>
              sample ? (
                <span key={it.id} className="sa-k-sb sa-sample" aria-disabled="true">
                  <SaIcon name={it.icon} />
                  {it.label}
                </span>
              ) : (
                <a
                  key={it.id}
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sa-k-sb"
                  data-cursor="SHARE"
                  onClick={() => share.tap(it.tap)}
                >
                  <SaIcon name={it.icon} />
                  {it.label}
                  <span className="sa-vh">で共有（外部サイトが新しいタブで開きます）</span>
                </a>
              )
            )}
            {sample ? (
              <span className="sa-k-sb sa-sample" aria-disabled="true">
                <SaIcon name="link" />
                リンクをコピー
              </span>
            ) : (
              <button type="button" className={`sa-k-sb${share.copied ? " is-done" : ""}`} data-cursor="SHARE" onClick={share.copy}>
                <SaIcon name={share.copied ? "check" : "link"} />
                {share.copied ? "コピーしました" : "リンクをコピー"}
              </button>
            )}
          </div>
          {!sample && <ShareFoot s={share} />}
        </div>
      </div>
    </>
  );
}
