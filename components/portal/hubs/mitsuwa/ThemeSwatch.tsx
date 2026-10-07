import Link from "next/link";
import { THEMES, themeData, themePath, type ThemeKey } from "@/lib/portal/hubs/mitsuwa/themes";

/**
 * 色の見本（見比べ用）。小さな丸を 6 つ横に並べる。サーバー（JS なし）。
 * 押すと、その色の URL へ移る。いま表示している色は、少し大きく、輪を二重にして印をつける。
 * 丸の中の色は themes.ts の同じ値（地の色の丸の中に、その色の代表の点）。見えるのは丸だけで、名前は読み上げ用。
 * 最初の画面の下、リードと同じ行の右はし（スマホはリードの下の行の右はし）に置く。見出し・輪・札・ロゴ・さがすとは重ならない。
 */
export default function ThemeSwatch({ current }: { current: ThemeKey }) {
  return (
    <nav className="mw-sw" aria-label="色の見比べ" data-nodrag>
      <ul>
        {THEMES.map((t) => {
          const d = themeData(t.key);
          return (
            <li key={t.key}>
              <Link
                href={themePath(t.key)}
                prefetch={false}
                className="mw-swi"
                aria-label={`色: ${t.label}`}
                aria-current={t.key === current ? "page" : undefined}
                style={{ ["--sw-bg" as string]: d.bg, ["--sw-dot" as string]: d.dot } as React.CSSProperties}
              >
                <i>
                  <b />
                </i>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
