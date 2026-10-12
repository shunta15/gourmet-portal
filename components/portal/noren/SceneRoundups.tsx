"use client";
import Link from "next/link";
import { useState } from "react";
import { sized } from "@/lib/imageUrl";
import { FEATURE_KIND_ROUNDUP } from "@/lib/portal/noren/featureKinds";
import { SCENE_ROUNDUP_VISIBLE, type SceneRoundupCard } from "@/lib/portal/noren/sceneRoundupOrder";
import "./sceneroundup.css";

/**
 * 「さがす」で利用シーンを選んだとき、結果の上に出す「シーン別のまとめ記事」の節（クライアント。大きなデータは持たない）。
 * 札は写真・題・地域だけ。最初に SCENE_ROUNDUP_VISIBLE 本、残りは「すべて見る」で開く。見出しの語は featureKinds.ts の FEATURE_KIND_ROUNDUP を読む（直書きしない）。
 * items は並べ替え済み（lib/portal/noren/sceneRoundupOrder.ts）。0 本のときは呼び出し側が節ごと出さない。
 */
export default function SceneRoundups({ items, sceneName, look }: { items: SceneRoundupCard[]; sceneName: string; look: "block" | "noren" }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, SCENE_ROUNDUP_VISIBLE);
  const more = items.length - SCENE_ROUNDUP_VISIBLE;
  return (
    <section className={`vSr vSr--${look}`} aria-label={`${sceneName}の${FEATURE_KIND_ROUNDUP}`}>
      <div className="vSr-head">
        <h3 className="vSr-h">
          {FEATURE_KIND_ROUNDUP}
          <small>{sceneName}</small>
        </h3>
        {more > 0 && (
          <button
            type="button"
            className="vSr-all"
            aria-expanded={open}
            aria-label={open ? `${sceneName}の${FEATURE_KIND_ROUNDUP}を、先頭の${SCENE_ROUNDUP_VISIBLE}本に戻す` : `${sceneName}の${FEATURE_KIND_ROUNDUP}を、${items.length}本すべて見る`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "閉じる" : `すべて見る（${items.length}本）`}
          </button>
        )}
      </div>
      <ul className="vSr-list">
        {shown.map((c) => (
          <li key={c.id}>
            <Link href={c.href} className="vSr-card" data-cursor="READ">
              <span className="vSr-ph" aria-hidden="true">
                {c.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sized(c.img, 480)} alt="" loading="lazy" decoding="async" />
                ) : null}
              </span>
              <span className="vSr-tx">
                <span className="vSr-ar">{c.areaLabel}</span>
                <span className="vSr-ti">{c.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
