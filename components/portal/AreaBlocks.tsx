import Link from "next/link";
import { BLOCK_FACE } from "@/lib/portal/meta";

export interface AreaItem {
  slug: string;
  short: string;
  block: string;
  /** 0 のときは件数を出さない */
  count: number;
  href: string;
  /** 件数・リンクの強調（グルメ掲載のある県など） */
  lit: boolean;
}

const BLOCK_ORDER = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州沖縄"];

/**
 * 地方ブロック別の都道府県一覧（サーバー）。総合トップと新業種の入口で共通。
 * 件数は渡された実数だけを出す。0 のときは数字を出さない。
 */
export default function AreaBlocks({ items, unit = "店", skyline = false }: { items: AreaItem[]; unit?: string; skyline?: boolean }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  let k = 0;
  return (
    <div className="mp-areas">
      {skyline && (
        <div className="mp-sky" data-reveal role="group" aria-label="都道府県ごとの掲載数">
          {BLOCK_ORDER.map((b) => {
            const list = items.filter((i) => i.block === b);
            return (
              <div className="mp-sky-g" key={b}>
                <div className="bars">
                  {list.map((p) => (
                    <Link
                      key={p.slug}
                      href={p.href}
                      prefetch={false}
                      tabIndex={-1}
                      aria-label={`${p.short}${p.count > 0 ? ` ${p.count}${unit}` : ""}`}
                      className={`bar${p.lit ? " lit" : ""}`}
                      style={{ ["--h" as string]: Math.sqrt(p.count / max).toFixed(3), ["--k" as string]: k++ }}
                      data-t={`${p.short}${p.count > 0 ? ` ${p.count}${unit}` : ""}`}
                    />
                  ))}
                </div>
                <span className="lb">{BLOCK_FACE[b].label}</span>
              </div>
            );
          })}
        </div>
      )}
      {BLOCK_ORDER.map((b, bi) => {
        const list = items.filter((i) => i.block === b);
        if (list.length === 0) return null;
        const face = BLOCK_FACE[b];
        const total = list.reduce((a, i) => a + i.count, 0);
        return (
          <section className="mp-area-row" key={b} data-reveal style={{ ["--i" as string]: Math.min(bi, 3) }}>
            <header className="mp-area-head">
              <h3>{face.label}</h3>
              <p>
                <span className="en">{face.en}</span>
                {total > 0 && (
                  <span className="n">
                    <b>{total}</b>
                    {unit}
                  </span>
                )}
              </p>
            </header>
            <ul className="mp-area-list">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={p.href}
                    prefetch={false}
                    className={`mp-pref${p.lit ? " lit" : ""}`}
                    style={{ ["--w" as string]: `${Math.max(8, Math.round((p.count / max) * 100))}%` }}
                    data-cursor="AREA"
                  >
                    <span className="nm">{p.short}</span>
                    {p.count > 0 && (
                      <span className="ct">
                        <b>{p.count}</b>
                        {unit}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
